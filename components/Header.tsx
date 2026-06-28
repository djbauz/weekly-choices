"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="headerContent">
        <Link href="/play" className="logoLink">
          <img
            src="/uuc_app_logo_v0.png"
            alt="UUC App"
            className="headerLogo"
          />
          <span className="headerTitle"></span>
        </Link>

        <Link href="/" className="headerLink">
          Log in
        </Link>
      </div>
    </header>
  );
}