import type { Metadata } from "next";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Sign up — Wed Assist" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
