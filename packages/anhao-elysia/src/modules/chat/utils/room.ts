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
    if (matchedSession && matchedSession.status === SessionStatus.HIBERNATING) {
      matchedSession.reconnect(ws);
    } else if (!matchedSession) {
      new Session({
        ...params,
        sessionManager: this.sessionManager,
        room: this,
      });
    } else if (
      matchedSession &&
      matchedSession.status !== SessionStatus.HIBERNATING
    ) {
      throw new Error(
        `用户 "${username}" 已经存在于 "${this.roomCode}" 房间里！`
      );
    } else {
      throw new Error("出现了未知错误, 请尝试刷新页面或联系管理员！");
    }
  };

  broadcast = (data: any, excludeUsernames: string[] = []) => {
    const excludeSet = new Set(excludeUsernames);
    this.sessionsArray.forEach((session) => {
      if (!excludeSet.has(session.username)) {
        session.send(data);
      }
    });
  };

  removeSessionFromUsernameMap = (username: string) => {
    const isSuccess = this.usernameSessionMap.delete(username);
    if (isSuccess) {
      console.log(
        `Removed session with username ${username} from room ${this.roomCode}`
      );
    } else {
      console.warn(
        `Failed to remove session with username ${username} from room ${this.roomCode}`
      );
    }
  };

  addSessionToUsernameMap = (session: Session) => {
    const { username } = session;
    this.usernameSessionMap.set(username, session);
    console.log(`User ${username} joined room ${this.roomCode}`);
  };

  cleanUpDeadSessions = async () => {
    const tasks: Promise<boolean>[] = [];
    this.usernameSessionMap.forEach((session) => {
      tasks.push(session.healthCheck());
    });
    const doneTasks = await Promise.all(tasks);
    return doneTasks.filter((doneTask) => !doneTask).length;
  };
}
