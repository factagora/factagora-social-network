import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

console.log('🌱 Claims 시드 데이터 생성 시작...\n')

// Test user IDs (will check if they exist, or use first available user)
let testUserId = null

async function getOrCreateTestUser() {
  // Get first user from database
  const { data: users } = await supabase
    .from('users')
    .select('id, email, tier')
    .limit(1)

  if (users && users.length > 0) {
    testUserId = users[0].id
    console.log(`✅ 테스트 유저 발견: ${users[0].email} (${users[0].tier})`)
    return users[0]
  }

  console.log('⚠️  유저가 없습니다. 로그인 후 다시 실행해주세요.')
  return null
}

async function createClaims() {
  const user = await getOrCreateTestUser()
  if (!user) return

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const claims = [
    {
      title: "ChatGPT-5가 2026년 상반기에 출시될 것이다",
      description: "OpenAI는 2026년 상반기(1-6월)에 ChatGPT-5를 정식 출시할 것입니다. GPT-4.5가 아닌 GPT-5로 명명된 메이저 업데이트입니다.",
      category: "Technology",
      resolution_date: nextMonth.toISOString(),
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "비트코인이 2026년에 $150,000를 돌파할 것이다",
      description: "비트코인(BTC)의 가격이 2026년 내에 최소 한 번 이상 $150,000를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: nextMonth.toISOString(),
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "한국 야구 KBO 2026 시즌 우승팀은 KIA 타이거즈이다",
      description: "2026 KBO 정규시즌 및 포스트시즌을 통해 최종 우승하는 팀은 KIA 타이거즈일 것입니다.",
      category: "Sports",
      resolution_date: nextMonth.toISOString(),
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "넷플릭스가 2026년에 게임 스트리밍 서비스를 출시한다",
      description: "넷플릭스가 2026년 내에 클라우드 게임 스트리밍 서비스를 정식으로 출시할 것입니다. 베타나 테스트가 아닌 정식 서비스를 의미합니다.",
      category: "Entertainment",
      resolution_date: nextMonth.toISOString(),
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "애플이 2026년에 폴더블 아이폰을 출시한다",
      description: "애플이 2026년 내에 폴더블 디스플레이를 탑재한 아이폰을 정식 출시할 것입니다.",
      category: "Technology",
      resolution_date: nextMonth.toISOString(),
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "2026년 한국 영화가 아카데미 작품상을 수상한다",
      description: "2026년에 개봉 또는 공개되는 한국 영화가 아카데미(오스카) 시상식에서 작품상(Best Picture)을 수상할 것입니다.",
      category: "Entertainment",
      resolution_date: '2027-03-31T00:00:00Z', // 아카데미 시상식 이후
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "테슬라 주가가 2026년 말까지 $500를 돌파한다",
      description: "테슬라(TSLA) 주가가 2026년 12월 31일까지 최소 한 번 이상 $500를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: '2027-01-15T00:00:00Z',
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "인공지능이 2026년 노벨상을 수상한다",
      description: "2026년 노벨상 수상자 중 AI 시스템이 공동 수상자로 포함될 것입니다. (어떤 부문이든 가능)",
      category: "Science",
      resolution_date: '2026-12-31T00:00:00Z',
      created_by: testUserId,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
  ]

  console.log(`\n📝 ${claims.length}개의 Claims 생성 중...\n`)

  let successCount = 0
  let createdIds = []

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

  console.log(`\n🎉 완료: ${successCount}/${claims.length}개 Claims 생성됨\n`)

  // Add some votes to the first few claims
  if (createdIds.length > 0) {
    console.log('🗳️  투표 데이터 생성 중...\n')

    for (let i = 0; i < Math.min(3, createdIds.length); i++) {
      const claimId = createdIds[i]

      // Add TRUE vote
      const { error: voteError } = await supabase
        .from('claim_votes')
        .insert([{
          claim_id: claimId,
          user_id: testUserId,
          vote_value: Math.random() > 0.5, // Random TRUE/FALSE
          confidence: 0.7 + Math.random() * 0.3, // 0.7-1.0
          reasoning: '테스트 투표입니다.'
        }])

      if (!voteError) {
        console.log(`✅ Claim ${i + 1}에 투표 추가됨`)
      }
    }
  }

  // Add some evidence to first claim
  if (createdIds.length > 0) {
    console.log('\n📊 Evidence 데이터 생성 중...\n')

    const { error: evidenceError } = await supabase
      .from('claim_evidence')
      .insert([{
        claim_id: createdIds[0],
        submitted_by: testUserId,
        url: 'https://example.com/evidence',
        title: '관련 기사 1',
        description: 'OpenAI CEO Sam Altman의 인터뷰 내용',
        credibility_score: 85
      }])

    if (!evidenceError) {
      console.log('✅ Evidence 추가됨')
    }
  }

  // Add some arguments to first claim
  if (createdIds.length > 0) {
    console.log('\n💭 Argument 데이터 생성 중...\n')

    const { error: argError } = await supabase
      .from('claim_arguments')
      .insert([
        {
          claim_id: createdIds[0],
          author_id: testUserId,
          position: 'TRUE',
          content: 'OpenAI의 최근 투자 라운드와 개발 속도를 보면 2026년 상반기 출시가 충분히 가능합니다. GPT-4 출시 이후 1년이 지났고, 경쟁사들의 압박도 있어서 빠른 출시가 예상됩니다.',
          reasoning: '과거 출시 패턴 분석 및 시장 경쟁 상황 고려',
          confidence: 0.8,
          score: 5
        },
        {
          claim_id: createdIds[0],
          author_id: testUserId,
          position: 'FALSE',
          content: 'GPT-5 개발은 예상보다 더 많은 시간이 필요할 것입니다. 안전성 검증과 규제 대응에 많은 시간이 소요될 것으로 보입니다.',
          reasoning: 'AI 안전성 및 규제 이슈 고려',
          confidence: 0.65,
          score: 3
        }
      ])

    if (!argError) {
      console.log('✅ Arguments 추가됨')
    }
  }

  console.log('\n✨ 모든 시드 데이터 생성 완료!\n')
  console.log('🌐 브라우저에서 확인: http://localhost:3000\n')
}

createClaims().catch(console.error)
