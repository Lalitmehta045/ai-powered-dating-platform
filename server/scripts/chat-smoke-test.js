/* eslint-disable no-console */
const { io } = require("socket.io-client");

const BASE_URL = "http://localhost:5000";

const randomSuffix = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    body = {};
  }

  return { status: response.status, body };
};

const createUser = async (name) => {
  const suffix = randomSuffix();
  const email = `${name.toLowerCase()}-${suffix}@test.com`;
  const password = "Test@123456";

  const result = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (result.status !== 201) {
    throw new Error(`Failed to register ${name}: ${JSON.stringify(result.body)}`);
  }

  return {
    id: result.body.user._id,
    token: result.body.accessToken,
    email,
    password,
  };
};

const swipeRight = async (token, targetUserId) => {
  return request(`/api/swipes/right/${targetUserId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getChatHistory = async (token, targetUserId, query = "") => {
  return request(`/api/chat/${targetUserId}${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const waitForEvent = (socket, eventName, timeoutMs = 4000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeoutMs);

    const handler = (payload) => {
      clearTimeout(timer);
      resolve(payload);
    };

    socket.once(eventName, handler);
  });
};

const emitWithAck = (socket, eventName, payload) => {
  return new Promise((resolve) => {
    socket.emit(eventName, payload, (ack) => resolve(ack));
  });
};

const connectSocket = (token) => {
  const socket = io(BASE_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: false,
    timeout: 5000,
  });

  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", (error) => reject(error));
  });
};

const run = async () => {
  const userA = await createUser("Alice");
  const userB = await createUser("Bob");
  const userC = await createUser("Charlie");

  const firstLike = await swipeRight(userA.token, userB.id);
  const secondLike = await swipeRight(userB.token, userA.id);

  if (!firstLike.body.success || !secondLike.body.success) {
    throw new Error("Failed to create match between userA and userB");
  }

  const socketA = await connectSocket(userA.token);
  const socketB = await connectSocket(userB.token);
  const socketC = await connectSocket(userC.token);

  const onlinePayload = await waitForEvent(socketA, "user-online");
  if (!Array.isArray(onlinePayload.users) || onlinePayload.users.length < 2) {
    throw new Error("Online user tracking not working");
  }

  socketA.emit("typing", { receiverId: userB.id });
  const typingPayload = await waitForEvent(socketB, "typing");
  if (typingPayload.from !== userA.id) {
    throw new Error("Typing event failed");
  }

  socketA.emit("stop-typing", { receiverId: userB.id });
  const stopTypingPayload = await waitForEvent(socketB, "stop-typing");
  if (stopTypingPayload.from !== userA.id) {
    throw new Error("Stop typing event failed");
  }

  const receiveMessagePromise = waitForEvent(socketB, "receive-message");
  const sendAck = await emitWithAck(socketA, "send-message", {
    receiverId: userB.id,
    text: "Hello from Alice",
  });
  if (!sendAck.success) {
    throw new Error(`send-message ack failed: ${JSON.stringify(sendAck)}`);
  }

  const receivedMessage = await receiveMessagePromise;
  if (receivedMessage.text !== "Hello from Alice") {
    throw new Error("Message delivery failed");
  }

  const readAck = await emitWithAck(socketB, "message-read", {
    messageId: receivedMessage._id,
  });
  if (!readAck.success) {
    throw new Error(`message-read ack failed: ${JSON.stringify(readAck)}`);
  }

  const unauthorizedAck = await emitWithAck(socketC, "send-message", {
    receiverId: userA.id,
    text: "I should be blocked",
  });
  if (unauthorizedAck.success !== false) {
    throw new Error("Unauthorized chat rejection failed");
  }

  const history = await getChatHistory(userA.token, userB.id, "?page=1&limit=10");
  if (history.status !== 200 || !Array.isArray(history.body.messages) || history.body.messages.length < 1) {
    throw new Error("Chat history API failed");
  }

  const unauthorizedHistory = await getChatHistory(userC.token, userA.id);
  if (unauthorizedHistory.status !== 403) {
    throw new Error("Unauthorized history access should return 403");
  }

  socketA.disconnect();
  const offlinePayload = await waitForEvent(socketB, "user-offline");
  if (offlinePayload.userId !== userA.id) {
    throw new Error("Offline event failed");
  }

  socketB.disconnect();
  socketC.disconnect();

  console.log("Chat smoke tests passed");
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Chat smoke tests failed:", error.message);
    process.exit(1);
  });
