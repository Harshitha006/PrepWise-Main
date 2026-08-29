"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserRecord } from "@/lib/actions/auth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Zap } from "lucide-react";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const setSession = async (idToken: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session creation failed");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "sign-up") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await createUserRecord(
          cred.user.uid,
          name || email.split("@")[0],
          email
        );
        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();
        await setSession(idToken);
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await createUserRecord(
        cred.user.uid,
        cred.user.displayName || "User",
        cred.user.email!,
        cred.user.photoURL || undefined
      );
      const idToken = await cred.user.getIdToken();
      await setSession(idToken);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let msg = "Google sign-in failed";
      if (error.code === "auth/unauthorized-domain") {
        msg = "This domain is not authorized in Firebase. Add your Vercel URL to Authorized Domains in Firebase Console.";
      } else if (error.code === "auth/popup-blocked") {
        msg = "Popup blocked by browser. Please allow popups for this site.";
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
      On mobile the card needs padding at the bottom so the submit button
      isn't hidden under the keyboard. `pb-safe` uses env(safe-area-inset-bottom)
      on iOS; the extra pb-6 is the fallback for Android.
    */
    <div className="glass-card rounded-3xl p-6 sm:p-8 neon-glow mb-4">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-cyber text-xl text-white tracking-wider">
            PREPWISE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {type === "sign-in" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-zinc-400 font-mono">
          {type === "sign-in"
            ? "Continue your interview prep journey"
            : "Start practicing with AI today"}
        </p>
      </div>

      {/* Google Button */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 ghost-btn mb-6 py-3"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs text-zinc-500 font-mono">
          <span className="bg-[#0f0f23] px-3">or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {type === "sign-up" && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              inputMode="text"
              enterKeyHint="next"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
            enterKeyHint="next"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={type === "sign-in" ? "current-password" : "new-password"}
            enterKeyHint="done"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="cyber-btn w-full flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : type === "sign-in" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 font-mono mt-6">
        {type === "sign-in" ? (
          <>
            No account?{" "}
            <Link
              href="/sign-up"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already have one?{" "}
            <Link
              href="/sign-in"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
