import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
} from "@/lib/auth-username";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawUsername = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const username = normalizeUsername(rawUsername);

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username 3-20 karakter: huruf kecil, angka, titik, atau underscore" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Supabase Auth is email-based; we create a confirmed account directly via
  // the admin API so a fake, undeliverable email never blocks login on a
  // "confirm your email" step that could never be completed.
  const { error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    const alreadyExists = /already|exists|registered/i.test(error.message);
    return NextResponse.json(
      { error: alreadyExists ? "Username sudah dipakai, coba yang lain" : error.message },
      { status: alreadyExists ? 409 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
