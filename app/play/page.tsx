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
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){
      location.href="/"
      return
    }
    const { data: profileData, error:profileError } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(profileError)
      return
    }

    setProfile(profileData)

    const { data: leaguesData, error: leaguesError } = await supabase
      .rpc('get_my_leagues_dashboard')
    if (leaguesError) {
      console.error(leaguesError)
      return
    }
    setLeagues(leaguesData || [])
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Ciao {profile?.nickname}
      </h1>
      <br />

      {leagues.map((league) => (
        <div
          key={league.league_id}
           className="card"
        >
          <h2 className="text-xl font-semibold">
            {league.league_name}
          </h2>

          <div>Round: {league.rounds_count}</div>
          <div>Giocatori: {league.total_players}</div>
          <div>Attivi: {league.active_players}</div>
          <div>Eliminati: {league.eliminated_players}</div>
          <button onClick={() => openMatrix(league.league_id)}>
            Matrice Giornate
          </button>
          <br />
          <br />
          <div>Status: {league.user_status}</div>

          {league.user_status === 'active' ? (
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.push("/dashboard")}>
              GIOCA
            </button>
          ) : (
            <div className="text-gray-500">
              Riprova nella prossima league
            </div>
          )}
        </div>
      ))}
    </div>
  )
}