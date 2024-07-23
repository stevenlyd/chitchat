import { Elysia, t } from "elysia";
import { ChatActionType, ClientMessageType } from "./types";
import { SessionManager } from "./utils/sessionManager";
import { SessionStatus } from "./types/session";
import cron from "@elysiajs/cron";

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
    idleTimeout: 10 * 60,
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
      try {
        const matchedSession = sessionManager.getSessionById(ws.id);
        if (matchedSession) {
          switch (type) {
            case ClientMessageType.MESSAGE: {
              if (message) {
                matchedSession.heartbeat();
                matchedSession.back();
                ws.publish(roomCode, {
                  // @ts-ignore
                  type: ChatActionType.MESSAGE,
                  username,
                  message,
                  timestamp,
                });
              }
              break;
            }
            case ClientMessageType.AWAY: {
              matchedSession.heartbeat();
              matchedSession.away();
              ws.publish(roomCode, {
                // @ts-ignore
                type: ChatActionType.AWAY,
                username,
                timestamp,
              });
              break;
            }
            case ClientMessageType.BACK: {
              matchedSession.heartbeat();
              matchedSession.back();
              ws.publish(roomCode, {
                // @ts-ignore
                type: ChatActionType.BACK,
                username,
                timestamp,
              });
              break;
            }
            case ClientMessageType.LEAVE: {
              matchedSession.terminate();
              break;
            }
            case ClientMessageType.HEARTBEAT_ONLINE: {
              matchedSession.heartbeat();
              matchedSession.back()
              break;
            }
            case ClientMessageType.HEARTBEAT_AWAY: {
              matchedSession.heartbeat()
              matchedSession.away()
              break
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    close: (ws) => {
      const { id } = ws;

      const matchedSession = sessionManager.getSessionById(id);

      if (matchedSession) {
        switch (matchedSession.status) {
          case SessionStatus.ONLINE: {
            matchedSession.terminate();
            break;
          }
          case SessionStatus.AWAY: {
            matchedSession.hibernate();
            break;
          }
          case SessionStatus.HIBERNATING: {
            const { username, roomCode } = matchedSession;
            console.log(
              `User ${username} is already hibernating in room ${roomCode}`
            );
            break;
          }
        }
      }
    },
  })
  .get(
    "/chat/:roomCode",
    ({ params: { roomCode } }) => {
      const sessionsSet = sessionManager.getSessionsByRoomCode(roomCode);

      if (sessionsSet) {
        return Array.from(sessionsSet).map(({ username, status }) => ({
          username,
          status,
        }));
      }

      return [];
    },
    {
      response: t.Array(
        t.Object({
          username: t.String(),
          status: t.Enum(SessionStatus),
        })
      ),
    }
  )
  .use(
    cron({
      name: "cleanUpDeadSessions",
      pattern: "*/10 * * * * *",
      run: async () => {
        await sessionManager.cleanUpDeadSessions();
      },
    })
  );

export default chatModule;
