import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, approved")
    .eq("id", user.id)
    .single()

  if (!profile?.approved) redirect("/dashboard")
  if (!profile?.is_admin) redirect("/dashboard")

  return { supabase, user }
}
