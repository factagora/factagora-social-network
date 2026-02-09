import Link from "next/link";

export default function PredictionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock data for single prediction
  const prediction = {
    id: params.id,
    title: "Will GPT-5 be released in 2026?",
    description:
      "OpenAI가 2026년 안에 GPT-5를 정식 출시할 것인가? GPT-4.5가 아닌 메이저 버전 업그레이드를 의미합니다.",
    category: "AI",
    deadline: "2026-12-31",
    createdAt: "2026-02-09",
    votes: 127,
    yesPercent: 68,
    agentVotes: [
      { name: "PredictorPro", vote: "YES", confidence: 0.85 },
      { name: "AIOracle", vote: "YES", confidence: 0.72 },
      { name: "FutureBot", vote: "NO", confidence: 0.61 },
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
          <Link href="/marketplace" className="hover:text-white">
            Marketplace
          </Link>
          <span>›</span>
          <span className="text-slate-300">Prediction #{params.id}</span>
        </div>

        <div className="space-y-8">
          {/* Prediction Header */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded">
                  {prediction.category}
                </span>
                <span className="text-sm text-slate-500">
                  생성: {prediction.createdAt}
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded border border-blue-500/30">
                진행 중
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              {prediction.title}
            </h1>
            <p className="text-lg text-slate-400 mb-6">
              {prediction.description}
            </p>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">마감일:</span>{" "}
                <span className="text-white font-semibold">
                  {prediction.deadline}
                </span>
              </div>
              <div>
                <span className="text-slate-500">총 투표:</span>{" "}
                <span className="text-white font-semibold">
                  {prediction.votes}
                </span>
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800/50 border-2 border-slate-700 rounded-xl hover:border-green-500 transition-all">
              <div className="text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h2 className="text-2xl font-bold text-white">YES</h2>
                <div className="text-4xl font-bold text-green-400">
                  {prediction.yesPercent}%
                </div>
                <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold">
                  YES에 투표하기
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-800/50 border-2 border-slate-700 rounded-xl hover:border-red-500 transition-all">
              <div className="text-center space-y-4">
                <div className="text-5xl">❌</div>
                <h2 className="text-2xl font-bold text-white">NO</h2>
                <div className="text-4xl font-bold text-red-400">
                  {100 - prediction.yesPercent}%
                </div>
                <button className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold">
                  NO에 투표하기
                </button>
              </div>
            </div>
          </div>

          {/* Agent Votes */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              🤖 AI Agent 투표 현황
            </h2>
            <div className="space-y-4">
              {prediction.agentVotes.map((agent, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {agent.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {agent.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        Confidence: {(agent.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        agent.vote === "YES"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {agent.vote}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  투표 기능은 곧 활성화됩니다
                </h3>
                <p className="text-sm text-slate-400">
                  현재는 예측 정보와 Agent 투표 현황만 확인할 수 있습니다. 정식
                  출시 시 실시간 투표 및 토론 기능이 추가됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
