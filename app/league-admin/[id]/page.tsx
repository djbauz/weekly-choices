"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams, useRouter } from "next/navigation"


export default function LeagueAdminPage() {

  const params = useParams()
  const router = useRouter()

  const leagueId = params.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  const [leagueName, setLeagueName] = useState("")
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    loadData()
  }, [leagueId])


  async function loadData() {

    setLoading(true)
    setError(null)

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      location.href = "/"
      return
    }


    const {
      data: adminData,
      error: adminError
    } = await supabase
      .rpc("get_league_admin_data", {
        p_league_id: leagueId
      })


    if (adminError) {
      console.error(adminError)
      setError(adminError.message)
      setLoading(false)
      return
    }


    setData(adminData)
    setLeagueName(adminData?.league?.name || "")


    if (adminData?.league?.start_date) {

      const matchingWeek =
        adminData.available_weeks?.find(
          (week: any) =>
            week.start_at === adminData.league.start_date
        )

      if (matchingWeek) {
        setSelectedWeek(matchingWeek.id)
      }

    }

    setLoading(false)
  }

  async function saveLeagueName() {

    if (league.status !== "draft") {
      return
    }

    const name = leagueName.trim()

    if (!name) {
      alert("Inserisci il nome della lega")
      return
    }

    setSavingName(true)

    const { error } = await supabase
      .rpc("update_league_name", {
        p_league_id: leagueId,
        p_name: name
      })

    if (error) {
      console.error(error)
      alert(error.message)
      setSavingName(false)
      return
    }

    await loadData()

    setSavingName(false)
  }


  function formatDate(date: string) {

    return new Date(date).toLocaleDateString(
      "it-IT",
      {
        day: "2-digit",
        month: "2-digit"
      }
    )

  }


  if (loading) {

    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </div>
    )

  }


  if (error || !data) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Amministrazione lega
          <div>
          <ol>
            <li>1. Scegli il nome della tua lega</li>
            <li>2. Scegli la data d'inizio</li>
            <li>3. Invita i tuoi amici a partecipare</li>
            <li>4. Apri ufficialmente la lega</li>
          </ol>
          </div>        
        </h1>
        <br />
        <div className="invitationCard">
          {error || "Impossibile caricare i dati della lega."}
        </div>
      </div>
    )

  }


  const league = data.league
  const weeks = data.available_weeks || []
  const invitations = data.invitations || []


  return (
    <div className="container">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {league.name || "Nuova lega"}
          </h1>
          <div className="text-sm opacity-70">
            Amministrazione lega
          </div>
        </div>
        <button
          className="playBtn"
          onClick={() => router.push("/play")}
        >
          Indietro
        </button>
      </div>

      <br />

      {/* STATUS */}
      <div className="leagueCard">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Stato della lega
            </h2>
            <div className="text-sm opacity-70">
              La lega è ancora in fase di preparazione.
            </div>
          </div>
          <div className="font-semibold">
            {league.status?.toUpperCase()}
          </div>
        </div>
      </div>

      <br />

      {/* CONFIGURATION */}
      <div className="leagueCard">
        <h2 className="text-xl font-semibold">
          Configurazione
        </h2>
        <br />
        <h3 className="font-semibold">
          Nome della lega
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            disabled={league.status !== "draft" || savingName}
            className="adminInput"
          />

          <button
            className="playBtn"
            onClick={saveLeagueName}
            disabled={
              league.status !== "draft" ||
              savingName ||
              !leagueName.trim()
            }
          >
            {savingName ? "Salvataggio..." : "Salva"}
          </button>

        </div>
        <br />
        <br />

        <h3 className="font-semibold">
          Settimana d'inizio
        </h3>
        <div className="text-sm opacity-70">
          La lega inizierà con una delle prossime settimane disponibili.
        </div>
        <br />
        <div>

          {weeks.map((week: any, index: number) => {
            const selected = selectedWeek === week.id
            return (
              <div
                key={week.id}
                className="leagueCard"
                onClick={() => setSelectedWeek(week.id)}
                style={{
                  cursor: "pointer",
                  border: selected
                    ? "2px solid currentColor"
                    : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong>
                      Week {index + 1}
                    </strong>
                    <div className="text-sm opacity-70">
                      {formatDate(week.start_at)}
                      {" - "}
                      {formatDate(week.end_at)}
                    </div>
                  </div>

                  {selected && (
                    <span className="font-semibold">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <br />

        <button
          className="playBtn"
          disabled={!selectedWeek}
        >
          Salva settimana d'inizio
        </button>
      </div>
      <br />

      {/* INVITATIONS */}
      <div className="leagueCard">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Inviti
            </h2>
            <div className="text-sm opacity-70">
              {data.pending_invitations} inviti pendenti
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {data.available_invitations} / {data.max_invitations} disponibili
            </div>
          </div>
        </div>
        <br />

        {/* SEND INVITATION */}
        <div>
          <h3 className="font-semibold">
            Invita giocatore
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={
                data.available_invitations <= 0
              }
              className="adminInput"
            />

            <button
              className="playBtn"
              disabled={
                !email ||
                data.available_invitations <= 0
              }
            >
              Invita
            </button>
          </div>
        </div>
        <br />

        {/* INVITATION LIST */}

        {invitations.length > 0 && (
          <div>
            <h3 className="font-semibold">
              Richieste inviate
            </h3>
            <br />
            <div>
              {invitations.map((invitation: any) => (
                <div
                  key={invitation.id}
                  className="invitationCard"
                >
                  <div>
                    <strong>
                      {invitation.email}
                    </strong>
                    <div className="text-sm opacity-70">
                      {invitation.status}
                    </div>
                  </div>

                  <div className="text-sm opacity-70">
                    {invitation.created_at
                      ? formatDate(invitation.created_at)
                      : ""
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {invitations.length === 0 && (
          <div className="text-sm opacity-70">
            Non sono ancora stati inviati inviti.
          </div>
        )}

      </div>
    </div>
  )
}