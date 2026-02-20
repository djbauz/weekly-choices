"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"


export default function PlayPage() {

  const [profile, setProfile] = useState<any>(null)
  const [leagues, setLeagues] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function openMatrix(leagueId: string) {
    router.push(`/matrix/${leagueId}`)
  }

  async function loadData() {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('nickname')
      .single()

    setProfile(profileData)

    const { data: leaguesData } = await supabase
      .rpc('get_my_leagues_dashboard')

    setLeagues(leaguesData || [])
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Ciao {profile?.nickname}
      </h1>

      {leagues.map((league) => (
        <div
          key={league.league_id}
          className="border rounded-xl p-4 space-y-2"
        >
          <h2 className="text-xl font-semibold">
            {league.league_name}
          </h2>

          <div>Round: {league.rounds_count}</div>
          <div>Status: {league.user_status}</div>
          <div>Giocatori: {league.total_players}</div>
          <div>Attivi: {league.active_players}</div>
          <div>Eliminati: {league.eliminated_players}</div>

          {league.user_status === 'active' ? (
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.push("/dashboard")}>
              GIOCA
            </button>
          ) : (
            <div className="text-gray-500">
              Riprova nella prossima league
            </div>
          )}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={() => openMatrix(league.league_id)}>
            Matrice
          </button>
        </div>
      ))}
    </div>
  )
}