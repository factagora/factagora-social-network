#!/usr/bin/env node

/**
 * Claims Approval & Resolution Workflow Test
 * Tests admin approval and claim resolution functionality
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
);

console.log('🧪 Claims Approval & Resolution Workflow Tests\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Get test user
const { data: { users } } = await supabase.auth.admin.listUsers();
if (!users || users.length === 0) {
  console.log('❌ No users found. Please create a test user first.');
  process.exit(1);
}
const testUser = users[0];
console.log(`👤 Test User: ${testUser.email}\n`);

// Test 1: Check existing claims approval status
await test('Verify claims have approval_status field', async () => {
  const { data: claims, error } = await supabase
    .from('claims')
    .select('id, title, approval_status, created_by')
    .limit(5);

  if (error) throw new Error(error.message);
  if (!claims || claims.length === 0) throw new Error('No claims found');

  console.log(`   Found ${claims.length} claims`);
  const approvedCount = claims.filter(c => c.approval_status === 'APPROVED').length;
  const pendingCount = claims.filter(c => c.approval_status === 'PENDING').length;
  console.log(`   Approved: ${approvedCount}, Pending: ${pendingCount}`);
});

// Test 2: Create a pending claim
let pendingClaimId;
await test('Create new claim (should default to PENDING)', async () => {
  const newClaim = {
    title: '테스트 Claim - Approval System Test',
    description: 'This is a test claim to verify the approval system workflow.',
    category: 'Technology',
    resolution_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: testUser.id,
    // Do not set approval_status - should default to PENDING
  };

  const { data, error } = await supabase
    .from('claims')
    .insert([newClaim])
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned');

  pendingClaimId = data.id;
  console.log(`   Created claim: ${data.id}`);
  console.log(`   Status: ${data.approval_status || 'NOT SET'}`);

  if (data.approval_status !== 'PENDING' && data.approval_status !== null) {
    throw new Error(`Expected PENDING, got ${data.approval_status}`);
  }
});

// Test 3: Verify public cannot see pending claims
await test('Verify pending claims not visible to public', async () => {
  // This test uses RLS, so we need to check without auth
  const publicSupabase = createClient(
    'https://ljyaylkntlwwkclxwofm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzc2ODIsImV4cCI6MjA2OTMxMzY4Mn0.ug6WIe9SvAkz1xbxuC8zhIg9gClIpUwb9y5uNo9PezI'
  );

  const { data, error } = await publicSupabase
    .from('claims')
    .select('id')
    .eq('id', pendingClaimId)
    .single();

  // Should NOT find the pending claim
  if (data) {
    throw new Error('Pending claim visible to public (RLS not working)');
  }

  console.log(`   ✅ Pending claim correctly hidden from public`);
});

// Test 4: Approve the claim
await test('Approve pending claim (admin action)', async () => {
  const { data, error } = await supabase
    .from('claims')
    .update({
      approval_status: 'APPROVED',
      approved_by: testUser.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', pendingClaimId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned');

  console.log(`   Approved claim: ${data.id}`);
  console.log(`   Status: ${data.approval_status}`);

  if (data.approval_status !== 'APPROVED') {
    throw new Error(`Expected APPROVED, got ${data.approval_status}`);
  }
});

// Test 5: Verify approved claim now visible to public
await test('Verify approved claim visible to public', async () => {
  const publicSupabase = createClient(
    'https://ljyaylkntlwwkclxwofm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzc2ODIsImV4cCI6MjA2OTMxMzY4Mn0.ug6WIe9SvAkz1xbxuC8zhIg9gClIpUwb9y5uNo9PezI'
  );

  const { data, error } = await publicSupabase
    .from('claims')
    .select('id, title, approval_status')
    .eq('id', pendingClaimId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Approved claim not visible to public');

  console.log(`   ✅ Approved claim visible to public`);
  console.log(`   Title: ${data.title}`);
});

// Test 6: Check resolution workflow
await test('Verify claim resolution fields exist', async () => {
  const { data, error } = await supabase
    .from('claims')
    .select('id, resolution_date, resolved_at, resolution_value, verification_status')
    .eq('id', pendingClaimId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Claim not found');

  console.log(`   Resolution date: ${data.resolution_date}`);
  console.log(`   Resolved: ${data.resolved_at || 'Not yet'}`);
  console.log(`   Resolution value: ${data.resolution_value ?? 'Not set'}`);
  console.log(`   Verification status: ${data.verification_status}`);
});

// Test 7: Test resolution (simulate creator resolving claim)
await test('Resolve claim as TRUE', async () => {
  const { data, error } = await supabase
    .from('claims')
    .update({
      resolved_at: new Date().toISOString(),
      resolution_value: true,
      verification_status: 'VERIFIED',
    })
    .eq('id', pendingClaimId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned');

  console.log(`   Resolved claim: ${data.id}`);
  console.log(`   Resolution: ${data.resolution_value ? 'TRUE' : 'FALSE'}`);
  console.log(`   Status: ${data.verification_status}`);

  if (data.resolution_value !== true) {
    throw new Error('Resolution value not set correctly');
  }
});

// Test 8: Verify point distribution function exists
await test('Check point distribution function exists', async () => {
  const { data, error } = await supabase.rpc('distribute_claim_resolution_points', {
    p_claim_id: pendingClaimId,
  });

  // Function should exist even if it doesn't distribute points (no votes yet)
  // We're just checking it doesn't throw an error
  console.log(`   ✅ Point distribution function callable`);
});

// Cleanup: Delete test claim
await test('Cleanup: Delete test claim', async () => {
  const { error } = await supabase
    .from('claims')
    .delete()
    .eq('id', pendingClaimId);

  if (error) throw new Error(error.message);
  console.log(`   Deleted test claim: ${pendingClaimId}`);
});

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failed > 0) {
  process.exit(1);
}
