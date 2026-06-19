import * as fs from 'fs';

let content = fs.readFileSync('src/pages/ClientPortal.tsx', 'utf8');

// 1. Merge project tabs
content = content.replace(
  /              <\/div>\n            \)}\n\n            \{activeTab === 'project' && \(\n              <div className="space-y-12">/,
  ''
);

// 2. Wrap first resources tab in space-y-12
content = content.replace(
  /\{activeTab === 'resources' && \(\n              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">/,
  `{activeTab === 'resources' && (\n              <div className="space-y-12">\n                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">`
);

// 3. Merge second resources tab
content = content.replace(
  /                <\/div>\n              <\/div>\n            \)}\n\n            \{activeTab === 'resources' && \(\n              <div className="space-y-12">/,
  '                </div>\n              </div>'
);

// 4. Merge third resources tab
content = content.replace(
  /                <\/div>\n              <\/div>\n            \)}\n\n            \{activeTab === 'resources' && \(\n              <div className="space-y-12">/,
  '                </div>\n              </div>'
);

// 5. Dashboard 2 should be moved to Dashboard 1? Let's just leave it if it works, or we can move it.
// Let's move Dashboard 2 to Dashboard 1.
const dash2Regex = /            \{activeTab === 'dashboard' && \(\n              <div className="max-w-4xl mx-auto">([\s\S]+?)              <\/div>\n            \)}\n\n/g;
let dash2Match = dash2Regex.exec(content);
if (dash2Match) {
  let dash2Content = `\n              <div className="max-w-4xl mx-auto">${dash2Match[1]}              </div>\n`;
  content = content.replace(dash2Regex, '');
  
  // Insert at end of first dashboard
  const dash1End = /                  <\/div>\n                 <\/div>\n              <\/div>\n            \)}\n\n            \{activeTab === 'project' && \(/;
  content = content.replace(dash1End, `                  </div>\n                 </div>${dash2Content}              </div>\n            )}\n\n            {activeTab === 'project' && (`);
}

fs.writeFileSync('src/pages/ClientPortal.tsx', content);
console.log('Fixed tabs in ClientPortal');
