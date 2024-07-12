import { Button, Input } from "@nextui-org/react";

interface DesktopLoginProps {
  shouldAutoFocusNameInput: boolean;
  handleRoomCodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEnterKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnterRoom: () => void;
  roomCode: string | null;
  username: string | null;
}

export default function DesktopLogin(props: DesktopLoginProps) {
  const {
    shouldAutoFocusNameInput,
    handleRoomCodeChange,
    roomCode,
    username,
    handleEnterKeyDown,
    handleUsernameChange,
    handleEnterRoom,
  } = props;
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col gap-20">
        <h1 className="text-4xl text-center">暗号</h1>
        <div className="flex flex-row items-center gap-10 h-full">
          <Input
            autoFocus={shouldAutoFocusNameInput}
            value={roomCode ?? ""}
            className="w-100"
            placeholder="输入你们的暗号..."
            onChange={handleRoomCodeChange}
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
    </div>
  );
}
