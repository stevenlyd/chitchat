import { treaty } from "@elysiajs/eden";
import type { AnhaoElysia } from "anhao-elysia";

export const api = treaty<AnhaoElysia>(
  process.env.NEXT_PUBLIC_ANHAO_API ?? "http://localhost:3001"
);
