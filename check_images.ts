import fs from 'fs';
import { execSync } from 'child_process';

try {
  const rs = execSync('grep -rIno "https://images.unsplash.com/[^\\"]*" src/');
  const urlsText = rs.toString();
  const rawUrls = urlsText.split('\n').filter(Boolean);
  
  // Extract unique URLs
  const urls = [...new Set(rawUrls.map(line => {
    // line format is file:line:url
    const parts = line.split(':http');
    if (parts.length === 2) {
      return 'http' + parts[1];
    }
    return '';
  }).filter(Boolean))];

  console.log(`Found ${urls.length} unique images. Checking...`);

  async function check() {
    for (const url of urls) {
      try {
        const urlToCheck = url.replace(/'$/, ''); // remove trailing quote if present
        const response = await fetch(urlToCheck, { method: 'HEAD' });
        if (!response.ok) {
          console.log(`BROKEN: [Status ${response.status}] ${urlToCheck}`);
        }
      } catch (e) {
        console.log(`ERROR: ${url} - ${e.message}`);
      }
    }
    console.log('Done checking images.');
  }
  
  check();

} catch (e) {
  console.error(e);
}
