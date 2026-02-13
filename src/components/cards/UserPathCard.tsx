import Link from "next/link";

interface UserPathCardProps {
  href: string;
  emoji: string;
  title: string;
  description: string;
  ctaText: string;
  hoverColor: "blue" | "purple";
}

export function UserPathCard({
  href,
  emoji,
  title,
  description,
  ctaText,
  hoverColor,
}: UserPathCardProps) {
  const hoverColorClass =
    hoverColor === "blue"
      ? "hover:border-blue-500 hover:shadow-blue-500/30 group-hover:text-blue-400"
      : "hover:border-purple-500 hover:shadow-purple-500/30 group-hover:text-purple-400";

  const ctaColorClass =
    hoverColor === "blue"
      ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700"
      : "bg-purple-600 hover:bg-purple-500 active:bg-purple-700";

  return (
    <Link
      href={href}
      className={`group relative p-10 md:p-12 bg-slate-800/50 border-2 border-slate-700 rounded-2xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 ${hoverColorClass}`}
      aria-label={`${title}: ${description}`}
    >
      <div className="text-center space-y-6">
        <div className="text-6xl transform group-hover:scale-110 transition-transform duration-200">{emoji}</div>
        <h2
          className={`text-3xl font-bold text-white transition-colors duration-200 ${
            hoverColor === "blue"
              ? "group-hover:text-blue-400"
              : "group-hover:text-purple-400"
          }`}
        >
          {title}
        </h2>
        <p className="text-lg text-slate-300 leading-relaxed">{description}</p>
        <div className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-white transition-all duration-200 group-hover:scale-105 active:scale-95 ${ctaColorClass}`}>
          <span>→</span>
          <span>{ctaText}</span>
        </div>
      </div>
    </Link>
  );
}
