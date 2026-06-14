"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"


export default function Home() {
  const router = useRouter()
  
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

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
    <div className="container">
      <h1>ULTIMO UOMO CHALLENGE</h1>

      <div className="card loginCard">
        <form className="loginForm" autoComplete="off" onSubmit={(e) => { e.preventDefault(); login(); }}>
          <input
            className="loginInput"
            type="email"
            placeholder="email"
            autoComplete="email"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="loginInput"
            type="password"
            placeholder="password"
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />

          <div className="buttonRow">
            <button type="submit" className="playBtn">Login</button>
            <button type="button" className="playBtn" onClick={signup}>Signup</button>
          </div>
        </form>
      </div>
    </div>
  )
}

