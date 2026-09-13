"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"


export default function PlayPage() {

  const [leagues, setLeagues] = useState<any[] | null>(null)
  const [invitations, setInvitations] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptingInvitation, setAcceptingInvitation] = useState<string | null>(null)

  const router = useRouter()
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null)


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

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      location.href = "/"
      return
    }


    // Load leagues
    const {
      data: leaguesData,
      error: leaguesError
    } = await supabase
      .rpc("get_my_leagues_dashboard_v2")


    if (leaguesError) {
      console.error(leaguesError)
      setLeagues([])
    } else {
      setLeagues(leaguesData || [])
    }


    // Load pending invitations
    const {
      data: invitationsData,
      error: invitationError
    } = await supabase
      .rpc("get_my_pending_invitations")


    if (invitationError) {
      console.error(invitationError)
      setInvitations([])
    } else {
      setInvitations(invitationsData || [])
    }


    setLoading(false)
  }


  async function acceptInvitation(invitationId: string) {

    setAcceptingInvitation(invitationId)

    const {
      data,
      error
    } = await supabase
      .rpc("accept_league_invitation", {
        p_invitation_id: invitationId
      })


    if (error) {
      console.error(error)
      alert(error.message)
      setAcceptingInvitation(null)
      return
    }


    console.log("Invitation accepted. League member:", data)

    setAcceptingInvitation(null)

    // Reload leagues + invitations
    await loadData()
  }


  if (loading || leagues === null || invitations === null) {

    return (
      <div className="container">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </div>
    )

  }


  return (
    <div className="container">

      <h1 className="text-2xl font-bold">

        {leagues.length > 0
          ? `Ciao ${leagues[0]?.nickname}`
          : "Ciao New User"
        }

      </h1>

      <br />


      {/* PENDING INVITATIONS */}

      {invitations.length > 0 && (

        <div className="invitationContainer">

          {invitations.map((invitation) => (

            <div
              key={invitation.invitation_id}
              className="invitationCard"
            >

              <div>
                Hai un invito pendente alla lega{" "}
                <strong>
                  {invitation.league_name}
                </strong>
              </div>


              <button
                className="playBtn"
                onClick={() =>
                  acceptInvitation(invitation.invitation_id)
                }
                disabled={
                  acceptingInvitation === invitation.invitation_id
                }
              >

                {acceptingInvitation === invitation.invitation_id
                  ? "Accettando..."
                  : "Accetta invito"
                }

              </button>

            </div>

          ))}

        </div>

      )}


      {/* NO LEAGUES */}

      {leagues.length === 0 && (

        <h2 className="text-xl font-semibold">
          In attesa di entrare nella tua prima league
        </h2>

      )}


      {/* LEAGUES */}

      {leagues.length > 0 && (

        <>

          {leagues.map((league) => (

            <div
              key={league.league_id}

              className={
                league.league_status === "finished"
                  ? "leagueCard finished"
                  : "leagueCard"
              }

              onClick={() =>
                setExpandedLeague(
                  expandedLeague === league.league_id
                    ? null
                    : league.league_id
                )
              }
            >

              {/* ALWAYS VISIBLE */}

              <h2 className="text-xl font-semibold flex items-center gap-2">

                {league.user_status === "winner" && (
                  <span className="text-yellow-500">
                    🏆
                  </span>
                )}

                {league.league_name}

              </h2>


              {/* ONLY WHEN EXPANDED */}

              {expandedLeague === league.league_id && (

                <>

                  <div>
                    Round: {league.rounds_count}
                  </div>

                  <div>
                    Giocatori: {league.total_players}
                  </div>

                  <div>
                    Attivi: {league.active_players}
                  </div>

                  <div>
                    Eliminati: {league.eliminated_players}
                  </div>

                  <div>
                    Status: {league.user_status}
                  </div>


                  <button
                    className="playBtn"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDashboard(league.league_id)
                    }}
                  >
                    Partite
                  </button>

                  &nbsp;&nbsp;&nbsp;&nbsp;

                  <button
                    className="playBtn"
                    onClick={(e) => {
                      e.stopPropagation()
                      openMatrix(league.league_id)
                    }}
                  >
                    Rounds
                  </button>
                  
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {league.is_league_admin && league.league_status ==="draft" && (
                    <button 
                    className="playBtn"
                    onClick={() => router.push(`/league-admin/${league.league_id}`)}
                    >
                        Admin
                    </button>
                   )}

                </>

              )}

            </div>

          ))}

        </>

      )}

    </div>
  )
}