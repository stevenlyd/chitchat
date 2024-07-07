import { treaty } from "@elysiajs/eden";
import type { AnhaoElysia } from "anhao-elysia";

export const api = treaty<AnhaoElysia>("localhost:3001");
