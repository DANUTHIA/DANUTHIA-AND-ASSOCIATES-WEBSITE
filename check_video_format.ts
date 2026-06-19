import fs from 'fs';
import path from 'path';

function checkVideo() {
  const filePath = path.join(process.cwd(), 'public', 'videos', 'about.mp4');
  if (!fs.existsSync(filePath)) {
    console.log("File does not exist!");
    return;
  }
  const stat = fs.statSync(filePath);
  console.log(`File size: ${stat.size} bytes`);
  
  // Read first 100 bytes to check the file header
  const buffer = Buffer.alloc(100);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 100, 0);
  fs.closeSync(fd);
  
  console.log("Header bytes (hex):", buffer.toString('hex', 0, 20));
  const utf8Text = buffer.toString('utf8', 0, 50);
  console.log("Header as text (first 50 chars):", utf8Text);
  if (utf8Text.includes('<!DOCTYPE') || utf8Text.includes('<html')) {
    console.log("WARNING: This is NOT a video! It is an HTML file!");
  } else {
    console.log("Matches binary data patterns.");
  }
}

checkVideo();
