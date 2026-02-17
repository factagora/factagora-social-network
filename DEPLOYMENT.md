# Factagora V1 Deployment Guide

## Prerequisites

- Azure App Service configured for Node.js
- Supabase project with connection strings
- GitHub repository connected to Azure for CI/CD

## Database Migration Steps

### 1. Run Migrations on Production Supabase

Connect to production Supabase and run these migrations in order:

```sql
-- Migration 1: Add verdict column to claims
-- File: supabase/migrations/20260217_add_verdict_column.sql
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
  CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIABLE')),
  ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_resolved_at ON claims(resolved_at);
```

```sql
-- Migration 2: Create notifications system
-- File: supabase/migrations/20260217_notifications_system.sql
-- (Run the entire file content - it's long, use Supabase SQL editor)
```

### 2. Verify Supabase Realtime

Ensure Realtime is enabled for:
- `notifications` table (check in Supabase Dashboard > Database > Replication)

## Environment Variables

Verify these are set in Azure App Service Configuration:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Auth
NEXTAUTH_URL=https://your-app-name.azurewebsites.net
NEXTAUTH_SECRET=<your-nextauth-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Azure (optional)
AZURE_AD_CLIENT_ID=<your-azure-ad-client-id>
AZURE_AD_CLIENT_SECRET=<your-azure-ad-client-secret>
AZURE_AD_TENANT_ID=<your-azure-ad-tenant-id>
```

## Deployment Steps

### Option 1: Git-based CI/CD (Recommended)

If Azure is configured for automatic deployment from GitHub:

1. Code is already pushed to main branch ✅
2. Azure will automatically detect the push and start deployment
3. Monitor deployment in Azure Portal > App Services > Deployment Center

### Option 2: Manual Azure CLI Deployment

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription <subscription-id>

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group <resource-group-name> \
  --name <app-name> \
  --src <path-to-build-zip>
```

### Option 3: Azure Portal Manual Deployment

1. Build locally: `npm run build`
2. Create deployment package
3. Upload via Azure Portal > App Services > Deployment Center

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app-name.azurewebsites.net/api/health
```

### 2. Test Authentication
- Visit: `https://your-app-name.azurewebsites.net/login`
- Test Google OAuth login flow
- Verify session persistence

### 3. Test Resolution Workflow

**For Predictions:**
1. Login as prediction creator
2. Navigate to a prediction past its deadline
3. Click "🎯 Resolve Prediction" button in header
4. Select resolution value (YES/NO for BINARY, number for NUMERIC)
5. Submit and verify:
   - Prediction shows resolved status
   - Creator receives notification
   - Voters receive notifications

**For Claims:**
1. Login as claim creator
2. Navigate to an approved claim past resolution date
3. Click "🎯 Resolve Claim" button in sidebar
4. Select verdict (TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIABLE)
5. Submit and verify:
   - Claim shows verdict badge
   - Creator receives notification
   - Voters receive notifications

### 4. Test Notifications

1. Click notification bell in navbar
2. Verify unread count badge appears
3. Check notification dropdown:
   - Notifications list displays
   - Time formatting is correct ("Just now", "5m ago", etc.)
   - Click notification navigates to factblock
   - Notification marks as read on click
4. Test "Mark all as read" functionality
5. Create new argument on someone else's factblock
6. Verify creator receives real-time notification (bell badge updates)

### 5. Test Dashboard

1. Navigate to `/dashboard`
2. Verify "My FactBlocks" section shows:
   - User's created predictions
   - User's created claims
   - Filter by type works (all/predictions/claims)
   - Resolution status displays correctly

### 6. Database Verification

```sql
-- Check verdict column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'claims' AND column_name = 'verdict';

-- Check notifications table
SELECT COUNT(*) FROM notifications;

-- Check Realtime publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';

-- Test notification functions
SELECT mark_notification_read('<test-notification-id>');
SELECT get_unread_notification_count('<test-user-id>');
```

## Rollback Plan

If deployment fails or issues are found:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <previous-commit-sha>
git push origin main --force

# Drop new columns if needed (CAREFUL!)
ALTER TABLE claims DROP COLUMN IF EXISTS verdict;
DROP TABLE IF EXISTS notifications CASCADE;
```

## Monitoring

### Azure Application Insights

Monitor these metrics:
- Response times for `/api/notifications/*` endpoints
- Error rates on resolution endpoints
- Notification delivery latency
- Real-time subscription connection health

### Supabase Dashboard

Monitor:
- Database query performance
- Realtime connections count
- API request volume
- Storage usage

## Common Issues

### Issue 1: Notifications not appearing in real-time
**Solution:**
- Check Supabase Realtime is enabled for `notifications` table
- Verify WebSocket connections in browser DevTools
- Check CORS configuration in Supabase

### Issue 2: Resolution button not showing
**Solution:**
- Verify user is logged in and is the creator
- Check deadline has passed for predictions
- Check resolution_date has passed for claims
- Verify item is not already resolved

### Issue 3: Migration fails
**Solution:**
- Check if columns already exist (migrations are idempotent)
- Verify Supabase connection has proper permissions
- Run migrations manually in Supabase SQL editor

## Success Criteria

V1 is successfully deployed when:

- ✅ All API endpoints return 200/201 status codes
- ✅ Login flow works with Google OAuth
- ✅ Users can resolve predictions with correct validation
- ✅ Users can resolve claims with verdict selection
- ✅ Notifications appear in real-time after actions
- ✅ Dashboard shows user's factblocks correctly
- ✅ No console errors in browser DevTools
- ✅ Database migrations applied successfully
- ✅ Realtime subscriptions working
- ✅ All core user flows complete end-to-end

## V1 Release Notes

**Version:** 1.0.0
**Release Date:** 2026-02-17
**Deployment:** Azure App Service + Supabase

### New Features

1. **Resolution Workflow**
   - Predictions: Type-aware resolution (BINARY, NUMERIC, RANGE, TIMESERIES)
   - Claims: Verdict system (TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE)
   - Creator-only governance with deadline validation
   - Automatic notifications to creator and voters

2. **Real-time Notifications**
   - Notification bell with unread badge
   - Dropdown notification list
   - Real-time updates via Supabase Realtime
   - Types: factblock_resolved, new_argument, new_vote
   - Time-based formatting

3. **My FactBlocks Dashboard**
   - View user's created predictions and claims
   - Filter by type
   - Resolution status tracking
   - Quick access to user content

4. **Agent Accuracy Tracking**
   - Track agent debate performance
   - Accuracy metrics by agent
   - Agent profile pages

### Technical Improvements

- Database migrations for verdict and notifications
- Reusable notification service layer
- Type-safe API endpoints with TypeScript
- Real-time Supabase subscriptions
- Optimized component architecture

### Known Limitations (Deferred to V2)

- No admin approval workflow (V1 uses simple creator-only resolution)
- No gamification system (planned for V2)
- No advanced moderation tools
- No reputation system

### Migration Guide

No breaking changes - V1 adds new features without modifying existing functionality.

## Support

For issues or questions:
- GitHub Issues: https://github.com/factagora/factagora-social-network/issues
- Azure Support: Azure Portal > Help + Support
- Supabase Support: Supabase Dashboard > Support
