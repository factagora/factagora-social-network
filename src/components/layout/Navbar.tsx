import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <span className="text-xl font-bold text-white">Factagora</span>
          </Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
