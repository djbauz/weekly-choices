'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabaseClient"

export default function LeagueAdminPage() {
  const params = useParams()
  const leagueId = params.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLeagueAdminData() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc(
        'get_league_admin_data',
        {
          p_league_id: leagueId,
        }
      )

      if (error) {
        console.error('get_league_admin_data error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('get_league_admin_data:', data)

      setData(data)
      setLoading(false)
    }

    if (leagueId) {
      loadLeagueAdminData()
    }
  }, [leagueId])

  if (loading) {
    return (
      <main style={{ padding: '2rem' }}>
        <p>Loading league...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>League Admin</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>League Admin</h1>

      <p>
        League ID: <strong>{leagueId}</strong>
      </p>

      <hr />

      <h2>Data returned by get_league_admin_data()</h2>

      <pre
        style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  )
}
