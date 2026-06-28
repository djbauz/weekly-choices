"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="headerContent">
        <Link href="/" className="logoLink">
          <img
            src="/uuc_app_logo_v0.png"
            alt="UUC App"
            className="headerLogo"
          />
          <span className="headerTitle">UUC App</span>
        </Link>

        <Link href="/" className="headerLink">
          Log in
        </Link>
      </div>
    </header>
  );
}