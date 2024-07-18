import type { SessionStatus } from "../types/session";
import { Room } from "./room";
import { Session } from "./session";

export class SessionManager {
  private idMap = new Map<string, Session>();
  private roomMap = new Map<string, Room>();

  addSession(
    params: Omit<ConstructorParameters<typeof Session>[0], "room"> & {
      roomCode: string;
    }
  ) {
    const { roomCode } = params;
    const matchedRoom = this.roomMap.get(roomCode);
    if (matchedRoom) {
      matchedRoom.addSession(params);
    } else {
      const room = new Room({ roomCode, sessionManager: this });
      this.roomMap.set(roomCode, room);
      room.addSession(params);
    }
  }

  addSessionToIdMap(session: Session) {
    this.idMap.set(session.id, session);
  }

  updateSessionStatus(id: string, status: SessionStatus) {
    const session = this.idMap.get(id);
    if (session) {
      session.status = status;
    } else {
      throw new Error(`找不到 ID 为 "${id}" 的会话！`);
    }
  }

  getSessionById(id: string): Session | undefined {
    return this.idMap.get(id);
  }

  getSessionsByRoomCode(roomCode: string): Set<Session> | undefined {
    const decodedRoomCode = decodeURIComponent(roomCode);
    const matchedRoom = this.roomMap.get(decodedRoomCode);
    return matchedRoom?.sessionsSet;
  }

  removeSessionFromIdMap(id: string) {
    this.idMap.delete(id);
  }
}
