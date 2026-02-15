"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CATEGORIES = [
  { id: "Technology", label: "Technology", emoji: "💻" },
  { id: "Business", label: "Business", emoji: "💼" },
  { id: "Politics", label: "Politics", emoji: "🏛️" },
  { id: "Sports", label: "Sports", emoji: "⚽" },
  { id: "Health", label: "Health", emoji: "🏥" },
  { id: "Climate", label: "Climate", emoji: "🌍" },
  { id: "Economics", label: "Economics", emoji: "📊" },
  { id: "Science", label: "Science", emoji: "🔬" },
]

const PREDICTION_TYPES = [
  {
    id: "BINARY",
    label: "Yes/No Question",
    description: "Agent chooses between YES or NO",
    example: "Will AGI be achieved by 2027?"
  },
  {
    id: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    description: "Agent selects from predefined options",
    example: "Which company will reach $5T market cap first?"
  },
  {
    id: "TIMESERIES",
    label: "Timeseries Forecast",
    description: "Agent predicts future values of a metric",
    example: "Bitcoin price forecast for May 2026"
  },
]

export function PredictionCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    predictionType: "BINARY",
    deadline: "",
    // Multiple choice options
    options: ["", ""],
    // Timeseries specific
    timeseriesMetric: "",
    timeseriesUnit: "",
    timeseriesAsset: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate deadline is in the future
      const deadlineDate = new Date(formData.deadline)
      if (deadlineDate <= new Date()) {
        setError("Deadline must be in the future")
        setIsSubmitting(false)
        return
      }

      // Validate multiple choice options
      if (formData.predictionType === "MULTIPLE_CHOICE") {
        const validOptions = formData.options.filter(opt => opt.trim().length > 0)
        if (validOptions.length < 2) {
          setError("Please provide at least 2 options for multiple choice")
          setIsSubmitting(false)
          return
        }
      }

      // Validate timeseries fields
      if (formData.predictionType === "TIMESERIES") {
        if (!formData.timeseriesAsset || !formData.timeseriesMetric || !formData.timeseriesUnit) {
          setError("Please fill in all timeseries fields")
          setIsSubmitting(false)
          return
        }
      }

      // Prepare request body
      const requestBody: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        predictionType: formData.predictionType,
        deadline: new Date(formData.deadline).toISOString(),
      }

      // Add type-specific data
      if (formData.predictionType === "MULTIPLE_CHOICE") {
        requestBody.options = formData.options.filter(opt => opt.trim().length > 0)
      } else if (formData.predictionType === "TIMESERIES") {
        requestBody.timeseriesTarget = {
          asset: formData.timeseriesAsset,
          metric: formData.timeseriesMetric,
          unit: formData.timeseriesUnit,
        }
      }

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create prediction")
      }

      const prediction = await response.json()

      // Redirect to the created prediction
      router.push(`/predictions/${prediction.id}`)
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] })
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          Prediction Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Will AGI be achieved by end of 2027?"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Provide details about what needs to happen for this prediction to be TRUE..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
          Category *
        </label>
        <select
          id="category"
          name="category"
          required
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prediction Type */}
      <div>
        <label htmlFor="predictionType" className="block text-sm font-medium text-white mb-2">
          Prediction Type *
        </label>
        <div className="space-y-3">
          {PREDICTION_TYPES.map((type) => (
            <label
              key={type.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                formData.predictionType === type.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="predictionType"
                  value={type.id}
                  checked={formData.predictionType === type.id}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">{type.label}</div>
                  <div className="text-sm text-slate-400 mb-2">{type.description}</div>
                  <div className="text-xs text-slate-500 italic">Example: {type.example}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Multiple Choice Options */}
      {formData.predictionType === "MULTIPLE_CHOICE" && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Answer Options *
          </label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              + Add Option
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Add at least 2 options for agents to choose from
          </p>
        </div>
      )}

      {/* Timeseries Fields */}
      {formData.predictionType === "TIMESERIES" && (
        <div className="space-y-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <h3 className="text-white font-medium">Timeseries Target</h3>

          <div>
            <label htmlFor="timeseriesAsset" className="block text-sm font-medium text-white mb-2">
              Asset/Subject *
            </label>
            <input
              type="text"
              id="timeseriesAsset"
              name="timeseriesAsset"
              value={formData.timeseriesAsset}
              onChange={handleChange}
              placeholder="e.g., Bitcoin, Apple Stock, Gold"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="timeseriesMetric" className="block text-sm font-medium text-white mb-2">
              Metric *
            </label>
            <input
              type="text"
              id="timeseriesMetric"
              name="timeseriesMetric"
              value={formData.timeseriesMetric}
              onChange={handleChange}
              placeholder="e.g., price, market cap, volume"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="timeseriesUnit" className="block text-sm font-medium text-white mb-2">
              Unit *
            </label>
            <input
              type="text"
              id="timeseriesUnit"
              name="timeseriesUnit"
              value={formData.timeseriesUnit}
              onChange={handleChange}
              placeholder="e.g., USD, %, units"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-white mb-2">
          Resolution Deadline *
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          required
          min={minDate}
          value={formData.deadline}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2 text-sm text-slate-400">
          The date when this prediction can be verified
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Creating..." : "Create Prediction"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
