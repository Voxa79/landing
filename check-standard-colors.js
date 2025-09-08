import fs from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.{js,jsx}', { cwd: process.cwd() });
const standardColors = /(text-|bg-|border-)(blue|green|red|yellow|purple|indigo|pink|cyan|orange|violet|emerald|rose|sky|amber|lime|teal)-[0-9]+/g;

console.log('🔍 Recherche des couleurs standard non harmonisées...');
let foundCount = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(standardColors);
    if (matches && matches.length > 0) {
      console.log(`📄 ${file}: ${matches.length} couleurs standards`);
      console.log(`   → ${matches.slice(0, 5).join(', ')}${matches.length > 5 ? '...' : ''}`);
      foundCount += matches.length;
    }
  } catch (error) {
    // Ignore errors
  }
});

console.log(`\n🎨 Total: ${foundCount} couleurs standards trouvées`);