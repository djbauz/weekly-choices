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
  const [editingWeek, setEditingWeek] = useState(false)
  const [savingWeek, setSavingWeek] = useState(false)

  const [email, setEmail] = useState("")
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [invitationMessage, setInvitationMessage] = useState<string | null>(null)
  const [invitationError, setInvitationError] = useState<string | null>(null)

  const [leagueName, setLeagueName] = useState("")
  const [savingName, setSavingName] = useState(false)


  // ============================================================
  // LOAD DATA
  // ============================================================

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

    // ------------------------------------------------------------
    // Comprobar si la fecha guardada coincide con una de las
    // cinco semanas actualmente disponibles
    // ------------------------------------------------------------

    if (adminData?.league?.start_date) {

      const matchingWeek =
        adminData.available_weeks?.find(
          (week: any) =>
            new Date(week.start_at).getTime() ===
            new Date(adminData.league.start_date).getTime()
        )

      if (matchingWeek) {
        setSelectedWeek(matchingWeek.id)
      } else {
        // La semana guardada ya no está entre las cinco futuras
        // disponibles. Puede ser porque ya haya pasado.
        setSelectedWeek(null)
      }

    } else {
      // La liga todavía no tiene semana de inicio
      setSelectedWeek(null)
    }

    // Después de cargar los datos volvemos al modo normal.
    // Si existe una fecha, se mostrará de forma compacta.
    // Si no existe, se mostrarán directamente las semanas.
    setEditingWeek(false)
    setLoading(false)
  }

  // ============================================================
  // SAVE LEAGUE NAME
  // ============================================================
  async function saveLeagueName() {

    if (data?.league?.status !== "draft") {
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

  // ============================================================
  // SAVE LEAGUE START WEEK
  // ============================================================

  async function saveLeagueStartWeek() {

    if (data?.league?.status !== "draft") {
      return
    }

    if (!selectedWeek) {
      alert("Seleziona una settimana")
      return
    }

    setSavingWeek(true)

    const { error } = await supabase
      .rpc("set_league_start_week", {
        p_league_id: leagueId,
        p_week_id: selectedWeek
      })

    if (error) {
      console.error(error)
      alert(error.message)
      setSavingWeek(false)
      return
    }

    await loadData()
    setSavingWeek(false)
  }

  // ============================================================
  // SEND INVITATION
  // ============================================================

  async function sendInvitation() {

    const invitationEmail = email.trim().toLowerCase()

    if (!invitationEmail) {
      return
    }

    setSendingInvitation(true)
    setInvitationMessage(null)
    setInvitationError(null)

    const { data: invitationData, error } = await supabase
      .rpc("invite_to_league", {
        p_league_id: leagueId,
        p_email: invitationEmail
      })

    if (error) {
      console.error(error)
      setInvitationError(error.message)
      setSendingInvitation(false)
      return
    }

    console.log("Invitation created:", invitationData)

    setEmail("")
    setInvitationMessage("Invito inviato correttamente.")

    // Recargamos para actualizar:
    // - número de invitaciones pendientes
    // - plazas disponibles
    // - lista de invitaciones
    await loadData()

    setSendingInvitation(false)
  }


  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "it-IT",
      {
        day: "2-digit",
        month: "2-digit"
      }
    )
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </div>
    )
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !data) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Amministrazione lega
        </h1>
        <br />
        <div className="invitationCard">
          {error || "Impossibile caricare i dati della lega."}
        </div>
      </div>
    )
  }

  // ============================================================
  // DATA
  // ============================================================

  const league = data.league
  const weeks = data.available_weeks || []
  const invitations = data.invitations || []

  const hasStartDate = !!league.start_date

  const isDraft = league.status === "draft"

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="container">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {league.name || "Nuova lega"}
          </h1>
          <div className="text-sm opacity-70">
            Amministrazione lega
            <br />
            <br />
            1. Scegli il nome della tua lega
            <br />
            2. Scegli la data d'inizio
            <br />
            3. Invita i tuoi amici a partecipare
            <br />
            4. Apri ufficialmente la lega
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

      {/* ======================================================
          STATUS
      ====================================================== */}

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

      {/* ======================================================
          CONFIGURATION
      ====================================================== */}

      <div className="leagueCard">
        <h2 className="text-xl font-semibold">
          Configurazione
        </h2>
        <br />

        {/* ------------------------------------------------------
            LEAGUE NAME
        ------------------------------------------------------ */}

        <h3 className="font-semibold">
          Nome della lega
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            disabled={!isDraft || savingName}
            className="adminInput"
          />

          <button
            className="playBtn"
            onClick={saveLeagueName}
            disabled={
              !isDraft ||
              savingName ||
              !leagueName.trim()
            }
          >
            {savingName
              ? "Salvataggio..."
              : "Salva"
            }
          </button>

        </div>
        <br />
        <br />

        {/* ------------------------------------------------------
            START WEEK
        ------------------------------------------------------ */}

        <h3 className="font-semibold">
          Settimana d'inizio
        </h3>
        <div className="text-sm opacity-70">
          La lega inizierà con una delle prossime settimane disponibili.
        </div>
        <br />

        {/* ======================================================
            CASO 1:
            Nessuna data ancora salvata
        ====================================================== */}

        {!hasStartDate && (

          <div>

            {weeks.map((week: any, index: number) => {

              const selected = selectedWeek === week.id


              return (

                <div
                  key={week.id}
                  className="leagueCard"
                  onClick={() => {

                    if (
                      isDraft &&
                      !savingWeek
                    ) {
                      setSelectedWeek(week.id)
                    }

                  }}
                  style={{
                    cursor:
                      isDraft && !savingWeek
                        ? "pointer"
                        : "default",

                    border:
                      selected
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
            <br />
            <button
              className="playBtn"
              onClick={saveLeagueStartWeek}
              disabled={
                !isDraft ||
                !selectedWeek ||
                savingWeek
              }
            >
              {savingWeek
                ? "Salvataggio..."
                : "Salva settimana d'inizio"
              }
            </button>
          </div>
        )}


        {/* ======================================================
            CASO 2:
            Esiste una data e NON siamo in modalità modifica
        ====================================================== */}

        {hasStartDate && !editingWeek && (
          <div>
            <div className="leagueCard">
              <div className="flex items-center justify-between">
                <div>
                  <strong>
                    Data d'inizio
                  </strong>
                  <div className="text-sm opacity-70">
                    {formatDate(league.start_date)}
                  </div>
                </div>

                {isDraft && (

                  <button
                    className="playBtn"
                    onClick={() => {

                      setEditingWeek(true)

                      // Se la data salvata coincide con una delle
                      // cinque settimane disponibili, la manteniamo
                      // selezionata.

                      const matchingWeek =
                        weeks.find(
                          (week: any) =>
                            new Date(week.start_at).getTime() ===
                            new Date(league.start_date).getTime()
                        )

                      if (matchingWeek) {
                        setSelectedWeek(matchingWeek.id)
                      } else {
                        setSelectedWeek(null)
                      }

                    }}
                  >
                    Modifica
                  </button>
                )}
              </div>
            </div>


            {/* --------------------------------------------------
                Aviso si la fecha guardada ya ha pasado
            -------------------------------------------------- */}

            {new Date(league.start_date).getTime() <= Date.now() && (

              <div className="text-sm opacity-70">
                La settimana di inizio selezionata è già trascorsa.
                Seleziona una nuova settimana prima di aprire la lega.
              </div>

            )}
          </div>
        )}


        {/* ======================================================
            CASO 3:
            Estamos modificando una fecha existente
        ====================================================== */}

        {hasStartDate && editingWeek && (

          <div>
            {weeks.map((week: any, index: number) => {

              const selected = selectedWeek === week.id

              return (
                <div
                  key={week.id}
                  className="leagueCard"
                  onClick={() => {

                    if (
                      isDraft &&
                      !savingWeek
                    ) {
                      setSelectedWeek(week.id)
                    }

                  }}
                  style={{
                    cursor:
                      isDraft && !savingWeek
                        ? "pointer"
                        : "default",

                    border:
                      selected
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

            <br />

            <div className="flex gap-2">

              <button
                className="playBtn"
                onClick={saveLeagueStartWeek}
                disabled={
                  !isDraft ||
                  !selectedWeek ||
                  savingWeek
                }
              >

                {savingWeek
                  ? "Salvataggio..."
                  : "Salva settimana d'inizio"
                }

              </button>

              <button
                className="playBtn"
                onClick={() => {

                  setEditingWeek(false)

                  // Recuperamos la semana actualmente guardada
                  const matchingWeek =
                    weeks.find(
                      (week: any) =>
                        new Date(week.start_at).getTime() ===
                        new Date(league.start_date).getTime()
                    )

                  if (matchingWeek) {
                    setSelectedWeek(matchingWeek.id)
                  } else {
                    setSelectedWeek(null)
                  }

                }}
                disabled={savingWeek}
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>

      <br />

      {/* ======================================================
          INVITATIONS
      ====================================================== */}

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


        {/* ------------------------------------------------------
            SEND INVITATION
        ------------------------------------------------------ */}

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
            onClick={sendInvitation}
            disabled={
              !email.trim() ||
              data.available_invitations <= 0 ||
              sendingInvitation
            }
          >
            {sendingInvitation ? "Invio..." : "Invita"}
          </button>
          </div>

          {invitationMessage && (
            <div className="text-sm">
              {invitationMessage}
            </div>
          )}

          {invitationError && (
            <div className="text-sm">
              {invitationError}
            </div>
          )}

        </div>
        <br />


        {/* ------------------------------------------------------
            INVITATION LIST
        ------------------------------------------------------ */}

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
