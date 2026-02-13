import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

console.log('🌱 테스트 유저 및 Claims 생성 시작...\n')

async function createTestUsers() {
  console.log('👥 테스트 유저 생성 중...\n')

  const testUsers = [
    {
      email: 'test1@factagora.com',
      password: 'test1234',
      tier: 'PREMIUM'
    },
    {
      email: 'test2@factagora.com',
      password: 'test1234',
      tier: 'FREE'
    },
    {
      email: 'admin@factagora.com',
      password: 'admin1234',
      tier: 'ADMIN'
    }
  ]

  const createdUsers = []

  for (const user of testUsers) {
    // Try to create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  ${user.email} - 이미 존재함, 조회 중...`)
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const found = existingUser?.users?.find(u => u.email === user.email)
        if (found) {
          createdUsers.push({ id: found.id, email: user.email, tier: user.tier })
          console.log(`✅ ${user.email} (기존 유저 사용)`)
        }
      } else {
        console.error(`❌ ${user.email} - 실패: ${authError.message}`)
      }
      continue
    }

    if (authData.user) {
      // Update user tier in users table
      const { error: updateError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: user.email,
            tier: user.tier,
            created_at: new Date().toISOString()
          }
        ])

      if (updateError) {
        console.error(`⚠️  ${user.email} - tier 설정 실패: ${updateError.message}`)
      }

      createdUsers.push({ id: authData.user.id, email: user.email, tier: user.tier })
      console.log(`✅ ${user.email} (${user.tier})`)
    }
  }

  console.log(`\n✨ ${createdUsers.length}명의 유저 준비 완료\n`)
  return createdUsers
}

