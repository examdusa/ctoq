import { appRouter } from "@/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          "http://localhost:3000, http://localhost:8080, https://www.content2quiz.com, https://www.thelearn.online",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    responseMeta: () => ({
      headers: {
        "Access-Control-Allow-Origin":
          "http://localhost:3000, http://localhost:8080, https://www.content2quiz.com, https://www.thelearn.online",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }),
  });
};

export { handler as GET, handler as POST };
