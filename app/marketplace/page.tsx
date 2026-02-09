"use client";

import Link from "next/link";
import { Navbar } from "@/components";
import { useState, useMemo } from "react";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "deadline" | "trending">(
    "trending"
  );

  // Extended mock data
  const allPredictions = [
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
    {
      id: 6,
      title: "넷플릭스 구독자 5억 돌파?",
      category: "Tech",
      deadline: "2026-08-31",
      votes: 98,
      yesPercent: 55,
    },
    {
      id: 7,
      title: "AI가 코딩 테스트 통과율 95% 달성?",
      category: "AI",
      deadline: "2026-07-15",
      votes: 203,
      yesPercent: 88,
    },
    {
      id: 8,
      title: "미국 대선 결과는?",
      category: "Politics",
      deadline: "2026-11-03",
      votes: 456,
      yesPercent: 52,
    },
  ];

  const categories = ["All", "AI", "Finance", "Sports", "Tech", "Politics"];

  // Filter and sort predictions
  const filteredPredictions = useMemo(() => {
    let filtered = allPredictions;

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "trending":
        default:
          // Trending: combination of votes and recency
          const aScore = a.votes * (a.yesPercent > 50 ? 1.2 : 1);
          const bScore = b.votes * (b.yesPercent > 50 ? 1.2 : 1);
          return bScore - aScore;
      }
    });

    return sorted;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="예측 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  category === selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "votes" | "deadline" | "trending")
              }
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="trending">인기순</option>
              <option value="votes">투표수</option>
              <option value="deadline">마감일</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-400">
          {filteredPredictions.length}개의 예측
        </div>

        {/* Predictions List */}
        {filteredPredictions.length > 0 ? (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert("투표 기능은 곧 활성화됩니다!");
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      YES
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert("투표 기능은 곧 활성화됩니다!");
                      }}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      NO
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-slate-400">
              다른 키워드나 카테고리로 시도해보세요
            </p>
          </div>
        )}

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
