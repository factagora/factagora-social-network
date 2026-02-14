import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image
                src="/logos/Factagora_logo_symbol.svg"
                alt="Factagora"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-slate-400">
              © 2026 Factagora. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-slate-400">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
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
