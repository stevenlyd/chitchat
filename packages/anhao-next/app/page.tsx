"use client";
import { Button, Input } from "@nextui-org/react";
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { AppContext } from "./_context/AppContext";
import dynamic from "next/dynamic";

const Mobile = dynamic(() => import("./_ui/MobileLogin"), { ssr: false });
const Desktop = dynamic(() => import("./_ui/DeskTopLogin"), { ssr: false });

export default function Home() {
  const searchParams = useSearchParams();
  const searchParamRoomCode = useMemo(
    () => searchParams.get("roomCode"),
    [searchParams]
  );
  const { enterChatRoom, isMobile } = useContext(AppContext);
  const [roomCode, setRooCode] = useState<string | null>(searchParamRoomCode);
  const [username, setUsername] = useState<string | null>(null);

  const handleEnterRoom = useCallback(() => {
    if (roomCode && username) {
      enterChatRoom(roomCode, username);
    }
  }, [enterChatRoom, roomCode, username]);

  const shouldAutoFocusNameInput = useMemo(() => {
    return !username && !searchParamRoomCode;
  }, [searchParamRoomCode, username]);

  const handleCipherChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setRooCode(e.target.value);
    },
    []
  );

  const handleUsernameChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((e) => {
    setUsername(e.target.value);
  }, []);

  const handleEnterKeyDown = useCallback<
    KeyboardEventHandler<HTMLButtonElement | HTMLInputElement> &
      ((e: KeyboardEvent) => void)
  >(
    (e) => {
      if (e.key === "Enter") {
        handleEnterRoom();
      }
    },
    [handleEnterRoom]
  );

  return isMobile ? (
    <Mobile
      shouldAutoFocusNameInput={shouldAutoFocusNameInput}
      handleRoomCodeChange={handleCipherChange}
      handleEnterKeyDown={handleEnterKeyDown}
      handleUsernameChange={handleUsernameChange}
      handleEnterRoom={handleEnterRoom}
      username={username}
      roomCode={roomCode}
    />
  ) : (
    <Desktop
      shouldAutoFocusNameInput={shouldAutoFocusNameInput}
      handleRoomCodeChange={handleCipherChange}
      handleEnterKeyDown={handleEnterKeyDown}
      handleUsernameChange={handleUsernameChange}
      handleEnterRoom={handleEnterRoom}
      username={username}
      roomCode={roomCode}
    />
  );
}
