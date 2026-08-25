import { readFile } from 'node:fs/promises';

const evaluationUrl = process.env.EVALUATION_URL;
if (!evaluationUrl) {
  console.error('Set EVALUATION_URL to the deployed /api/v1/chat endpoint.');
  process.exit(1);
}

const cases = JSON.parse(
  await readFile(new URL('../evals/chat-cases.json', import.meta.url), 'utf8'),
);

function event(block) {
  const name = block
    .split('\n')
    .find((line) => line.startsWith('event: '))
    ?.slice(7);
  const data = block
    .split('\n')
    .find((line) => line.startsWith('data: '))
    ?.slice(6);
  if (!name || !data) return null;
  try {
    return { data: JSON.parse(data), name };
  } catch {
    return null;
  }
}

async function evaluate(testCase) {
  const startedAt = performance.now();
  const response = await fetch(evaluationUrl, {
    body: JSON.stringify({ message: testCase.prompt }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const latencyMs = Math.round(performance.now() - startedAt);
  const body = await response.text();
  const events = body.split('\n\n').map(event);
  const answer = events.find((item) => item?.name === 'answer')?.data?.answer;
  const error = events.find((item) => item?.name === 'error')?.data?.error;
  return {
    category: testCase.category,
    id: testCase.id,
    latencyMs,
    maxCompletionTokens: 400,
    responseStatus: response.status,
    review: {
      forbiddenSignals: testCase.forbiddenSignals,
      requiredSignals: testCase.requiredSignals,
    },
    text: typeof answer === 'string' ? answer : (error ?? 'No answer event.'),
    withinLatencyTarget: latencyMs <= testCase.maxLatencyMs,
  };
}

const results = [];
for (const testCase of cases) {
  results.push(await evaluate(testCase));
}
console.log(
  JSON.stringify(
    { cases: results, generatedAt: new Date().toISOString() },
    null,
    2,
  ),
);
