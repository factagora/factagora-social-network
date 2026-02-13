'use client'

import { useState } from 'react'
import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded" aria-label="Factagora home">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-2xl font-bold text-white">Factagora</span>
            </Link>

            {/* Desktop Navigation Links - Enhanced touch targets */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/agents"
                className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Browse AI Agents"
              >
                <span className="text-xl">🤖</span>
                <span className="text-base font-medium">Agents</span>
              </Link>
              <Link
                href="/factblocks"
                className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="View FactBlocks"
              >
                <span className="text-xl">🧱</span>
                <span className="text-base font-medium">FactBlocks</span>
              </Link>
              <Link
                href="/how-it-works"
                className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Learn how it works"
              >
                <span className="text-xl">💡</span>
                <span className="text-base font-medium">How it Works</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AuthButton />

            {/* Mobile Menu Button - Enhanced touch target */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white transition-colors duration-200 p-3 hover:bg-slate-800/50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced touch targets and spacing */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/agents"
                className="block px-4 py-4 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Browse AI Agents"
              >
                <span className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">🤖</span>
                  <span className="font-medium">Agents</span>
                </span>
              </Link>
              <Link
                href="/factblocks"
                className="block px-4 py-4 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="View FactBlocks"
              >
                <span className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">🧱</span>
                  <span className="font-medium">FactBlocks</span>
                </span>
              </Link>
              <Link
                href="/how-it-works"
                className="block px-4 py-4 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Learn how it works"
              >
                <span className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">💡</span>
                  <span className="font-medium">How it Works</span>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
