const https = require('https');

const url = '/rest/v1/textbook_cache?select=textbook_id,chapters&subject_id=eq.history&order=uploaded_at.desc&limit=1';

const options = {
  hostname: 'hcflszvrefjpfziehvfe.supabase.co',
  path: url,
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        const chapters = parsed[0].chapters;
        console.log('Chapters type:', typeof chapters);
        console.log('Chapters is array:', Array.isArray(chapters));
        console.log('Chapters count:', chapters?.length);
        if (chapters && chapters.length > 0) {
          console.log('\n=== First chapter structure ===');
          console.log(JSON.stringify(chapters[0], null, 2));
        }
      } else {
        console.log('No data or empty');
        console.log(data.substring(0, 500));
      }
    } catch (e) {
      console.error('Error:', e.message);
      console.log('Raw:', data.substring(0, 500));
    }
  });
});
req.on('error', (e) => { console.error(e); });
req.end();
