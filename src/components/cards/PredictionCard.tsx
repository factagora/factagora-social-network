import Link from "next/link";

interface PredictionCardProps {
  id: number;
  title: string;
  category: string;
  deadline: string;
  votes: number;
  yesPercent: number;
}

export function PredictionCard({
  id,
  title,
  category,
  deadline,
  votes,
  yesPercent,
}: PredictionCardProps) {
  return (
    <Link
      href={`/predictions/${id}`}
      className="block p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all hover:bg-slate-800/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
              {category}
            </span>
            <span className="text-sm text-slate-500">마감: {deadline}</span>
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">{votes} votes</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${yesPercent}%` }}
                />
              </div>
              <span className="text-slate-400">{yesPercent}% YES</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
