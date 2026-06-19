const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  const imgRegex = /<motion\.img([^>]*?src=\{\s*resources\.([a-zA-Z0-9_]+).*?\}[^>]*?)>/g;
  content = content.replace(imgRegex, (match, attr, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<motion.img data-cms-key="${key}"${attr}>`;
  });

  fs.writeFileSync(path, content, 'utf8');
}

['src/pages/About.tsx', 'src/pages/Home.tsx', 'src/pages/Services.tsx', 'src/pages/Portfolio.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    processFile(file);
    console.log('Processed motion.img', file);
  }
});
