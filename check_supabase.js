const https = require('https');

const options = {
  hostname: 'hcflszvrefjpfziehvfe.supabase.co',
  path: '/rest/v1/textbook_cache?select=textbook_id,textbook_name,subject_id,file_size,uploaded_at&order=uploaded_at.desc',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2',
    'Authorization': 'Bearer sb_publishable_GCnVu19RLkuUfJ2_eNEklQ_pzjwyxy2'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('=== textbook_cache (total ' + parsed.length + ' records) ===');
      parsed.forEach((t, i) => {
        console.log((i+1) + '. ' + t.textbook_id);
        console.log('   Name: ' + t.textbook_name);
        console.log('   Subject: ' + t.subject_id);
        console.log('   Size: ' + Math.round(t.file_size/1024) + 'KB');
        console.log('   Uploaded: ' + t.uploaded_at);
        console.log('');
      });
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
});
req.on('error', (e) => { console.error(e); });
req.end();
