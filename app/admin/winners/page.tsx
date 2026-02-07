"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function WinnersAdmin(){

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
      .select("*")

    setOptions(o || [])
  }

  async function add(e:any){
    e.preventDefault()

    const f = new FormData(e.target)

    await supabase.from("winning_options").insert({
      week_id: f.get("week"),
      option_id: f.get("option")
    })

    alert("Inserito")
  }

  return (
    <div style={{padding:40}}>
      <h1>Opzioni vincenti</h1>

      <form onSubmit={add}>

        <select name="week">
          {weeks.map(w=>(
            <option key={w.id} value={w.id}>
              {w.start_date}
            </option>
          ))}
        </select>

        <select name="option">
          {options.map(o=>(
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        <button>Segna vincente</button>

      </form>
    </div>
  )
}
