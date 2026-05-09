import { getIO } from "../../socket";
import Notification from "./notification.model";

type NotificationType = "new_match" | "new_message" | "profile_like";

/**
 * Realtime Notification Emitter
 * 
 * Factory function that persists a notification to the database and
 * immediately emits it via Websockets to the targeted user.
 * 
 * Architecture Notes:
 * - Decoupled from specific domain events. It can be imported and called
 *   by `MatchService` or `ChatService` as needed.
 * - Fails silently on the socket layer if the user is offline or the
 *   socket server isn't running (e.g. during isolated unit tests),
 *   while ensuring the DB record is always saved for next login.
 */
export const createAndEmitNotification = async (params: {
  sender: string;
  receiver: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}) => {
  const notification = await Notification.create({
    sender: params.sender,
    receiver: params.receiver,
    type: params.type,
    metadata: params.metadata || {},
  });

  try {
    const io = getIO();
    // Emits specifically to the room named after the receiver's ID
    io.to(params.receiver).emit("notification:new", notification);
  } catch (error) {
    // Socket can be unavailable during startup in tests.
  }

  return notification;
};
