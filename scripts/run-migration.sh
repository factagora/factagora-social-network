#!/bin/bash

# Run voting system migration
# Usage: ./scripts/run-migration.sh

echo "🚀 Running voting system migration..."

# Check if Supabase CLI is logged in
if ! supabase projects list &> /dev/null; then
  echo "❌ Supabase CLI not logged in"
  echo "Please run: supabase login"
  exit 1
fi

# Run migration
supabase db push

echo "✅ Migration complete!"
