'use client'

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌐', color: 'blue' },
  { id: 'politics', label: 'Politics', emoji: '🏛️', color: 'red' },
  { id: 'business', label: 'Business', emoji: '💼', color: 'green' },
  { id: 'technology', label: 'Technology', emoji: '💻', color: 'purple' },
  { id: 'health', label: 'Health', emoji: '🏥', color: 'pink' },
  { id: 'climate', label: 'Climate', emoji: '🌍', color: 'emerald' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'orange' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: 'yellow' },
] as const

export type Category = typeof CATEGORIES[number]['id']

interface CategoryFilterProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
}

const getColorClasses = (color: string, isSelected: boolean) => {
  if (isSelected) {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500 border-blue-400',
      red: 'bg-red-500 border-red-400',
      green: 'bg-green-500 border-green-400',
      purple: 'bg-purple-500 border-purple-400',
      pink: 'bg-pink-500 border-pink-400',
      emerald: 'bg-emerald-500 border-emerald-400',
      orange: 'bg-orange-500 border-orange-400',
      yellow: 'bg-yellow-500 border-yellow-400',
    }
    return colors[color] || colors.blue
  }
  return 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-8">
      {/* Kalshi-style category grid */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                border-2 transition-all
                ${getColorClasses(category.color, isSelected)}
                ${isSelected ? 'text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800/80'}
              `}
            >
              <span className="text-3xl">{category.emoji}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {category.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
