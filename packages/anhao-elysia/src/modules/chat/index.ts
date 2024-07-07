import { Elysia, t } from "elysia";
import { ChatActionTypes } from "./types";
import { SessionManager } from "./utils/sessionManager";

const wsBodySchema = t.Object({
  message: t.Optional(t.String()),
  timestamp: t.Date(),
});

const wsQuerySchema = t.Object({
  roomCode: t.String(),
  username: t.String(),
});

const wsResponseSchema = t.Object({
  type: t.Enum(ChatActionTypes),
  username: t.String(),
  message: t.Optional(t.String()),
  timestamp: t.Date(),
});

const sessionManager = new SessionManager();

const chatModule = new Elysia()
  .ws("/chat", {
    body: wsBodySchema,
    query: wsQuerySchema,
    response: wsResponseSchema,
    open: (ws) => {
      const { roomCode, username } = ws.data.query;

      try {
        sessionManager.addSession({
          username,
          roomCode,
          ws,
        });

        console.log(`User ${username} joined room ${roomCode}`);

        ws.subscribe(roomCode);

        ws.publish(roomCode, {
          type: ChatActionTypes.JOIN,
          username,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error(error);
        ws.send({
          type: ChatActionTypes.ERROR,
          message: error?.message ?? "An error occurred",
          timestamp: new Date(),
          username: "System",
        });
        ws.close();
      }
    },
    message: (ws, { message, timestamp }) => {
      const { roomCode, username } = ws.data.query;
      if (message) {
        ws.publish(roomCode, {
          type: ChatActionTypes.MESSAGE,
          username,
          message,
          timestamp,
        });
      }
    },
    close: (ws) => {
      const { id } = ws;

      const { username, roomCode } = sessionManager.getSessionById(id) ?? {};

      sessionManager.removeSession(id);

      if (roomCode) {
        const sessionsSet = sessionManager.getSessionsByRoomCode(roomCode);
        if (sessionsSet) {
          sessionsSet.forEach((session) => {
            session.ws.send({
              type: ChatActionTypes.LEAVE,
              username,
              timestamp: new Date(),
            });
          });
        }
      }

      console.log(`User ${username} left room ${roomCode}`);

      ws.close();
    },
  })
  .get("/chat/:roomCode", ({ params: { roomCode } }) => {
    const sessionsSet = sessionManager.getSessionsByRoomCode(roomCode);

    if (sessionsSet) {
      return Array.from(sessionsSet).map(({ username }) => username);
    }

    return [];
  });

export default chatModule;
