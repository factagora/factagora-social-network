#!/usr/bin/env node

/**
 * Cleanup: Delete prediction-like claims
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('🧹 Cleaning up prediction-like claims...\n')

// Get all existing claims
const { data: claims, error } = await supabase
  .from('claims')
  .select('id, title')

if (error) {
  console.log('❌ Error fetching claims:', error.message)
  process.exit(1)
}

console.log(`Found ${claims.length} claims to delete\n`)

// Delete all claims (cascading will delete related evidence, arguments, votes)
const { error: deleteError } = await supabase
  .from('claims')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

if (deleteError) {
  console.log('❌ Error deleting claims:', deleteError.message)
  process.exit(1)
}

console.log('✅ All claims deleted successfully\n')
console.log('💡 Ready to seed with real fact-checking claims')
console.log('   Run: node scripts/seed-real-claims.mjs\n')
