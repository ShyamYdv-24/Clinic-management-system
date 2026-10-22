const http = require('http');
const fs = require('fs');

async function main() {
  console.log('=== PHASE 8 MEDIA LIBRARY VERIFICATION SUITE ===\n');

  // Helper for HTTP requests
  function request(options, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json;
          try {
            json = JSON.parse(body);
          } catch (e) {
            json = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      });
      req.on('error', reject);
      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  // Helper for multipart/form-data upload
  function uploadFile(path, token, fieldName, filename, mimeType, buffer, extraFields = {}) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let postData = '';

    for (const [key, val] of Object.entries(extraFields)) {
      postData += `--${boundary}\r\n`;
      postData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      postData += `${val}\r\n`;
    }

    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
    postData += `Content-Type: ${mimeType}\r\n\r\n`;

    const header = Buffer.from(postData, 'utf-8');
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const fullBody = Buffer.concat([header, buffer, footer]);

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBody.length,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['Cookie'] = `adminToken=${token}`;
    }

    return request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers,
      },
      fullBody
    );
  }

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Unauthorized upload rejection
  console.log('1. Testing unauthorized upload rejection...');
  const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const unauthRes = await uploadFile('/api/admin/media/upload', null, 'file', 'test.png', 'image/png', fakePng);
  assert(unauthRes.status === 401, 'Unauthorized upload is rejected with HTTP 401');

  // 2. Admin Authentication
  console.log('\n2. Authenticating as administrator...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({ password: 'OmSaiClinic@2026' })
  );
  assert(loginRes.status === 200 && loginRes.body.success, 'Admin login succeeded');
  const token = loginRes.body.token;

  // 3. Storage Status Check
  console.log('\n3. Testing storage status endpoint...');
  const statusRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/media/status',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(statusRes.status === 200 && statusRes.body.success, 'Media status endpoint responds successfully');
  console.log(`   Storage Provider: ${statusRes.body.provider} (Configured: ${statusRes.body.isConfigured})`);
  console.log(`   Status Message: ${statusRes.body.message}`);

  // 4. List Media Assets
  console.log('\n4. Testing media library listing and filtering...');
  const listRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/media',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(listRes.status === 200 && Array.isArray(listRes.body.data), 'Listed media assets array returned');
  console.log(`   Found ${listRes.body.data.length} existing media asset(s).`);

  // 5. Test Spoofed File Upload (Magic Byte content inspection)
  console.log('\n5. Testing strict magic-byte file signature validation...');
  const fakeTextAsJpg = Buffer.from('This is a plain text file pretending to be an image.php', 'utf-8');
  const spoofRes = await uploadFile(
    '/api/admin/media/upload',
    token,
    'file',
    'trojan_avatar.jpg',
    'image/jpeg',
    fakeTextAsJpg,
    { title: 'Fake Image Test' }
  );
  assert(
    spoofRes.status === 400 && spoofRes.body.success === false,
    'Server rejects spoofed file with non-image magic bytes'
  );
  console.log(`   Server correctly responded with: "${spoofRes.body.error}"`);

  // 6. Test Valid PNG Upload
  console.log('\n6. Testing valid image upload...');
  // A minimal valid 1x1 PNG binary
  const valid1x1Png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const uploadRes = await uploadFile(
    '/api/admin/media/upload',
    token,
    'file',
    'om_sai_logo_test.png',
    'image/png',
    valid1x1Png,
    {
      title: 'Om Sai Test Logo',
      category: 'logos',
      altText: 'Om Sai Adarsha Clinic Logo Test Asset',
      tags: 'logo,brand,test',
    }
  );
  assert(uploadRes.status === 201 && uploadRes.body.success, 'Valid image uploaded successfully (HTTP 201)');
  const uploadedAsset = uploadRes.body.data;
  console.log(`   Created asset ID: ${uploadedAsset.id}`);
  console.log(`   Access URL: ${uploadedAsset.url}`);
  console.log(`   Storage Provider: ${uploadRes.body.storageProvider}`);

  // 7. Get Media Asset by ID & Verify Metadata
  console.log('\n7. Testing get media asset by ID...');
  const getAssetRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/media/${uploadedAsset.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(getAssetRes.status === 200 && getAssetRes.body.data.id === uploadedAsset.id, 'Asset retrieved by ID');
  assert(getAssetRes.body.data.usageCount === 0, 'New unreferenced asset has usageCount = 0');

  // 8. Test Media Usage Tracking & Deletion Protection
  console.log('\n8. Testing media relationship tracking and deletion protection...');
  // Create a doctor referencing this new asset
  const doctorSlug = `dr-test-media-${Date.now()}`;
  const createDocRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/doctors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    JSON.stringify({
      name: 'Dr. Media Relationship Test',
      slug: doctorSlug,
      specialty: 'Internal Medicine',
      department: 'General Medicine',
      qualifications: ['MBBS', 'MD - Internal Medicine'],
      experienceYears: 10,
      bio: 'Test doctor profile to verify media relationship protection and automatic URL cascading.',
      languages: ['English', 'Odia'],
      avatarUrl: uploadedAsset.secureUrl || uploadedAsset.url,
      avatarMediaId: uploadedAsset.id,
      consultationFee: 500,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: ['09:00 AM - 01:00 PM'],
      order: 99,
      isAvailable: true,
      isPublished: true,
    })
  );
  if (createDocRes.status !== 201) {
    console.error('Doctor creation error details:', createDocRes.body);
  }
  assert(createDocRes.status === 201 && createDocRes.body.success, 'Doctor created referencing the media asset');
  const createdDoc = createDocRes.body.data;

  // Verify asset usage count is now 1
  const assetWithUsageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/media/${uploadedAsset.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(
    assetWithUsageRes.body.data.usageCount === 1,
    'Asset usage count accurately incremented to 1'
  );
  console.log(`   Active reference found: ${assetWithUsageRes.body.data.usages[0].entityTitle} (${assetWithUsageRes.body.data.usages[0].field})`);

  // Attempt to delete referenced asset without force -> MUST FAIL with 409
  console.log('\n9. Testing deletion blocking for referenced media asset...');
  const blockedDeleteRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/media/${uploadedAsset.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(
    blockedDeleteRes.status === 409 && blockedDeleteRes.body.success === false,
    'Deletion of referenced asset safely blocked with HTTP 409 Conflict'
  );
  console.log(`   Protection message: "${blockedDeleteRes.body.error}"`);

  // 10. Test Media Replacement & Cascade URL Updates
  console.log('\n10. Testing media asset replacement and cascading reference updates...');
  // A minimal valid JPEG binary (FF D8 FF E0 00 10 4A 46 49 46 00 01...)
  const validJpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64'
  );
  const replaceRes = await uploadFile(
    `/api/admin/media/${uploadedAsset.id}/replace`,
    token,
    'file',
    'om_sai_logo_v2.jpg',
    'image/jpeg',
    validJpeg
  );
  assert(replaceRes.status === 200 && replaceRes.body.success, 'Media asset replaced successfully');
  const newUrl = replaceRes.body.data.secureUrl || replaceRes.body.data.url;
  console.log(`   New replacement URL: ${newUrl}`);
  console.log(`   Cascaded updates: ${replaceRes.body.updatedReferences.join(', ')}`);

  // Verify the doctor's avatar was automatically updated to the new URL!
  const doctorCheckRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/doctors/${createdDoc.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(
    doctorCheckRes.body.data.avatarUrl === newUrl,
    'Doctor avatarUrl was automatically updated via cascade to the new URL'
  );

  // 11. Cleanup Test Records
  console.log('\n11. Cleaning up test records and verifying deletion...');
  // Delete test doctor
  const deleteDocRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/doctors/${createdDoc.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(deleteDocRes.status === 200, 'Test doctor deleted successfully');

  // Verify asset usage count returns to 0
  const assetPostDocDelete = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/media/${uploadedAsset.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(assetPostDocDelete.body.data.usageCount === 0, 'Asset usage count returned to 0 after referencing doctor removed');

  // Now delete the unreferenced media asset -> Should succeed!
  const deleteAssetRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/media/${uploadedAsset.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(deleteAssetRes.status === 200 && deleteAssetRes.body.success, 'Unreferenced media asset deleted successfully');

  console.log(`\n======================================================`);
  console.log(`ALL ${totalTests} PHASE 8 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('\nTest failed with error:', err);
  process.exit(1);
});
