class KeyedMutex {
  constructor() {
    this.queues = new Map();
  }

  async acquire(key) {
    if (!this.queues.has(key)) {
      this.queues.set(key, []);
      return;
    }
    await new Promise((resolve) => this.queues.get(key).push(resolve));
  }

  release(key) {
    const queue = this.queues.get(key);
    if (!queue) return;
    const next = queue.shift();
    if (next) next();
    else this.queues.delete(key);
  }

  async runExclusive(key, fn) {
    await this.acquire(key);
    try {
      return await fn();
    } finally {
      this.release(key);
    }
  }
}

module.exports = { KeyedMutex };
