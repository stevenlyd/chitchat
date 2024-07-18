import type { ElysiaWS } from "elysia/dist/ws";
import { ChatActionType } from "../types";
import { SessionManager } from "./sessionManager";
import { Room } from "./room";
import { SessionConstructorParams, SessionStatus } from "../types/session";

export class Session {
  private readonly $username: string;
  private readonly $sessionManager: SessionManager;
  private readonly $awayTolerance = 5 * 60 * 1000;
  private readonly $room: Room;
  private $ws: ElysiaWS<any, any, any>;
  private $status: SessionStatus;
  private $timeoutId: Timer | null = null;

  constructor(params: SessionConstructorParams) {
    const { ws, username, sessionManager, awayTolerance, room } = params;
    this.$ws = ws;
    this.$username = username;
    this.$status = SessionStatus.ONLINE;
    this.$sessionManager = sessionManager;
    this.$room = room;
    if (awayTolerance) {
      this.$awayTolerance = awayTolerance;
    }
  }

  get id() {
    return this.ws.id;
  }

  get ws() {
    return this.$ws;
  }

  set ws(ws: ElysiaWS<any, any, any>) {
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
      this.$status = status;
      switch (status) {
        case SessionStatus.ONLINE:
          this.setSessionOnline();
          break;
        case SessionStatus.AWAY:
          this.setSessionAway();
          break;
      }
    }
  }

  private get awayTolerance() {
    return this.$awayTolerance;
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

  setSessionAway = () => {
    this.timeoutId = setTimeout(() => {
      this.status = SessionStatus.AWAY;
      this.ws.publish(this.roomCode, {
        type: ChatActionType.LOST,
        username: this.$username,
        timestamp: new Date(),
      });
      this.terminate();
    }, this.awayTolerance);
  };

  setSessionOnline = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.ws.publish(this.roomCode, {
        type: ChatActionType.BACK,
        username: this.$username,
        timestamp: new Date(),
      });
    }
  };

  terminate = () => {
    this.sessionManager.removeSessionFromIdMap(this.id);
    this.room.removeSessionFromUsernameMap(this.username);
    this.ws.close();
  };
}
