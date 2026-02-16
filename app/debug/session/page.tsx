import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SessionDebugPage() {
  const session = await auth()

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
        <p className="text-red-400">No session found - please log in first</p>
        <a href="/login" className="text-blue-400 hover:underline">
          Go to Login
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>

      <div className="bg-slate-800 p-6 rounded-lg space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Session User Data</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><span className="text-slate-400">User ID:</span> <span className="text-green-400">{session.user.id}</span></div>
            <div><span className="text-slate-400">Email:</span> {session.user.email}</div>
            <div><span className="text-slate-400">Name:</span> {session.user.name}</div>
            <div><span className="text-slate-400">Username:</span> {session.user.username}</div>
            <div><span className="text-slate-400">Role:</span> {session.user.role}</div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Full Session Object</h2>
          <pre className="bg-slate-950 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <a href="/dashboard" className="text-blue-400 hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
