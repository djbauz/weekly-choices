"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"


export default function PlayPage() {

  //const [profile, setProfile] = useState<any>(null)
  const [leagues, setLeagues] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);

  useEffect(() => {
    loadData()
  }, [])

  async function openMatrix(leagueId: string) {
    router.push(`/matrix/${leagueId}`)
  }

  async function openDashboard(leagueId: string) {
    router.push(`/dashboard/${leagueId}`)
  }

  async function loadData() {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      location.href = "/"
      return
    }

    //const user = session.user 

    const { data: leaguesData, error: leaguesError } = await supabase
      .rpc('get_my_leagues_dashboard_v2')
    if (leaguesError) {
      console.error(leaguesError)
      setLoading(false)
      return
    }
    setLeagues(leaguesData || [])
    setLoading(false)
  }

  if (loading || leagues === null) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    )
  }

  if (leagues.length === 0) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Ciao New User
        </h1>

        <h2 className="text-xl font-semibold">
          In attesa di entrare nella tua prima league
        </h2>
      </div>
    )
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
            className="leagueCard"
              onClick={() =>
              setExpandedLeague(
                expandedLeague === league.league_id ? null : league.league_id
              )
            }
          >
            {/* ALWAYS VISIBLE */}
            <h2 className="text-xl font-semibold">
              {league.league_name}
            </h2>
            
            {/* ONLY WHEN OPEN */}
            {expandedLeague === league.league_id && (
            <>
              <div>Round: {league.rounds_count}</div>
              <div>Giocatori: {league.total_players}</div>
              <div>Attivi: {league.active_players}</div>
              <div>Eliminati: {league.eliminated_players}</div>
              <div>Status: {league.user_status}</div>

              <button className="playBtn" onClick={() => openDashboard(league.league_id)}>
                Partite
              </button>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button className="playBtn" onClick={() => openMatrix(league.league_id)}>
                Rounds
              </button>
            </>
            )}
          </div>
        ))
      }
    </div>
  )
}