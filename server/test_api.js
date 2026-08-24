const axios = require('axios');

async function testBackend() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await axios.get(`${BASE_URL}/health`);
  console.log('Health:', healthRes.data);

  console.log('\n--- 2. Testing Operator Login ---');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'operator@nitc.ac.in',
    password: 'Password123!',
  });
  console.log('Login Success:', loginRes.data.success, 'User:', loginRes.data.data.user.email);
  const token = loginRes.data.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('\n--- 3. Testing Workflows List ---');
  const workflowsRes = await axios.get(`${BASE_URL}/workflows`, { headers: authHeaders });
  console.log(`Retrieved ${workflowsRes.data.data.length} workflows:`);
  workflowsRes.data.data.forEach((w) => console.log(` - [${w._id}] ${w.name} (${w.nodes.length} nodes)`));

  console.log('\n--- 4. Testing AI Workflow Prompt Generation ---');
  const genRes = await axios.post(
    `${BASE_URL}/workflows/generate`,
    { prompt: 'When an urgent student admission grievance is submitted, extract key parameters with AI, send Slack alert to #admissions, append record to Google Sheets, and email student confirmation via Gmail.' },
    { headers: authHeaders }
  );
  console.log('AI Generated Workflow:', genRes.data.data.name);
  console.log(`Generated Nodes: ${genRes.data.data.nodes.length}, Edges: ${genRes.data.data.edges.length}`);

  console.log('\n--- 5. Testing Multi-Agent Execution Run ---');
  const workflowToRun = workflowsRes.data.data[0];
  const execRes = await axios.post(
    `${BASE_URL}/workflows/${workflowToRun._id}/execute`,
    { inputs: { severity: 'CRITICAL', incidentType: 'NETWORK_CORE_SWITCH' } },
    { headers: authHeaders }
  );
  const executionId = execRes.data.data._id;
  console.log(`Triggered Execution ID: ${executionId}, Initial Status: ${execRes.data.data.status}`);

  console.log('\n--- 6. Waiting 2s for 5-Agent Chain to Complete ---');
  await new Promise((r) => setTimeout(r, 2000));

  const timelineRes = await axios.get(`${BASE_URL}/executions/${executionId}/timeline`, { headers: authHeaders });
  console.log(`Execution Final Status: ${timelineRes.data.data.execution.status}`);
  console.log(`Duration: ${timelineRes.data.data.execution.duration}ms`);
  console.log(`Total Agent Events Logged: ${timelineRes.data.data.timeline.length}`);
  console.log('\nAgent Event Log Sample:');
  timelineRes.data.data.timeline.forEach((log) => {
    console.log(` [${log.agent.toUpperCase()} - ${log.level.toUpperCase()}] ${log.message}`);
  });

  console.log('\n--- 7. Testing Integrations Status ---');
  const intRes = await axios.get(`${BASE_URL}/integrations`, { headers: authHeaders });
  console.log(`Integrations count: ${intRes.data.data.length}`);

  console.log('\n✅ ALL BACKEND MULTI-AGENT API TESTS PASSED SUCCESSFULLY!');
}

testBackend().catch((err) => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
