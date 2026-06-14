"use client"

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"


export default function MyApp() {
    const router = useRouter();

    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPw, setConfirmPW]=useState("")
    const [nickname,setNickname]=useState("")

    const signup = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emailValue = email.trim().toLowerCase();
        const nicknameValue = nickname.trim();

        if (!emailValue) return alert("Email is required");
        if (!emailValue.includes("@")) return alert("Enter a valid email");
        if (!nicknameValue) return alert("Nickname is required");
        if (password.length < 8 || password.length > 20) return alert("Password must be between 8 and 20 characters long");
        if (password !== confirmPw) return alert("Passwords don't match");

        const { error } = await supabase.auth.signUp({ 
            email: emailValue, 
            password, 
            options: {
                data: {display_name: nicknameValue}
            },
        });

        if (error) {
            alert(error.message)
            return;
         }
         
         alert("Signup ok, check your email. The administrator will approve your registration soon");
         router.replace("/");
    }

    return (
        <div>
            <div className="container">
                <a href="#">
                    <img src="/uuc_app_logo_v0.png" alt="UUC logo" className="img-max-h-150px" />
                </a>
            </div>
        <h1 className="centered-h1">Signup to UUC App</h1>

        <div className="container">
            <div className="card">
            <form onSubmit={signup}>
                <input className="contentSignup" type="text" autoComplete="nickname" placeholder="nickname" onChange={e=>setNickname(e.target.value)} />
                <br />
                <input className="contentSignup" type="email" autoComplete="email" placeholder="email" onChange={e=>setEmail(e.target.value)} />
                <br />
                <input className="contentSignup" type="password" autoComplete="new-password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
                <br />
                <input className="contentSignup" type="password" autoComplete="new-password" placeholder="Retype password" onChange={e=>setConfirmPW(e.target.value)} />
                <br />
                <button className="playBtn" type="submit">Signup</button>
            </form>
            </div>
        </div>
        </div>
    );
}