"use client";
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
import { useParams } from "next/navigation";
import DesktopUI from "./_ui/DesktopUI";
import MobileUI from "./_ui/MobileUI";

export default function Page() {
  const {
    isMobile,
    sendMessage,
    messages,
    users,
    username,
    getToggleNotificationButton,
  } = useContext(AppContext);
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

  return isMobile ? (
    <MobileUI
      handleSendMessage={handleSendMessage}
      handleMessageChange={handleMessageChange}
      message={message}
      messages={messages}
      inputRef={inputRef}
      messagesEndRef={messagesEndRef}
      currentRoomCode={currentRoomCode}
      users={users}
      username={username}
      toggleNotificationButton={getToggleNotificationButton("lg")}
    />
  ) : (
    <DesktopUI
      handleSendMessage={handleSendMessage}
      handleMessageChange={handleMessageChange}
      message={message}
      messages={messages}
      inputRef={inputRef}
      messagesEndRef={messagesEndRef}
      currentRoomCode={currentRoomCode}
      users={users}
      username={username}
      toggleNotificationButton={getToggleNotificationButton()}
    />
  );
}
