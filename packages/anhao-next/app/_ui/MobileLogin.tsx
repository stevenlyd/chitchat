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
        <h1 className="text-4xl text-center">Chithat</h1>
        <div className="flex flex-col items-center justify-center gap-10 h-full">
          <Input
            size="lg"
            autoFocus={shouldAutoFocusNameInput}
            value={roomCode ?? ""}
            className="w-100"
            placeholder="Enter the room code..."
            onChange={handleRoomCodeChange}
          />
          <Input
            size="lg"
            autoFocus={!shouldAutoFocusNameInput}
            value={username ?? ""}
            className="w-100"
            placeholder="Enter your nickname..."
            onKeyDown={handleEnterKeyDown}
            onChange={handleUsernameChange}
          />
          <Button
            size="lg"
            disabled={!(roomCode && username)}
            onPress={handleEnterRoom}
          >
            Enter the room
          </Button>
        </div>
      </div>
    </div>
  );
}
