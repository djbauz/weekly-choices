"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Row = {
  user_id: string
  nickname: string
  round_number: number
  option_name: string | null
  is_win: boolean | null
  elim_round: number | null
}

export default function MatrixPage({ params }: any) {
  const leagueId = params.leagueId

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

  function getCellColor(player: any, round: number, cell: Row | undefined) {
    if (!player.elim_round) return ""

    if (round >= player.elim_round) return "cellRed"

    if (cell && cell.is_win === false) return "cellRed"

    return ""
  }

  return (
    <div className="page">

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
            {players.map((p: any, i: number) => (
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

        h1 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        h2 {
          margin-bottom: 20px;
          color: #666;
        }

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          border-collapse: collapse;
          min-width: 600px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: center;
        }

        th {
          background: #f5f5f5;
        }

        .player {
          font-weight: bold;
          text-align: left;
        }

        .cellRed {
          background: #ffcccc;
        }
      `}</style>

    </div>
  )
}