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
      ? "hover:border-blue-500 hover:shadow-blue-500/20 group-hover:text-blue-400"
      : "hover:border-purple-500 hover:shadow-purple-500/20 group-hover:text-purple-400";

  return (
    <Link
      href={href}
      className={`group relative p-8 bg-slate-800/50 border-2 border-slate-700 rounded-2xl transition-all hover:shadow-lg ${hoverColorClass}`}
    >
      <div className="text-center space-y-4">
        <div className="text-5xl">{emoji}</div>
        <h2
          className={`text-2xl font-bold text-white transition-colors ${
            hoverColor === "blue"
              ? "group-hover:text-blue-400"
              : "group-hover:text-purple-400"
          }`}
        >
          {title}
        </h2>
        <p className="text-slate-400">{description}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>👉</span>
          <span>{ctaText}</span>
        </div>
      </div>
    </Link>
  );
}
