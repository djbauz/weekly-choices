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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      location.href = "/"
      return
    }
    const user = session.user 

    /*const { data: { user } } = await supabase.auth.getUser()
    if(!user){
      location.href="/"
      return
    }*/

    /*const { data: profileData, error:profileError } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(profileError)
      return
    }

    setProfile(profileData)*/

    const { data: leaguesData, error: leaguesError } = await supabase
      .rpc('get_my_leagues_dashboard_v2')
    if (leaguesError) {
      console.error(leaguesError)
      return
    }
    setLeagues(leaguesData || [])
  }

  return (
    <div className="container">

      <h1 className="text-2xl font-bold">
        Ciao {leagues[0]?.nickname}
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

          <div>Status: {league.user_status}</div>
          <button className="playBtn" onClick={() => openMatrix(league.league_id)}>
            Rounds
          </button>
          &nbsp;&nbsp;&nbsp;&nbsp;
            <button className="playBtn" onClick={() => router.push("/dashboard")}>
              Partite
            </button>
        </div>
      ))}
    </div>
  )
}