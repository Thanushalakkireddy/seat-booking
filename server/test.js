import axios from 'axios';

const endpoint = 'http://localhost:8060/compiler/checkCodingAnswer';

function createPayload(i) {
  return {
    type: 'run', 
    id: "00262d5f-01e1-4dea-99b8-b5ce82768b6e", 
    language: 71, 
    code: `print('Test ${i}')`,
    inputs: ['input1', 'input2'] 
  };
}

// Send a single request
async function sendRequest(i) {
  try {
    const res = await axios.post(endpoint, createPayload(i));
    console.log(`Request #${i}: ✅ Success`);
    return { success: true };
  } catch (err) {
    console.log(`Request #${i}: ❌ Failed`, err.response?.data || err.message);
    return { success: false };
  }
}

// Run requests in chunks to avoid overload
async function runConcurrentRequests(total = 200, chunkSize = 50) {
  const startTime = Date.now(); // Start timer

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = Array.from(
      { length: Math.min(chunkSize, total - i) },
      (_, j) => sendRequest(i + j)
    );
    const results = await Promise.all(chunk);
    results.forEach(r => {
      if (r.success) successCount++;
      else failCount++;
    });
    console.log(`Progress: ${i + results.length}/${total} requests completed`);
  }

  const endTime = Date.now(); // End timer
  const duration = endTime - startTime; // Total time in ms

  console.log(`\nFinal Summary: Success = ${successCount}, Failed = ${failCount}`);
  console.log(`Total time taken: ${duration} ms (${(duration / 1000).toFixed(2)} seconds)`);
}

// Run 200 requests with 50 at a time
runConcurrentRequests(50, 50);
