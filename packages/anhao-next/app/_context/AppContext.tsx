import { api } from "@/api";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WSMessage } from "../_types/message";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { getNotificationConfig } from "@/utils";
import eventBus, {
  ApplicationEventTypes,
  subscribeEvents,
} from "../_services/eventBus";
import NotificationButton, {
  NotificationButtonProps,
} from "../_components/message/NotificationButton";
import useIsMobile from "@/hooks/useIsMobile";
import { UserInformation } from "../_types/user";
import useWindowBlur from "@/hooks/useWindowBlur";
import useWindowFocus from "@/hooks/useWindowFocus";
import {
  ChatActionType,
  ClientMessageType,
} from "anhao-elysia/src/modules/chat/types";
import { SessionStatus } from "anhao-elysia/src/modules/chat/types/session";
import useBeforeUnload from "@/hooks/useBeforeUnload";

interface AppContext {
  ws: ReturnType<typeof api.chat.subscribe> | null;
  sendMessage: (message: string) => void;
  messages: WSMessage[];
  users: UserInformation[];
  username: string | null;
  roomCode: string | null;
  enterChatRoom: (roomCode: string, username: string) => void;
  leaveChatRoom: () => void;
  updateUserList: (_roomCode: string, _username: string) => void;
  isConnecting: boolean;
  getToggleNotificationButton: (
    size?: NotificationButtonProps["size"]
  ) => JSX.Element;
  isMobile: boolean | null;
}

export const AppContext = createContext<AppContext>({
  ws: null,
  messages: [],
  users: [],
  username: null,
  roomCode: null,
  sendMessage: () => {},
  enterChatRoom: () => {},
  leaveChatRoom: () => {},
  updateUserList: (_roomCode: string, _username: string) => {},
  isConnecting: false,
  getToggleNotificationButton: (size?: NotificationButtonProps["size"]) => (
    <NotificationButton size={size} isEnabled={true} setIsEnabled={() => {}} />
  ),
  isMobile: null,
});

