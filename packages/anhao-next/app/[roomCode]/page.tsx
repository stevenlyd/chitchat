"use client";
import { Button, Chip, Input, ScrollShadow } from "@nextui-org/react";
import {
  ChangeEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../_context/AppContext";
import { MessageBlock } from "../_components/message";
import { useParams } from "next/navigation";

export default function Page() {
  const { sendMessage, messages, users, username, enterChatRoom, ws } =
    useContext(AppContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const { roomCode: roomCodeParam } = useParams();

  const [message, setMessage] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRoomCode = useMemo(() => {
    if (typeof roomCodeParam === "string") {
      return decodeURIComponent(roomCodeParam);
    }
    return decodeURIComponent(roomCodeParam[0]);
  }, [roomCodeParam]);

  const handleSendMessage = useCallback(() => {
    if (message) {
      sendMessage(message);
      setMessage("");
      inputRef.current?.focus();
    }
  }, [message, sendMessage]);

  const handleMessageChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setMessage(e.target.value);
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    };
    addEventListener("keydown", handleKeyDown);
    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSendMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo(0, messagesEndRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-row item-center justify-center gap-5">
      <title>{`${currentRoomCode}: ${username}`}</title>
      <ScrollShadow className="flex flex-col flex-shrink-0 h-full w-200 bg-gray-900 rounded-lg pt-4 px-3 items-center gap-2">
        <p className="text-2xl font-bold mb-4">在线用户</p>
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
        <p className="text-2xl font-bold mb-4 text-left w-full">
          {currentRoomCode}
        </p>
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
