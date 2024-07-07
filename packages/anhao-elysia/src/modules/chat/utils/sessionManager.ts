import type { ElysiaWS } from "elysia/dist/ws";

export type Session = {
  username: string;
  roomCode: string;
  ws: ElysiaWS<any, any, any>;
};

export class SessionManager {
  private idMap = new Map<string, Session>();
  private roomMap = new Map<string, Set<Session>>();

  private getUsernameSet(roomCode: string) {
    return new Set(
      Array.from(this.roomMap.get(roomCode) || []).map(
        (session) => session.username
      )
    );
  }

  addSession(session: Session) {
    const { username, roomCode, ws } = session;

    if (this.getUsernameSet(roomCode).has(username)) {
      throw new Error(`用户 "${username}" 已经存在于 "${roomCode}" 房间里！`);
    }

    this.idMap.set(ws.id, session);

    let roomSessions = this.roomMap.get(roomCode);
    if (!roomSessions) {
      roomSessions = new Set();
      this.roomMap.set(roomCode, roomSessions);
    }
    roomSessions.add(session);
  }

  getSessionById(id: string): Session | undefined {
    return this.idMap.get(id);
  }

  getSessionsByRoomCode(roomCode: string): Set<Session> | undefined {
    const decodedRoomCode = decodeURIComponent(roomCode);
    return this.roomMap.get(decodedRoomCode);
  }

  removeSession(id: string) {
    const session = this.idMap.get(id);
    if (session) {
      this.idMap.delete(id);

      const roomSessions = this.roomMap.get(session.roomCode);
      if (roomSessions) {
        roomSessions.delete(session);
        if (roomSessions.size === 0) {
          this.roomMap.delete(session.roomCode);
        }
      }
    }
  }
}
