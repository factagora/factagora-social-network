import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('🔍 Claims 테이블 확인 중...\n')

const { data, error } = await supabase
  .from('claims')
  .select('*')
  .limit(5)

if (error) {
  console.error('❌ 조회 에러:', error.message)
  console.error('Code:', error.code)
} else {
  console.log(`✅ Claims 테이블 존재 (현재 ${data.length}개)`)
  if (data.length > 0) {
    console.log('\n최근 Claims:')
    data.forEach((claim, i) => {
      console.log(`${i + 1}. ${claim.title}`)
    })
  }
}
