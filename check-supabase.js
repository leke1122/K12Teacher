const https = require('https');

function query(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hcflszvrefjpfziehvfe.supabase.co',
      path: path,
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
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Check what columns exist in textbook_cache
  console.log('=== textbook_cache columns check (with limit 1) ===');
  const rows = await query('/rest/v1/textbook_cache?limit=1');
  if (Array.isArray(rows) && rows.length > 0) {
    console.log('All columns:', Object.keys(rows[0]).join(', '));
    console.log('sample row:', JSON.stringify(rows[0], null, 2));
  } else if (typeof rows === 'object') {
    console.log('Response:', JSON.stringify(rows, null, 2));
  }

  // Check all textbook_cache entries with their subject_id
  console.log('\n=== textbook_cache with subject_id ===');
  const all = await query('/rest/v1/textbook_cache?select=textbook_id,textbook_name,subject_id,user_id,uploaded_at');
  if (Array.isArray(all)) {
    all.forEach((row, i) => {
      console.log(`[${i}] textbook_id: ${row.textbook_id}, subject_id: ${row.subject_id}, user_id: ${row.user_id}`);
    });
  } else {
    console.log(JSON.stringify(all, null, 2));
  }
}

main().catch(console.error);
