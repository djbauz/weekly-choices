"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";

export default function Header() {
  const { session, loading } = useSession();

  if (loading) return null;

  const nickname =
    session?.user?.user_metadata?.display_name ||
    session?.user?.email ||
    "";

  return (
    <header className="header">
      <div className="headerContent">

        {/* LOGO */}
        <Link
          href={session ? "/play" : "/"}
          className="logoLink"
        >
          <img
            src="/uuc_app_logo_v0.png"
            className="headerLogo"
            alt="UUC"
          />
        </Link>

        {/* USER INFO */}
        {session && (
          <div className="userInfo">
            Ciao, {nickname}!
          </div>
        )}

      </div>
    </header>
  );
}