/**
 * Dev-mode Network Simulator
 * 
 * Allows simulating network failures, delays, and errors for testing retry logic
 * 
 * Usage:
 *   import { networkSimulator } from './utils/networkSimulator';
 *   
 *   // Enable simulator
 *   networkSimulator.enable();
 *   
 *   // Simulate 50% failure rate
 *   networkSimulator.setFailureRate(0.5);
 *   
 *   // Simulate 2 second delay
 *   networkSimulator.setDelay(2000);
 *   
 *   // Disable simulator
 *   networkSimulator.disable();
 */

class NetworkSimulator {
  constructor() {
    this.enabled = false;
    this.failureRate = 0; // 0-1, probability of failure
    this.delay = 0; // milliseconds
    this.failureType = 'network'; // 'network' | 'timeout' | 'server'
    this.allowedEndpoints = null; // null = all endpoints, or array of endpoint patterns
  }

  enable() {
    this.enabled = true;
    console.log('[NetworkSimulator] Enabled', {
      failureRate: this.failureRate,
      delay: this.delay,
      failureType: this.failureType
    });
  }

  disable() {
    this.enabled = false;
    console.log('[NetworkSimulator] Disabled');
  }

  setFailureRate(rate) {
    this.failureRate = Math.max(0, Math.min(1, rate));
    console.log(`[NetworkSimulator] Failure rate set to ${(this.failureRate * 100).toFixed(0)}%`);
  }

  setDelay(ms) {
    this.delay = Math.max(0, ms);
    console.log(`[NetworkSimulator] Delay set to ${this.delay}ms`);
  }

  setFailureType(type) {
    if (['network', 'timeout', 'server'].includes(type)) {
      this.failureType = type;
      console.log(`[NetworkSimulator] Failure type set to ${type}`);
    }
  }

  setAllowedEndpoints(endpoints) {
    this.allowedEndpoints = endpoints;
    console.log(`[NetworkSimulator] Allowed endpoints:`, endpoints);
  }

  shouldSimulate(url) {
    if (!this.enabled) return false;
    
    // Check if endpoint is allowed
    if (this.allowedEndpoints) {
      const matches = this.allowedEndpoints.some(pattern => {
        if (typeof pattern === 'string') {
          return url.includes(pattern);
        }
        if (pattern instanceof RegExp) {
          return pattern.test(url);
        }
        return false;
      });
      if (!matches) return false;
    }
    
    return true;
  }

  async simulate(config) {
    if (!this.shouldSimulate(config.url || '')) {
      return config;
    }

    // Apply delay
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Check if we should fail
    if (Math.random() < this.failureRate) {
      const error = this.createError(config);
      throw error;
    }

    return config;
  }

  createError(config) {
    const baseError = {
      config,
      message: '',
      code: '',
      response: null
    };

    switch (this.failureType) {
      case 'network':
        return {
          ...baseError,
          message: 'Network Error',
          code: 'ERR_NETWORK',
          isNetworkError: true
        };
      
      case 'timeout':
        return {
          ...baseError,
          message: 'timeout of 10000ms exceeded',
          code: 'ETIMEDOUT',
          isNetworkError: true
        };
      
      case 'server':
        return {
          ...baseError,
          message: 'Request failed with status code 500',
          code: 'ERR_BAD_RESPONSE',
          response: {
            status: 500,
            data: { message: 'Internal Server Error (Simulated)' }
          },
          isNetworkError: false
        };
      
      default:
        return {
          ...baseError,
          message: 'Network Error',
          code: 'ERR_NETWORK',
          isNetworkError: true
        };
    }
  }
}

export const networkSimulator = new NetworkSimulator();

// Expose to window in dev mode for easy testing
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.networkSimulator = networkSimulator;
  console.log('[NetworkSimulator] Available in dev mode: window.networkSimulator');
  console.log('[NetworkSimulator] Example usage:');
  console.log('  window.networkSimulator.enable()');
  console.log('  window.networkSimulator.setFailureRate(0.5)');
  console.log('  window.networkSimulator.setDelay(2000)');
  console.log('  window.networkSimulator.setFailureType("network")');
  console.log('  window.networkSimulator.disable()');
}

