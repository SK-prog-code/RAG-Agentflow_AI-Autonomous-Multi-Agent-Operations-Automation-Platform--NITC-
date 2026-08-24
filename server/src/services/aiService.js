const axios = require('axios');
const env = require('../config/env');

class AIService {
  /**
   * Main method to generate a workflow graph from a natural language prompt
   */
  async generateWorkflowFromPrompt(prompt, userPreferences = {}) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required for workflow generation');
    }

    const trimmedPrompt = prompt.trim();

    // 1. Try OpenRouter if API key is provided
    if (env.OPENROUTER_API_KEY) {
      try {
        console.log('[AI Service] Attempting workflow generation via OpenRouter...');
        const result = await this.generateViaOpenRouter(trimmedPrompt);
        if (result) return { ...result, source: 'openrouter' };
      } catch (err) {
        console.warn('[AI Service] OpenRouter generation failed, trying fallback:', err.message);
      }
    }

    // 2. Try Google Gemini if API key is provided
    if (env.GEMINI_API_KEY) {
      try {
        console.log('[AI Service] Attempting workflow generation via Google Gemini...');
        const result = await this.generateViaGemini(trimmedPrompt);
        if (result) return { ...result, source: 'gemini' };
      } catch (err) {
        console.warn('[AI Service] Gemini generation failed, trying deterministic fallback:', err.message);
      }
    }

    // 3. Fallback: Intelligent Deterministic Rule-Based Workflow Generator
    console.log('[AI Service] Using Intelligent Deterministic Rule Engine for workflow generation.');
    return {
      ...this.generateDeterministicWorkflow(trimmedPrompt),
      source: 'deterministic-rule-engine',
    };
  }

  async generateViaOpenRouter(prompt) {
    const systemPrompt = this.getSystemPrompt();
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nitc.ac.in',
          'X-Title': 'NIT Calicut Agentflow AI',
        },
        timeout: 20000,
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  async generateViaGemini(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const systemPrompt = this.getSystemPrompt();
    const result = await model.generateContent(`${systemPrompt}\n\nUSER PROMPT: ${prompt}`);
    const text = result.response.text();
    return JSON.parse(text);
  }

  getSystemPrompt() {
    return `You are an expert AI workflow architect for Agentflow_AI at NIT Calicut.
Convert the user's plain English automation description into an executable visual workflow JSON.

Output MUST be valid JSON with this exact structure:
{
  "name": "Concise workflow title",
  "description": "Clear explanation of what the automation achieves",
  "tags": ["category1", "category2"],
  "triggerConfig": {
    "type": "manual" | "webhook" | "schedule" | "event",
    "cronExpression": "0 9 * * *" (if schedule),
    "webhookPath": "/webhook/incoming" (if webhook),
    "parameters": {}
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger" | "ai_action" | "gmail" | "slack" | "discord" | "google_sheets" | "condition",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Display Label",
        "action": "action_name (e.g. send_email, post_message, append_row, prompt_completion)",
        "config": { ...key-value parameters required for the node }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "node-1",
      "target": "node-2",
      "animated": true
    }
  ]
}

Available Node Types & Actions:
1. trigger: manual, webhook, schedule, event
2. ai_action: summarize_text, extract_entities, sentiment_analysis, classify_intent
3. gmail: send_email (to, subject, body), read_emails (query, maxResults)
4. slack: post_message (channel, message), read_channel_messages (channel)
5. discord: post_message (channelId, content), send_embed (title, description)
6. google_sheets: append_row (spreadsheetId, range, values), read_range (spreadsheetId, range)
7. condition: evaluate (conditionExpression, trueTarget, falseTarget)`;
  }

  /**
   * Deterministic Rule Engine for instantaneous, zero-cost, offline graph generation
   */
  generateDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();
    let name = 'Automated Operations Pipeline';
    let description = 'Automated agentic workflow generated by Agentflow_AI rule engine for NIT Calicut.';
    let tags = ['automation', 'nit-calicut'];
    let triggerType = 'manual';
    let triggerConfig = { type: 'manual', parameters: {} };

    const nodes = [];
    const edges = [];

    // Base Trigger Node
    if (p.includes('schedule') || p.includes('daily') || p.includes('hourly') || p.includes('every')) {
      triggerType = 'schedule';
      triggerConfig = { type: 'schedule', cronExpression: '0 9 * * *', parameters: { timezone: 'Asia/Kolkata' } };
    } else if (p.includes('webhook') || p.includes('api') || p.includes('payload')) {
      triggerType = 'webhook';
      triggerConfig = { type: 'webhook', webhookPath: '/webhook/v1/trigger', parameters: {} };
    }

    nodes.push({
      id: 'node-1',
      type: 'trigger',
      position: { x: 100, y: 200 },
      data: {
        label: triggerType === 'schedule' ? 'Daily Schedule Trigger' : triggerType === 'webhook' ? 'Incoming Webhook Trigger' : 'Manual Trigger',
        action: triggerType,
        config: triggerConfig,
      },
    });

    let currentX = 380;
    let nodeIndex = 2;

    // Check for AI processing
    if (p.includes('summar') || p.includes('extract') || p.includes('ai') || p.includes('analyze') || p.includes('classify') || p.includes('filter')) {
      nodes.push({
        id: `node-${nodeIndex}`,
        type: 'ai_action',
        position: { x: currentX, y: 200 },
        data: {
          label: 'AI Reasoning & Extraction Agent',
          action: p.includes('summar') ? 'summarize_text' : p.includes('classify') ? 'classify_intent' : 'extract_entities',
          config: {
            model: 'agentflow-core-v2',
            promptTemplate: 'Analyze input payload from previous step and extract actionable metrics and summary.',
            requiredFields: ['summary', 'sentiment', 'priority'],
          },
        },
      });
      edges.push({
        id: `edge-${nodeIndex - 1}-${nodeIndex}`,
        source: `node-${nodeIndex - 1}`,
        target: `node-${nodeIndex}`,
        animated: true,
      });
      currentX += 280;
      nodeIndex++;
    }

    // Check for Google Sheets
    if (p.includes('sheet') || p.includes('excel') || p.includes('spreadsheet') || p.includes('row') || p.includes('record')) {
      nodes.push({
        id: `node-${nodeIndex}`,
        type: 'google_sheets',
        position: { x: currentX, y: 200 },
        data: {
          label: 'Google Sheets Append',
          action: 'append_row',
          config: {
            spreadsheetId: 'nitc_operations_audit_log',
            range: 'Sheet1!A:E',
            values: ['{{timestamp}}', '{{node-1.source}}', '{{summary}}', '{{priority}}', 'COMPLETED'],
          },
        },
      });
      edges.push({
        id: `edge-${nodeIndex - 1}-${nodeIndex}`,
        source: `node-${nodeIndex - 1}`,
        target: `node-${nodeIndex}`,
        animated: true,
      });
      currentX += 280;
      nodeIndex++;
      tags.push('google-sheets');
    }

    // Check for Slack or Discord notifications
    if (p.includes('slack') || (!p.includes('discord') && (p.includes('notify') || p.includes('alert') || p.includes('message')))) {
      nodes.push({
        id: `node-${nodeIndex}`,
        type: 'slack',
        position: { x: currentX, y: 200 },
        data: {
          label: 'Slack Notification',
          action: 'post_message',
          config: {
            channel: '#nitc-ops-alerts',
            message: 'Automated notification: Pipeline step processed with priority {{priority}}.',
          },
        },
      });
      edges.push({
        id: `edge-${nodeIndex - 1}-${nodeIndex}`,
        source: `node-${nodeIndex - 1}`,
        target: `node-${nodeIndex}`,
        animated: true,
      });
      currentX += 280;
      nodeIndex++;
      tags.push('slack');
    } else if (p.includes('discord')) {
      nodes.push({
        id: `node-${nodeIndex}`,
        type: 'discord',
        position: { x: currentX, y: 200 },
        data: {
          label: 'Discord Channel Alert',
          action: 'post_message',
          config: {
            channelId: 'operations-desk',
            content: 'Agentic workflow completed execution successfully.',
          },
        },
      });
      edges.push({
        id: `edge-${nodeIndex - 1}-${nodeIndex}`,
        source: `node-${nodeIndex - 1}`,
        target: `node-${nodeIndex}`,
        animated: true,
      });
      currentX += 280;
      nodeIndex++;
      tags.push('discord');
    }

    // Check for Gmail / Email
    if (p.includes('email') || p.includes('mail') || p.includes('gmail') || p.includes('invoice') || nodes.length === 1) {
      nodes.push({
        id: `node-${nodeIndex}`,
        type: 'gmail',
        position: { x: currentX, y: 200 },
        data: {
          label: 'Gmail Dispatcher',
          action: 'send_email',
          config: {
            to: 'admin@nitc.ac.in',
            subject: 'Automated Operations Notification - NIT Calicut',
            body: 'Workflow pipeline execution completed with full agentic verification.',
          },
        },
      });
      edges.push({
        id: `edge-${nodeIndex - 1}-${nodeIndex}`,
        source: `node-${nodeIndex - 1}`,
        target: `node-${nodeIndex}`,
        animated: true,
      });
      tags.push('gmail');
    }

    // Adjust title and summary based on keywords
    if (p.includes('invoice')) {
      name = 'Invoice Processing & Approval Workflow';
      description = 'Extracts invoice metadata, appends line items to Google Sheets, and dispatches email approval notification.';
      tags.push('finance', 'invoicing');
    } else if (p.includes('student') || p.includes('admission') || p.includes('grade')) {
      name = 'NIT Calicut Student Service Automation';
      description = 'Processes student academic queries, logs records in Google Sheets, and alerts staff on Slack.';
      tags.push('academics', 'nit-calicut');
    } else if (p.includes('incident') || p.includes('alert') || p.includes('server')) {
      name = 'Incident Response & Escalation Engine';
      description = 'Captures incident webhooks, analyzes severity with AI, routes notifications to Slack and logs audit rows.';
      tags.push('incident-response', 'devops');
    } else {
      name = prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
      description = `AI-orchestrated workflow designed for: "${prompt}"`;
    }

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description,
      tags,
      triggerConfig,
      nodes,
      edges,
    };
  }
}

module.exports = new AIService();
