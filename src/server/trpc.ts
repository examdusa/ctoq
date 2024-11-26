import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

const router = t.router;
const procedure = t.procedure;

export { procedure, router };
