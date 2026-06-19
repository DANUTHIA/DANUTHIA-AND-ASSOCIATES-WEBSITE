const fs = require('fs');

const content = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Find the boundaries
const startViewport = content.indexOf('{/* Draggable Live Viewport Simulator - Real-time visual bindings */}');
const endAssetShelf = content.indexOf('{/* Filters and Search Bar */}');

if (startViewport === -1 || endAssetShelf === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

// Extract the section
const extracted = content.substring(startViewport, endAssetShelf);

// Remove the section from the middle
let newContent = content.substring(0, startViewport) + content.substring(endAssetShelf);

// Find where to insert it (after CMS List)
// The CMS list ends where we see:     })()}
//                 </div>
const listEnd = newContent.indexOf('})()}\n                </div>') + '})()}\n                </div>'.length;

const wrappedExtracted = `
                  </div>
                  <div className="w-full xl:w-1/2 sticky top-8 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar space-y-8 pl-4 border-l border-steel/10 hidden xl:block">
                     ` + extracted.trim() + `
                  
`;

newContent = newContent.substring(0, listEnd) + wrappedExtracted + newContent.substring(listEnd);

fs.writeFileSync('src/pages/Admin.tsx', newContent);
console.log('Modified Admin.tsx successfully');
