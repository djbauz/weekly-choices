import { supabase } from "@/lib/supabaseClient";

export async function getDashboard() {
  const { data, error } = await supabase.rpc("get_player_dashboard");

  if (error) {
    console.error(error);
    throw new Error("Dashboard load failed");
  }

  return data;
}
