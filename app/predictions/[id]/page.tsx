"use client";

import Link from "next/link";
import { Navbar } from "@/components";
import { useState } from "react";

export default function PredictionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [userVote, setUserVote] = useState<"YES" | "NO" | null>(null);

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
      { name: "TrendAnalyzer", vote: "YES", confidence: 0.78 },
      { name: "MarketSage", vote: "NO", confidence: 0.55 },
    ],
  };

  // Mock historical data
  const voteHistory = [
    { date: "2월 1일", yesPercent: 45 },
    { date: "2월 3일", yesPercent: 52 },
    { date: "2월 5일", yesPercent: 61 },
    { date: "2월 7일", yesPercent: 65 },
    { date: "2월 9일", yesPercent: 68 },
  ];

  const handleVote = (vote: "YES" | "NO") => {
    setUserVote(vote);
    alert(`${vote}에 투표했습니다! (실제 기능은 곧 활성화됩니다)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

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

          {/* Vote Distribution Chart */}
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              📊 투표 현황
            </h2>

            {/* Current Split */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-semibold">
                  YES {prediction.yesPercent}%
                </span>
                <span className="text-red-400 font-semibold">
                  NO {100 - prediction.yesPercent}%
                </span>
              </div>
              <div className="h-8 bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${prediction.yesPercent}%` }}
                />
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  style={{ width: `${100 - prediction.yesPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                <span>{Math.round((prediction.votes * prediction.yesPercent) / 100)} 표</span>
                <span>{Math.round((prediction.votes * (100 - prediction.yesPercent)) / 100)} 표</span>
              </div>
            </div>

            {/* Historical Trend */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                트렌드 (YES %)
              </h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {voteHistory.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-24 mb-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t transition-all duration-500 hover:opacity-80"
                        style={{ height: `${point.yesPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">{point.date}</div>
                    <div className="text-xs text-blue-400 font-semibold">
                      {point.yesPercent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleVote("YES")}
              className={`p-6 bg-slate-800/50 border-2 rounded-xl transition-all ${
                userVote === "YES"
                  ? "border-green-500 ring-2 ring-green-500/20"
                  : "border-slate-700 hover:border-green-500"
              }`}
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h2 className="text-2xl font-bold text-white">YES</h2>
                <div className="text-4xl font-bold text-green-400">
                  {prediction.yesPercent}%
                </div>
                <div className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold">
                  {userVote === "YES" ? "투표 완료!" : "YES에 투표하기"}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleVote("NO")}
              className={`p-6 bg-slate-800/50 border-2 rounded-xl transition-all ${
                userVote === "NO"
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-slate-700 hover:border-red-500"
              }`}
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">❌</div>
                <h2 className="text-2xl font-bold text-white">NO</h2>
                <div className="text-4xl font-bold text-red-400">
                  {100 - prediction.yesPercent}%
                </div>
                <div className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold">
                  {userVote === "NO" ? "투표 완료!" : "NO에 투표하기"}
                </div>
              </div>
            </button>
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
                  className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
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
                  {/* Confidence Bar */}
                  <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        agent.vote === "YES"
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${agent.confidence * 100}%` }}
                    />
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
