import { redirect } from "next/navigation";

/**
 * Root page — middleware handles auth, so anyone reaching here
 * is either signed in (go to dashboard) or will be caught by
 * Clerk's redirect. We just send everyone to /dashboard and let
 * middleware redirect unauthenticated users to /login.
 */
export default function Home() {
  redirect("/dashboard");
}
