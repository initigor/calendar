"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
  USERNAME_RULES_LABEL,
} from "@/lib/auth-username";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUsername = normalizeUsername(username);

    try {
      if (!isValidUsername(cleanUsername)) {
        throw new Error(`Username tidak valid — ${USERNAME_RULES_LABEL}`);
      }

      if (mode === "register") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanUsername, password }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Gagal mendaftar");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(cleanUsername),
        password,
      });
      if (error) throw new Error("Username atau password salah");

      router.push("/environments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-[18px] bg-gradient-to-b from-brand to-brand-dark shadow-card" />
        </div>

        <h1 className="text-2xl font-semibold text-center text-ink mb-1">
          {mode === "login" ? "Masuk" : "Buat akun"}
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          {mode === "login"
            ? "Masuk untuk melihat kalender bersamamu"
            : "Mulai bagikan jadwal dengan orang terdekat"}
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              autoFocus
              required
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
            />
            {mode === "register" && (
              <p className="text-[11px] text-gray-400 mt-1.5">{USERNAME_RULES_LABEL}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark disabled:opacity-50 transition"
          >
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? (
            <>
              Belum punya akun?{" "}
              <Link href="/register" className="text-brand font-medium">
                Daftar
              </Link>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <Link href="/login" className="text-brand font-medium">
                Masuk
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
