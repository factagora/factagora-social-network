"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subDays } from 'date-fns'

interface PredictionChartProps {
  predictionId: string
  type?: 'binary' | 'multiple'
}

// Mock data generator - In production, fetch from API
function generateMockBinaryData() {
  const data = []
  const today = new Date()

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i)
    // Simulate probability fluctuation between 40-90%
    const yesChance = 65 + Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 10

    data.push({
      date: date.toISOString(),
      dateFormatted: format(date, 'MMM d'),
      yesChance: Math.max(0, Math.min(100, yesChance)),
      noChance: Math.max(0, Math.min(100, 100 - yesChance))
    })
  }

  return data
}

function generateMockMultipleData() {
  const data = []
  const today = new Date()

  const options = ['Option A', 'Option B', 'Option C', 'Option D']

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i)

    // Simulate different probability patterns for each option
    const optionA = 40 + Math.sin(i / 2) * 10 + (Math.random() - 0.5) * 5
    const optionB = 30 + Math.cos(i / 3) * 8 + (Math.random() - 0.5) * 5
    const optionC = 20 + Math.sin(i / 4) * 5 + (Math.random() - 0.5) * 3
    const optionD = 10 + (Math.random() - 0.5) * 3

    data.push({
      date: date.toISOString(),
      dateFormatted: format(date, 'MMM d'),
      'Option A': Math.max(0, Math.min(100, optionA)),
      'Option B': Math.max(0, Math.min(100, optionB)),
      'Option C': Math.max(0, Math.min(100, optionC)),
      'Option D': Math.max(0, Math.min(100, optionD))
    })
  }

  return data
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white font-semibold text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function PredictionChart({ predictionId, type = 'binary' }: PredictionChartProps) {
  const isBinary = type === 'binary'
  const data = isBinary ? generateMockBinaryData() : generateMockMultipleData()

  const binaryColors = {
    yes: '#3b82f6', // blue-500
    no: '#ef4444'   // red-500
  }

  const multipleColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">
          {isBinary ? 'Probability Over Time' : 'Options Probability Over Time'}
        </h3>
        <p className="text-slate-400 text-sm">
          {isBinary
            ? 'Historical probability that the prediction will resolve as YES'
            : 'Historical probability for each option'
          }
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />

          {isBinary ? (
            <>
              <Line
                type="monotone"
                dataKey="yesChance"
                name="YES"
                stroke={binaryColors.yes}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </>
          ) : (
            <>
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span className="text-white text-sm">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="Option A"
                stroke={multipleColors[0]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option B"
                stroke={multipleColors[1]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option C"
                stroke={multipleColors[2]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Option D"
                stroke={multipleColors[3]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {isBinary && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full" style={{ backgroundColor: binaryColors.yes }} />
            <span className="text-slate-300 text-sm font-medium">YES</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full" style={{ backgroundColor: binaryColors.no }} />
            <span className="text-slate-300 text-sm font-medium">NO</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">
          * This chart shows historical probability data. Mock data is shown for demonstration purposes.
        </p>
      </div>
    </div>
  )
}
