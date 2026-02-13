import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

// GET /api/admin/migrate - Run user_stats migration
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting migration...')

    // Use service role client to bypass RLS
    const supabase = createAdminClient()

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260211_user_stats.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')

    // Try to check if table already exists
    const { error: checkError } = await supabase
      .from('user_stats')
      .select('count')
      .limit(0)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'user_stats table already exists. Migration may have already been run.',
        alreadyExists: true,
      })
    }

    console.log('⚠️  Table does not exist, need to run migration')

    // Return SQL for manual execution
    return NextResponse.json({
      success: false,
      message: 'Please run migration manually in Supabase SQL Editor',
      instructions: [
        '1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql',
        '2. Click "+ New query"',
        '3. Copy contents from: supabase/migrations/20260211_user_stats.sql',
        '4. Paste and click "Run"',
      ],
      sqlPath: 'supabase/migrations/20260211_user_stats.sql',
    }, { status: 400 })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
