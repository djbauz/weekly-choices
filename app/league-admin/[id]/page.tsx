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

    // If the league already has a start date,
    // select the corresponding week if present.
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
          Amministrare Lega
        </h1>

        <br />

        <div className="invitationCard">
          {error || "Non è stato possibile caricare i dati della lega."}
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
            Amministrare lega
          </div>

        </div>


        <button
          className="playBtn"
          onClick={() => router.push("/play")}
        >
          Volver
        </button>

      </div>


      <br />


      {/* LEAGUE STATUS */}

      <div className="leagueCard">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              Status della lega
            </h2>

            <div className="text-sm opacity-70">
              La lega è ancora in preparazione.
            </div>

          </div>


          <div className="font-semibold">
            {league.status?.toUpperCase()}
          </div>

        </div>

      </div>


      <br />


      {/* LEAGUE SETTINGS */}

      <div className="leagueCard">

        <h2 className="text-xl font-semibold">
          Configurazione
        </h2>

        <br />


        <label className="block font-semibold">
          Nome della lega
        </label>

        <br />

        <input
          type="text"
          value={league.name || ""}
          disabled
          className="w-full p-2 rounded border"
        />


        <br />
        <br />


        <label className="block font-semibold">
          Settimana d'inizio
        </label>

        <div className="text-sm opacity-70">
          La lega inizierà una delle prossime settimane disponibili.
        </div>

        <br />


        <div className="space-y-2">

          {weeks.map((week: any) => {

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
                      {week.name || `Week ${week.number}`}
                    </strong>

                    <div className="text-sm opacity-70">
                      {new Date(week.start_at).toLocaleString("it-IT")}
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
          Salva data d'inizio
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
              {data.pending_invitations} Inviti in attesa
            </div>

          </div>


          <div className="text-right">

            <div className="text-2xl font-bold">
              {data.available_invitations} / {data.max_invitations}
            </div>

            <div className="text-sm opacity-70">
              disponibili
            </div>

          </div>

        </div>


        <br />


        {/* SEND INVITATION */}

        <div>

          <label className="block font-semibold">
            Invita giocatore
          </label>

          <br />

          <div className="flex gap-2">

            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={
                data.available_invitations <= 0
              }
              className="flex-1 p-2 rounded border"
            />


            <button
              className="playBtn"
              disabled={
                !email ||
                data.available_invitations <= 0
              }
            >
              Invitare
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


            <div className="space-y-2">

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
                      ? new Date(
                          invitation.created_at
                        ).toLocaleDateString("it-IT")
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
            Non sono ancora state inviate richieste.
          </div>

        )}

      </div>

    </div>
  )
}