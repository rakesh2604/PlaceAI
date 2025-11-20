import request from 'supertest';
import { TEST_CONFIG } from '../config/test-config.js';

/**
 * API Client for making authenticated requests
 */
export class APIClient {
  constructor(baseURL, app = null) {
    this.baseURL = baseURL;
    this.app = app;
    this.token = null;
    this.user = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    return this;
  }

  /**
   * Set user info
   */
  setUser(user) {
    this.user = user;
    return this;
  }

  /**
   * Make authenticated request
   */
  async request(method, path, options = {}) {
    const { body, headers = {}, files = [] } = options;
    
    let req;
    if (this.app) {
      // Use supertest with app
      req = this.app[method.toLowerCase()](path);
    } else {
      // Use supertest with URL
      req = request(this.baseURL)[method.toLowerCase()](path);
    }

    // Add auth header
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }

    // Add custom headers
    Object.entries(headers).forEach(([key, value]) => {
      req.set(key, value);
    });

    // Handle file uploads
    if (files.length > 0) {
      files.forEach(file => {
        req.attach(file.field, file.buffer, file.filename);
      });
    }

    // Add body
    if (body) {
      req.send(body);
    }

    return req;
  }

  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, options = {}) {
    return this.request('POST', path, options);
  }

  async put(path, options = {}) {
    return this.request('PUT', path, options);
  }

  async patch(path, options = {}) {
    return this.request('PATCH', path, options);
  }

  async delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }

  /**
   * Authenticate and get token
   */
  async authenticate(email, password = null) {
    // For OTP-based auth, we need to send OTP first
    const otpResponse = await this.post('/auth/send-otp', {
      body: { email }
    });

    if (otpResponse.status !== 200) {
      throw new Error('Failed to send OTP');
    }

    // In development, OTP is returned in response
    const otp = otpResponse.body.otp || '123456'; // Fallback for testing

    const verifyResponse = await this.post('/auth/verify-otp', {
      body: {
        email,
        otp,
        isSignup: false
      }
    });

    if (verifyResponse.status !== 200) {
      throw new Error('Failed to verify OTP');
    }

    this.token = verifyResponse.body.token;
    this.user = verifyResponse.body.user;
    return { token: this.token, user: this.user };
  }
}

