import type { ElysiaWS } from "elysia/dist/ws";
import { ChatActionType } from "../types";
import { SessionManager } from "./sessionManager";
import { Room } from "./room";
import { SessionConstructorParams, SessionStatus } from "../types/session";

export class Session {
  private readonly $username: string;
  private readonly $sessionManager: SessionManager;
  private readonly $hibernationTolerance = 1 * 60 * 1000;
  private readonly $room: Room;
  private $ws: ElysiaWS<any, any, any> | null = null;
  private $status: SessionStatus;
  private $timeoutId: Timer | null = null;
  private $lastActiveAt: Date | null = null;

  constructor(params: SessionConstructorParams) {
    const { ws, username, sessionManager, hibernationTolerance, room } = params;
    this.$ws = ws;
    this.$username = username;
    this.$status = SessionStatus.ONLINE;
    this.$sessionManager = sessionManager;
    this.$room = room;
    this.$lastActiveAt = new Date();
    this.ws?.subscribe(this.roomCode);
    this.sessionManager.addSessionToIdMap(this);
    this.room.addSessionToUsernameMap(this);
    this.publish(this.roomCode, {
      type: ChatActionType.JOIN,
      username,
      timestamp: new Date(),
    });
    if (hibernationTolerance) {
      this.$hibernationTolerance = hibernationTolerance;
    }
  }

  get id() {
    return this.ws?.id;
  }

  get ws() {
    return this.$ws;
  }

  set ws(ws: ElysiaWS<any, any, any> | null) {
    this.$ws = ws;
  }

  get roomCode() {
    return this.room.roomCode;
  }

  get room() {
    return this.$room;
  }

  get username() {
    return this.$username;
  }

  get status() {
    return this.$status;
  }

  get lastActiveAt() {
    return this.$lastActiveAt;
  }

  set lastActiveAt(lastActiveAt: Date | null) {
    this.$lastActiveAt = lastActiveAt;
  }

  private set status(status: SessionStatus) {
    if (status !== this.$status) {
      this.$status = status;
    }
  }

  private get hibernationTolerance() {
    return this.$hibernationTolerance;
  }

  private get timeoutId() {
    return this.$timeoutId;
  }

  private set timeoutId(timeoutId: Timer | null) {
    this.$timeoutId = timeoutId;
  }

  private get sessionManager() {
    return this.$sessionManager;
  }

  send = (data: any) => {
    this.ws?.send(data);
  };

  publish = (roomCode: string, data: any) => {
    this.ws?.publish(roomCode, data);
  };

  away = () => {
    if (this.status !== SessionStatus.AWAY) {
      this.status = SessionStatus.AWAY;
      this.publish(this.roomCode, {
        type: ChatActionType.AWAY,
        username: this.username,
        timestamp: new Date(),
      });
      console.log(`User ${this.username} went away in room ${this.roomCode}`);
    }
  };

  back = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.status !== SessionStatus.ONLINE) {
      this.status = SessionStatus.ONLINE;
      this.publish(this.roomCode, {
        type: ChatActionType.BACK,
        username: this.$username,
        timestamp: new Date(),
      });
      console.log(`User ${this.username} came back in room ${this.roomCode}`);
    }
  };

  hibernate = () => {
    if (this.status !== SessionStatus.HIBERNATING) {
      this.status = SessionStatus.HIBERNATING;
    }
    if (this.id) {
      this.sessionManager.removeSessionFromIdMap(this.id);
    }
    this.ws?.close();
    this.ws = null;
    console.log(`User ${this.username} hibernated in room ${this.roomCode}`);
    this.timeoutId = setTimeout(() => {
      this.terminate();
    }, this.hibernationTolerance);
  };

  reconnect = (ws: ElysiaWS<any, any, any>) => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    ws.subscribe(this.roomCode);
    this.ws = ws;
    this.status = SessionStatus.ONLINE;
    console.log(`User ${this.username} reconnected to room ${this.roomCode}`);
  };

  terminate = () => {
    if (this.id) {
      this.sessionManager.removeSessionFromIdMap(this.id);
    }
    this.room.removeSessionFromUsernameMap(this.username);
    this.publish(this.roomCode, {
      type: ChatActionType.LEAVE,
      username: this.username,
      timestamp: new Date(),
    });
    console.log(`User ${this.username} left room ${this.roomCode}`);
    this.ws?.close();
  };

  heartbeat = () => {
    this.lastActiveAt = new Date();
  };

  healthCheck = async () => {
    return new Promise<boolean>((resolve) => {
      const now = new Date();
      if (!this.lastActiveAt) {
        this.terminate();
        resolve(false);
        return;
      }

      if (this.status === SessionStatus.ONLINE) {
        if (now.getSeconds() - this.lastActiveAt.getSeconds() > 6) {
          this.terminate();
          resolve(false);
          return;
        }
        resolve(true);
        return;
      }

      if (now.getSeconds() - this.lastActiveAt.getSeconds() > 2 * 60) {
        resolve(false);
        return;
      } else {
        resolve(true);
        return;
      }
    });
  };
}
