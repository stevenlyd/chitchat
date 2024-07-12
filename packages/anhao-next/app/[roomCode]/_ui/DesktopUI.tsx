import { MessageBlock } from "@/app/_components/message/MessageBlock";
import { WSMessage } from "@/app/_types";
import { Button, Chip, Input, ScrollShadow } from "@nextui-org/react";
import { ChangeEventHandler, RefObject } from "react";

export interface DesktopUIProps {
  handleMessageChange: ChangeEventHandler<HTMLInputElement>;
  handleSendMessage: () => void;
  inputRef: RefObject<HTMLInputElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
  message: string | undefined;
  messages: WSMessage[];
  users: string[];
  username: string | null;
  toggleNotificationButton: JSX.Element;
  currentRoomCode: string;
}

export default function DesktopUI(props: DesktopUIProps) {
  const {
    handleMessageChange,
    handleSendMessage,
    inputRef,
    messagesEndRef,
    message,
    messages,
    users,
    username,
    toggleNotificationButton,
    currentRoomCode,
  } = props;

  return (
    <div className="flex h-full w-full py-20 flex-row item-center justify-center gap-5">
      <title>{`${currentRoomCode}: ${username}`}</title>
      <ScrollShadow className="flex flex-col flex-shrink-0 h-full w-200 bg-gray-900 rounded-lg pt-4 px-3 items-center gap-2">
        <p className="text-2xl font-bold mb-4 dark:text-white">在线用户</p>
        {users.map((user) => {
          return (
            <Chip className="overflow-ellipsis max-w-xs" key={user}>
              {user}
            </Chip>
          );
        })}
      </ScrollShadow>
      <div
        className="flex flex-grow h-full flex-col items-center bg-gray-900 justify-end pt-4 px-4 pb-4 rounded-lg gap-3"
        style={{ maxWidth: "600px" }}
      >
        <div className="flex flex-row w-full items-center justify-end">
          <p className="text-2xl font-bold mb-4 text-left w-full dark:text-white">
            {currentRoomCode}
          </p>
          {toggleNotificationButton}
        </div>
        <ScrollShadow
          className="flex flex-col h-full w-full items-center gap-2 pr-2"
          ref={messagesEndRef}
        >
          {messages.map((message) => {
            const { username, timestamp } = message;
            return (
              <MessageBlock
                key={`${username}-${timestamp.getMilliseconds()}`}
                {...message}
              />
            );
          })}
        </ScrollShadow>
        <div className="flex h-200 w-full flex-row justify-between gap-10">
          <Input
            value={message}
            autoFocus
            style={{ width: "100%" }}
            placeholder="请输入消息..."
            onChange={handleMessageChange}
            ref={inputRef}
          />
          <Button disabled={!message} onPress={handleSendMessage}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
