"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function OptionsAdmin(){

  const [weeks,setWeeks] = useState<any[]>([])
  const [options,setOptions] = useState<any[]>([])

  useEffect(()=>{
    load()
  },[])

  async function load(){

    const { data:w } = await supabase
      .from("weeks")
      .select("id,start_date")

    setWeeks(w || [])

    const { data:o } = await supabase
      .from("options")
      .select("*, weeks(start_date)")

    setOptions(o || [])
  }

  async function create(e:any){
    e.preventDefault()

    const f = new FormData(e.target)

    const { error } = await supabase
    .from("options")
    .insert({
        week_id: f.get("week"),
        name: f.get("name")
    })

    if (error) {
    alert(error.message)
    console.error(error)
    }

    e.target.reset()
    load()
  }

  return (
    <div style={{padding:40}}>
      <h1>Opzioni</h1>

      <form onSubmit={create}>
        <select name="week">
          {weeks.map(w=>(
            <option key={w.id} value={w.id}>
              {w.start_date}
            </option>
          ))}
        </select>

        <input name="name" placeholder="Nome opzione" required/>
        <button>Aggiungi</button>
      </form>

      <hr/>

      {options.map(o=>(
        <div key={o.id}>
          {o.name} — settimana {o.weeks?.start_date}
        </div>
      ))}
    </div>
  )
}
