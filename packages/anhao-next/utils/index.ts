import { WSMessage } from "@/app/_types/message";
import { NotificationConfig } from "@/hooks/useNotification";
import { ChatActionType } from "anhao-elysia/src/modules/chat/types";

export const getNotificationConfig = (
  wsMessage: WSMessage
): NotificationConfig | null => {
  const { type, message, username } = wsMessage;

  switch (type) {
    case ChatActionType.MESSAGE:
      return {
        title: `${username}`,
        body: message,
      };
    case ChatActionType.ERROR:
      return {
        title: "An error occurred",
        body: message,
      };
    case ChatActionType.JOIN:
      return {
        title: `${username} joined the chat room`,
      };
    case ChatActionType.LEAVE:
      return {
        title: `${username} left the chat room`,
      };
    default:
      return null;
  }
};
