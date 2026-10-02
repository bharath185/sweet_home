const crypto = require('crypto');

// Simulated and extracted core logic from paymentStore and authGuard for standalone verification
const processedWebhookEventIds = new Set();
const usersMap = new Map();

function setUserPaymentStatus(update) {
  const record = {
    id: update.userId,
    email: update.email,
    role: update.role || 'DESIGNER',
    payment_status: update.payment_status,
    plan: update.plan || null,
    expires_at: update.expires_at || null,
    cashfree_order_id: update.cashfree_order_id || null,
    cashfree_payment_id: update.cashfree_payment_id || null,
  };
  usersMap.set(update.userId, record);
  usersMap.set(update.email, record);
  return record;
}

function getUserPaymentStatus(userId, email) {
  if (userId && usersMap.has(userId)) return usersMap.get(userId);
  if (email && usersMap.has(email)) return usersMap.get(email);
  return null;
}

function verifyCashfreeWebhookSignature(rawBody, timestamp, signature, secretKey) {
  if (!signature || !timestamp || !secretKey) return false;
  try {
    const payload = `${timestamp}${rawBody}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const expectedBase64 = hmac.digest('base64');
    const expectedHex = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const base64Buffer = Buffer.from(expectedBase64);
    const hexBuffer = Buffer.from(expectedHex);

    if (sigBuffer.length === base64Buffer.length && crypto.timingSafeEqual(sigBuffer, base64Buffer)) {
      return true;
    }
    if (sigBuffer.length === hexBuffer.length && crypto.timingSafeEqual(sigBuffer, hexBuffer)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function isWebhookProcessed(eventId) {
  return processedWebhookEventIds.has(eventId);
}

function markWebhookProcessed(eventId) {
  processedWebhookEventIds.add(eventId);
}

function checkUserAccess({ headers = {} }) {
  const roleHeader = (headers['x-user-role'] || '').toUpperCase();
  if (roleHeader === 'ADMIN') {
    return { allowed: true, status: 200 };
  }

  const userId = headers['x-user-id'];
  const userEmail = headers['x-user-email'];

  if (userId || userEmail) {
    const record = getUserPaymentStatus(userId, userEmail);
    if (record) {
      if (record.role === 'ADMIN') return { allowed: true, status: 200 };
      if (record.payment_status === 'paid') {
        if (!record.expires_at) return { allowed: true, status: 200 };
        const expTime = new Date(record.expires_at).getTime();
        if (Date.now() < expTime) return { allowed: true, status: 200 };
      }
      return { allowed: false, status: 402, reason: 'Payment required' };
    }
  }

  return { allowed: false, status: 402, reason: 'Payment required' };
}

const TEST_SECRET = process.env.CASHFREE_SECRET_KEY || 'mock_local_secret_key_for_testing_only';

console.log('====================================================');
console.log('   SWEETHOME CASHFREE ACCESS RESTRICTIONS TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

// TEST 1: Unpaid blocked
setUserPaymentStatus({
  userId: 'unpaid_designer_1',
  email: 'unpaid@design.com',
  role: 'DESIGNER',
  payment_status: 'unpaid',
});
const res1 = checkUserAccess({ headers: { 'x-user-id': 'unpaid_designer_1' } });
assert(res1.allowed === false && res1.status === 402, 'Unpaid user access is blocked with HTTP 402');

// TEST 2a: Paid allowed
const futureExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
setUserPaymentStatus({
  userId: 'paid_user_1',
  email: 'paid@design.com',
  role: 'DESIGNER',
  payment_status: 'paid',
  plan: 'monthly',
  expires_at: futureExpiry,
});
const res2a = checkUserAccess({ headers: { 'x-user-id': 'paid_user_1' } });
assert(res2a.allowed === true && res2a.status === 200, 'Paid user with active subscription is granted access (HTTP 200)');

// TEST 2b: Admin allowed
const res2b = checkUserAccess({ headers: { 'x-user-role': 'ADMIN' } });
assert(res2b.allowed === true && res2b.status === 200, 'Admin role bypasses subscription check (HTTP 200)');

// TEST 3: Invalid webhook signature rejected
const payload = JSON.stringify({
  data: {
    order: { order_id: 'cf_ord_99', order_amount: 999 },
    payment: { cf_payment_id: 'cf_pay_99', payment_status: 'SUCCESS' },
  },
  type: 'PAYMENT_SUCCESS_WEBHOOK',
});
const timestamp = String(Math.floor(Date.now() / 1000));
const tamperedSig = 'invalid_tampered_sig_xxx==';
const isRejected = verifyCashfreeWebhookSignature(payload, timestamp, tamperedSig, TEST_SECRET);
assert(isRejected === false, 'Invalid Cashfree webhook signature is strictly rejected (returns false)');

// Valid signature accepted
const validSig = crypto.createHmac('sha256', TEST_SECRET).update(`${timestamp}${payload}`).digest('base64');
const isAccepted = verifyCashfreeWebhookSignature(payload, timestamp, validSig, TEST_SECRET);
assert(isAccepted === true, 'Legitimate HMAC-SHA256 signature is accepted (returns true)');

// TEST 4: Duplicate webhook handled idempotently
const eventId = 'cf_webhook_evt_12345';
assert(isWebhookProcessed(eventId) === false, 'Fresh webhook event is detected as unprocessed');
markWebhookProcessed(eventId);
assert(isWebhookProcessed(eventId) === true, 'Duplicate webhook event is detected idempotently');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
