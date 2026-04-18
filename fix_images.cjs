const fs = require('fs');
const path = require('path');

// Image mappings based on ideal architectural placeholders
const replacements = {
  // Nairobi Tech Hub
  '1486406146926-c627a92ad1ab': '1486406146926-c627a92ad1ab', 
  '1503387762-592dee58ef4e': '1497366811353-68a6daefba28', // Blueprint/diagram
  '1541888946425-d81bb19480c5': '1554469384-e58fac16e23a', // Construction/render

  // Karen Villa
  '1613490493576-7fde63acd811': '1512917774080-9991f1c4c750', // Modern Villa
  '1518770660439-4636190af475': '1503387762-592deb58ef4e', // Diagram
  '1600607687920-4e2a09cf159d': '1600585154340-be6161a56a0c', // Architectural details
  '1512917774080-9991f1c4c750': '1613545325278-f24b0c68c463', // Villa interior

  // Loft Office
  '1497366754035-f200968a6e72': '1497366216548-37526070297c', // Loft interior
  '1524758631624-e2822e304c36': '1497366811353-68a6daefba28', 
  '1519642918688-7e43b19245d8': '1497215410103-6cb4a4130090', 

  // Mombasa Terminal
  '1519567241046-7f570eee3ce6': '1413844053676-e137b7ca57fa', // Aerodynamic roof / terminal
  '1473163928189-3f4b2c7e33e6': '1545622780-6bc53716a495', 
  '1506765515384-028b60a970df': '1506765515384-028b60a970df',

  // Kisumu Medical
  '1586773860418-d372a676f045': '1519494026892-80bbd2d6fd0d', // Clinic/sterile architecture
  '1519494026892-80bbd2d6fd0d': '1519494026892-80bbd2d6fd0d', 
  '1516549655169-df83a0774514': '1536882240095-0379873feb4e', 

  // Science Tech Park
  '1581094794329-c8112a89af12': '1581091226825-a6a2a5aee158', // Tech lab
  '1507413245164-6160d8298b31': '1507413245164-6160d8298b31',
  '1532094349884-543bc11b234d': '1532094349884-543bc11b234d',

  // Tana Bridge (All new functional IDs)
  '1545143333-11bb321d5b88': '1513828583688-c52646db42da', // Main bridge working ID
  '1513828583688-c52646db42da': '1473341304170-971dccb5ac1e', // Bridge spanning water
  '1522333323-32663f1010a6': '1522333323-32663f1010a6',
  '1545143243-7f61c3a61bb8': '1513828583688-c52646db42da', // Bridge render
  
  // Materials and other bits
  '1590069261209-48e3b9737d12': '1590069261209-48e3b9737d12', // Concrete
  '1504917595217-d4f5ebe612b0': '1504917595217-d4f5ebe612b0', // Steel
  '1503387762-592deb58ef4e': '1503387762-592deb58ef4e', // Wireframe/planning
  '1541888081604-033571dff2fb': '1503387762-592deb58ef4e', // Drafts
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Revert picsum back to Unsplash and apply mappings
  content = content.replace(/https:\/\/picsum\.photos\/seed\/([a-zA-Z0-9\-]+)\/1200\/800/g, (match, id) => {
    let finalId = replacements[id] || id; // Fallback to the original ID if no mapping
    
    // There are some globally broken IDs, check if it's the broken Bridge
    if (finalId === '1545143333-11bb321d5b88' || finalId === '1545143243-7f61c3a61bb8') {
        finalId = '1513828583688-c52646db42da'; // Safe bridge
    }
    if (finalId === '1581094794329-c8112a89af12') {
        finalId = '1581091226825-a6a2a5aee158'; // Safe tech
    }
    
    return `https://images.unsplash.com/photo-${finalId}?q=80&w=1600&auto=format&fit=crop`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

walk('src');
console.log('Images converted back to contextual Unsplash Architecture IDs.');
