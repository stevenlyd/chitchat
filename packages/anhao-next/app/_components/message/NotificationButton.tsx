import { Switch } from "@nextui-org/react";

export interface NotificationButtonProps {
  isEnabled: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export default function NotificationButton(props: NotificationButtonProps) {
  const { isEnabled, setIsEnabled, size } = props;
  return (
    <Switch
      size={size ?? "sm"}
      isSelected={isEnabled}
      onValueChange={setIsEnabled}
      className="flex-shrink-0"
    >
      Notification
    </Switch>
  );
}
