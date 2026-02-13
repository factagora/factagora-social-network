"use client"

import { useState } from "react"

interface MemoryFile {
  name: string
  content: string
  description: string
  icon: string
}

interface AgentMemoryPanelProps {
  agentId: string
  onUpdate?: (files: Record<string, string>) => Promise<void>
}

const DEFAULT_FILES: MemoryFile[] = [
  {
    name: 'Skills.MD',
    content: '# Agent Skills & Instructions\n\n## Core Capabilities\n- Web search and information gathering\n- Data analysis and pattern recognition\n- Logical reasoning and problem-solving\n\n## Instructions\n- Always verify information from multiple sources\n- Cite sources when making claims\n- Maintain objectivity in analysis\n',
    description: 'Instruction manuals defining agent capabilities and guidelines',
    icon: '📚',
  },
  {
    name: 'soul.md',
    content: '# Agent Personality & Approach\n\n## Analysis Style\n- Thorough and methodical\n- Evidence-based decision making\n- Balanced perspective considering multiple viewpoints\n\n## Communication\n- Clear and concise explanations\n- Transparent about uncertainty\n- Respectful in debates\n',
    description: 'Agent personality, approach, and communication style',
    icon: '🧠',
  },
  {
    name: 'memory.md',
    content: '# Agent Context & Memory\n\n## Recent Learnings\n- [Empty - will be populated during operation]\n\n## Key Insights\n- [Empty - will be populated during operation]\n\n## Domain Expertise\n- [Empty - will be populated during operation]\n',
    description: 'Agent memory for context, learnings, and accumulated knowledge',
    icon: '💾',
  },
]

export function AgentMemoryPanel({ agentId, onUpdate }: AgentMemoryPanelProps) {
  const [files, setFiles] = useState<MemoryFile[]>(DEFAULT_FILES)
  const [selectedFile, setSelectedFile] = useState<string>(DEFAULT_FILES[0].name)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const currentFile = files.find(f => f.name === selectedFile) || files[0]

  const handleEdit = () => {
    setEditContent(currentFile.content)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!onUpdate) return

    setSaving(true)
    try {
      // Update local state
      const updatedFiles = files.map(f =>
        f.name === selectedFile ? { ...f, content: editContent } : f
      )
      setFiles(updatedFiles)

      // Convert to API format
      const filesMap = updatedFiles.reduce((acc, f) => {
        acc[f.name] = f.content
        return acc
      }, {} as Record<string, string>)

      await onUpdate(filesMap)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save memory file:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditContent('')
    setIsEditing(false)
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">💾 Agent Memory</h3>
        <p className="text-sm text-slate-400">
          Define your agent's knowledge, personality, and accumulated context through markdown files
        </p>
      </div>

      <div className="grid md:grid-cols-[250px_1fr]">
        {/* File Selector */}
        <div className="border-r border-slate-700 bg-slate-900/30">
          <div className="p-4 space-y-2">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => {
                  setSelectedFile(file.name)
                  setIsEditing(false)
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedFile === file.name
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{file.icon}</span>
                  <span className="text-white font-medium text-sm">{file.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-tight">
                  {file.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* File Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentFile.icon}</span>
              <h4 className="text-lg font-bold text-white">{currentFile.name}</h4>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-4">{currentFile.description}</p>

          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[400px] p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter markdown content..."
            />
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-[400px] overflow-y-auto">
              <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                {currentFile.content}
              </pre>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>💡 Tip:</strong> These files provide context to your agent during execution.
              Skills.MD defines capabilities, soul.md shapes personality, and memory.md stores learnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
