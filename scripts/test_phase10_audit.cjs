/**
 * Comprehensive Automated Phase 10 Audit & Verification Suite
 * Tests SEO, Performance, Accessibility, and Security.
 */
const http = require('http');

const PORT = 3000;
const HOST = 'localhost';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        ...options,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json,
          });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runPhase10Audit() {
  console.log('=== PHASE 10: SEO, PERFORMANCE, ACCESSIBILITY & SECURITY AUDIT ===\n');
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

  // 1. Security Headers Audit
  console.log('1. Checking HTTP Security & Privacy Headers...');
  const healthRes = await request({ path: '/api/health', method: 'GET' });
  assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff header present');
  assert(healthRes.headers['x-xss-protection'] === '1; mode=block', 'X-XSS-Protection: 1; mode=block header present');
  assert(healthRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy header present');
  assert(!!healthRes.headers['permissions-policy'], 'Permissions-Policy header present');
  assert(!healthRes.headers['x-powered-by'], 'X-Powered-By header is stripped to conceal framework');

  // 2. Sensitive Route Caching Audit
  console.log('\n2. Checking Cache-Control on Protected Administrative Endpoints...');
  const adminRes = await request({ path: '/api/admin/seo', method: 'GET' });
  assert(adminRes.statusCode === 401, 'Unauthorized request to /api/admin/seo is rejected with HTTP 401');
  assert(
    adminRes.headers['cache-control'] && adminRes.headers['cache-control'].includes('no-store'),
    'Admin endpoints enforce Cache-Control: no-store, no-cache'
  );

  // 3. SEO: Dynamic sitemap.xml Audit
  console.log('\n3. Auditing Dynamic XML Sitemap...');
  const sitemapRes = await request({ path: '/sitemap.xml', method: 'GET' });
  assert(sitemapRes.statusCode === 200, 'GET /sitemap.xml responds with HTTP 200 OK');
  assert(
    sitemapRes.headers['content-type'] && sitemapRes.headers['content-type'].includes('application/xml'),
    'Sitemap Content-Type is application/xml'
  );
  assert(sitemapRes.body.includes('<urlset') && sitemapRes.body.includes('/doctors/'), 'Sitemap contains urlset and dynamic doctor routes');
  assert(sitemapRes.body.includes('/services/'), 'Sitemap contains dynamic clinical services routes');
  assert(!sitemapRes.body.includes('/dashboard-admin'), 'Sitemap strictly excludes private /dashboard-admin routes');

  // 4. SEO: Dynamic robots.txt Audit
  console.log('\n4. Auditing Crawl Directives in robots.txt...');
  const robotsRes = await request({ path: '/robots.txt', method: 'GET' });
  assert(robotsRes.statusCode === 200, 'GET /robots.txt responds with HTTP 200 OK');
  assert(robotsRes.body.includes('Disallow: /dashboard-admin/'), 'robots.txt blocks /dashboard-admin/ crawler indexing');
  assert(robotsRes.body.includes('Disallow: /api/admin/'), 'robots.txt blocks /api/admin/ crawler indexing');
  assert(robotsRes.body.includes('Sitemap:'), 'robots.txt references sitemap.xml location');

  // 5. Security: Input Sanitization & XSS Resistance
  console.log('\n5. Testing Server-Side Input Sanitization against XSS payloads...');
  const xssPayload = {
    patientName: 'John <script>alert("xss")</script> Doe',
    patientPhone: '+91 98451 99999',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTimeSlot: '10:00 AM - 12:00 PM',
    message: '<img src=x onerror=alert(1)> Needs blood sugar check',
  };
  const xssRes = await request({ path: '/api/appointments', method: 'POST' }, xssPayload);
  assert(xssRes.statusCode === 201, 'Appointment booking accepts payload and sanitizes');
  assert(!xssRes.body.includes('<script>'), 'Script tags were thoroughly stripped from persisted data');
  assert(!xssRes.body.includes('<img src=x'), 'HTML event injection was sanitized');

  // 6. Security: Anti-Bot Honeypot Suppression
  console.log('\n6. Testing Anti-Bot Honeypot Trap...');
  const botPayload = {
    patientName: 'Spam Bot',
    patientPhone: '1234567890',
    honeypot: 'http://spam-link.ru',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  };
  const botRes = await request({ path: '/api/appointments', method: 'POST' }, botPayload);
  assert(botRes.statusCode === 200 && botRes.json?.message === 'Request received', 'Honeypot trap silently absorbed bot submission');

  // 7. Security: Deduplication of Recent Submissions
  console.log('\n7. Testing Rapid Duplicate Submission Protection...');
  const duplicatePayload = {
    patientName: 'Deduplication Test Patient',
    patientPhone: '+91 91111 22222',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTimeSlot: '10:00 AM - 12:00 PM',
  };
  const firstSub = await request({ path: '/api/appointments', method: 'POST' }, duplicatePayload);
  assert(firstSub.statusCode === 201, 'First submission logs appointment (HTTP 201)');
  const secondSub = await request({ path: '/api/appointments', method: 'POST' }, duplicatePayload);
  assert(
    secondSub.statusCode === 201 && secondSub.json?.isDuplicate === true,
    'Subsequent duplicate submission correctly detected and flagged with isDuplicate = true'
  );

  // 8. Public HTML Accessibility & Meta Tags
  console.log('\n8. Checking Public HTML Shell Accessibility & SEO...');
  const indexRes = await request({ path: '/', method: 'GET' });
  assert(indexRes.statusCode === 200, 'Homepage responds with HTTP 200 OK');
  assert(indexRes.body.includes('<title>'), 'HTML shell contains <title> tag');
  assert(indexRes.body.includes('name="description"'), 'HTML shell contains meta description');
  assert(indexRes.body.includes('og:title'), 'HTML shell contains OpenGraph title tag');
  assert(indexRes.body.includes('fonts.googleapis.com'), 'Fonts preconnected for Core Web Vitals (FCP/LCP)');

  console.log('\n======================================================');
  console.log(`PHASE 10 AUDIT COMPLETE: ${passed} OF ${total} TESTS PASSED!`);
  console.log('======================================================');
}

runPhase10Audit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
