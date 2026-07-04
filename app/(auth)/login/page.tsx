import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";

export const metadata: Metadata = {
  title: "Log in — Wed Assist",
  robots: { index: false, follow: false },
};

// Login is hidden from the public while the product is finishing up: the page
// only renders with the owner bypass (/login?owner=1) and otherwise shows the
// "coming soon" gate. Change OWNER_KEY to any secret you like. Sign-in itself is
// still protected by the Supabase password — this just keeps casual visitors
// out of the login screen.
const OWNER_KEY = "1";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ owner?: string }>;
}) {
  const { owner } = await searchParams;
  if (owner !== OWNER_KEY) redirect("/coming-soon");
  return <AuthForm mode="login" />;
}