async function createClaims(users) {
  if (users.length === 0) {
    console.log('❌ 유저가 없어서 Claims를 생성할 수 없습니다.')
    return
  }

  const mainUser = users.find(u => u.tier === 'PREMIUM') || users[0]

  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const claims = [
    {
      title: "ChatGPT-5가 2026년 상반기에 출시될 것이다",
      description: "OpenAI는 2026년 상반기(1-6월)에 ChatGPT-5를 정식 출시할 것입니다. GPT-4.5가 아닌 GPT-5로 명명된 메이저 업데이트입니다.",
      category: "Technology",
      resolution_date: nextMonth.toISOString(),
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "비트코인이 2026년에 $150,000를 돌파할 것이다",
      description: "비트코인(BTC)의 가격이 2026년 내에 최소 한 번 이상 $150,000를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: nextMonth.toISOString(),
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "한국 야구 KBO 2026 시즌 우승팀은 KIA 타이거즈이다",
      description: "2026 KBO 정규시즌 및 포스트시즌을 통해 최종 우승하는 팀은 KIA 타이거즈일 것입니다.",
      category: "Sports",
      resolution_date: '2026-11-30T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "넷플릭스가 2026년에 게임 스트리밍 서비스를 출시한다",
      description: "넷플릭스가 2026년 내에 클라우드 게임 스트리밍 서비스를 정식으로 출시할 것입니다. 베타나 테스트가 아닌 정식 서비스를 의미합니다.",
      category: "Entertainment",
      resolution_date: '2027-01-15T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "애플이 2026년에 폴더블 아이폰을 출시한다",
      description: "애플이 2026년 내에 폴더블 디스플레이를 탑재한 아이폰을 정식 출시할 것입니다.",
      category: "Technology",
      resolution_date: '2027-01-01T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "2026년 한국 영화가 아카데미 작품상을 수상한다",
      description: "2026년에 개봉 또는 공개되는 한국 영화가 아카데미(오스카) 시상식에서 작품상(Best Picture)을 수상할 것입니다.",
      category: "Entertainment",
      resolution_date: '2027-03-31T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "테슬라 주가가 2026년 말까지 $500를 돌파한다",
      description: "테슬라(TSLA) 주가가 2026년 12월 31일까지 최소 한 번 이상 $500를 돌파할 것입니다.",
      category: "Finance",
      resolution_date: '2027-01-15T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
    {
      title: "인공지능이 2026년 노벨상을 공동 수상한다",
      description: "2026년 노벨상 수상자 중 AI 시스템이 공동 수상자로 포함될 것입니다. (어떤 부문이든 가능)",
      category: "Science",
      resolution_date: '2026-12-31T00:00:00Z',
      created_by: mainUser.id,
      approval_status: 'APPROVED',
      verification_status: 'PENDING'
    },
  ]

  console.log(`📝 ${claims.length}개의 Claims 생성 중...\n`)

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

  // Add votes
  if (createdIds.length > 0 && users.length > 0) {
    console.log('🗳️  투표 데이터 생성 중...\n')

    for (let i = 0; i < Math.min(5, createdIds.length); i++) {
      const claimId = createdIds[i]

      // Multiple users vote
      for (const user of users.slice(0, 2)) {
        const { error: voteError } = await supabase
          .from('claim_votes')
          .insert([{
            claim_id: claimId,
            user_id: user.id,
            vote_value: Math.random() > 0.5,
            confidence: 0.6 + Math.random() * 0.4,
            reasoning: `${user.email}의 테스트 투표`
          }])

        if (!voteError) {
          console.log(`✅ Claim ${i + 1}에 ${user.email} 투표 추가`)
        }
      }
    }
  }

  // Add evidence
  if (createdIds.length > 0) {
    console.log('\n📊 Evidence 데이터 생성 중...\n')

    const evidenceData = [
      {
        claim_id: createdIds[0],
        submitted_by: mainUser.id,
        url: 'https://techcrunch.com/openai-gpt5',
        title: 'OpenAI GPT-5 개발 현황',
        description: 'Sam Altman CEO 인터뷰 - GPT-5 개발 진행 상황',
        credibility_score: 85
      },
      {
        claim_id: createdIds[0],
        submitted_by: mainUser.id,
        url: 'https://example.com/ai-timeline',
        title: 'AI 모델 출시 타임라인',
        description: '과거 GPT 모델들의 출시 패턴 분석',
        credibility_score: 75
      }
    ]

    for (const evidence of evidenceData) {
      const { error } = await supabase
        .from('claim_evidence')
        .insert([evidence])

      if (!error) {
        console.log(`✅ Evidence 추가됨: ${evidence.title}`)
      }
    }
  }

  // Add arguments
  if (createdIds.length > 0) {
    console.log('\n💭 Argument 데이터 생성 중...\n')

    const argumentsData = [
      {
        claim_id: createdIds[0],
        author_id: mainUser.id,
        position: 'TRUE',
        content: 'OpenAI의 최근 투자 라운드와 개발 속도를 보면 2026년 상반기 출시가 충분히 가능합니다. GPT-4 출시 이후 1년이 지났고, 경쟁사들의 압박도 있어서 빠른 출시가 예상됩니다.',
        reasoning: '과거 출시 패턴 분석 및 시장 경쟁 상황 고려',
        confidence: 0.8,
        score: 5
      },
      {
        claim_id: createdIds[0],
        author_id: users.length > 1 ? users[1].id : mainUser.id,
        position: 'FALSE',
        content: 'GPT-5 개발은 예상보다 더 많은 시간이 필요할 것입니다. 안전성 검증과 규제 대응에 많은 시간이 소요될 것으로 보입니다. OpenAI도 최근 안전성을 우선시한다고 발표했습니다.',
        reasoning: 'AI 안전성 및 규제 이슈 고려',
        confidence: 0.65,
        score: 3
      },
      {
        claim_id: createdIds[1], // Bitcoin claim
        author_id: mainUser.id,
        position: 'TRUE',
        content: '비트코인 반감기 이후 역사적으로 가격이 크게 상승했습니다. 2024년 반감기 이후 2026년까지 충분한 시간이 있고, 기관 투자자들의 진입도 계속되고 있습니다.',
        reasoning: '역사적 패턴과 시장 환경 분석',
        confidence: 0.75,
        score: 8
      }
    ]

    for (const arg of argumentsData) {
      const { error } = await supabase
        .from('claim_arguments')
        .insert([arg])

      if (!error) {
        console.log(`✅ Argument 추가됨 (${arg.position})`)
      }
    }
  }

  console.log('\n✨ 모든 시드 데이터 생성 완료!\n')
}

async function main() {
  try {
    const users = await createTestUsers()
    await createClaims(users)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 테스트 계정 정보')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. test1@factagora.com / test1234 (PREMIUM)')
    console.log('2. test2@factagora.com / test1234 (FREE)')
    console.log('3. admin@factagora.com / admin1234 (ADMIN)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('🌐 브라우저에서 확인: http://localhost:3000')
    console.log('🔐 로그인: http://localhost:3000/login\n')

  } catch (error) {
    console.error('❌ 에러 발생:', error)
  }
}

main()
