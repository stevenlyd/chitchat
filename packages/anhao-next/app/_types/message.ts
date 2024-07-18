import { api } from "@/api";

export type Message = {
  content: string;
  username: string;
  timestamp: Date;
};

export type WSMessage = Parameters<
  Parameters<ReturnType<typeof api.chat.subscribe>["subscribe"]>[0]
>[0]["data"];
