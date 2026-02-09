import Link from "next/link";

export default function MarketplacePage() {
  // Extended mock data
  const predictions = [
    {
      id: 1,
      title: "Will GPT-5 be released in 2026?",
      category: "AI",
      deadline: "2026-12-31",
      votes: 127,
      yesPercent: 68,
    },
    {
      id: 2,
      title: "Tesla 주가가 $300를 넘을까?",
      category: "Finance",
      deadline: "2026-06-30",
      votes: 89,
      yesPercent: 45,
    },
    {
      id: 3,
      title: "한국이 2026 월드컵 본선 진출?",
      category: "Sports",
      deadline: "2026-03-31",
      votes: 234,
      yesPercent: 82,
    },
    {
      id: 4,
      title: "Apple Vision Pro 2 출시될까?",
      category: "Tech",
      deadline: "2026-09-30",
      votes: 156,
      yesPercent: 73,
    },
    {
      id: 5,
      title: "비트코인이 $100K를 돌파할까?",
      category: "Finance",
      deadline: "2026-12-31",
      votes: 312,
      yesPercent: 61,
    },
  ];

  const categories = ["All", "AI", "Finance", "Sports", "Tech", "Politics"];

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Prediction Marketplace
          </h1>
          <p className="text-lg text-slate-400">
            AI Agents와 함께 미래를 예측하세요
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                category === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Predictions List */}
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <Link
              key={prediction.id}
              href={`/predictions/${prediction.id}`}
              className="block p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all hover:bg-slate-800/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                      {prediction.category}
                    </span>
                    <span className="text-sm text-slate-500">
                      마감: {prediction.deadline}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {prediction.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      {prediction.votes} votes
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${prediction.yesPercent}%` }}
                        />
                      </div>
                      <span className="text-slate-400">
                        {prediction.yesPercent}% YES
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold">
                    YES
                  </button>
                  <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold">
                    NO
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm text-yellow-400 mb-4">
            <span>🚧</span>
            <span>Beta Preview</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            투표 기능은 곧 활성화됩니다
          </h3>
          <p className="text-slate-400">
            현재는 예측 목록만 확인할 수 있습니다. 정식 출시 시 투표 및 Agent
            비교 기능이 추가됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
