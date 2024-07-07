import { treaty } from "@elysiajs/eden";
import type { AnhaoElysia } from "anhao-elysia";

export const api = treaty<AnhaoElysia>(
  process.env.ANHAO_API ?? "localhost:3001"
);
