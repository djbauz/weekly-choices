"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    init()
  },[])

  async function init(){
    await checkLogged()
    await load()
    setLoading(false)
  }

  async function checkLogged(){
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){
      location.href="/"
      return
    }
  }

  async function load() {
    const { data, error } = await supabase
      .rpc("get_player_dashboard")

    if (!error) {
      setData(data)
    }

    setLoading(false)
  }

  async function playChoice(
    leagueId: string,
    weekId: string,
    optionId: string
  ) {
    if (loading) return
    setLoading(true)

    const { error } = await supabase.rpc("play_choice", {
      p_league_id: leagueId,
      p_week_id: weekId,
      p_option_id: optionId
    })

    setLoading(false)

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

      <h1 className="title">Dashboard UUC</h1>

      <WeekCard week={data.week} />

      <UserStatusCard data={data} />

      <MatchesCard
        matches={data.matches}
        playerChoice={data.player?.choice_team_id}
      />

      <TeamsCard
        data={data}
        onSelect={(optionId: string) =>
          playChoice(data.league_id, data.week?.id, optionId)
        }
      />

    </div>
  )
}


function WeekCard({ week }: any) {
  const today = new Date().toLocaleDateString()
  return (
    <div className="card">
      <h2>Settimana di gioco</h2>
      <p>Oggi è {new Date().toLocaleString("it-IT", {
          weekday: "long",
          day: "2-digit",
          month: "short",
          year: "numeric",
          //hour: "2-digit",
          //minute: "2-digit"         
        })}</p>
      <p>
        Apertura: {new Date(week.start_at).toLocaleString("it-IT", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"         
        })}
      </p>
      <p>
        Chiusura: {new Date(week.betting_closes_at).toLocaleString("it-IT", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"         
        })}
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
      {data.player?.has_played ? (
        <p>Hai già giocato: <b>{data.player.choice_name}</b></p>
      ) : (
        <p>Non hai ancora giocato</p>
      )}
    </div>
  )
}

function MatchesCard({ matches, playerChoice }: any) {
  return (
    <div className="card">
      <h2>Partite della settimana</h2>

      {matches?.map((m: any, i: number) => {
        const isSelected =
          playerChoice &&
          (playerChoice === m.home_team_id ||
           playerChoice === m.away_team_id)
        const isRecovery = m.flag !== null ? true : false

        return (
          <div
            key={i}
            className={`match ${isSelected ? "selected" : ""}`}
          >
            {/* PRIMA RIGA */}
            <div className="match-row">
              <span>
                {isRecovery ? "[R] " : ""} {m.home_team} vs {m.away_team}
                {isSelected && <span className="badge">✓ </span>}
              </span>

              <span className="score">
                {m.home_score ?? "-"} : {m.away_score ?? "-"}
              </span>
            </div>

            {/* SECONDA RIGA */}
            <div className="utc">
              {new Date(m.utc_time).toLocaleString("it-IT", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}



function TeamsCard({ data, onSelect }: any) {

  if (data.player?.has_played) {
    return (
      <div className="card">

        <h2>La tua scelta</h2>

        <div className="chosen">
          {data.player.choice_name}
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
        className={`teamBtn${t.previous ? "Red" : ""}`}
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
