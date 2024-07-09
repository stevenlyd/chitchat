import { WSMessage } from "@/app/_types";
import { NotificationConfig } from "@/hooks/useNotification";
import { ChatActionTypes } from "anhao-elysia/src/modules/chat/types";

export const getNotificationConfig = (
  wsMessage: WSMessage
): NotificationConfig | null => {
  const { type, message, username } = wsMessage;

  switch (type) {
    case ChatActionTypes.MESSAGE:
      return {
        title: `${username}`,
        body: message,
      };
    case ChatActionTypes.ERROR:
      return {
        title: "An error occurred",
        body: message,
      };
    case ChatActionTypes.JOIN:
      return {
        title: `${username} joined the chat room`,
      };
    case ChatActionTypes.LEAVE:
      return {
        title: `${username} left the chat room`,
      };
    default:
      return null;
  }
};
