import pkg from 'pg'
const { Client } = pkg
import { readFileSync } from 'fs'

console.log('🚀 PostgreSQL을 통한 마이그레이션 실행...\n')

// Supabase connection details
// Note: 실제 비밀번호가 필요합니다
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres:YOUR_PASSWORD@db.ljyaylkntlwwkclxwofm.supabase.co:5432/postgres'

if (connectionString.includes('YOUR_PASSWORD')) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  데이터베이스 비밀번호가 필요합니다')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n비밀번호 확인 방법:')
  console.log('1. https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/settings/database')
  console.log('2. "Database password" 섹션에서 비밀번호 확인')
  console.log('\n실행 방법:')
  console.log('DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.ljyaylkntlwwkclxwofm.supabase.co:5432/postgres" node scripts/run-migration-pg.mjs')
  console.log('\n또는:')
  console.log('이 스크립트 파일을 열어서 YOUR_PASSWORD를 실제 비밀번호로 변경하세요.\n')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

try {
  console.log('📡 데이터베이스 연결 중...')
  await client.connect()
  console.log('✅ 연결 성공!\n')

  // Read migration file
  const sql = readFileSync('./supabase/migrations/combined_claims_system.sql', 'utf-8')
  console.log(`📄 마이그레이션 파일 로드: ${sql.split('\n').length}줄\n`)

  console.log('⚙️  마이그레이션 실행 중...\n')

  // Execute the migration
  await client.query(sql)

  console.log('✅ 마이그레이션 완료!\n')

  // Verify tables were created
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('claims', 'claim_votes', 'claim_evidence', 'claim_arguments')
    ORDER BY table_name
  `)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 생성된 테이블 확인:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  rows.forEach(row => console.log(`  ✓ ${row.table_name}`))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🎉 모든 마이그레이션이 성공적으로 완료되었습니다!\n')

} catch (error) {
  console.error('❌ 에러 발생:', error.message)

  if (error.message.includes('password authentication failed')) {
    console.log('\n⚠️  비밀번호가 올바르지 않습니다.')
    console.log('Supabase Dashboard에서 비밀번호를 확인해주세요.')
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
    console.log('\n⚠️  데이터베이스에 연결할 수 없습니다.')
    console.log('인터넷 연결을 확인해주세요.')
  } else {
    console.log('\n상세 에러:', error)
  }

  process.exit(1)
} finally {
  await client.end()
}
