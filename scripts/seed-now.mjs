import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('🌱 Claims 시드 데이터 생성...\n')

// Get existing users
const { data: { users } } = await supabase.auth.admin.listUsers()

if (!users || users.length === 0) {
  console.log('❌ 유저가 없습니다. 먼저 로그인해주세요.')
  process.exit(1)
}

const testUser = users[0]
console.log(`✅ 유저 확인: ${testUser.email}\n`)

const now = new Date()
const nextMonth = new Date(now)
nextMonth.setMonth(nextMonth.getMonth() + 1)

const claims = [
  {
    title: "ChatGPT-5가 2026년 상반기에 출시될 것이다",
    description: "OpenAI는 2026년 상반기(1-6월)에 ChatGPT-5를 정식 출시할 것입니다. GPT-4.5가 아닌 GPT-5로 명명된 메이저 업데이트입니다.",
    category: "Technology",
    resolution_date: nextMonth.toISOString(),
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  {
    title: "비트코인이 2026년에 $150,000를 돌파할 것이다",
    description: "비트코인(BTC)의 가격이 2026년 내에 최소 한 번 이상 $150,000를 돌파할 것입니다.",
    category: "Finance",
    resolution_date: nextMonth.toISOString(),
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  {
    title: "한국 야구 KBO 2026 시즌 우승팀은 KIA 타이거즈이다",
    description: "2026 KBO 정규시즌 및 포스트시즌을 통해 최종 우승하는 팀은 KIA 타이거즈일 것입니다.",
    category: "Sports",
    resolution_date: '2026-11-30T00:00:00Z',
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  {
    title: "애플이 2026년에 폴더블 아이폰을 출시한다",
    description: "애플이 2026년 내에 폴더블 디스플레이를 탑재한 아이폰을 정식 출시할 것입니다.",
    category: "Technology",
    resolution_date: '2027-01-01T00:00:00Z',
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  {
    title: "테슬라 주가가 2026년 말까지 $500를 돌파한다",
    description: "테슬라(TSLA) 주가가 2026년 12월 31일까지 최소 한 번 이상 $500를 돌파할 것입니다.",
    category: "Finance",
    resolution_date: '2027-01-15T00:00:00Z',
    created_by: testUser.id,
    approval_status: 'APPROVED'
  },
  {
    title: "넷플릭스가 2026년에 게임 스트리밍 서비스를 출시한다",
    description: "넷플릭스가 2026년 내에 클라우드 게임 스트리밍 서비스를 정식으로 출시할 것입니다.",
    category: "Entertainment",
    resolution_date: '2027-01-15T00:00:00Z',
    created_by: testUser.id,
    approval_status: 'APPROVED'
  }
]

console.log(`📝 ${claims.length}개 Claims 생성 중...\n`)

let success = 0
const createdIds = []

for (const claim of claims) {
  const { data, error } = await supabase
    .from('claims')
    .insert([claim])
    .select()
    .single()

  if (error) {
    console.log(`❌ ${claim.title}`)
    console.log(`   에러: ${error.message}`)
  } else {
    success++
    createdIds.push(data.id)
    console.log(`✅ ${claim.title}`)
  }
}

console.log(`\n🎉 ${success}/${claims.length}개 생성 완료!\n`)

// Add votes
if (createdIds.length > 0) {
  console.log('🗳️  투표 추가 중...\n')

  for (let i = 0; i < Math.min(3, createdIds.length); i++) {
    await supabase
      .from('claim_votes')
      .insert([{
        claim_id: createdIds[i],
        user_id: testUser.id,
        vote_value: i % 2 === 0,
        confidence: 0.7 + (i * 0.1)
      }])

    console.log(`✅ Claim ${i + 1}에 투표 추가`)
  }
}

// Add evidence
if (createdIds.length > 0) {
  console.log('\n📊 Evidence 추가 중...\n')

  await supabase
    .from('claim_evidence')
    .insert([{
      claim_id: createdIds[0],
      submitted_by: testUser.id,
      url: 'https://techcrunch.com/ai-news',
      title: 'OpenAI 개발 현황',
      description: 'ChatGPT-5 관련 최신 뉴스',
      credibility_score: 80
    }])

  console.log('✅ Evidence 추가 완료')
}

// Add arguments
if (createdIds.length > 0) {
  console.log('\n💭 Arguments 추가 중...\n')

  const args = [
    {
      claim_id: createdIds[0],
      author_id: testUser.id,
      position: 'TRUE',
      content: 'OpenAI의 개발 속도와 투자 규모를 보면 2026년 상반기 출시가 충분히 가능합니다. GPT-4 출시 후 1년이 지났고, 경쟁사들의 압박도 커지고 있습니다. 특히 Google의 Gemini와 Anthropic의 Claude가 빠르게 발전하고 있어서 OpenAI도 빠른 출시를 고려할 것입니다.',
      reasoning: '과거 패턴 및 경쟁 환경 분석',
      confidence: 0.8,
      score: 0
    },
    {
      claim_id: createdIds[0],
      author_id: testUser.id,
      position: 'FALSE',
      content: 'AI 안전성 검증과 규제 대응에 예상보다 많은 시간이 소요될 것입니다. OpenAI도 최근 안전성을 우선시한다고 발표했고, GPT-5의 능력이 크게 향상될 경우 더 많은 테스트가 필요할 것입니다. 또한 EU의 AI Act 등 규제 대응에도 시간이 걸립니다.',
      reasoning: 'AI 안전성 및 규제 이슈',
      confidence: 0.65,
      score: 0
    }
  ]

  for (const arg of args) {
    await supabase
      .from('claim_arguments')
      .insert([arg])
    console.log(`✅ Argument 추가 (${arg.position})`)
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨ 시드 데이터 생성 완료!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`📧 테스트 계정: ${testUser.email}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🌐 http://localhost:3000')
console.log('🔐 http://localhost:3000/login\n')

