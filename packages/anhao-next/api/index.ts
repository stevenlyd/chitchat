import { treaty } from "@elysiajs/eden";
import type { AnhaoElysia } from "anhao-elysia";

export const api = treaty<AnhaoElysia>(
  process.env.ANHAO_API ?? "http://localhost:3001"
  // ?? "https://anhao.onrender.com"
);
