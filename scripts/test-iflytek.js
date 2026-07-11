const crypto = require('crypto');

const appId = 'f3d18ece';
const apiKey = '937b9b0316b1b29008049d6da313f0aa';
const apiSecret = 'NDFhNjE5OGQxYmQ4NjA2NmFjNjQ5NWMx';
const host = 'api-dx.xf-yun.com';
const path = '/v1/private/dts_create';
const date = new Date().toUTCString();

const signatureOrigin = 'host: ' + host + '\ndate: ' + date + '\nPOST ' + path + ' HTTP/1.1';
console.log('Signature string:', signatureOrigin);

const signature = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
console.log('Signature:', signature);

const authOrigin = 'api_key="' + apiKey + '",algorithm="hmac-sha256",headers="host date request-line",signature="' + signature + '"';
const auth = Buffer.from(authOrigin).toString('base64');
console.log('Auth:', auth);

const url = 'https://' + host + path + '?host=' + host + '&date=' + encodeURIComponent(date) + '&authorization=' + auth;
console.log('Full URL length:', url.length);

const body = JSON.stringify({
  header: { app_id: appId },
  parameter: {
    dts: {
      vcn: 'x5_lingfeizhe',
      speed: 50, volume: 50, pitch: 50,
      audio: { encoding: 'lame', sample_rate: 16000 },
      pybuf: { encoding: 'utf8', compress: 'raw', format: 'plain' }
    }
  },
  payload: {
    text: {
      encoding: 'utf8', compress: 'raw', format: 'plain',
      text: Buffer.from('讯飞语音合成测试').toString('base64')
    }
  }
});

console.log('Request body:', body);
console.log('Calling iFlytek API...');

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: body,
  signal: AbortSignal.timeout(15000)
})
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(d => {
    console.log('Response:', d);
  })
  .catch(e => {
    console.error('Network error:', e.message);
  });
