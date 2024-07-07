import { Elysia } from "elysia";
import modules from "./modules";
import cors from "@elysiajs/cors";

const app = new Elysia().use(modules).use(cors());

export default app;
