const EventEmitter = require('events');
const env = require('../config/env');

class MemoryExecutionQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.isProcessing = false;
    this.queue = [];
    console.log('[Queue] Initialized In-Memory Execution Queue Fallback.');
  }

  async add(name, data, opts = {}) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const job = {
      id: jobId,
      name,
      data,
      opts,
      attempts: 0,
      maxAttempts: opts.attempts || 3,
      status: 'waiting',
      timestamp: Date.now(),
    };
    this.jobs.set(jobId, job);
    this.queue.push(job);
    this.processNext();
    return job;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (!job) {
      this.isProcessing = false;
      return;
    }

    try {
      job.status = 'active';
      job.attempts++;
      if (this.workerHandler) {
        await this.workerHandler(job);
      }
      job.status = 'completed';
    } catch (err) {
      console.error(`[Queue] Job ${job.id} failed:`, err.message);
      if (job.attempts < job.maxAttempts) {
        job.status = 'retrying';
        const delay = (job.opts.backoff?.delay || 1000) * Math.pow(2, job.attempts - 1);
        setTimeout(() => {
          this.queue.push(job);
          this.processNext();
        }, delay);
      } else {
        job.status = 'failed';
        job.error = err.message;
      }
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  process(handler) {
    this.workerHandler = handler;
    this.processNext();
  }
}

let queueInstance = null;
let workerInstance = null;

const initExecutionQueue = (processor) => {
  if (env.REDIS_URL) {
    try {
      const { Queue, Worker } = require('bullmq');
      const IORedis = require('ioredis');
      const connection = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: () => null, // don't hang if redis is down
      });

      connection.on('error', (err) => {
        console.warn('[Queue] Redis connection failed. Switched to In-Memory Queue:', err.message);
      });

      queueInstance = new Queue('workflow-executions', { connection });
      workerInstance = new Worker(
        'workflow-executions',
        async (job) => {
          if (processor) await processor(job);
        },
        { connection }
      );
      console.log('[Queue] Connected to Redis BullMQ.');
      return { queue: queueInstance, isRedis: true };
    } catch (err) {
      console.warn('[Queue] Could not initialize BullMQ Redis queue. Using In-Memory fallback.');
    }
  }

  const memoryQueue = new MemoryExecutionQueue();
  if (processor) {
    memoryQueue.process(processor);
  }
  queueInstance = memoryQueue;
  return { queue: memoryQueue, isRedis: false };
};

const getExecutionQueue = () => {
  if (!queueInstance) {
    initExecutionQueue();
  }
  return queueInstance;
};

const enqueueExecution = async (executionId, options = {}) => {
  const q = getExecutionQueue();
  return await q.add('run-workflow', { executionId }, {
    attempts: options.attempts || 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options,
  });
};

module.exports = {
  initExecutionQueue,
  getExecutionQueue,
  enqueueExecution,
};
