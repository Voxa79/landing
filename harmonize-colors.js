import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Mapping des couleurs hexadécimales vers les classes Tailwind de la palette "Tournesol Souverain"
const colorMappings = {
  // Couleurs principales de la palette
  '#034E64': 'sovereign',
  '#F06905': 'action', 
  '#FEB909': 'success',
  '#638D13': 'growth',
  '#0A3226': 'premium',
  
  // Variantes avec text-
  'text-[#034E64]': 'text-sovereign',
  'text-[#F06905]': 'text-action',
  'text-[#FEB909]': 'text-success', 
  'text-[#638D13]': 'text-growth',
  'text-[#0A3226]': 'text-premium',
  
  // Variantes avec bg-
  'bg-[#034E64]': 'bg-sovereign',
  'bg-[#F06905]': 'bg-action',
  'bg-[#FEB909]': 'bg-success',
  'bg-[#638D13]': 'bg-growth', 
  'bg-[#0A3226]': 'bg-premium',
  
  // Variantes avec border-
  'border-[#034E64]': 'border-sovereign',
  'border-[#F06905]': 'border-action',
  'border-[#FEB909]': 'border-success',
  'border-[#638D13]': 'border-growth',
  'border-[#0A3226]': 'border-premium'
};

function harmonizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Appliquer les mappings
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      if (content.includes(oldColor)) {
        content = content.replace(new RegExp(escapeRegExp(oldColor), 'g'), newColor);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Harmonisé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Trouver tous les fichiers JSX et JS
const files = glob.sync('src/**/*.{js,jsx}', { cwd: process.cwd() });

console.log(`🎨 Harmonisation de ${files.length} fichiers avec la palette "Tournesol Souverain"...`);

let harmonizedCount = 0;
files.forEach(file => {
  if (harmonizeFile(file)) {
    harmonizedCount++;
  }
});

console.log(`\n🌻 Harmonisation terminée: ${harmonizedCount} fichiers modifiés sur ${files.length}`);