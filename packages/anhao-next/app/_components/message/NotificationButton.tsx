import { Switch } from "@nextui-org/react";

interface NotificationButtonProps {
  isEnabled: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
}

export default function NotificationButton(props: NotificationButtonProps) {
  const { isEnabled, setIsEnabled } = props;
  return (
    <Switch
      size="sm"
      isSelected={isEnabled}
      onValueChange={setIsEnabled}
      className="flex-shrink-0"
    >
      通知
    </Switch>
  );
}
