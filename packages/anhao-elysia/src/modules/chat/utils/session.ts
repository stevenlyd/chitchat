import type { ElysiaWS } from "elysia/dist/ws";
import { ChatActionType } from "../types";
import { SessionManager } from "./sessionManager";
import { Room } from "./room";
import { SessionConstructorParams, SessionStatus } from "../types/session";

export class Session {
  private readonly $username: string;
  private readonly $sessionManager: SessionManager;
  private readonly $hibernationTolerance = 5 * 60 * 1000;
  private readonly $room: Room;
  private $ws: ElysiaWS<any, any, any> | null = null;
  private $status: SessionStatus;
  private $timeoutId: Timer | null = null;

  constructor(params: SessionConstructorParams) {
    const { ws, username, sessionManager, hibernationTolerance, room } = params;
    this.$ws = ws;
    this.$username = username;
    this.$status = SessionStatus.ONLINE;
    this.$sessionManager = sessionManager;
    this.$room = room;
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

  set status(status: SessionStatus) {
    if (status !== this.$status) {
      switch (status) {
        case SessionStatus.ONLINE:
          this.back();
          break;
        case SessionStatus.AWAY:
          this.away();
          break;
      }
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
      this.$status = SessionStatus.AWAY;
    }
      this.publish(this.roomCode, {
        type: ChatActionType.AWAY,
        username: this.username,
        timestamp: new Date(),
      });
  };

  back = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.status !== SessionStatus.ONLINE) {
      this.$status = SessionStatus.ONLINE;
    }
    this.publish(this.roomCode, {
      type: ChatActionType.BACK,
      username: this.$username,
      timestamp: new Date(),
    });
  };

  hibernate = () => {
    this.away();
    if (this.id) {
      this.sessionManager.removeSessionFromIdMap(this.id);
    }
    this.ws?.close();
    this.ws = null;
    this.timeoutId = setTimeout(() => {
      this.terminate();
    }, this.hibernationTolerance);
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
}
