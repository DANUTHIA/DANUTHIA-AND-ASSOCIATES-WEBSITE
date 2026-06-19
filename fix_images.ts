const fs = require('fs');
const path = require('path');

const brokenIds = [
  '1541888086225-ee590059c237',
  '1590069261209-48e3b9737d12',
  '1497215410103-6cb4a4130090',
  '1504917595217-d4f5ebe612b0',
  '1497366811353-68a6daefba28',
  '1600607688969-a5bfcd64bd28',
  '1574950201202-b2fa84b80a15',
  '1473163928189-39a0c8a95641',
  '1513584684374-8bdb74s=6023',
  '1413844053676-e137b7ca57fa'
];

const replacementIds: string[] = [
  '1600585154340-be6161a56a0c',
  '1449034446853-66c86144b0ad',
  '1600596542815-ffad4c1539a9',
  '1518005020951-eccb494ad742',
  '1473448912268-2022ce9509d8',
  '1503387762-592deb58ef4e',
  '1522071820081-009f0129c71c',
  '1486406146926-c627a92ad1ab',
  '1531834685032-c34bf0d84c77',
  '1451187580459-43490279c0fa'
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (let i = 0; i < brokenIds.length; i++) {
        const regex = new RegExp(`photo-${brokenIds[i].replace(/=/g, '\\=')}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `photo-${replacementIds[i]}`);
          changed = true;
          console.log(`Replaced in ${fullPath}`);
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDir('./src');
