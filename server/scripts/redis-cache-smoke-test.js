/* eslint-disable no-console */
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

  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    body = { raw: text };
  }

  return { status: response.status, body };
};

const registerUser = async (name) => {
  const suffix = randomSuffix();
  const email = `${name.toLowerCase()}-${suffix}@test.com`;
  const password = "Test@123456";

  const result = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      interests: ["coding", "gym"],
      age: 25,
      gender: "male",
      interestedIn: "female",
    }),
  });

  if (result.status !== 201) {
    throw new Error(`Register failed for ${name}: ${JSON.stringify(result.body)}`);
  }

  return {
    id: result.body.user._id,
    token: result.body.accessToken,
  };
};

const run = async () => {
  const userA = await registerUser("CacheA");
  const userB = await registerUser("CacheB");

  const me1 = await request("/api/users/me", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });
  const me2 = await request("/api/users/me", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });

  if (me1.status !== 200 || me2.status !== 200) {
    throw new Error("Profile cache path failed");
  }

  const rec1 = await request("/api/users/recommendations?page=1&limit=5&minAge=18&maxAge=35", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });
  const rec2 = await request("/api/users/recommendations?page=1&limit=5&minAge=18&maxAge=35", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });

  if (rec1.status !== 200 || rec2.status !== 200) {
    throw new Error("Recommendation cache path failed");
  }

  const swipeRight = await request(`/api/swipes/right/${userB.id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userA.token}` },
  });

  if (![200, 400].includes(swipeRight.status)) {
    throw new Error("Swipe endpoint failed while testing cache invalidation");
  }

  const rec3 = await request("/api/users/recommendations?page=1&limit=5&minAge=18&maxAge=35", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });

  if (rec3.status !== 200) {
    throw new Error("Recommendation fetch after invalidation failed");
  }

  const updateProfile = await request("/api/users/update", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${userA.token}` },
    body: JSON.stringify({ bio: "Cache invalidation check" }),
  });

  if (updateProfile.status !== 200) {
    throw new Error("Profile update invalidation test failed");
  }

  const me3 = await request("/api/users/me", {
    headers: { Authorization: `Bearer ${userA.token}` },
  });
  if (me3.status !== 200) {
    throw new Error("Profile fetch after invalidation failed");
  }

  const unauthorizedRec = await request("/api/users/recommendations?page=1&limit=5");
  if (unauthorizedRec.status !== 401) {
    throw new Error("Unauthorized guard broke on recommendations endpoint");
  }

  console.log("Redis/cache smoke tests passed");
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Redis/cache smoke tests failed:", error.message);
    process.exit(1);
  });
