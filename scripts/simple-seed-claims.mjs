import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

console.log('🌱 간단한 Claims 시드 데이터 생성...\n')

async function main() {
  // 1. Get or create test user
  console.log('👥 테스트 유저 생성/확인 중...\n')

  const testEmail = 'test@factagora.com'
  const testPassword = 'test1234'

  let userId = null

  // Try to create user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log(`⚠️  ${testEmail} 이미 존재함, 조회 중...`)
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const found = users?.find(u => u.email === testEmail)
      if (found) {
        userId = found.id
        console.log(`✅ 기존 유저 사용: ${testEmail}`)
      }
    } else {
      console.error('❌ 유저 생성 실패:', authError.message)
      return
    }
  } else {
    userId = authData.user.id
    console.log(`✅ 새 유저 생성: ${testEmail}`)
  }

  if (!userId) {
    console.error('❌ 유저 ID를 찾을 수 없습니다.')
    return
  }

  // 2. Create Claims (without tier checking since migration not run)
  console.log(`\n📝 Claims 생성 중...\n`)

  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const claims = [
    {
      title: "ChatGPT-5가 2026년 상반기에 출시될 것이다",
      description: "OpenAI는 2026년 상반기(1-6월)에 ChatGPT-5를 정식 출시할 것입니다. GPT-4.5가 아닌 GPT-5로 명명된 메이저 업데이트입니다.",
      category: "Technology",
      resolution_date: nextMonth.toISOString(),
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "비트코인이 2026년에 $150,000를 돌파할 것이다",
      description: "비트코인(BTC)의 가격이 2026년 내에 최소 한 번 이상 $150,000를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: nextMonth.toISOString(),
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "한국 야구 KBO 2026 시즌 우승팀은 KIA 타이거즈이다",
      description: "2026 KBO 정규시즌 및 포스트시즌을 통해 최종 우승하는 팀은 KIA 타이거즈일 것입니다.",
      category: "Sports",
      resolution_date: '2026-11-30T00:00:00Z',
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "넷플릭스가 2026년에 게임 스트리밍 서비스를 출시한다",
      description: "넷플릭스가 2026년 내에 클라우드 게임 스트리밍 서비스를 정식으로 출시할 것입니다.",
      category: "Entertainment",
      resolution_date: '2027-01-15T00:00:00Z',
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "애플이 2026년에 폴더블 아이폰을 출시한다",
      description: "애플이 2026년 내에 폴더블 디스플레이를 탑재한 아이폰을 정식 출시할 것입니다.",
      category: "Technology",
      resolution_date: '2027-01-01T00:00:00Z',
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "테슬라 주가가 2026년 말까지 $500를 돌파한다",
      description: "테슬라(TSLA) 주가가 2026년 12월 31일까지 최소 한 번 이상 $500를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: '2027-01-15T00:00:00Z',
      created_by: userId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    }
  ]

  let successCount = 0
  const createdIds = []

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i]
    const { data, error } = await supabase
      .from('claims')
      .insert([claim])
      .select()
      .single()

    if (error) {
      console.error(`❌ [${i + 1}/${claims.length}] 실패: ${claim.title}`)
      console.error(`   에러: ${error.message}`)
    } else {
      successCount++
      createdIds.push(data.id)
      console.log(`✅ [${i + 1}/${claims.length}] ${claim.title}`)
    }
  }

  console.log(`\n🎉 ${successCount}/${claims.length}개 Claims 생성 완료!\n`)

  // 3. Add some votes
  if (createdIds.length > 0) {
    console.log('🗳️  투표 데이터 생성 중...\n')

    for (let i = 0; i < Math.min(3, createdIds.length); i++) {
      const { error } = await supabase
        .from('claim_votes')
        .insert([{
          claim_id: createdIds[i],
          user_id: userId,
          vote_value: i % 2 === 0, // TRUE, FALSE, TRUE 패턴
          confidence: 0.7 + (i * 0.1),
          reasoning: `테스트 투표 ${i + 1}`
        }])

      if (!error) {
        console.log(`✅ Claim ${i + 1}에 투표 추가됨`)
      }
    }
  }

  // 4. Add evidence
  if (createdIds.length > 0) {
    console.log('\n📊 Evidence 생성 중...\n')

    const { error } = await supabase
      .from('claim_evidence')
      .insert([{
        claim_id: createdIds[0],
        submitted_by: userId,
        url: 'https://techcrunch.com/ai-news',
        title: 'OpenAI 최신 뉴스',
        description: 'ChatGPT-5 개발 현황 관련 기사',
        credibility_score: 80
      }])

    if (!error) {
      console.log(`✅ Evidence 추가됨`)
    }
  }

  // 5. Add arguments
  if (createdIds.length > 0) {
    console.log('\n💭 Arguments 생성 중...\n')

    const args = [
      {
        claim_id: createdIds[0],
        author_id: userId,
        position: 'TRUE',
        content: 'OpenAI의 개발 속도와 투자 규모를 보면 2026년 상반기 출시가 충분히 가능합니다. GPT-4 출시 후 1년이 지났고, 경쟁사들의 압박도 커지고 있습니다.',
        reasoning: '과거 패턴 및 시장 분석',
        confidence: 0.8,
        score: 0
      },
      {
        claim_id: createdIds[0],
        author_id: userId,
        position: 'FALSE',
        content: 'AI 안전성 검증과 규제 대응에 예상보다 많은 시간이 소요될 것입니다. OpenAI도 안전성을 우선시한다고 발표했습니다.',
        reasoning: '안전성 및 규제 이슈',
        confidence: 0.65,
        score: 0
      }
    ]

    for (const arg of args) {
      const { error } = await supabase
        .from('claim_arguments')
        .insert([arg])

      if (!error) {
        console.log(`✅ Argument 추가됨 (${arg.position})`)
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ 시드 데이터 생성 완료!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 테스트 계정: ${testEmail}`)
  console.log(`🔑 비밀번호: ${testPassword}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 브라우저: http://localhost:3000')
  console.log('🔐 로그인: http://localhost:3000/login\n')
}

main().catch(console.error)
