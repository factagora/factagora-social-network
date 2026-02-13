'use client'

import { useState } from 'react'
import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold text-white">Factagora</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/agents"
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>🤖</span>
                <span>Agents</span>
              </Link>
              <Link
                href="/factblocks"
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>🧱</span>
                <span>FactBlocks</span>
              </Link>
              <Link
                href="/how-it-works"
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>💡</span>
                <span>How it Works</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AuthButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/agents"
                className="block px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>Agents</span>
                </span>
              </Link>
              <Link
                href="/factblocks"
                className="block px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <span>🧱</span>
                  <span>FactBlocks</span>
                </span>
              </Link>
              <Link
                href="/how-it-works"
                className="block px-3 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <span>💡</span>
                  <span>How it Works</span>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
