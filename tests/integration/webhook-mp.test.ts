/**
 * Integration tests: webhook de MercadoPago.
 *
 * Usa el handler real exportado desde src/app/api/webhooks/mp/route.ts.
 * No hace calls a Supabase reales — mockea createServiceClient.
 *
 * Verificado contra el route.ts real:
 *   - Body no-JSON → 400 { error: 'invalid_json' }
 *   - Evento no-payment → 200 { skipped: true, reason: 'not_payment' }
 *   - Evento payment sin data.id → 400 { error: 'missing_payment_id' }
 */

import { describe, test, expect, vi } from 'vitest';

// Mockear createServiceClient antes de importar el route
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
  }),
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

// Importar DESPUÉS del mock
const { POST } = await import('@/app/api/webhooks/mp/route');

/**
 * Helper: construir un NextRequest mínimo para el handler.
 */
function makeRequest(body: string, contentType = 'application/json') {
  const { NextRequest } = require('next/server');
  return new NextRequest('http://localhost:3000/api/webhooks/mp', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
}

describe('POST /api/webhooks/mp', () => {

  test('Body no-JSON → 400 con error invalid_json', async () => {
    const req = makeRequest('esto no es json!!!', 'text/plain');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toMatchObject({ error: 'invalid_json' });
  });

  test('Evento tipo "payment.created" (no payment) → 200 skipped', async () => {
    const req = makeRequest(JSON.stringify({ type: 'payment.created', data: { id: '123' } }));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ skipped: true });
  });

  test('Evento tipo distinto de payment → 200 skipped', async () => {
    const req = makeRequest(JSON.stringify({ type: 'merchant_order', data: { id: '456' } }));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
  });

  test('Evento payment sin data.id → 400 missing_payment_id', async () => {
    const req = makeRequest(JSON.stringify({ type: 'payment', data: {} }));
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toMatchObject({ error: 'missing_payment_id' });
  });

  test('Evento payment válido pero sesión no encontrada → 200 skipped session_not_found', async () => {
    // El mock devuelve data: null → session not found → skipped
    const req = makeRequest(JSON.stringify({ type: 'payment', data: { id: '789' } }));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe(true);
    expect(json.reason).toBe('session_not_found');
  });

});
