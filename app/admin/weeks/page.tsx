"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function WeeksAdmin(){

  const [weeks,setWeeks] = useState<any[]>([])

  useEffect(()=>{
    load()
  },[])

  async function load(){
    const { data } = await supabase
      .from("weeks")
      .select("*")
      .order("start_date", { ascending:false })

    setWeeks(data || [])
  }

  async function createWeek(e:any){
    e.preventDefault()

    const form = new FormData(e.target)

    await supabase.from("weeks").insert({
      start_date: form.get("start"),
      end_date: form.get("end"),
      is_closed:false
    })

    e.target.reset()
    load()
  }

  async function closeWeek(id:string){
    await supabase
      .from("weeks")
      .update({ is_closed:true })
      .eq("id", id)

    load()
  }

  return (
    <div style={{padding:40}}>

      <h1>Settimane</h1>

      <form onSubmit={createWeek}>
        <input name="start" type="date" required/>
        <input name="end" type="date" required/>
        <button>Crea</button>
      </form>

      <hr/>

      {weeks.map(w=>(
        <div key={w.id}>
          {w.start_date} → {w.end_date}
          {" "}
          {w.is_closed ? "CHIUSA" : "ATTIVA"}

          {!w.is_closed && (
            <button onClick={()=>closeWeek(w.id)}>
              Chiudi
            </button>
          )}
        </div>
      ))}

    </div>
  )
}
