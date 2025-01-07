import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const customMiddleware = (req: NextRequest) => {
  const protectedRoutes = ["/chat", "/profile"];
  const pathname = req.nextUrl.pathname;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get("__session")?.value;
    if (!token) {
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("redirect_url", "/");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
};

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent
) {
  const clerkResponse = clerkMiddleware()(req, event);
  if (clerkResponse) {
    return customMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/((?!api/trpc).*)",
  ],
};
