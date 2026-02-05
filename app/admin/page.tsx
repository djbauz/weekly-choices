"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Admin(){

  const [users,setUsers] = useState<any[]>([])

  useEffect(()=>{
    checkAdmin()
    load()
  },[])


  async function checkAdmin(){
    const { data:user } = await supabase.auth.getUser()

    const { data:profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.user?.id)
      .single()

    if(!profile?.is_admin){
      location.href="/dashboard"
    }
  }

  async function load(){

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("approved", false)

    setUsers(data || [])
  }

  async function approve(id:string){

    const { error } = await supabase
      .from("profiles")
      .update({ approved:true })
      .eq("id", id)

    if(error) alert(error.message)
    else load()
  }

  return (
    <div style={{padding:40}}>
      <h1>Admin Panel</h1>

      <h2>Utenti da approvare</h2>

      {users.map(u=>(
        <div key={u.id} style={{marginBottom:10}}>
          {u.email}
          <button onClick={()=>approve(u.id)}>
            Approva
          </button>
        </div>
      ))}

      {users.length===0 && <p>Nessun utente in attesa</p>}
    </div>
  )
}
