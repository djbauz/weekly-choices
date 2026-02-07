"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function Admin(){

  const [users,setUsers] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    init()
  },[])

  async function init(){
    await checkAdmin()
    await load()
    setLoading(false)
  }

  async function checkAdmin(){
    const { data: { user } } = await supabase.auth.getUser()

    if(!user){
      location.href="/"
      return
    }

    const { data:profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if(!profile?.is_admin){
      location.href="/dashboard"
    }
  }

  async function load(){
    const { data } = await supabase
      .from("profiles")
      .select("id,email,approved,game_active,is_admin")
      .order("email")

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

  if(loading) return <p>Loading...</p>

  const active = users.filter(u => u.approved && u.game_active)
  const eliminated = users.filter(u => u.approved && !u.game_active)

  return (
    <div style={{padding:40}}>
      <h1>Admin Panel</h1>
      {/* NAV ADMIN */}
      <div style={{marginBottom:30}}>
        <Link href="/admin/weeks">Settimane</Link>{" | "}
        <Link href="/admin/options">Opzioni</Link>{" | "}
        <Link href="/admin/winners">Vincitori</Link>
      </div>

      <h2 style={{marginTop:30}} >🟢 In gara</h2>
      {active.map(u=>(
        <div key={u.id}>{u.email}</div>
      ))}

      <h2 style={{marginTop:30}}>🔴 Eliminati</h2>
      {eliminated.map(u=>(
        <div key={u.id}>{u.email}</div>
      ))}


    </div>
  )
}
