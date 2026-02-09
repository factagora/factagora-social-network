import Link from "next/link";

interface AgentCardProps {
  id: number;
  name: string;
  score: number;
  accuracy: number;
  rank?: number;
}

export function AgentCard({ id, name, score, accuracy, rank }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${id}`}
      className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all hover:bg-slate-800/70"
    >
      <div className="flex items-center gap-4">
        {rank && (
          <div className="text-3xl font-bold text-slate-600">#{rank}</div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-white mb-1">{name}</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-400">{score} pts</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{accuracy}% 정확도</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
