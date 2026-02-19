import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { executeSkill } from '@/lib/skills/skill-executor';
import type { Skill, SkillExecutionInput } from '@/src/types/skill';
import type { PredictionRequest } from '@/lib/agents/core/types';

/**
 * Test endpoint for timeseries skill execution
 * GET /api/test/timeseries-skill
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Timeseries Skill Execution');

    const supabase = createAdminClient();

    // Step 1: Find agent with timeseries skill
    console.log('\n📋 Step 1: Finding agent with timeseries skill...');
    const { data: assignments, error: assignError } = await supabase
      .from('agent_skill_assignments')
      .select(`
        agent_id,
        skill_id,
        is_enabled,
        agents!inner (
          id,
          name,
          is_active,
          mode
        ),
        agent_skills!inner (
          id,
          name,
          slug,
          implementation_type,
          implementation_config
        )
      `)
      .eq('is_enabled', true)
      .eq('agents.is_active', true)
      .eq('agent_skills.slug', 'timeseries-forecasting');

    if (assignError || !assignments || assignments.length === 0) {
      return NextResponse.json({
        error: 'No agent with timeseries skill found',
        details: assignError?.message,
      }, { status: 404 });
    }

    const assignment = assignments[0];
    const agent = assignment.agents as any;
    const skill = assignment.agent_skills as any;

    console.log(`✅ Found agent: ${agent.name}`);
    console.log(`✅ Skill: ${skill.name}`);

    // Step 2: Find TIMESERIES prediction
    console.log('\n📊 Step 2: Finding TIMESERIES prediction...');
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('prediction_type', 'TIMESERIES')
      .limit(1);

    if (predError || !predictions || predictions.length === 0) {
      return NextResponse.json({
        error: 'No TIMESERIES predictions found',
      }, { status: 404 });
    }

    const prediction = predictions[0];
    console.log(`✅ Found prediction: ${prediction.title}`);

    // Step 3: Get agent's skills
    const { data: agentSkills, error: skillsError } = await supabase
      .from('agent_skill_assignments')
      .select(`
        skill_id,
        is_enabled,
        skill_config,
        agent_skills!inner (
          id,
          slug,
          name,
          category,
          implementation_type,
          implementation_config
        )
      `)
      .eq('agent_id', agent.id)
      .eq('is_enabled', true);

    if (skillsError || !agentSkills || agentSkills.length === 0) {
      return NextResponse.json({
        error: 'No skills found for agent',
      }, { status: 404 });
    }

    console.log(`\n🔧 Step 3: Found ${agentSkills.length} skills for agent`);

    // Step 4: Create mock historical data for testing
    const mockHistoricalData = [
      { date: '2024-01-01', value: 42000 },
      { date: '2024-02-01', value: 45000 },
      { date: '2024-03-01', value: 48000 },
      { date: '2024-04-01', value: 52000 },
      { date: '2024-05-01', value: 58000 },
      { date: '2024-06-01', value: 62000 },
      { date: '2024-07-01', value: 65000 },
      { date: '2024-08-01', value: 68000 },
      { date: '2024-09-01', value: 72000 },
      { date: '2024-10-01', value: 75000 },
    ];

    // Step 5: Build prediction request
    const predictionRequest: PredictionRequest = {
      predictionId: prediction.id,
      title: prediction.title,
      description: prediction.description || '',
      category: prediction.category,
      deadline: prediction.deadline,
      roundNumber: 1,
      metadata: {
        predictionType: 'TIMESERIES',
        historicalData: mockHistoricalData,
        forecastHorizon: 30,
      },
    };

    console.log('\n⚡ Step 4: Executing skills...');

    // Step 6: Execute skills
    const skillResults: any[] = [];

    for (const assignment of agentSkills) {
      const skillData = assignment.agent_skills as any;

      // Transform snake_case database fields to camelCase TypeScript fields
      const skill: Skill = {
        id: skillData.id,
        slug: skillData.slug,
        name: skillData.name,
        description: skillData.description,
        category: skillData.category,
        version: skillData.version,
        author: skillData.author,
        provider: skillData.provider,
        capabilities: skillData.capabilities,
        requiredData: skillData.required_data,
        outputFormat: skillData.output_format,
        implementationType: skillData.implementation_type,
        implementationConfig: skillData.implementation_config,
        subscriptionRequirement: skillData.subscription_requirement,
        isActive: skillData.is_active,
        isBeta: skillData.is_beta,
        createdAt: skillData.created_at,
        updatedAt: skillData.updated_at,
      };

      const skillInput: SkillExecutionInput = {
        agentId: agent.id,
        skillId: skill.id,
        predictionId: prediction.id,
        predictionTitle: prediction.title,
        predictionDescription: prediction.description || '',
        category: prediction.category,
        deadline: prediction.deadline,
        historicalData: mockHistoricalData,
        forecastHorizon: 30,
        confidenceInterval: 0.95,
      };

      console.log(`  Executing skill: ${skill.name}...`);
      const result = await executeSkill(skill, skillInput);

      // Debug: Log result structure
      console.log(`  Result:`, JSON.stringify(result, null, 2));

      skillResults.push({
        skill,
        result,
      });

      if (result.success) {
        console.log(`  ✅ ${skill.name} completed in ${result.executionTimeMs}ms`);
      } else {
        console.log(`  ❌ ${skill.name} failed: ${result.error}`);
      }
    }

    console.log(`\n✅ Executed ${skillResults.length} skills`);

    // Step 7: Format results for display
    const formattedResults = skillResults.map(({ skill, result }) => {
      const forecastData = result.success && result.data?.forecast
        ? result.data.forecast.slice(0, 5) // Show first 5 forecast points
        : null;

      return {
        skillName: skill.name,
        skillSlug: skill.slug,
        success: result.success,
        executionTime: result.executionTimeMs,
        error: result.error,
        forecast: forecastData,
        prediction: result.success && result.data?.prediction,
        trend: result.success && result.data?.trend,
        confidence: result.success && result.data?.confidence,
        supportingEvidence: result.success && result.data?.supportingEvidence,
        statistical_validation: result.success && result.data?.statistical_validation,
        fullResult: result.data, // Include full result for debugging
      };
    });

    console.log('\n✅ Test completed successfully!');

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
      },
      prediction: {
        id: prediction.id,
        title: prediction.title,
        type: prediction.prediction_type,
      },
      skills: formattedResults,
      summary: {
        totalSkills: skillResults.length,
        successfulSkills: skillResults.filter(r => r.result.success).length,
        failedSkills: skillResults.filter(r => !r.result.success).length,
      },
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
