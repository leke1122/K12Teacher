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
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('=== docx_imports columns ===');
  const rows = await query('/rest/v1/docx_imports?limit=1');
  if (Array.isArray(rows) && rows.length > 0) {
    console.log('All columns:', Object.keys(rows[0]).join(', '));
  } else {
    console.log('Response:', JSON.stringify(rows).slice(0, 1000));
  }

  console.log('\n=== existing docx_imports for u1,u2,u3 ===');
  const records = await query('/rest/v1/docx_imports?select=id,unit_id,unit_title,concepts_count,events_count,imported_at&unit_id=in.(u1,u2,u3)&order=unit_id.asc');
  if (Array.isArray(records)) {
    records.forEach((row, i) => {
      console.log(`[${i}] ${row.unit_id} | ${row.unit_title} | concepts=${row.concepts_count} events=${row.events_count}`);
    });
  } else {
    console.log(JSON.stringify(records, null, 2).slice(0, 1000));
  }
}

main().catch(console.error);
