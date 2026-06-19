const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  // This matches tags followed by properties, ensuring we don't cross into other tags
  const regex = /<([a-zA-Z0-9_\.]+)([^>]*?)(>[^<]*?resources\.([a-zA-Z0-9_]+)[^<]*?<\/\1>)/g;
  content = content.replace(regex, (match, tag, attr, rest, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<${tag} data-cms-key="${key}"${attr}${rest}`;
  });

  const regex2 = /<([a-zA-Z0-9_\.]+)([^>]*?)(>[^<]*?resources\['([a-zA-Z0-9_]+)'\][^<]*?<\/\1>)/g;
  content = content.replace(regex2, (match, tag, attr, rest, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<${tag} data-cms-key="${key}"${attr}${rest}`;
  });

  const imgRegex = /<img([^>]*?src=\{\s*resources\.([a-zA-Z0-9_]+).*?\}[^>]*?)>/g;
  content = content.replace(imgRegex, (match, attr, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<img data-cms-key="${key}"${attr}>`;
  });
  
  const vidRegex = /<video([^>]*?src=\{\s*resources\.([a-zA-Z0-9_]+).*?\}[^>]*?)>/g;
  content = content.replace(vidRegex, (match, attr, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<video data-cms-key="${key}"${attr}>`;
  });

  // also add them on elements where background image style is used
  const bgRegex = /<([a-zA-Z0-9_\.]+)([^>]*?style={{[^}]*backgroundImage:[^}]*resources\.([a-zA-Z0-9_]+).*?}}[^>]*?)>/g;
  content = content.replace(bgRegex, (match, tag, attr, key) => {
    if (attr.includes('data-cms-key')) return match;
    return `<${tag} data-cms-key="${key}"${attr}>`;
  });

  fs.writeFileSync(path, content, 'utf8');
}

['src/pages/Home.tsx', 'src/pages/About.tsx', 'src/pages/Services.tsx', 'src/pages/Portfolio.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    processFile(file);
    console.log('Processed', file);
  }
});
