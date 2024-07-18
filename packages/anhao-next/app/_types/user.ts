import { SessionStatus } from "anhao-elysia/src/modules/chat/types/session";

export type UserInformation = {
  username: string;
  status: SessionStatus;
};
