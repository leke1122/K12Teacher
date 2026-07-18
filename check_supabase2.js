const https = require('https');

const options = {
  hostname: 'hcflszvrefjpfziehvfe.supabase.co',
  path: '/rest/v1/textbook_cache?select=textbook_id,textbook_name,subject_id,file_size,total_pages,full_text,pages,chapters&order=uploaded_at.desc',
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
      parsed.forEach((t, i) => {
        console.log('=== 教材 ' + (i+1) + ': ' + t.textbook_id + ' ===');
        console.log('Name: ' + t.textbook_name);
        console.log('Subject: ' + t.subject_id);
        console.log('File size: ' + (t.file_size || 0) + ' bytes');
        console.log('Total pages: ' + (t.total_pages || 0));
        console.log('full_text length: ' + (t.full_text ? t.full_text.length : 0) + ' chars');
        console.log('pages count: ' + (t.pages ? t.pages.length : 0));
        console.log('chapters count: ' + (t.chapters ? t.chapters.length : 0));
        console.log('');
      });
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw:', data.substring(0, 1000));
    }
  });
});
req.on('error', (e) => { console.error(e); });
req.end();
