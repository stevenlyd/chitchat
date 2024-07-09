import { api } from "@/api";
import {
  ChatActionTypes,
  ClientMessageTypes,
} from "anhao-elysia/src/modules/chat/types";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WSMessage } from "../_types";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { getNotificationConfig } from "@/utils";

interface AppContext {
  ws: ReturnType<typeof api.chat.subscribe> | null;
  sendMessage: (message: string) => void;
  messages: WSMessage[];
  users: string[];
  username: string | null;
  roomCode: string | null;
  enterChatRoom: (roomCode: string, username: string) => void;
  leaveChatRoom: () => void;
  updateUserList: (_roomCode: string, _username: string) => void;
  isConnecting: boolean;
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
});

export const AppContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<ReturnType<typeof api.chat.subscribe> | null>(
    null
  );
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [usersSet, setUsersSet] = useState<Set<string>>(new Set<string>([]));
  const [username, setUsername] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { requestPermission, sendNotification } = useNotification();
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

  const users = useMemo(() => Array.from(usersSet), [usersSet]);

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

  const updateUserList = useCallback(
    async (_roomCode: string, _username: string) => {
      if (_roomCode) {
        const { data: userList } = await api
          .chat({ roomCode: _roomCode })
          .get();

        if (userList) {
          setUsersSet(() => {
            const newSet = new Set(userList);
            if (_username) {
              newSet.add(_username);
            }
            return newSet;
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
          type: ClientMessageTypes.MESSAGE,
          message,
          timestamp: new Date(),
        });
        setMessages((prev) => [
          ...prev,
          {
            message,
            username,
            timestamp: new Date(),
            type: ChatActionTypes.MESSAGE,
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
    setUsersSet(new Set());
    setRoomCode(null);
    setIsConnected(false);
  }, [roomCode, router, ws]);

  useEffect(() => {
    if (ws && !isConnected) {
      ws.on("open", () => {
        setIsConnecting(false);
        if (pathname === "/") {
          router.push(`/${roomCode}?username=${username}`);
          requestPermission();
        }
      });

      ws.subscribe(({ data }) => {
        const { type, username: senderUserName, message } = data;
        if (username !== senderUserName) {
          if (type !== ChatActionTypes.ERROR) {
            setMessages((prev) => [
              ...(prev.length > 100 ? prev.slice(1) : prev),
              data,
            ]);
            const notificationConfig = getNotificationConfig(data);
            if (notificationConfig) {
              sendNotification(notificationConfig);
            }
          } else {
            toast(message, { type: "error" });
            console.error(message);
          }
          if (type === ChatActionTypes.JOIN) {
            setUsersSet((prev) => {
              const newSet = new Set(prev);
              newSet.add(senderUserName);
              return newSet;
            });
          } else if (type === ChatActionTypes.LEAVE) {
            setUsersSet((prev) => {
              const newSet = new Set(prev);
              newSet.delete(senderUserName);
              return newSet;
            });
          }
        }
      });

      ws.on("close", () => {
        leaveChatRoom();
      });

      setIsConnected(true);
    }
  }, [
    isConnected,
    leaveChatRoom,
    pathname,
    requestPermission,
    roomCode,
    router,
    sendNotification,
    username,
    ws,
  ]);

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
        leaveChatRoom();
      }
    }
  }, [isConnecting, leaveChatRoom, pathname, roomCode, router, username, ws]);

  useEffect(() => {
    const heartBeatInterval = setInterval(() => {
      if (ws) {
        ws.send({
          type: ClientMessageTypes.HEARTBEAT,
          message: "I'm alive",
          timestamp: new Date(),
        });
      }
    }, 3000);

    return () => {
      clearInterval(heartBeatInterval);
    };
  }, [ws]);

  return (
    <AppContext.Provider
      value={{
        ws,
        messages,
        users,
        username,
        roomCode,
        sendMessage,
        enterChatRoom: throttledEnterChatRoom,
        leaveChatRoom,
        updateUserList,
        isConnecting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
