import fs from 'fs';
import path from 'path';

function listAllFiles(dir: string, depth = 0) {
  if (depth > 6) return;
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      if (['/proc', '/sys', '/dev', '/var/lib/docker', '/tmp', '/run', '/sys_class'].some(p => fullPath.startsWith(p))) return;
      if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('.cache')) return;
      
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return;
      }
      
      if (stat.isDirectory()) {
        listAllFiles(fullPath, depth + 1);
      } else {
        const ageInSecs = (Date.now() - stat.mtime.getTime()) / 1000;
        // Print files modified in the last 20 minutes OR all media/videos
        if (ageInSecs < 1200 || file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.webm')) {
          console.log(`${fullPath} | Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB | Modified: ${stat.mtime.toISOString()} (${ageInSecs.toFixed(0)}s ago)`);
        }
      }
    });
  } catch (e) {
    // ignore
  }
}

console.log('--- GLOBAL RECENT & VIDEO SELECTION ---');
listAllFiles('/');
