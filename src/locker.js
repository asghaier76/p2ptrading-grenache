'use strict';
const Logger = require('./logger');
const logger = new Logger('Lock');

class Locker {
  lockedIds = new Set();

  constructor() {}

  lock(id) {
    this.lockedIds.add(id);
    logger.debug("Locking client", id);
  }

  unlock(id) {
    this.lockedIds.delete(id);
    logger.debug("Unlocking client", id);
  }

  async awaitTillUnlocked() {
    while(this.lockedIds.size !== 0) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
}

module.exports = Locker;