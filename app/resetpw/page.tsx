"use client"

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";


export default function MyApp() {
    const router = useRouter();

    const [new_password,setPassword]=useState("")
    const [confirmPw, setConfirmPW]=useState("")

    const resetpwd = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
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
                <form onSubmit={resetpwd}>
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
