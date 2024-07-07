import { api } from "@/api";
import { ChatActionTypes } from "anhao-elysia/src/modules/chat/types";
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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { throttle } from "lodash";

interface AppContext {
  ws: ReturnType<typeof api.chat.subscribe> | null;
  sendMessage: (message: string) => void;
  messages: WSMessage[];
  users: string[];
  username: string | null;
  roomCode: string | null;
  enterChatRoom: (roomCode: string, username: string) => void;
  leaveChatRoom: () => void;
  updateUserList: () => void;
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
  updateUserList: () => {},
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
  const router = useRouter();
  const { roomCode: roomCodeParam } = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const users = useMemo(() => Array.from(usersSet), [usersSet]);

  const searchParamUsername = useMemo(
    () => searchParams.get("username"),
    [searchParams]
  );

  const updateUserList = useCallback(
    async (_roomCode = roomCode) => {
      if (_roomCode) {
        const { data: userList } = await api
          .chat({ roomCode: _roomCode })
          .get();

        if (userList) {
          setUsersSet(() => {
            const newSet = new Set(userList);
            if (username) {
              newSet.add(username);
            }
            return newSet;
          });
        } else {
          console.warn("User list update failed");
        }
      }
    },
    [roomCode, username]
  );

  const enterChatRoom = useCallback(
    throttle((_roomCode: string, username: string) => {
      if (_roomCode !== roomCode) {
        const wsInstance = api.chat.subscribe({
          query: {
            roomCode: _roomCode,
            username,
          },
        });
        setUsername(username);
        setRoomCode(_roomCode);
        setWs(wsInstance);
        updateUserList(_roomCode);
      }
    }, 1000),
    [roomCode, updateUserList]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (ws && username) {
        ws.send({
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
      router.push("/");
      setWs(null);
      setUsername(null);
      setMessages([]);
      setUsersSet(new Set());
    } else {
      console.error("You are not in a chat room!");
    }
  }, [router, ws]);

  useEffect(() => {
    if (ws) {
      ws.subscribe(({ data }) => {
        const { type, username: senderUserName, message } = data;
        if (username !== senderUserName) {
          if (type !== ChatActionTypes.ERROR) {
            setMessages((prev) => [
              ...(prev.length > 100 ? prev.slice(1) : prev),
              data,
            ]);
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
    }
  }, [leaveChatRoom, username, ws]);

  useEffect(() => {
    if (pathname === "/" && ws && username && roomCode) {
      router.push(`/${roomCode}?username=${username}`);
    } else if (
      !ws &&
      pathname !== "/" &&
      searchParamUsername &&
      roomCodeParam &&
      typeof roomCodeParam === "string"
    ) {
      enterChatRoom(
        decodeURIComponent(roomCodeParam),
        decodeURIComponent(searchParamUsername)
      );
    } else if (!ws) {
      leaveChatRoom();
      router.push("/");
    }
  }, [
    enterChatRoom,
    leaveChatRoom,
    pathname,
    roomCode,
    roomCodeParam,
    router,
    searchParamUsername,
    username,
    ws,
  ]);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        ws,
        messages,
        users,
        username,
        roomCode,
        sendMessage,
        enterChatRoom,
        leaveChatRoom,
        updateUserList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
