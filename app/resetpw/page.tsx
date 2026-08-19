"use client"

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";


export default function MyApp() {
    const router = useRouter();

    //const [email,setEmail]=useState("")
    const [new_password,setPassword]=useState("")
    const [confirmPw, setConfirmPW]=useState("")
    //const [nickname,setNickname]=useState("")

    const signup = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        //const emailValue = email.trim().toLowerCase();
        //const nicknameValue = nickname.trim();

        //if (!emailValue) return alert("Email is required");
        //if (!emailValue.includes("@")) return alert("Enter a valid email");
        //if (!nicknameValue) return alert("Nickname is required");
        if (new_password.length < 8 || new_password.length > 20) return alert("Password must be between 8 and 20 characters long");
        if (new_password !== confirmPw) return alert("Passwords don't match");

        const { error } = await supabase.auth.updateUser({ 
            password: new_password, 
        });

        if (error) {
            alert(error.message)
            return;
         }
         
         alert("Password reset ok, check your email.");
         router.replace("/");
    }

    return (
        <>
        {/* <Header /> */}
            <div style={{ paddingTop: "30px" }}>
                <h1 className="centered-h1">Reset your Password</h1>

            <div className="container">
                <div className="card">
                <form onSubmit={signup}>
                    {/* <input className="contentSignup" type="text" autoComplete="nickname" placeholder="nickname" onChange={e=>setNickname(e.target.value)} />
                    <br />
                    <input className="contentSignup" type="email" autoComplete="email" placeholder="email" onChange={e=>setEmail(e.target.value)} />
                    <br /> */}
                    <input className="contentSignup" type="password" autoComplete="new-password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
                    <br />
                    <input className="contentSignup" type="password" autoComplete="new-password" placeholder="Retype password" onChange={e=>setConfirmPW(e.target.value)} />
                    <br />
                    <button className="playBtn" type="submit">Reset</button>
                </form>
                </div>
            </div>
            </div>
        </>
    );
}

/* ISTRUZIONI:
- Seleziona il tuo nickname preferito, la tua mail e la password. 
- La password deve avere tra gli 8 e i 20 caratteri
- Una volta completati i dati, fai click su SIGNUP
- Attendi una mail all'indirizzo indicato e poi fai click sul link ricevuto per attivare l'account
- 
*/