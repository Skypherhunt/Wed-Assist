"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "./actions";
import Ornament from "@/components/Ornament";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const action = isLogin ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="card w-full max-w-md p-8 text-center sm:p-10">
        <p className="eyebrow mb-4">For Couples</p>
        <h1 className="display text-3xl">
          {isLogin ? "Welcome back" : "Create your wedding"}
        </h1>
        <div className="my-5">
          <Ornament className="mx-auto" />
        </div>
        <p className="mb-6 font-body text-sm text-muted">
          {isLogin
            ? "Log in to manage your invitation and see your guests' responses."
            : "Sign up and we'll set up your invitation site in seconds."}
        </p>

        <form action={formAction} className="space-y-4 text-left">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              className="field"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="font-body text-sm text-red-400">{state.error}</p>
          )}
          {state?.notice && (
            <p className="font-body text-sm text-accent">{state.notice}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending
              ? isLogin
                ? "Logging in…"
                : "Creating…"
              : isLogin
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <p className="mt-6 font-body text-sm text-muted">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href="/coming-soon" className="text-accent hover:underline">
                Create your wedding
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>

        <Link
          href="/"
          className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-accent hover:underline"
        >
          ← Home
        </Link>
      </div>
    </main>
  );
}
