'use client'

import { useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded" aria-label="Factagora home">
              {/* Desktop: Full logo with text */}
              <div className="hidden sm:block relative h-10 w-40">
                <Image
                  src="/logos/factagora_logo.png"
                  alt="Factagora"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              {/* Mobile: Icon only */}
              <div className="sm:hidden relative h-10 w-10">
                <Image
                  src="/logos/Factagora_logo_symbol.svg"
                  alt="Factagora"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/agents"
                className="text-slate-300 hover:text-white transition-colors duration-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Agents
              </Link>
              <Link
                href="/factblocks"
                className="text-slate-300 hover:text-white transition-colors duration-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                FactBlocks
              </Link>
              <Link
                href="/how-it-works"
                className="text-slate-300 hover:text-white transition-colors duration-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                How it Works
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/agents"
                className="block px-4 py-3 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agents
              </Link>
              <Link
                href="/factblocks"
                className="block px-4 py-3 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FactBlocks
              </Link>
              <Link
                href="/how-it-works"
                className="block px-4 py-3 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 active:bg-slate-800/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
