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
        console.log('=== All lessons ===');
        chapters.forEach((unit, uIdx) => {
          console.log(`\n[Unit ${uIdx+1}]: ${unit.id} - ${unit.title}`);
          if (unit.children) {
            unit.children.forEach((lesson, lIdx) => {
              console.log(`  Lesson ${lIdx+1}: ${lesson.id} - ${lesson.title} (pages ${lesson.startPage}-${lesson.endPage})`);
            });
          }
        });
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});
req.on('error', (e) => { console.error(e); });
req.end();
