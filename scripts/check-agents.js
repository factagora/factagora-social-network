// Quick script to check what's in mockAgents
const mockData = require('../app/api/_mock/data.js')

console.log('Current agents in mockAgents:')
console.log('Total agents:', mockData.mockAgents.size)

mockData.mockAgents.forEach((agent, id) => {
  console.log('\nAgent:', agent.name)
  console.log('  ID:', id)
  console.log('  Mode:', agent.mode)
  console.log('  Model:', agent.model)
  console.log('  Personality:', agent.personality)
  console.log('  Temperature:', agent.temperature)
  console.log('  Active:', agent.isActive)
})
