import { readFileSync } from 'fs'
import fetch from 'node-fetch'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

console.log('🚀 마이그레이션 직접 실행 중...\n')

// Read the combined migration file
const sql = readFileSync('./supabase/migrations/combined_claims_system.sql', 'utf-8')

console.log('📄 마이그레이션 파일 로드 완료')
console.log(`📊 총 ${sql.split('\n').length}줄\n`)

// Try to execute via Supabase REST API
try {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({ query: sql })
  })

  if (response.ok) {
    console.log('✅ 마이그레이션 성공!')
  } else {
    const error = await response.text()
    console.error('❌ REST API 실패:', error)
    console.log('\n💡 대안: PostgreSQL 직접 연결 시도...\n')

    // Alternative: Show instructions for manual execution
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔧 수동 실행이 필요합니다')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n방법 1: Supabase SQL Editor')
    console.log('1. https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
    console.log('2. 파일 열기: supabase/migrations/combined_claims_system.sql')
    console.log('3. 전체 복사 & 붙여넣기')
    console.log('4. Run 클릭\n')
    console.log('\n방법 2: psql 사용')
    console.log('psql "postgresql://postgres:[PASSWORD]@db.ljyaylkntlwwkclxwofm.supabase.co:5432/postgres" < supabase/migrations/combined_claims_system.sql')
    console.log('\n[PASSWORD]는 Supabase Dashboard > Settings > Database에서 확인\n')
  }
} catch (error) {
  console.error('❌ 에러:', error.message)
  console.log('\n이 방법으로는 실행이 안 되는 것 같습니다.')
  console.log('Supabase SQL Editor를 사용해주세요!\n')
}
