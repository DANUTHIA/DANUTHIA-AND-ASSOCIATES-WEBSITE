import * as fs from 'fs';

let content = fs.readFileSync('src/pages/ClientPortal.tsx', 'utf8');

const regex = /            \{false && activeTab === 'tasks' && \([\s\S]+?            \)\}\n/;
content = content.replace(regex, '');

fs.writeFileSync('src/pages/ClientPortal.tsx', content);
console.log('Removed disabled tasks block');
