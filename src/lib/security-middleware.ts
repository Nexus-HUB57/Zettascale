/**
 * @fileOverview Security Middleware for Nexus API
 * Implements WAF, rate limiting, request validation, and logging.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityContext {
  requestId: string;
  clientIp: string;
  timestamp: number;
  endpoint: string;
  authenticated: boolean;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * WAF middleware: detects and blocks suspicious requests
 */
export async function wafMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Block suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/, // XSS
    /union.*select/i, // SQL injection
    /drop.*table/i,
    /exec\(/i,
    /eval\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(path) || pattern.test(JSON.stringify(await request.text()))) {
      console.warn(`[WAF] Blocked suspicious request: ${path}`);
      return NextResponse.json(
        { error: 'Request blocked by security policy' },
        { status: 403 }
      );
    }
  }

  return null;
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(
  clientId: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const key = clientId;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Create security context for request logging
 */
export function createSecurityContext(
  request: NextRequest,
  endpoint: string,
  authenticated = false
): SecurityContext {
  const clientIp =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return {
    requestId: `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    clientIp,
    timestamp: Date.now(),
    endpoint,
    authenticated,
  };
}

/**
 * Validate request signature (for authenticated endpoints)
 */
export function validateRequestSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  context: SecurityContext,
  eventType: string,
  details: any
): Promise<void> {
  const logEntry = {
    requestId: context.requestId,
    clientIp: context.clientIp,
    timestamp: context.timestamp,
    endpoint: context.endpoint,
    eventType,
    details,
    environment: process.env.NODE_ENV,
  };

  // Log to console in development, to centralized logger in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry or similar
    console.log('[SECURITY_EVENT]', JSON.stringify(logEntry));
  } else {
    console.log('[SECURITY_EVENT_DEV]', logEntry);
  }
}
