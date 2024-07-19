import type { RoomConstructorParams } from "../types/room";
import { SessionStatus } from "../types/session";
import { Session } from "./session";
import { SessionManager } from "./sessionManager";

export class Room {
  private readonly $roomCode: string;
  private readonly $sessionManager: SessionManager;
  private readonly $usernameSessionMap = new Map<string, Session>();

  constructor(params: RoomConstructorParams) {
    const { roomCode, sessionManager } = params;
    this.$roomCode = roomCode;
    this.$sessionManager = sessionManager;
  }

  private get sessionManager() {
    return this.$sessionManager;
  }

  private get usernameSessionMap() {
    return this.$usernameSessionMap;
  }

  get roomCode() {
    return this.$roomCode;
  }

  get sessionsArray() {
    return Array.from(this.usernameSessionMap.values());
  }

  get sessionsSet() {
    return new Set(this.usernameSessionMap.values());
  }

  addSession = (
    params: Omit<ConstructorParameters<typeof Session>[0], "room">
  ) => {
    const { username, ws } = params;
    const matchedSession = this.usernameSessionMap.get(username);
    if (matchedSession && matchedSession.status === SessionStatus.AWAY) {
      ws.subscribe(this.roomCode);
      matchedSession.ws = ws;
      matchedSession.status = SessionStatus.ONLINE;
    } else if (!matchedSession) {
      const session = new Session({
        ...params,
        sessionManager: this.sessionManager,
        room: this,
      });
      this.usernameSessionMap.set(username, session);
      this.sessionManager.addSessionToIdMap(session);
    } else if (
      matchedSession &&
      matchedSession.status === SessionStatus.ONLINE
    ) {
      throw new Error(
        `用户 "${username}" 已经存在于 "${this.roomCode}" 房间里！`
      );
    } else {
      throw new Error("出现了未知错误, 请尝试刷新页面或联系管理员！");
    }
  };

  broadcast = (data: any) => {
    this.sessionsArray.forEach((session) => {
      session.send(data);
    });
  };

  removeSessionFromUsernameMap = (username: string) => {
    this.usernameSessionMap.delete(username);
  };
}
