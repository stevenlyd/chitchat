import { Button, Input } from "@nextui-org/react";

interface MobileLoginProps {
  shouldAutoFocusNameInput: boolean;
  handleRoomCodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEnterKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnterRoom: () => void;
  roomCode: string | null;
  username: string | null;
}

export default function MobileLogin(props: MobileLoginProps) {
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
      <div className="flex flex-col gap-10">
        <h1 className="text-4xl text-center">暗号</h1>
        <div className="flex flex-col items-center justify-center gap-10 h-full">
          <Input
            size="lg"
            autoFocus={shouldAutoFocusNameInput}
            value={roomCode ?? ""}
            className="w-100"
            placeholder="输入你们的暗号..."
            onChange={handleRoomCodeChange}
          />
          <Input
            size="lg"
            autoFocus={!shouldAutoFocusNameInput}
            value={username ?? ""}
            className="w-100"
            placeholder="输入你的名字..."
            onKeyDown={handleEnterKeyDown}
            onChange={handleUsernameChange}
          />
          <Button
            size="lg"
            disabled={!(roomCode && username)}
            onPress={handleEnterRoom}
          >
            进入房间
          </Button>
        </div>
      </div>
    </div>
  );
}
