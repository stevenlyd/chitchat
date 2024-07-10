import { Switch } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useState } from "react";

export type NotificationConfig = NotificationOptions & {
  title: string;
};

export const useNotification = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return "denied";
      }

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        console.log("permission", permission);
        setIsEnabled(permission === "granted");
        return permission;
      }
      setIsEnabled(true);
      return Notification.permission;
    }, []);

  const toggleNotificationButton = useMemo(
    () => (
      <Switch size="sm" isSelected={isEnabled} onValueChange={setIsEnabled}>
        Notification
      </Switch>
    ),
    [isEnabled]
  );

  const sendNotification = useCallback(
    async (options: NotificationConfig) => {
      console.log("sendNotification", isEnabled);
      if (isEnabled) {
        const permission = await requestPermission();
        setIsEnabled(permission === "granted");

        console.log("tring to send notification", permission);
        if (permission === "granted") {
          const { title, ...notificationOptions } = options;
          console.log("sending notification");
          new Notification(title, notificationOptions);
        }
      }
    },
    [isEnabled, requestPermission]
  );

  useEffect(() => {
    if (isEnabled) {
      requestPermission();
    }
  }, [isEnabled, requestPermission]);

  return {
    requestPermission,
    sendNotification,
    toggleNotificationButton,
    isEnabled,
  };
};
