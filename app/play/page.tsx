"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function PreDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users,setUsers] = useState<any>(null)

  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)

    const { data: sessionData } = await supabase.auth.getUser()
    const user = sessionData?.user

    setUsers(user)

    if (!user) {
      setLoading(false)
      return
    }

    const { data: dashboardData, error } = await supabase
      .rpc("get_player_dashboard")

    if (!error) {
      setData(dashboardData)
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  if (!data) return <div>Errore caricamento</div>

  const player = data.player || {}
  const week = data.week || {}

  const isEliminated = player.active_player === false
  const hasPlayed = player.has_played === true
  const userNick = player.player_nick

  return (
    <><div className="card">

      <h1>Schedina</h1> <p>{userNick}</p>

      <div>
        <b>Settimana:</b> {week.name || "-"}
      </div>

      <div>
        <b>Matchday:</b> {week.matchday || "-"}
      </div>

      <hr />

      <h2>Il tuo stato</h2>

      {isEliminated ? (
        <div>
          ❌ Sei stato eliminato
        </div>
      ) : (
        <div>
          ✅ Sei ancora in gioco
        </div>
      )}

      <hr />

      <h2>Ultima giocata</h2>

      {hasPlayed ? (
        <div>
          Hai scelto: <b>{player.choice_name || player.choice}</b>
        </div>
      ) : (
        <div>Non hai ancora giocato</div>
      )}

      <hr />

      {!isEliminated ? (
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          GIOCA
        </button>
      ) : (
        <div>
          Spiace, non puoi accedere al dashboard.
        </div>
      )}

    </div>
    <div className="card"><h1></h1></div></>
  )
}
