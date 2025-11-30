import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/webhook(.*)",
]);

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // CRITICAL FIX: Use await for async auth() call
  const { sessionId, sessionClaims } = await auth();

  // Check if route is protected by role-based access map
  const matched = matchers.find(({ matcher }) => matcher(req));

  // No session: redirect to sign-in
  if (!sessionId) {
    return auth().redirectToSignIn();
  }

  // Get user role from metadata
  const role =
    (sessionClaims?.metadata as { role?: string })?.role ??
    (sessionClaims?.publicMetadata as { role?: string })?.role;

  // Missing role: redirect to setup page (prevent infinite loop)
  if (!role) {
    if (!req.nextUrl.pathname.startsWith("/setup")) {
      return NextResponse.redirect(new URL("/setup", req.url));
    }
    return NextResponse.next();
  }

  // If route is not in protected map, allow access
  if (!matched) {
    return NextResponse.next();
  }

  // Check role permissions and prevent redirect loops
  const targetRolePath = `/${role}`;
  const isOnTargetRolePage = req.nextUrl.pathname.startsWith(targetRolePath);
  
  // If user doesn't have permission and is not already on their role page
  if (!matched.allowedRoles.includes(role) && !isOnTargetRolePage) {
    return NextResponse.redirect(new URL(targetRolePath, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};