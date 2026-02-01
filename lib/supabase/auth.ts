import { supabaseServer } from "./server";

export async function requireUser() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return data.user;
}

export async function requireRole() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("role,email,full_name")
    .eq("id", data.user.id)
    .single();

  return { user: data.user, profile: prof };
}
