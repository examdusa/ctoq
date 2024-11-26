import { type AppRouter } from "@/server";
import { createTRPCReact } from "@trpc/react-query";
const trpc = createTRPCReact<AppRouter>({});
export { trpc };
