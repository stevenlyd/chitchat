import { Elysia, t } from "elysia";
import { ChatActionType, ClientMessageType } from "./types";
import { SessionManager } from "./utils/sessionManager";
import { SessionStatus } from "./types/session";

const wsBodySchema = t.Object({
  message: t.Optional(t.String()),
  timestamp: t.Date(),
  type: t.Enum(ClientMessageType),
});

const wsQuerySchema = t.Object({
  roomCode: t.String(),
  username: t.String(),
});

const wsResponseSchema = t.Object({
  type: t.Enum(ChatActionType),
  username: t.String(),
  message: t.Optional(t.String()),
  timestamp: t.Date(),
});

const sessionManager = new SessionManager();

const chatModule = new Elysia()
  .ws("/chat", {
    idleTimeout: 60,
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
          sessionManager,
        });

        console.log(`User ${username} joined room ${roomCode}`);

        ws.subscribe(roomCode);

        ws.publish(roomCode, {
          type: ChatActionType.JOIN,
          username,
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error(error);
        ws.send({
          type: ChatActionType.ERROR,
          message: error?.message ?? "An error occurred",
          timestamp: new Date(),
          username: "System",
        });
        ws.close();
      }
    },
    message: (ws, { message, timestamp, type }) => {
      const { roomCode, username } = ws.data.query;
      switch (type) {
        case ClientMessageType.MESSAGE: {
          if (message) {
            sessionManager.updateSessionStatus(ws.id, SessionStatus.ONLINE);
            ws.publish(roomCode, {
              type: ChatActionType.MESSAGE,
              username,
              message,
              timestamp,
            });
          }
          break;
        }
        case ClientMessageType.AWAY: {
          sessionManager.updateSessionStatus(ws.id, SessionStatus.AWAY);
          ws.publish(roomCode, {
            type: ChatActionType.AWAY,
            username,
            timestamp,
          });
          break;
        }
        case ClientMessageType.BACK: {
          sessionManager.updateSessionStatus(ws.id, SessionStatus.ONLINE);
          ws.publish(roomCode, {
            type: ChatActionType.BACK,
            username,
            timestamp,
          });
          break;
        }
        case ClientMessageType.LEAVE: {
          sessionManager.getSessionById(ws.id)?.terminate();
        }
      }
    },
    close: (ws) => {
      const { id } = ws;

      const matchedSession = sessionManager.getSessionById(id);

      if (matchedSession) {
        matchedSession.hibernate();
      }
    },
  })
  .get("/chat/:roomCode", ({ params: { roomCode } }) => {
    const sessionsSet = sessionManager.getSessionsByRoomCode(roomCode);

    if (sessionsSet) {
      return Array.from(sessionsSet).map(({ username, status }) => ({
        username,
        status,
      }));
    }

    return [];
  });

export default chatModule;
