import type { SessionManager } from "../utils/sessionManager";

export interface RoomConstructorParams {
  roomCode: string;
  sessionManager: SessionManager;
}
