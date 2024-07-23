export enum ChatActionType {
  JOIN = "join",
  MESSAGE = "message",
  LEAVE = "leave",
  AWAY = "away",
  LOST = "lost",
  BACK = "back",
  ERROR = "error",
}

export enum ClientMessageType {
  MESSAGE = "message",
  AWAY = "away",
  BACK = "back",
  LEAVE = "leave",
  HEARTBEAT_ONLINE = "heartbeat-online",
  HEARTBEAT_AWAY = "heartbeat-away",
}
