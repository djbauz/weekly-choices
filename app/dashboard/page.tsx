"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {

  const [loading,setLoading] = useState(true)
  const [user,setUser] = useState<any>(null)
  const [approved,setApproved] = useState(false)
  const [week,setWeek] = useState<any>(null)
  const [options,setOptions] = useState<any[]>([])
  const [message,setMessage] = useState("")
  const [lastResult,setLastResult] = useState<any>(null)
  const [resultStatus, setResultStatus] = useState<
    "attesa" | "passato" | "eliminato" | null
  >(null)
  const [myChoice, setMyChoice] = useState<any | null>(null)


  useEffect(()=>{
    init()
  },[])

  async function init() {

    const { data } = await supabase.auth.getUser()
    //console.log("AUTH USER:", data.user)

    if(!data.user){
      location.href = "/"
      return
    }

    setUser(data.user)

    // verifica approvazione
    const { data:profile, error:profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    //console.log("PROFILE:", profile)
    //console.log("PROFILE ERROR:", profileError)


    if(!profile?.approved){
      setMessage("Utente in attesa di approvazione admin")
      setLoading(false)
      return
    }

    if(!profile?.game_active){
      setMessage("Sei stato eliminato dal gioco")
      setLoading(false)
      return
    }

    setApproved(true)
    
    // ultimo risultato utente
    const { data:results, error } = await supabase
      .from("user_results")
      .select("*")
      .eq("user_id", data.user.id)
      .order("week_id",{ascending:false})
      .limit(1)

    if(results && results.length > 0){
      const last = results[0]
      setLastResult(last)

    //console.log("RESULTS", results)
    //console.log("ERROR", results && results.length > 0)

      const { data: winners } = await supabase
        .from("winning_options")
        .select("option_id")
        .eq("week_id", last.week_id)

      if (!winners || winners.length === 0) {
        setResultStatus("attesa")
      } else if (winners.some(w => w.option_id === last.option_id)) {
        setResultStatus("passato")
      } else {
        setResultStatus("eliminato")
      }
    //console.log("LAST RESULT =", lastResult)
    //console.log("RESULT STATUS =", resultStatus)
   }
    // settimana attiva
    const { data:week } = await supabase
      .from("weeks")
      .select("*")
      .eq("is_active",true)
      .single()

    setWeek(week)

    if(week){
      const { data:opts } = await supabase
        .from("options")
        .select("*")
        //.eq("week_id",week.id)

      setOptions(opts || [])
    }

    if (week) {
      const { data: choice } = await supabase
        .from("choices")
        .select(`
          option_id,
          options(name)
        `)
        .eq("user_id", data.user.id)
        .eq("week_id", week.id)
        .maybeSingle()

      setMyChoice(choice)
    }


    setLoading(false)
  }

  async function choose(option_id:string){

    const { error } = await supabase
      .from("choices")
      .insert({
        user_id:user.id,
        week_id:week.id,
        option_id
      })

    if(error) alert(error.message)
    else alert("Scelta registrata ✅")
  }

  if(loading) return <div>Loading...</div>

  if(!approved) return <div>{message}</div>

  return (
    <div style={{padding:40}}>
      <h1>Dashboard Utente</h1>
        {resultStatus && (
          <div style={{marginTop:20,padding:10,border:"1px solid #ccc"}}>
            Ultima settimana:
            {resultStatus === "attesa" && " ⏳ in attesa risultati"}
            {resultStatus === "passato" && " ✅ passata"}
            {resultStatus === "eliminato" && " ❌ eliminato"}
          </div>
        )}

      <p>Email: {user.email}</p>

      {week && (
        <>
          <h2>Settimana attiva</h2>
          <p>{week.start_date} → {week.end_date}</p>

          <h3>Opzioni</h3>

          {myChoice ? (
            <div style={{
              padding:12,
              border:"1px solid #ccc",
              background:"#f5f5f5",
              color:"#000000",
              marginTop:10
            }}>
              Hai già scelto:
              <b> {myChoice.options?.name || myChoice.option_id}</b>
            </div>
          ) : (
            options.map(o => (
              <button
                key={o.id}
                onClick={()=>choose(o.id)}
                style={{display:"block",margin:10}}
              >
                {o.name}
              </button>
            ))
          )}

        </>
      )}

      {!week && <p>Nessuna settimana attiva</p>}
    </div>
  )
}

