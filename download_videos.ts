import fs from 'fs';
import path from 'path';

const videos = [
  { url: 'https://cdn.coverr.co/videos/coverr-city-buildings-on-a-rainy-day-1854/1080p.mp4', name: 'hero.mp4' },
  { url: 'https://cdn.coverr.co/videos/coverr-urban-runner-in-a-modern-cityscape/1080p.mp4', name: 'about.mp4' },
  { url: 'https://cdn.coverr.co/videos/coverr-steps-of-the-vessel-8844/1080p.mp4', name: 'sustainability.mp4' },
  { url: 'https://cdn.coverr.co/videos/coverr-jeronimos-monastery-in-lisbon-portugal-6360/1080p.mp4', name: 'services.mp4' }
];

async function main() {
  const dir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

  for (const v of videos) {
    console.log(`Downloading ${v.url}...`);
    try {
      const res = await fetch(v.url, { headers });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(path.join(dir, v.name), Buffer.from(buffer));
        console.log(`Saved ${v.name}`);
      } else {
        console.log(`Failed to fetch ${v.url}: ${res.status}`);
      }
    } catch (e) {
      console.log(`Error downloading ${v.url}: ${e}`);
    }
  }
}

main();
