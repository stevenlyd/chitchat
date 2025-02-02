import { WSMessage } from "../../_types/message";
import { ChatActionType } from "anhao-elysia/src/modules/chat/types";
import { FC, useContext, useMemo } from "react";
import { Chip } from "@nextui-org/react";
import { DateTime } from "luxon";
import { AppContext } from "../../_context/AppContext";

export const MessageBlock: FC<WSMessage> = ({
  type,
  timestamp,
  username: senderUsername,
  message,
}) => {
  const time = useMemo(
    () => DateTime.fromJSDate(timestamp).toFormat("h:mm a"),
    [timestamp]
  );

  const { username } = useContext(AppContext);

  if (type === ChatActionType.MESSAGE) {
    if (senderUsername === username) {
      return (
        <div className="flex flex-row w-full items-center justify-end gap-5 p-2">
          <span className="dark:text-white flex-shrink-0">{time}</span>
          <p className="gap-2 dark:bg-gray-800 dark:text-white rounded-lg px-2 py-1 break-words overflow-hidden">
            {message}
          </p>
          <Chip>{senderUsername}</Chip>
        </div>
      );
    }
    return (
      <div className="flex flex-row w-full  items-center justify-start gap-5 p-2">
        <Chip>{senderUsername}</Chip>
        <p className="gap-2 dark:bg-gray-800 dark:text-white rounded-lg px-2 py-1 break-words overflow-hidden">
          {message}
        </p>
        <span className="dark:text-white flex-shrink-0">{time}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-row w-full  items-center justify-between gap-10 p-2">
      <div className="flex flex-row gap-2">
        <Chip>{senderUsername}</Chip>
        <span>
          {type === ChatActionType.JOIN ? "entered" : "left"} the chat room
        </span>
      </div>
      <span className="dark:text-white flex-shrink-0">{time}</span>
    </div>
  );
};
