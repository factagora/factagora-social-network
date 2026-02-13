import ClaimCreateForm from '@/components/forms/ClaimCreateForm'

export default function CreateClaimPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ClaimCreateForm />
      </div>
    </div>
  )
}
