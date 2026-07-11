const crypto = require('crypto');

const appId = 'f3d18ece';
const apiKey = '937b9b0316b1b29008049d6da313f0aa';
const apiSecret = 'NDFhNjE5OGQxYmQ4NjA2NmFjNjQ5NWMx';
const taskId = '260711125738061137671187';
const host = 'api-dx.xf-yun.com';
const queryPath = '/v1/private/dts_query';
const date = new Date().toUTCString();

const signatureOrigin = 'host: ' + host + '\ndate: ' + date + '\nPOST ' + queryPath + ' HTTP/1.1';
const signature = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
const authOrigin = 'api_key="' + apiKey + '",algorithm="hmac-sha256",headers="host date request-line",signature="' + signature + '"';
const auth = Buffer.from(authOrigin).toString('base64');
const url = 'https://' + host + queryPath + '?host=' + host + '&date=' + encodeURIComponent(date) + '&authorization=' + auth;

const body = JSON.stringify({
  header: {
    app_id: appId,
    task_id: taskId
  }
});

console.log('Querying task:', taskId);

function queryTask() {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
    signal: AbortSignal.timeout(10000)
  })
    .then(r => r.text())
    .then(d => {
      console.log('Response:', d);
      const data = JSON.parse(d);
      const status = data.header?.task_status;
      console.log('Task status:', status);
      if (status === 5) {
        console.log('COMPLETED! Audio URL:', data.payload?.audio?.audio);
        const audioUrl = Buffer.from(data.payload?.audio?.audio || '', 'base64').toString('utf8');
        console.log('Decoded URL:', audioUrl);
        if (audioUrl) {
          console.log('Fetching audio from URL...');
          fetch(audioUrl, { signal: AbortSignal.timeout(15000) })
            .then(r => {
              console.log('Audio status:', r.status, 'Content-Type:', r.headers.get('content-type'));
              return r.arrayBuffer();
            })
            .then(buf => {
              console.log('Audio downloaded, size:', buf.byteLength, 'bytes');
              require('fs').writeFileSync('test-audio.mp3', Buffer.from(buf));
              console.log('Saved to test-audio.mp3');
            })
            .catch(e => console.error('Audio fetch error:', e.message));
        }
      } else if (status) {
        console.log('Still processing, waiting 3s...');
        setTimeout(queryTask, 3000);
      }
    })
    .catch(e => console.error('Query error:', e.message));
}

queryTask();
