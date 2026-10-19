"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useParams } from "next/navigation";

type Row = {
  user_id: string
  nickname: string
  round_number: number
  option_name: string | null
  is_win: boolean | null
  elim_round: number | null
}

export default function MatrixPage({ params }: any) {
  const { leagueId } = useParams();

  const [rows, setRows] = useState<Row[]>([])
  const [leagueName, setLeagueName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)

    const { data: matrix, error } = await supabase.rpc(
      "get_league_matrix",
      { p_league_id: leagueId }
    )
    console.log({leagueId})

    if (error) {
      alert(error.message)
      return
    }

    const { data: name } = await supabase.rpc(
      "get_league_name",
      { p_league_id: leagueId }
    )

    setLeagueName(name || "")
    setRows(matrix || [])
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  // pivot frontend
  const playersMap: Record<string, any> = {}
  const roundsSet = new Set<number>()

  rows.forEach(r => {
    roundsSet.add(r.round_number)

    if (!playersMap[r.user_id]) {
      playersMap[r.user_id] = {
        nickname: r.nickname,
        elim_round: r.elim_round,
        rounds: {}
      }
    }

    playersMap[r.user_id].rounds[r.round_number] = r
  })

  const players = Object.values(playersMap)
  const rounds = Array.from(roundsSet).sort((a, b) => a - b)

  const lastRound = rounds[rounds.length - 1]

  const sortedPlayers = [...players].sort((a, b) => {
    const aVal = a.rounds[lastRound]?.option_name || ""
    const bVal = b.rounds[lastRound]?.option_name || ""

    return bVal.localeCompare(aVal) // orden alfabético
  })

  function getCellColor(player: any, round: number, cell: Row |undefined) {
    if (player.elim_round != null && round >= player.elim_round) {
      return "cellRed"
    }

    if (cell?.is_win === true) {
      return "cellGreen"
    }

    if (cell?.is_win === false) {
      return "cellRed"
    }

    if (cell?.is_win == null) {
      return "cellPending"
    }

    return ""
  }

  return (
    <div className="container">

      <h1>Matrice</h1>
      <h2>{leagueName}</h2>

      <div className="tableWrapper">
        <table className="matrix">

          <thead>
            <tr>
              <th>Player</th>
              {rounds.map(r => (
                <th key={r}>R{r}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedPlayers.map((p: any, i: number) => (
            //{players.map((p: any, i: number) => (
              <tr key={i}>
                <td className="player">{p.nickname}</td>

                {rounds.map(round => {
                  const cell = p.rounds[round]

                  return (
                    <td
                      key={round}
                      className={getCellColor(p, round, cell)}
                    >
                      {cell?.option_name || "-"}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <style jsx>{`
        .page {
          padding: 24px;
        }

        .container {
          padding: 16px;
          max-width: 100%;
        }

        h1 {
          font-size: 24px;
          margin: 0 0 4px;
        }

        h2 {
          font-size: 17px;
          font-weight: 500;
          margin: 0 0 16px;
          color: #666;
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: white;
        }

        table {
          border-collapse: separate;
          border-spacing: 0;
          min-width: max-content;
          width: 100%;
          font-size: 13px;
        }

        th, td {
          min-width: 42px;
          padding: 5px 7px;
          text-align: center;
          white-space: nowrap;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f3f4f6;
          color: #374151;
          font-weight: 700;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        th:first-child {
          position: sticky;
          left: 0;
          z-index: 4;
          text-align: left;
          min-width: 100px;
        }

        td.player {
          position: sticky;
          left: 0;
          z-index: 1;
          text-align: left;
          font-weight: 600;
          color: #111827;
          background: white;
          min-width: 100px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cellRed {
          background: #fee2e2;
          color: #b91c1c;
        }

        .cellGreen {
          background: #dcfce7;
          color: #166534;
        }

        .cellPending {
          background: #374151;
          color: white;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        th:last-child,
        td:last-child {
          border-right: 0;
        }


        /* Estilos específicos para móviles */
        @media (max-width: 600px) {
          .container {
            padding: 10px 6px;
          }

          h1 {
            font-size: 22px;
          }

          h2 {
            font-size: 15px;
            margin-bottom: 12px;
          }

          table {
            font-size: 12px;
          }

          th, td {
            padding: 4px 5px;
          }

          th:first-child,
          td.player {
            min-width: 88px;
            max-width: 110px;
          }

          th {
            padding-top: 7px;
            padding-bottom: 7px;
          }
        }

        /* Estilos específicos para ordenador y pantallas grandes */
        @media (min-width: 601px) {
          .tableWrapper {
            width: fit-content;
            max-width: 100%;
          }

          table {
            width: auto;
          }
        }

      `}</style>

    </div>
  )
}