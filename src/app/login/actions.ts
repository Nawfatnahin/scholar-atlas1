"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { authRateLimit, getIp } from "@/lib/ratelimit";
import { authSchema, updatePasswordSchema, formatZodError } from "@/lib/validations";

export async function login(formData: FormData) {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await authRateLimit.limit(ip);
  if (!success) redirect("/login?error=Too many requests. Please try again later.");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = authSchema.safeParse({ email, password });
  if (!validation.success) {
    const { error } = formatZodError(validation.error);
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();

  const data = {
    email: email,
    password: password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=Could not authenticate user");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await authRateLimit.limit(ip);
  if (!success) redirect("/signup?error=Too many requests. Please try again later.");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = authSchema.safeParse({ email, password });
  if (!validation.success) {
    const { error } = formatZodError(validation.error);
    redirect(`/signup?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();

  const data = {
    email: email,
    password: password,
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  
  if (authData?.user && authData?.session === null) {
    redirect("/login?message=Check your email to confirm your account.");
  } else {
    redirect("/dashboard");
  }
}

export async function forgotPassword(formData: FormData) {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await authRateLimit.limit(ip);
  if (!success) redirect("/login/forgot-password?error=Too many requests. Please try again later.");

  const email = formData.get("email") as string;

  const validation = authSchema.pick({ email: true }).safeParse({ email });
  if (!validation.success) {
    const { error } = formatZodError(validation.error);
    redirect(`/login/forgot-password?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/login/reset-password`,
  });

  if (error) {
    redirect(`/login/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login/forgot-password?message=Check your email for the reset link.");
}

export async function updatePassword(formData: FormData) {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await authRateLimit.limit(ip);
  if (!success) redirect("/login/reset-password?error=Too many requests. Please try again later.");

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validation = updatePasswordSchema.safeParse({ password, confirmPassword });
  if (!validation.success) {
    const { error } = formatZodError(validation.error);
    redirect(`/login/reset-password?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/login/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Password updated successfully. You can now sign in.");
}

export async function logout() {
  const headersList = await headers();
  const ip = getIp(headersList);
  const { success } = await authRateLimit.limit(ip);
  if (!success) redirect("/?error=Too many requests. Please try again later.");

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
