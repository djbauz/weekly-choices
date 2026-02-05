"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

  const signup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    alert(error ? error.message : "Signup ok")
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if(error){
      alert(error.message)
    } else {
      location.href = "/dashboard"
    }
  }

  return (
    <div style={{padding:40}}>
      <h1>Weekly Choices</h1>

      <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
      <br/>
      <input type="password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
      <br/>

      <button onClick={login}>Login</button>
      <button onClick={signup}>Signup</button>
    </div>
  )
}

