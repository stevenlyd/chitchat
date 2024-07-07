import Elysia from "elysia";
import chatModule from "./chat";

const modules = new Elysia().use(chatModule);

export default modules;
