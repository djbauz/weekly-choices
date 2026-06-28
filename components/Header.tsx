"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/hooks/useSession";


export default function Header() {
  const router = useRouter();
  const { session, loading } = useSession();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) return null;

  return (
    <header className="header">
      <div className="headerContent">
        {/* LEFT SIDE */}
        <Link href="/play" className="logoLink">
          <img
            src="/uuc_app_logo_v0.png"
            className="headerLogo"
            alt="UUC"
          />
        </Link>

        {/* CENTER NAV */}
        {session && (
          <nav className="nav">
            <Link href="/play" className="navItem">Play</Link>
            <Link href="/dashboard" className="navItem">Dashboard</Link>
            <Link href="/matrix" className="navItem">Matrix</Link>
          </nav>
        )}

        {/* RIGHT SIDE */}
        {session && (
          <div className="userArea">
            <span className="userEmail">
              {session.user.email}
            </span>

            <button className="logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}