export const AppContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<ReturnType<typeof api.chat.subscribe> | null>(
    null
  );
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<
    Map<string, { username: string; status: SessionStatus }>
  >(new Map());
  const [username, setUsername] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { requestPermission, sendNotification, getToggleNotificationButton } =
    useNotification();
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  const { roomCode: roomCodeParam } = useParams();
  const searchParams = useSearchParams();
  const searchParamUsername = useMemo(
    () => searchParams.get("username"),
    [searchParams]
  );
  const pathParamRoomCode = useMemo(() => {
    if (typeof roomCodeParam === "string") {
      return decodeURIComponent(roomCodeParam);
    } else if (Array.isArray(roomCodeParam) && roomCodeParam.length > 0) {
      return decodeURIComponent(roomCodeParam[0]);
    }
    return null;
  }, [roomCodeParam]);

  const users = useMemo(() => Array.from(usersMap.values()), [usersMap]);

  const throttle = useCallback(
    <T extends (...args: any[]) => void>(
      fn: T,
      limit: number
    ): ((...args: Parameters<T>) => void) => {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          fn(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
    []
  );

  useWindowBlur(() => {
    if (ws) {
      ws.send({
        type: ClientMessageType.AWAY,
        timestamp: new Date(),
      });

      if (username) {
        setUsersMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(username, {
            username,
            status: SessionStatus.AWAY,
          });
          return newMap;
        });
      }
    }
  });

  useWindowFocus(() => {
    if (ws) {
      ws.send({
        type: ClientMessageType.BACK,
        timestamp: new Date(),
      });

      if (username) {
        setUsersMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(username, {
            username,
            status: SessionStatus.ONLINE,
          });
          return newMap;
        });
      }
    }
  });

  const updateUserList = useCallback(
    async (_roomCode: string, _username: string) => {
      if (_roomCode) {
        const { data: userList } = await api
          .chat({ roomCode: _roomCode })
          .get();

        if (userList) {
          setUsersMap(() => {
            const newMap = new Map<
              string,
              { username: string; status: SessionStatus }
            >(userList.map((user) => [user.username, user]));
            if (_username) {
              newMap.set(_username, {
                username: _username,
                status: SessionStatus.ONLINE,
              });
            }
            return newMap;
          });
        } else {
          console.warn("User list update failed");
        }
      }
    },
    []
  );

  const enterChatRoom = useCallback(
    (_roomCode: string, _username: string) => {
      setIsConnecting(true);
      const wsInstance = api.chat.subscribe({
        query: {
          roomCode: _roomCode,
          username: _username,
        },
      });
      setUsername(_username);
      setRoomCode(_roomCode);
      setWs(wsInstance);
      updateUserList(_roomCode, _username);
    },
    [updateUserList]
  );

  const throttledEnterChatRoom = useMemo(
    () => throttle(enterChatRoom, 1000),
    [throttle, enterChatRoom]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (ws && username) {
        ws.send({
          type: ClientMessageType.MESSAGE,
          message,
          timestamp: new Date(),
        });
        setMessages((prev) => [
          ...prev,
          {
            message,
            username,
            timestamp: new Date(),
            type: ChatActionType.MESSAGE,
          },
        ]);
      } else {
        console.error("You are not in a chat room!");
      }
    },
    [username, ws]
  );

  const leaveChatRoom = useCallback(() => {
    if (ws) {
      ws.close();
    } else {
      console.error("You are not in a chat room!");
    }
    router.push(roomCode ? `/?roomCode=${roomCode}` : "/");
    setWs(null);
    setUsername(null);
    setMessages([]);
    setUsersMap(new Map());
    setRoomCode(null);
    setIsConnected(false);
  }, [roomCode, router, ws]);

  const throttledLeaveChatRoom = useMemo(
    () => throttle(leaveChatRoom, 1000),
    [throttle, leaveChatRoom]
  );

  useEffect(() => {
    if (ws && !isConnected) {
      ws.on("open", () => {
        eventBus.emit(ApplicationEventTypes.WS_CONNECT);
      });

      ws.subscribe(({ data }) => {
        eventBus.emit(ApplicationEventTypes.WS_MESSAGE, data);
      });

      ws.on("close", () => {
        eventBus.emit(ApplicationEventTypes.WS_DISCONNECT);
      });
      setIsConnected(true);
    }
  }, [isConnected, ws]);

  useEffect(() => {
    if (!ws && !isConnecting && searchParamUsername && pathParamRoomCode) {
      throttledEnterChatRoom(
        decodeURIComponent(pathParamRoomCode),
        decodeURIComponent(searchParamUsername)
      );
    }
  }, [
    isConnecting,
    pathParamRoomCode,
    searchParamUsername,
    throttledEnterChatRoom,
    ws,
  ]);

  useEffect(() => {
    if (pathname === "/" && ws && !isConnecting) {
      if (roomCode && username) {
        router.push(`/${roomCode}?username=${username}`);
      } else {
        throttledLeaveChatRoom();
      }
    }
  }, [
    isConnecting,
    throttledLeaveChatRoom,
    pathname,
    roomCode,
    router,
    username,
    ws,
  ]);

  useEffect(() => {
    const heartBeatInterval = setInterval(() => {
      if (ws) {
        ws.send({
          type: ClientMessageType.HEARTBEAT,
          message: "I'm alive",
          timestamp: new Date(),
        });
      }
    }, 3000);

    return () => {
      clearInterval(heartBeatInterval);
    };
  }, [ws]);

  useEffect(() => {
    const handleWSMessage = (data: WSMessage) => {
      const { type, username: senderUserName, message } = data;
      const pushMessage = () => {
        setMessages((prev) => [
          ...(prev.length > 100 ? prev.slice(1) : prev),
          data,
        ]);
        const notificationConfig = getNotificationConfig(data);
        if (notificationConfig) {
          sendNotification(notificationConfig);
        }
      };
      if (username !== senderUserName) {
        switch (type) {
          case ChatActionType.JOIN: {
            pushMessage();
            setUsersMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(senderUserName, {
                username: senderUserName,
                status: SessionStatus.ONLINE,
              });
              return newMap;
            });
            break;
          }
          case ChatActionType.LEAVE: {
            pushMessage();
            setUsersMap((prev) => {
              const newMap = new Map(prev);
              newMap.delete(senderUserName);
              return newMap;
            });
            break;
          }
          case ChatActionType.MESSAGE: {
            pushMessage();
            break;
          }
          case ChatActionType.AWAY: {
            setUsersMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(senderUserName, {
                username: senderUserName,
                status: SessionStatus.AWAY,
              });
              return newMap;
            });
            break;
          }
          case ChatActionType.BACK: {
            setUsersMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(senderUserName, {
                username: senderUserName,
                status: SessionStatus.ONLINE,
              });
              return newMap;
            });
            break;
          }
          case ChatActionType.ERROR: {
            toast(message, { type: "error" });
            console.error(message);
            break;
          }
        }
      }
    };

    const handleWSConnect = () => {
      setIsConnecting(false);
      if (pathname === "/") {
        router.push(`/${roomCode}?username=${username}`);
      }
      requestPermission();
    };

    const handleWSDisconnect = () => {
      throttledLeaveChatRoom();
    };

    const unsubscriber = subscribeEvents([
      {
        event: ApplicationEventTypes.WS_MESSAGE,
        listener: handleWSMessage,
      },
      {
        event: ApplicationEventTypes.WS_CONNECT,
        listener: handleWSConnect,
      },
      {
        event: ApplicationEventTypes.WS_DISCONNECT,
        listener: handleWSDisconnect,
      },
    ]);

    return unsubscriber;
  }, [
    pathname,
    requestPermission,
    roomCode,
    router,
    sendNotification,
    throttledLeaveChatRoom,
    username,
  ]);

  useEffect(() => {
    const resetViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, user-scalable=no"
        );
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        document.body.scrollIntoView();
        resetViewport();
      }
    };

    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  useBeforeUnload(() => {
    ws?.send({
      type: ClientMessageType.LEAVE,
      timestamp: new Date(),
    });
  });

  const contextValue = useMemo(
    () => ({
      ws,
      messages,
      users,
      username,
      roomCode,
      sendMessage,
      enterChatRoom: throttledEnterChatRoom,
      leaveChatRoom: throttledLeaveChatRoom,
      updateUserList,
      isConnecting,
      getToggleNotificationButton,
      isMobile,
    }),
    [
      ws,
      messages,
      users,
      username,
      roomCode,
      sendMessage,
      throttledEnterChatRoom,
      throttledLeaveChatRoom,
      updateUserList,
      isConnecting,
      getToggleNotificationButton,
      isMobile,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
