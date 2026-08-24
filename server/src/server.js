const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initExecutionQueue } = require('./queues/executionQueue');
const orchestrator = require('./agents/orchestrator');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const User = require('./models/User');
const Workflow = require('./models/Workflow');

const app = express();
const httpServer = http.createServer(app);

// 1. Core Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 2. Health & Heartbeat Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Agentflow_AI',
    institution: 'NIT CALICUT',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    langGraphStatus: orchestrator.langGraphStatus,
    environment: env.NODE_ENV,
  });
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 4. Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Helper function to seed initial demo operator and default NIT Calicut workflows
const seedInitialData = async () => {
  try {
    const existingUser = await User.findOne({ email: 'operator@nitc.ac.in' });
    let operatorUser = existingUser;

    if (!operatorUser) {
      operatorUser = await User.create({
        name: 'NIT Calicut Admin',
        email: 'operator@nitc.ac.in',
        password: 'Password123!',
        role: 'admin',
        institution: 'NIT CALICUT',
      });
      console.log('[Seed] Created default operator account: operator@nitc.ac.in (Password123!)');
    }

    const workflowCount = await Workflow.countDocuments({ owner: operatorUser._id });
    if (workflowCount === 0) {
      await Workflow.create([
        {
          name: 'Campus IT Incident Alert & Escalation',
          description: 'Monitors server health alerts, classifies severity using AI, notifies Discord/Slack, and logs records to Google Sheets.',
          owner: operatorUser._id,
          status: 'active',
          triggerConfig: { type: 'webhook', webhookPath: '/webhook/campus-alerts' },
          version: 1,
          tags: ['incident-response', 'nit-calicut', 'it-ops'],
          nodes: [
            {
              id: 'node-1',
              type: 'trigger',
              position: { x: 80, y: 150 },
              data: { label: 'Incident Webhook Trigger', action: 'webhook', config: {} },
            },
            {
              id: 'node-2',
              type: 'ai_action',
              position: { x: 340, y: 150 },
              data: {
                label: 'AI Incident Classifier',
                action: 'classify_intent',
                config: { requiredFields: ['intent', 'priority'] },
              },
            },
            {
              id: 'node-3',
              type: 'slack',
              position: { x: 600, y: 150 },
              data: {
                label: 'Slack Duty Alert',
                action: 'post_message',
                config: { channel: '#it-duty-escalation', message: 'Alert classified with priority {{priority}}.' },
              },
            },
            {
              id: 'node-4',
              type: 'google_sheets',
              position: { x: 860, y: 150 },
              data: {
                label: 'Google Sheets Audit Log',
                action: 'append_row',
                config: { spreadsheetId: 'nitc_it_incidents', values: ['{{timestamp}}', '{{priority}}', 'RESOLVED'] },
              },
            },
          ],
          edges: [
            { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
            { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
            { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true },
          ],
        },
        {
          name: 'Student Grievance & Service Dispatcher',
          description: 'Processes student requests, performs summarization with AI, logs to spreadsheets and sends confirmation emails.',
          owner: operatorUser._id,
          status: 'active',
          triggerConfig: { type: 'manual' },
          version: 1,
          tags: ['students', 'academics', 'nit-calicut'],
          nodes: [
            {
              id: 'node-1',
              type: 'trigger',
              position: { x: 80, y: 150 },
              data: { label: 'Manual Student Submission', action: 'manual', config: {} },
            },
            {
              id: 'node-2',
              type: 'ai_action',
              position: { x: 340, y: 150 },
              data: {
                label: 'AI Request Summarizer',
                action: 'summarize_text',
                config: { requiredFields: ['summary', 'priority'] },
              },
            },
            {
              id: 'node-3',
              type: 'gmail',
              position: { x: 600, y: 150 },
              data: {
                label: 'Student Dispatch Confirmation',
                action: 'send_email',
                config: { to: 'student@nitc.ac.in', subject: 'Your Request is being Processed - NIT Calicut' },
              },
            },
          ],
          edges: [
            { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
            { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
          ],
        },
      ]);
      console.log('[Seed] Seeded default NIT Calicut starter workflows.');
    }
  } catch (seedErr) {
    console.warn('[Seed Error]', seedErr.message);
  }
};

// 5. Bootstrap Server
const startServer = async () => {
  try {
    await connectDB();
    initSocket(httpServer);
    initExecutionQueue(async (job) => {
      if (job.data?.executionId) {
        await orchestrator.runExecution(job.data.executionId);
      }
    });

    await seedInitialData();

    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Server Error] Port ${env.PORT} is already in use by another process. Please free port ${env.PORT} or configure PORT in .env`);
      } else {
        console.error('[Server Error]', err.message);
      }
      process.exit(1);
    });

    httpServer.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(` 🚀 Agentflow_AI Backend Server Running`);
      console.log(` 🏛️ Institution: NIT CALICUT`);
      console.log(` 🌐 URL: http://localhost:${env.PORT}`);
      console.log(` 🔗 Client: ${env.CLIENT_URL}`);
      console.log(` ⚡ LangGraph Substrate: ${orchestrator.langGraphStatus}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal server bootstrap error:', error);
    process.exit(1);
  }
};

startServer();

