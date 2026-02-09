import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
            <span className="text-slate-400">
              © 2026 Factagora. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-slate-400">
            <Link href="/docs" className="hover:text-white transition-colors">
              문서
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              소개
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              문의
            </Link>
            <Link
              href="https://github.com/factagora/factagora-social-network"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
