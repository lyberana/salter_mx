import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-correlation-id", correlationId);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
