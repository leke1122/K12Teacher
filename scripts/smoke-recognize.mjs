import fs from 'fs';

const imagePath = 'C:/Users/Admin/.cursor/projects/e/assets/c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_134bb421092907315477bf4f869e0c95_images_001-896b06d7-611c-4cfb-a32a-0a7f5ce39500.png';

const file = fs.readFileSync(imagePath);
const base64 = file.toString('base64');

const form = new FormData();
const blob = new Blob([file], { type: 'image/png' });
form.append('image', blob, 'geometry.png');

const res = await fetch('http://localhost:3000/api/geogebra/recognize', {
  method: 'POST',
  body: form,
});

const json = await res.json();
console.log('status:', res.status);
console.log(JSON.stringify(json, null, 2));
process.exit(res.ok ? 0 : 1);
