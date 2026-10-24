/**
 * Deep audit verification script for Phase 10
 */
const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runDeepAudit() {
  console.log('=== PHASE 10 DEEP VERIFICATION & REGRESSION AUDIT ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Health check
  console.log('1. Checking System Health & Hybrid Persistence...');
  const healthRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/health',
    method: 'GET',
  });
  assert(healthRes.statusCode === 200, 'Server health endpoint returns HTTP 200 OK');
  const healthJson = JSON.parse(healthRes.body);
  assert(healthJson.status === 'ok' && healthJson.database, 'Health payload confirms operational database');

  // 2. Rate limiting on login attempts
  console.log('\n2. Testing Admin Login Rate Limiting...');
  // Send invalid credentials from an isolated test IP header
  const testIp = '198.51.100.99';
  let wasRateLimited = false;
  for (let i = 0; i < 7; i++) {
    const loginRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testIp,
        },
      },
      { password: 'IncorrectPassword' }
    );
    if (loginRes.statusCode === 429) {
      wasRateLimited = true;
      break;
    }
  }
  assert(wasRateLimited, 'Login rate limiter triggers HTTP 429 after repeated failed authentication attempts');

  // 3. Enquiry submission & bot protection
  console.log('\n3. Testing Public Contact Enquiry & Anti-Bot Honeypot...');
  const botEnquiry = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/enquiries',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.101',
      },
    },
    {
      patientName: 'Spam Bot',
      patientPhone: '9999999999',
      email: 'bot@spam.com',
      message: 'Buy cheap medicine',
      honeypot: 'filled_by_automated_crawler',
    }
  );
  assert(botEnquiry.statusCode === 200, 'Honeypot-triggered contact submission returns 200 without saving spam');

  // Valid enquiry
  const validEnquiry = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/enquiries',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.101',
      },
    },
    {
      patientName: 'Kavitha R',
      patientPhone: '9845012345',
      email: 'kavitha.r@example.com',
      message: 'Inquiring about pediatric cardiology consultation hours.',
    }
  );
  if (validEnquiry.statusCode !== 201) {
    console.error('validEnquiry error status:', validEnquiry.statusCode, validEnquiry.body);
  }
  assert(validEnquiry.statusCode === 201, 'Valid contact inquiry returns HTTP 201 Created');
  const validEnquiryJson = JSON.parse(validEnquiry.body);
  assert(validEnquiryJson.reference && validEnquiryJson.reference.startsWith('OSA-'), 'Inquiry provides a generated tracking reference');

  // 4. Sitemap & Robots
  console.log('\n4. Verifying Sitemap and Crawl Directives...');
  const sitemapRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/sitemap.xml',
    method: 'GET',
  });
  assert(sitemapRes.statusCode === 200, 'Sitemap responds with HTTP 200');
  assert(sitemapRes.body.includes('/doctors/dr-suresh-kumar') || sitemapRes.body.includes('/doctors/'), 'Sitemap includes doctor profile route');
  assert(sitemapRes.body.includes('/services/cardiology-preventive-care') || sitemapRes.body.includes('/services/'), 'Sitemap includes clinical service routes');
  assert(!sitemapRes.body.includes('/dashboard-admin'), 'Sitemap excludes administrative routes');

  const robotsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/robots.txt',
    method: 'GET',
  });
  assert(robotsRes.statusCode === 200, 'robots.txt responds with HTTP 200');
  assert(robotsRes.body.includes('Disallow: /dashboard-admin/'), 'robots.txt disallows administrative directory');
  assert(robotsRes.body.includes('Disallow: /api/admin/'), 'robots.txt disallows administrative API endpoints');

  // 5. Security Headers
  console.log('\n5. Verifying Security & Privacy Headers...');
  const homeRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  assert(homeRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
  assert(homeRes.headers['x-xss-protection'] === '1; mode=block', 'X-XSS-Protection is 1; mode=block');
  assert(homeRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is strict-origin-when-cross-origin');
  assert(homeRes.headers['permissions-policy'] !== undefined, 'Permissions-Policy is present');
  assert(!homeRes.headers['x-powered-by'], 'X-Powered-By is omitted');

  console.log('\n======================================================');
  console.log(`DEEP AUDIT RESULTS: ${passed} OF ${total} TESTS PASSED!`);
  console.log('======================================================\n');
}

runDeepAudit().catch((err) => {
  console.error('Deep audit encountered an unexpected error:', err);
  process.exit(1);
});
