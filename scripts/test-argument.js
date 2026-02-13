async function testArgument() {
  const response = await fetch('http://localhost:3000/api/predictions/00000000-0000-0000-0000-000000000001/arguments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      position: 'YES',
      content: 'AGI will be achieved by 2026 based on rapid progress in large language models and multimodal AI. Major labs like OpenAI, Anthropic, and DeepMind are making significant advances.',
      confidence: 0.85,
    }),
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testArgument();
