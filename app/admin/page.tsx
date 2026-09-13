"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function Admin(){

  const [users,setUsers] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  const [adminId, setAdminId] = useState("")
  const [maxInvitations, setMaxInvitations] = useState("")


  useEffect(()=>{
    init()
  },[])

  async function init(){
    await checkAdmin()
    await load()
    setLoading(false)
  }

  async function testInvite(){

    const { data, error } = await supabase.rpc('invite_to_league', {
      p_league_id: 'test-league-id',
      p_email: 'test@gmail.com'
    })

    if(error){
      console.error(error)
      alert(error.message)
      return
    }

    console.log("Invitation created:", data)

    alert(JSON.stringify(data))
  }

  async function testGetPendingInvitations(){
    const { data, error } = await supabase.rpc('get_my_pending_invitations')
    
    if(error){
      console.error(error)
      alert(error.message)
      return
    }

    console.log("Pending Invitation data:", data)

    alert(JSON.stringify(data))

  }

  async function testCreateNewLeague(){

    if(!adminId){
      alert("Introduce el UUID del usuario")
      return
    }

    const { data, error } = await supabase.rpc('assign_league_admin', {
      p_user_id: adminId,
      p_max_invitations: maxInvitations
    })

    if(error){
      console.error(error)
      alert(error.message)
      return
    }

    console.log("testCreateNewLeague:", data)

    alert(`Nueva liga creada: ${data}`)
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

  if(loading) return <p>Loading...</p>

  return (
    <div style={{padding:40}}>
      <h1>Admin Panel</h1>

      {/* NAV ADMIN */}
      <div style={{marginBottom:30}}>
        <Link href="/admin/weeks">Settimane</Link>{" | "}
        <Link href="/admin/options">Opzioni</Link>{" | "}
        <Link href="/admin/winners">Vincitori</Link>
      </div>

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
      <p></p>
      <h2>test admin league functions</h2>
      <div>
        <button type="button" className="playBtn" onClick={testInvite}>
          Invite_to_league
        </button>
      </div>
      
      <p></p>
      <div>
        <button type="button" className="playBtn" onClick={testGetPendingInvitations}>
          GetPendingInvitations
        </button>
      </div>

      <p></p>
      <div>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="UUID del usuario"
            style={{
              width: "380px",
              height: "40px",
              padding: "10px",
              border: "2px solid red",
              backgroundColor: "white",
              color: "black",
              display: "block"
            }}
          />
      </div>
      <div>
          <input
            type="number"
            value={maxInvitations}
            onChange={(e) => setMaxInvitations(e.target.value)}
            placeholder="max inviti (20, 40, 60)"
            style={{
              width: "60px",
              height: "40px",
              padding: "10px",
              border: "2px solid red",
              backgroundColor: "white",
              color: "black",
              display: "block"
            }}
          />
      </div>
      <div>
        <button type="button" className="playBtn" onClick={testCreateNewLeague}>
          testCreateNewLeague
        </button>
      </div>


    </div>
  )
}
