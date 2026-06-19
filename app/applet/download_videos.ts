import fs from 'fs';
import path from 'path';

const videos = [
  { url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4', name: 'hero.mp4' },
  { url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4', name: 'about.mp4' },
  { url: 'https://test-videos.co.uk/vids/tears-of-steel/mp4/h264/720/Tears_of_Steel_720_10s_1MB.mp4', name: 'sustainability.mp4' },
  { url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', name: 'services.mp4' }
];

async function main() {
  const dir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const v of videos) {
    console.log(`Downloading ${v.url}...`);
    try {
      const res = await fetch(v.url);
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
