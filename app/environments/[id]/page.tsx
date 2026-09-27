import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarApp from "@/components/calendar/CalendarApp";
import type { EnvironmentMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EnvironmentCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: environment } = await supabase
    .from("environments")
    .select("id, nama, owner_id, invite_code")
    .eq("id", id)
    .single();

  if (!environment) redirect("/environments");

  const { data: membersRaw } = await supabase
    .from("environment_members")
    .select("environment_id, user_id, role, joined_at, profiles(id, username)")
    .eq("environment_id", id);

  const members = (membersRaw ?? []) as unknown as EnvironmentMember[];

  const { data: myEnvironmentsRaw } = await supabase
    .from("environment_members")
    .select("environments(id, nama)")
    .eq("user_id", user.id);

  const myEnvironments = (myEnvironmentsRaw ?? [])
    .map((r) => r.environments as unknown as { id: string; nama: string })
    .filter(Boolean);

  return (
    <CalendarApp
      environment={environment}
      members={members}
      myEnvironments={myEnvironments}
      currentUserId={user.id}
    />
  );
}
