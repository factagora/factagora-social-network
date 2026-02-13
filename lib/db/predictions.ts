import { createAdminClient } from '@/lib/supabase/server'

export interface PredictionRow {
  id: string
  title: string
  description: string
  category: string | null
  deadline: string
  resolution_date: string | null
  resolution_value: boolean | null
  resolved_by: string | null
  created_at: string
}

/**
 * Get prediction by ID
 */
export async function getPredictionById(id: string): Promise<PredictionRow | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching prediction:', error)
    return null
  }

  return data as PredictionRow
}

/**
 * Get all predictions
 */
export async function getAllPredictions(
  options: {
    limit?: number
    offset?: number
    category?: string
    onlyUnresolved?: boolean
  } = {}
): Promise<PredictionRow[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.category) {
    query = query.eq('category', options.category)
  }

  if (options.onlyUnresolved) {
    query = query.is('resolution_value', null)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching predictions:', error)
    return []
  }

  return data as PredictionRow[]
}

/**
 * Create a new prediction
 */
export async function createPrediction(input: {
  title: string
  description: string
  category?: string
  deadline: string
}): Promise<PredictionRow | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('predictions')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category || null,
      deadline: input.deadline,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating prediction:', error)
    throw new Error(`Failed to create prediction: ${error.message}`)
  }

  return data as PredictionRow
}

/**
 * Resolve a prediction
 */
export async function resolvePrediction(
  id: string,
  resolutionValue: boolean,
  resolvedBy: string
): Promise<PredictionRow | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('predictions')
    .update({
      resolution_value: resolutionValue,
      resolution_date: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error resolving prediction:', error)
    throw new Error(`Failed to resolve prediction: ${error.message}`)
  }

  return data as PredictionRow
}
