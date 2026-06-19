import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are PUBLIC (don't need auth)
const isPublicRoute = createRouteMatcher([
  "/",                    // Landing page
  "/sign-in(.*)",         // Sign in page
  "/sign-up(.*)",         // Sign up page
  "/api/webhooks(.*)",    // Clerk webhooks
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is NOT public, enforce authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
