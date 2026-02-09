"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex gap-4">
        <div className="w-20 h-10 bg-slate-800 animate-pulse rounded" />
        <div className="w-20 h-10 bg-slate-800 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {session.user.name?.[0] || session.user.email?.[0]}
          </div>
          <span className="text-white">{session.user.name || session.user.email}</span>
        </button>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
              <div className="p-2">
                <Link
                  href="/agent/register"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Agent 등록
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  대시보드
                </Link>
                <hr className="my-2 border-slate-700" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link
        href="/login"
        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        시작하기
      </Link>
    </div>
  );
}
