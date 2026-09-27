import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EnvironmentList from "@/components/EnvironmentList";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface EnvironmentSummary {
  id: string;
  nama: string;
  invite_code: string;
  owner_id: string;
  role: Role;
  memberCount: number;
}

export default async function EnvironmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("environment_members")
    .select("role, environments(id, nama, invite_code, owner_id)")
    .eq("user_id", user.id);

  const rows = memberships ?? [];

  const summaries: EnvironmentSummary[] = await Promise.all(
    rows
      .filter((row) => row.environments)
      .map(async (row) => {
        const env = row.environments as unknown as {
          id: string;
          nama: string;
          invite_code: string;
          owner_id: string;
        };
        const { count } = await supabase
          .from("environment_members")
          .select("*", { count: "exact", head: true })
          .eq("environment_id", env.id);

        return {
          id: env.id,
          nama: env.nama,
          invite_code: env.invite_code,
          owner_id: env.owner_id,
          role: row.role as Role,
          memberCount: count ?? 1,
        };
      })
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return <EnvironmentList environments={summaries} userName={profile?.username ?? ""} />;
}
