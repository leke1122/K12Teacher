const crypto = require('crypto');
const host = 'api-dx.xf-yun.com';
const path = '/v1/private/dts_query';
const date = new Date().toUTCString();
const sig = crypto.createHmac('sha256', 'NDFhNjE5OGQxYmQ4NjA2NmFjNjQ5NWMx')
  .update('host: ' + host + '\ndate: ' + date + '\nPOST ' + path + ' HTTP/1.1').digest('base64');
const auth = Buffer.from('api_key="937b9b0316b1b29008049d6da313f0aa",algorithm="hmac-sha256",headers="host date request-line",signature="' + sig + '"').toString('base64');
const url = 'https://' + host + path + '?host=' + host + '&date=' + encodeURIComponent(date) + '&authorization=' + auth;
const body = JSON.stringify({ header: { app_id: 'f3d18ece', task_id: '260711125738061137671187' } });

console.log('Testing query API (20s timeout)...');
const t = Date.now();
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: body,
  signal: AbortSignal.timeout(20000)
})
  .then(r => r.text().then(d => ({ status: r.status, d: d, ms: Date.now() - t })))
  .then(r => {
    console.log('Status:', r.status, 'Time:', r.ms + 'ms');
    const data = JSON.parse(r.d);
    if (data.payload?.audio?.audio) {
      const audioUrl = Buffer.from(data.payload.audio.audio, 'base64').toString('utf8');
      console.log('Audio URL found:', audioUrl.substring(0, 80) + '...');
      console.log('Fetching audio from:', audioUrl);
      return fetch(audioUrl, { signal: AbortSignal.timeout(15000) });
    } else {
      console.log('Response:', r.d.substring(0, 300));
    }
  })
  .then(r => {
    if (r) {
      console.log('Audio status:', r.status, 'Content-Type:', r.headers.get('content-type'));
      return r.arrayBuffer();
    }
  })
  .then(buf => {
    if (buf) {
      require('fs').writeFileSync('vercel-test-audio.mp3', Buffer.from(buf));
      console.log('Saved', buf.byteLength, 'bytes to vercel-test-audio.mp3');
    }
  })
  .catch(e => console.error('Error:', e.message, 'Time:', Date.now() - t + 'ms'));
