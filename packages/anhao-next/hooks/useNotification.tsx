import NotificationButton, {
  NotificationButtonProps,
} from "@/app/_components/message/NotificationButton";
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

  const getToggleNotificationButton = useCallback(
    (size?: NotificationButtonProps["size"]) => (
      <NotificationButton
        size={size}
        isEnabled={isEnabled}
        setIsEnabled={setIsEnabled}
      />
    ),
    [isEnabled]
  );

  const sendNotification = useCallback(
    async (options: NotificationConfig) => {
      if (
        isEnabled &&
        (document.visibilityState === "hidden" || !document.hasFocus())
      ) {
        const permission = await requestPermission();
        setIsEnabled(permission === "granted");

        if (permission === "granted") {
          const { title, ...notificationOptions } = options;
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
    getToggleNotificationButton,
    isEnabled,
  };
};
