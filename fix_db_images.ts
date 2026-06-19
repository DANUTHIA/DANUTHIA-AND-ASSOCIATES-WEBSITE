import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const brokenMap = {
  '1541888086225-ee590059c237': '1600585154340-be6161a56a0c',
  '1590069261209-48e3b9737d12': '1449034446853-66c86144b0ad',
  '1497215410103-6cb4a4130090': '1600596542815-ffad4c1539a9',
  '1504917595217-d4f5ebe612b0': '1518005020951-eccb494ad742',
  '1497366811353-68a6daefba28': '1473448912268-2022ce9509d8',
  '1600607688969-a5bfcd64bd28': '1503387762-592deb58ef4e',
  '1574950201202-b2fa84b80a15': '1522071820081-009f0129c71c',
  '1473163928189-39a0c8a95641': '1486406146926-c627a92ad1ab',
  '1513584684374-8bdb74s=6023': '1531834685032-c34bf0d84c77',
  '1413844053676-e137b7ca57fa': '1451187580459-43490279c0fa'
};

async function fixDB() {
  const colRef = collection(db, 'siteResources');
  const snap = await getDocs(colRef);
  for (const item of snap.docs) {
    const data = item.data();
    let value = data.value;
    if (typeof value === 'string') {
      let changed = false;
      for (const [broken, replacement] of Object.entries(brokenMap)) {
        if (value.includes(broken)) {
          value = value.replace(new RegExp(broken, 'g'), replacement);
          changed = true;
        }
      }
      if (changed) {
        console.log('fixing doc', item.id);
        await updateDoc(doc(db, 'siteResources', item.id), { value });
      }
    }
  }
  console.log('done fixing site resources');
  
  const pRef = collection(db, 'projects');
  const psnap = await getDocs(pRef);
  for (const item of psnap.docs) {
    const data = item.data();
    let valStr = JSON.stringify(data);
    let changed = false;
    for (const [broken, replacement] of Object.entries(brokenMap)) {
      if (valStr.includes(broken)) {
        valStr = valStr.replace(new RegExp(broken, 'g'), replacement);
        changed = true;
      }
    }
    if (changed) {
      console.log('fixing project', item.id);
      await updateDoc(doc(db, 'projects', item.id), JSON.parse(valStr));
    }
  }
  console.log('done fixing projects');
}

fixDB().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
