import fs from 'fs';
import { glob } from 'glob';

// Mapping intelligent des couleurs standard vers la palette "Tournesol Souverain"
const colorMappings = {
  // BLEU → SOVEREIGN (bleu pétrole)
  'blue-50': 'sovereign-50',
  'blue-100': 'sovereign-100', 
  'blue-200': 'sovereign-200',
  'blue-300': 'sovereign-300',
  'blue-400': 'sovereign-400',
  'blue-500': 'sovereign',
  'blue-600': 'sovereign-600',
  'blue-700': 'sovereign-700',
  'blue-800': 'sovereign-800',
  'blue-900': 'sovereign-900',
  
  // ORANGE/RED → ACTION (orange solaire)
  'orange-50': 'action-50',
  'orange-100': 'action-100',
  'orange-200': 'action-200', 
  'orange-300': 'action-300',
  'orange-400': 'action-400',
  'orange-500': 'action',
  'orange-600': 'action-600',
  'orange-700': 'action-700',
  'orange-800': 'action-800',
  'orange-900': 'action-900',
  'red-50': 'action-50',
  'red-100': 'action-100',
  'red-200': 'action-200',
  'red-300': 'action-300', 
  'red-400': 'action-400',
  'red-500': 'action',
  'red-600': 'action-600',
  'red-700': 'action-700',
  'red-800': 'action-800',
  'red-900': 'action-900',
  
  // JAUNE/AMBER → SUCCESS (jaune prospérité)
  'yellow-50': 'success-50',
  'yellow-100': 'success-100',
  'yellow-200': 'success-200',
  'yellow-300': 'success-300',
  'yellow-400': 'success-400', 
  'yellow-500': 'success',
  'yellow-600': 'success-600',
  'yellow-700': 'success-700',
  'yellow-800': 'success-800',
  'yellow-900': 'success-900',
  'amber-50': 'success-50',
  'amber-100': 'success-100',
  'amber-200': 'success-200',
  'amber-300': 'success-300',
  'amber-400': 'success-400',
  'amber-500': 'success',
  'amber-600': 'success-600',
  'amber-700': 'success-700',
  'amber-800': 'success-800',
  'amber-900': 'success-900',
  
  // VERT → GROWTH (vert développement)
  'green-50': 'growth-50',
  'green-100': 'growth-100',
  'green-200': 'growth-200',
  'green-300': 'growth-300',
  'green-400': 'growth-400',
  'green-500': 'growth',
  'green-600': 'growth-600',
  'green-700': 'growth-700',
  'green-800': 'growth-800', 
  'green-900': 'growth-900',
  'emerald-50': 'growth-50',
  'emerald-100': 'growth-100',
  'emerald-200': 'growth-200',
  'emerald-300': 'growth-300',
  'emerald-400': 'growth-400',
  'emerald-500': 'growth',
  'emerald-600': 'growth-600',
  'emerald-700': 'growth-700',
  'emerald-800': 'growth-800',
  'emerald-900': 'growth-900',
  'lime-50': 'growth-50',
  'lime-100': 'growth-100',
  'lime-200': 'growth-200', 
  'lime-300': 'growth-300',
  'lime-400': 'growth-400',
  'lime-500': 'growth',
  'lime-600': 'growth-600',
  'lime-700': 'growth-700',
  'lime-800': 'growth-800',
  'lime-900': 'growth-900',
  
  // VERT FONCÉ → PREMIUM (vert foncé premium)
  'teal-50': 'premium-50',
  'teal-100': 'premium-100',
  'teal-200': 'premium-200',
  'teal-300': 'premium-300',
  'teal-400': 'premium-400',
  'teal-500': 'premium',
  'teal-600': 'premium-600',
  'teal-700': 'premium-700',
  'teal-800': 'premium-800',
  'teal-900': 'premium-900',
  
  // VIOLETS → PREMIUM (harmonisation vers vert foncé premium)
  'purple-50': 'premium-50',
  'purple-100': 'premium-100',
  'purple-200': 'premium-200',
  'purple-300': 'premium-300',
  'purple-400': 'premium-400',
  'purple-500': 'premium',
  'purple-600': 'premium-600',
  'purple-700': 'premium-700',
  'purple-800': 'premium-800',
  'purple-900': 'premium-900',
  'violet-50': 'premium-50',
  'violet-100': 'premium-100',
  'violet-200': 'premium-200',
  'violet-300': 'premium-300',
  'violet-400': 'premium-400',
  'violet-500': 'premium',
  'violet-600': 'premium-600',
  'violet-700': 'premium-700',
  'violet-800': 'premium-800',
  'violet-900': 'premium-900',
  'indigo-50': 'sovereign-50',
  'indigo-100': 'sovereign-100',
  'indigo-200': 'sovereign-200',
  'indigo-300': 'sovereign-300',
  'indigo-400': 'sovereign-400',
  'indigo-500': 'sovereign',
  'indigo-600': 'sovereign-600',
  'indigo-700': 'sovereign-700',
  'indigo-800': 'sovereign-800',
  'indigo-900': 'sovereign-900',
  
  // CYAN/SKY → SOVEREIGN (harmonisation vers bleu souverain)
  'cyan-50': 'sovereign-50',
  'cyan-100': 'sovereign-100',
  'cyan-200': 'sovereign-200',
  'cyan-300': 'sovereign-300',
  'cyan-400': 'sovereign-400',
  'cyan-500': 'sovereign',
  'cyan-600': 'sovereign-600',
  'cyan-700': 'sovereign-700',
  'cyan-800': 'sovereign-800',
  'cyan-900': 'sovereign-900',
  'sky-50': 'sovereign-50',
  'sky-100': 'sovereign-100',
  'sky-200': 'sovereign-200',
  'sky-300': 'sovereign-300',
  'sky-400': 'sovereign-400',
  'sky-500': 'sovereign',
  'sky-600': 'sovereign-600',
  'sky-700': 'sovereign-700',
  'sky-800': 'sovereign-800',
  'sky-900': 'sovereign-900',
  
  // ROSE/PINK → ACTION (harmonisation vers orange action)
  'rose-50': 'action-50',
  'rose-100': 'action-100',
  'rose-200': 'action-200',
  'rose-300': 'action-300',
  'rose-400': 'action-400',
  'rose-500': 'action',
  'rose-600': 'action-600',
  'rose-700': 'action-700',
  'rose-800': 'action-800',
  'rose-900': 'action-900',
  'pink-50': 'action-50',
  'pink-100': 'action-100',
  'pink-200': 'action-200',
  'pink-300': 'action-300',
  'pink-400': 'action-400',
  'pink-500': 'action',
  'pink-600': 'action-600',
  'pink-700': 'action-700',
  'pink-800': 'action-800',
  'pink-900': 'action-900'
};

function harmonizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let changeCount = 0;
    
    // Harmoniser les couleurs avec préfixes (text-, bg-, border-)
    const prefixes = ['text-', 'bg-', 'border-', 'from-', 'to-', 'via-', 'hover:', 'focus:', 'active:'];
    
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      // Couleur simple (sans préfixe)
      if (content.includes(oldColor)) {
        const regex = new RegExp('\\\\b' + escapeRegExp(oldColor) + '\\\\b', 'g');
        content = content.replace(regex, newColor);
        hasChanges = true;
        changeCount++;
      }
      
      // Avec préfixes
      for (const prefix of prefixes) {
        const prefixedOld = prefix + oldColor;
        const prefixedNew = prefix + newColor;
        
        if (content.includes(prefixedOld)) {
          const regex = new RegExp('\\\\b' + escapeRegExp(prefixedOld) + '\\\\b', 'g');
          content = content.replace(regex, prefixedNew);
          hasChanges = true;
          changeCount++;
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Harmonisé: ${filePath} (${changeCount} changements)`);
      return changeCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return 0;
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// Trouver tous les fichiers JSX et JS
const files = glob.sync('src/**/*.{js,jsx}', { cwd: process.cwd() });

console.log('🎨 Harmonisation COMPLÈTE des couleurs standard vers palette "Tournesol Souverain"...');
console.log(`📁 ${files.length} fichiers à traiter\\n`);

let totalChanges = 0;
let filesModified = 0;

files.forEach(file => {
  const changes = harmonizeFile(file);
  if (changes > 0) {
    totalChanges += changes;
    filesModified++;
  }
});

console.log(`\\n🌻 Harmonisation terminée !`);
console.log(`📊 ${filesModified} fichiers modifiés`);
console.log(`🔄 ${totalChanges} couleurs harmonisées`);
console.log(`\\n🎯 Palette "Tournesol Souverain" maintenant appliquée sur tout le projet !`);