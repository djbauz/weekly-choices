"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .rpc("get_player_dashboard")

    if (!error) {
      setData(data)
    }

    setLoading(false)
  }

  async function playChoice(optionId: string) {
    const { error } = await supabase.rpc("play_choice", {
        p_option: optionId
    })

    if (error) {
        alert(error.message)
    } else {
        load()
    }
    }



  if (loading) return <div>Loading...</div>

  if (!data) return <div>Nessun dato</div>

  return (
    <div className="container">

      <h1 className="title">Dashboard</h1>

      <WeekCard week={data.week} />

      <UserStatusCard data={data} />

      <MatchesCard matches={data.matches} />

      <TeamsCard
        data={data}
        onSelect={playChoice}
      />

    </div>
  )
}


function WeekCard({ week }: any) {

  const today = new Date().toLocaleDateString()

  return (
    <div className="card">

      <h2>Settimana di gioco</h2>

      <p>Oggi è {today}</p>

      <p>
        Apertura: {formatDate(week.bet_open_at)}
      </p>

      <p>
        Chiusura: {formatDate(week.bet_close_at)}
      </p>

      <p>
        Stato: <b>{week.status}</b>
      </p>

    </div>
  )
}

function UserStatusCard({ data }: any) {

  return (
    <div className="card">

      <h2>Il tuo stato</h2>

      {data.user_choice ? (
        <p>Hai già giocato: <b>{data.user_choice}</b></p>
      ) : (
        <p>Non hai ancora giocato</p>
      )}

    </div>
  )
}

function MatchesCard({ matches }: any) {

  return (
    <div className="card">

      <h2>Partite della settimana</h2>

      {matches?.map((m: any, i: number) => (

        <div key={i} className="match">

          <div>
            {m.home_team} vs {m.away_team}
          </div>

          <div className="score">
            {m.home_score ?? "-"} : {m.away_score ?? "-"}
          </div>

        </div>

      ))}

    </div>
  )
}

function TeamsCard({ data, onSelect }: any) {

  if (data.user_choice) {
    return (
      <div className="card">

        <h2>La tua scelta</h2>

        <div className="chosen">
          {data.user_choice}
        </div>

      </div>
    )
  }

  if (!data.playable_teams?.length) {
    return (
      <div className="card">
        Nessuna squadra disponibile
      </div>
    )
  }

  return (
    <div className="card">

      <h2>Scegli la squadra</h2>

      <div className="teams">

        {data.playable_teams.map((t: any) => (

      <button
        key={t.id ?? t.full_name}
        onClick={() => {
          console.log("TEAM", t)
          onSelect(t.id)
        }}
        className="teamBtn"
      >
        {t.short_name ?? t.name}
      </button>

        ))}

      </div>

    </div>
  )
}

function formatDate(date: string) {
  if (!date) return "-"
  return new Date(date).toLocaleString()
}
