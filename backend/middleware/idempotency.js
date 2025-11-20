import IdempotencyKey from '../models/IdempotencyKey.js';

/**
 * Idempotency middleware
 * Checks for Idempotency-Key header and ensures requests are idempotent
 * Stores response for duplicate requests within 24 hours
 */
export const idempotencyMiddleware = async (req, res, next) => {
  // Only apply to POST, PUT, PATCH methods
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];
  
  // If no key provided, continue normally
  if (!idempotencyKey) {
    return next();
  }

  try {
    // Check if we've seen this key before
    const existing = await IdempotencyKey.findOne({ key: idempotencyKey });
    
    if (existing) {
      // Return cached response
      const headers = existing.headers || {};
      Object.keys(headers).forEach(key => {
        res.setHeader(key, headers[key]);
      });
      return res.status(existing.statusCode).json(existing.responseBody);
    }

    // Store original methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    let capturedStatusCode = 200;
    let capturedBody = null;
    let responseSent = false;

    // Override res.json to capture response
    res.json = function(body) {
      if (!responseSent) {
        capturedBody = body;
        responseSent = true;
      }
      return originalJson.call(this, body);
    };

    // Override res.status to capture status code
    res.status = function(code) {
      capturedStatusCode = code;
      return originalStatus.call(this, code);
    };

    // Store response after it's sent
    res.on('finish', async () => {
      try {
        // Only cache successful responses (2xx)
        if (capturedStatusCode >= 200 && capturedStatusCode < 300 && capturedBody !== null) {
          const headers = {};
          const headerNames = res.getHeaderNames();
          headerNames.forEach(name => {
            const value = res.getHeader(name);
            if (value) {
              headers[name] = String(value);
            }
          });
          
          await IdempotencyKey.create({
            key: idempotencyKey,
            method: req.method,
            path: req.path,
            statusCode: capturedStatusCode,
            headers: headers,
            responseBody: capturedBody,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          });
        }
      } catch (error) {
        console.error('Error storing idempotency key:', error);
        // Don't fail the request if idempotency storage fails
      }
    });

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    // Continue with request if idempotency check fails
    next();
  }
};

