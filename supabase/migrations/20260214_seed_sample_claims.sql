-- Seed sample claims for each category
-- These are fact-checkable claims that can generate interesting debates

-- Technology Claims
INSERT INTO claims (
  title,
  description,
  category,
  claim_type,
  claim_date,
  source_url,
  source_title,
  resolution_date,
  approval_status,
  created_by
) VALUES
(
  'AI will achieve human-level reasoning capabilities by 2030',
  'Multiple AI researchers predict that artificial general intelligence (AGI) will reach human-level reasoning and problem-solving abilities within the next 6 years, based on current progress in large language models and multimodal AI systems.',
  'technology',
  'FACTUAL',
  NOW(),
  'https://example.com/ai-predictions-2030',
  'AI Research Institute Report 2024',
  '2030-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Quantum computers will break current encryption standards within 5 years',
  'Security experts claim that quantum computing advances will make RSA-2048 and similar encryption methods vulnerable to attacks by 2029, requiring a complete overhaul of internet security infrastructure.',
  'technology',
  'FACTUAL',
  NOW(),
  'https://example.com/quantum-encryption',
  'Cybersecurity Today',
  '2029-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Politics Claims
(
  'Universal Basic Income reduces poverty more effectively than traditional welfare',
  'Studies from UBI pilot programs in Finland, Kenya, and California suggest that direct cash transfers are more effective at reducing poverty than traditional welfare programs with conditions and restrictions.',
  'politics',
  'STATISTICAL',
  NOW(),
  'https://example.com/ubi-studies',
  'Economic Policy Institute',
  '2026-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Remote work policies increase overall worker productivity by 20%',
  'Analysis of Fortune 500 companies shows that employees working remotely 3+ days per week demonstrate 20% higher productivity compared to full-time office workers, measured by output per hour.',
  'politics',
  'STATISTICAL',
  NOW(),
  'https://example.com/remote-work-productivity',
  'Harvard Business Review',
  '2026-06-30'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Business Claims
(
  'Companies with diverse leadership teams outperform their peers by 35%',
  'McKinsey research indicates that companies in the top quartile for gender and ethnic diversity on executive teams are 35% more likely to outperform their industry medians on profitability.',
  'business',
  'STATISTICAL',
  NOW(),
  'https://example.com/diversity-performance',
  'McKinsey & Company Report',
  '2026-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'The 4-day work week increases employee satisfaction without reducing output',
  'Trials in UK, Iceland, and New Zealand show that companies implementing a 4-day work week (32 hours) maintain 100% productivity while increasing employee satisfaction scores by 40%.',
  'business',
  'STATISTICAL',
  NOW(),
  'https://example.com/4day-workweek',
  'Global Work-Life Balance Study',
  '2026-09-30'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Health Claims
(
  'Intermittent fasting reduces risk of type 2 diabetes by 40%',
  'Meta-analysis of clinical trials suggests that intermittent fasting (16:8 or 5:2 protocols) reduces the risk of developing type 2 diabetes by up to 40% in pre-diabetic individuals over a 2-year period.',
  'health',
  'STATISTICAL',
  NOW(),
  'https://example.com/intermittent-fasting-diabetes',
  'Journal of Clinical Endocrinology',
  '2027-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Regular meditation practice reduces anxiety symptoms as effectively as medication',
  'Randomized controlled trials show that 8 weeks of daily meditation (20 minutes) produces anxiety reduction comparable to first-line SSRI medications, with fewer side effects.',
  'health',
  'STATISTICAL',
  NOW(),
  'https://example.com/meditation-anxiety',
  'American Journal of Psychiatry',
  '2026-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Climate Claims
(
  'Renewable energy will be cheaper than fossil fuels globally by 2025',
  'Bloomberg analysis projects that solar and wind energy will achieve lower levelized cost of energy (LCOE) than coal and natural gas in all major markets by the end of 2025.',
  'climate',
  'STATISTICAL',
  NOW(),
  'https://example.com/renewable-cost-parity',
  'Bloomberg New Energy Finance',
  '2025-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Electric vehicles will reach cost parity with gas cars by 2027',
  'Automotive industry analysts predict that EVs will match or undercut the upfront purchase price of equivalent gasoline vehicles by 2027, driven by battery cost reductions and manufacturing scale.',
  'climate',
  'FACTUAL',
  NOW(),
  'https://example.com/ev-cost-parity',
  'International Energy Agency',
  '2027-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),

-- Sports Claims
(
  'Athletes using sleep optimization protocols improve performance by 15%',
  'Sports science research shows that professional athletes following structured sleep protocols (8-10 hours, consistent schedule, recovery tracking) improve competitive performance metrics by an average of 15%.',
  'sports',
  'STATISTICAL',
  NOW(),
  'https://example.com/sleep-athletic-performance',
  'Journal of Sports Medicine',
  '2026-12-31'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Video Assistant Referee (VAR) reduces referee errors by 80%',
  'Analysis of major football leagues shows that VAR implementation has reduced clear and obvious referee errors by approximately 80%, though it has increased average match time by 3 minutes.',
  'sports',
  'STATISTICAL',
  NOW(),
  'https://example.com/var-effectiveness',
  'FIFA Technical Report',
  '2026-06-30'::timestamptz,
  'APPROVED',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Verify the inserts
SELECT
  category,
  COUNT(*) as claim_count,
  STRING_AGG(SUBSTRING(title, 1, 50), ' | ') as sample_titles
FROM claims
WHERE approval_status = 'APPROVED'
GROUP BY category
ORDER BY category;
