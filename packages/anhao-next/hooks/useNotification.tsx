import { useCallback } from "react";

export type NotificationConfig = NotificationOptions & {
  title: string;
};

export const useNotification = () => {
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return "denied";
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        return permission;
      }

      return Notification.permission;
    }, []);

  const sendNotification = useCallback(
    async (options: NotificationConfig) => {
      const permission = await requestPermission();

      if (permission === "granted") {
        const { title, ...notificationOptions } = options;
        new Notification(title, notificationOptions);
      }
    },
    [requestPermission]
  );

  return { requestPermission, sendNotification };
};
