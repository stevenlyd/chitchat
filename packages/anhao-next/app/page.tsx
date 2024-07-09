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
import { AppContext } from "./_context/AppContext";

export default function Home() {
  const { roomCode: storedRoomCode, enterChatRoom } = useContext(AppContext);
  const [roomCode, setRooCode] = useState<string | null>(storedRoomCode);
  const [username, setUsername] = useState<string | null>(null);

  const handleEnterRoom = useCallback(() => {
    if (roomCode && username) {
      enterChatRoom(roomCode, username);
    }
  }, [enterChatRoom, roomCode, username]);

  const shouldAutoFocusNameInput = useMemo(() => {
    return !username && !storedRoomCode;
  }, [storedRoomCode, username]);

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

  return (
    <div className="flex flex-col items-center justify-end h-full">
      <h1 className="text-4xl">暗号</h1>
      <div className="flex flex-row items-center gap-10 h-full">
        <Input
          autoFocus={shouldAutoFocusNameInput}
          value={roomCode ?? ""}
          className="w-100"
          placeholder="输入你们的暗号..."
          onChange={handleCipherChange}
        />
        <Input
          autoFocus={!shouldAutoFocusNameInput}
          value={username ?? ""}
          className="w-100"
          placeholder="输入你的名字..."
          onKeyDown={handleEnterKeyDown}
          onChange={handleUsernameChange}
        />
        <Button disabled={!(roomCode && username)} onPress={handleEnterRoom}>
          进入房间
        </Button>
      </div>
    </div>
  );
}
