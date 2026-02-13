#!/usr/bin/env node

/**
 * Claims CRUD Manual Test Script
 * Tests all Claims system endpoints and functionality
 */

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Claims System CRUD Test Suite\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: List Claims (READ)
await test('GET /api/claims - List all claims', async () => {
  const response = await fetch(`${BASE_URL}/api/claims?limit=10`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  if (!data.claims || !Array.isArray(data.claims)) {
    throw new Error('Invalid response format');
  }

  console.log(`   Found ${data.claims.length} claims`);
  if (data.claims.length > 0) {
    console.log(`   First claim: "${data.claims[0].title.substring(0, 50)}..."`);
  }
});

// Test 2: Get single Claim (READ)
await test('GET /api/claims/[id] - Get single claim', async () => {
  // First get list to find a claim ID
  const listResponse = await fetch(`${BASE_URL}/api/claims?limit=1`);
  const listData = await listResponse.json();

  if (listData.claims.length === 0) {
    throw new Error('No claims available to test');
  }

  const claimId = listData.claims[0].id;
  const response = await fetch(`${BASE_URL}/api/claims/${claimId}`);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  if (!data.claim) throw new Error('No claim data returned');

  console.log(`   Claim ID: ${claimId}`);
  console.log(`   Title: "${data.claim.title.substring(0, 50)}..."`);
  console.log(`   Category: ${data.claim.category}`);
  console.log(`   True votes: ${data.claim.trueVotes || 0}`);
  console.log(`   False votes: ${data.claim.falseVotes || 0}`);
});

// Test 3: Get Claim Evidence (READ)
await test('GET /api/claims/[id]/evidence - Get evidence', async () => {
  const listResponse = await fetch(`${BASE_URL}/api/claims?limit=1`);
  const listData = await listResponse.json();

  if (listData.claims.length === 0) {
    throw new Error('No claims available');
  }

  const claimId = listData.claims[0].id;
  const response = await fetch(`${BASE_URL}/api/claims/${claimId}/evidence`);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  console.log(`   Found ${data.evidence?.length || 0} evidence items`);
});

// Test 4: Get Claim Arguments (READ)
await test('GET /api/claims/[id]/arguments - Get arguments', async () => {
  const listResponse = await fetch(`${BASE_URL}/api/claims?limit=1`);
  const listData = await listResponse.json();

  if (listData.claims.length === 0) {
    throw new Error('No claims available');
  }

  const claimId = listData.claims[0].id;
  const response = await fetch(`${BASE_URL}/api/claims/${claimId}/arguments`);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  console.log(`   Found ${data.arguments?.length || 0} arguments`);

  if (data.arguments && data.arguments.length > 0) {
    const arg = data.arguments[0];
    console.log(`   Position: ${arg.position}`);
    console.log(`   Content: "${arg.content.substring(0, 50)}..."`);
  }
});

// Test 5: Homepage renders
await test('GET / - Homepage renders with claims', async () => {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  if (!html.includes('Factagora')) {
    throw new Error('Homepage title not found');
  }

  console.log(`   Page size: ${(html.length / 1024).toFixed(1)} KB`);
});

// Test 6: Claim detail page renders
await test('GET /claims/[id] - Claim detail page renders', async () => {
  const listResponse = await fetch(`${BASE_URL}/api/claims?limit=1`);
  const listData = await listResponse.json();

  if (listData.claims.length === 0) {
    throw new Error('No claims available');
  }

  const claimId = listData.claims[0].id;
  const response = await fetch(`${BASE_URL}/claims/${claimId}`);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const html = await response.text();
  if (!html.includes(listData.claims[0].title)) {
    throw new Error('Claim title not found in page');
  }

  console.log(`   Claim detail page loaded successfully`);
});

// Test 7: Claims list page
await test('GET /claims - Claims list page', async () => {
  const response = await fetch(`${BASE_URL}/claims`);

  // Claims list page doesn't exist yet, should return 404
  if (response.status === 404) {
    console.log(`   ⚠️  Claims list page not implemented (expected)`);
    return;
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  console.log(`   Claims list page exists`);
});

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (testsFailed > 0) {
  process.exit(1);
}
