import type { ElysiaWS } from "elysia/dist/ws";
import type { SessionManager } from "../utils/sessionManager";
import type { Room } from "../utils/room";

export enum SessionStatus {
  ONLINE = "online",
  AWAY = "away",
  HIBERNATING = "hibernating",
}

export interface SessionConstructorParams {
  ws: ElysiaWS<any, any>;
  username: string;
  sessionManager: SessionManager;
  room: Room;
  hibernationTolerance?: number;
}
