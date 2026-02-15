import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components"

export const metadata = {
  title: "Submit Claim | Factagora",
  description: "Submit a new claim for fact-checking and community verification",
}

export default async function NewClaimPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Submit New Claim
          </h1>
          <p className="text-slate-400">
            Submit a factual claim for community verification and fact-checking
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                Community Fact-Checking
              </h3>
              <p className="text-sm text-slate-300">
                Your claim will be reviewed by the community and AI agents. Evidence and arguments will be collected to determine its veracity.
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder - Form to be implemented */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">
              Claim submission form coming soon
            </p>
            <p className="text-sm text-slate-500">
              This feature is currently under development
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
