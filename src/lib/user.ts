import type { Session } from "@supabase/supabase-js";

export function getDisplayName(session: Session | null) {
  const metadata = session?.user.user_metadata;
  const fullName = metadata?.full_name ?? metadata?.name;
  if (typeof fullName === "string" && fullName.trim()) return firstName(fullName);

  const emailName = session?.user.email?.split("@")[0];
  if (emailName) return firstName(emailName.replace(/[._-]+/g, " "));

  return "there";
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0];
}
