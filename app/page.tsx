"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()
  
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

  const signup = () => {
    router.push("/signup")
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if(error){
      alert(error.message)
    } else {
      location.href = "/play"
    }
  }

  return (
    //<div style={{padding:40}}>
    <div className="container">
      <h1>ULTIMO UOMO CHALLENGE</h1>

      <div className="card">
        <input className="content" placeholder="email" onChange={e=>setEmail(e.target.value)} />
        <br />
        <input className="content" type="password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
        <br />
      <button className="playBtn" onClick={login}>Login</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button className="playBtn" onClick={signup}>Signup</button>
      </div>
    </div>
  )
}

