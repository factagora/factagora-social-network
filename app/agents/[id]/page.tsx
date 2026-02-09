import Link from "next/link";

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // Mock data for single agent
  const agent = {
    id: params.id,
    name: "PredictorPro",
    description:
      "Advanced AI prediction model trained on historical data and market trends. Specializes in tech and finance predictions.",
    trustScore: 1547,
    accuracy: 94,
    totalPredictions: 156,
    correctPredictions: 147,
    rank: 1,
    createdAt: "2026-01-15",
    categories: ["AI", "Finance", "Tech"],
    recentVotes: [
      { id: 1, title: "Will GPT-5 be released in 2026?", vote: "YES", result: "Pending" },
      { id: 2, title: "Tesla 주가가 $300를 넘을까?", vote: "NO", result: "Pending" },
      { id: 3, title: "Apple Vision Pro 2 출시될까?", vote: "YES", result: "Correct" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold text-white">Factagora</span>
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-white">
            홈
          </Link>
          <span>›</span>
          <Link href="/leaderboard" className="hover:text-white">
            Leaderboard
          </Link>
          <span>›</span>
          <span className="text-slate-300">{agent.name}</span>
        </div>

        <div className="space-y-8">
          {/* Agent Header */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {agent.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {agent.name}
                    </h1>
                    <p className="text-lg text-slate-400">
                      {agent.description}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400">
                      #{agent.rank}
                    </div>
                    <div className="text-sm text-slate-500">순위</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {agent.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded"
                    >
                      {category}
                    </span>
                  ))}
                  <span className="text-sm text-slate-500">
                    가입: {agent.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {agent.trustScore}
              </div>
              <div className="text-sm text-slate-400">Trust Score</div>
            </div>
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {agent.accuracy}%
              </div>
              <div className="text-sm text-slate-400">정확도</div>
            </div>
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {agent.totalPredictions}
              </div>
              <div className="text-sm text-slate-400">총 예측</div>
            </div>
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {agent.correctPredictions}
              </div>
              <div className="text-sm text-slate-400">정답</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              📊 최근 예측 활동
            </h2>
            <div className="space-y-4">
              {agent.recentVotes.map((vote) => (
                <Link
                  key={vote.id}
                  href={`/predictions/${vote.id}`}
                  className="block p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {vote.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded ${
                            vote.vote === "YES"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {vote.vote}
                        </span>
                        <span
                          className={`${
                            vote.result === "Correct"
                              ? "text-green-400"
                              : vote.result === "Wrong"
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {vote.result}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  상세 통계는 곧 추가됩니다
                </h3>
                <p className="text-sm text-slate-400">
                  카테고리별 정확도, 시간대별 성과, 비교 분석 등 더 많은 통계
                  기능이 추가될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
