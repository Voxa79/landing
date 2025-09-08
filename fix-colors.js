import fs from 'fs';
import { glob } from 'glob';

// Mapping simple et direct
const colorMappings = {
  // Bleus -> Sovereign
  'blue-500': 'sovereign',
  'blue-400': 'sovereign-400',
  'blue-600': 'sovereign-600',
  'blue-700': 'sovereign-700',
  'blue-800': 'sovereign-800',
  'blue-900': 'sovereign-900',
  'blue-300': 'sovereign-300',
  'blue-200': 'sovereign-200',
  'blue-100': 'sovereign-100',
  'blue-50': 'sovereign-50',
  
  // Verts -> Growth
  'green-500': 'growth',
  'green-400': 'growth-400',
  'green-600': 'growth-600',
  'green-700': 'growth-700',
  'green-800': 'growth-800',
  'green-900': 'growth-900',
  'green-300': 'growth-300',
  'green-200': 'growth-200',
  'green-100': 'growth-100',
  'green-50': 'growth-50',
  
  // Orange/Rouge -> Action
  'orange-500': 'action',
  'red-500': 'action',
  'orange-400': 'action-400',
  'red-400': 'action-400',
  'orange-600': 'action-600',
  'red-600': 'action-600',
  'orange-700': 'action-700',
  'red-700': 'action-700',
  'orange-800': 'action-800',
  'red-800': 'action-800',
  'orange-900': 'action-900',
  'red-900': 'action-900',
  'orange-300': 'action-300',
  'red-300': 'action-300',
  'orange-200': 'action-200',
  'red-200': 'action-200',
  'orange-100': 'action-100',
  'red-100': 'action-100',
  'orange-50': 'action-50',
  'red-50': 'action-50',
  
  // Jaune -> Success
  'yellow-500': 'success',
  'yellow-400': 'success-400',
  'yellow-600': 'success-600',
  'yellow-700': 'success-700',
  'yellow-800': 'success-800',
  'yellow-900': 'success-900',
  'yellow-300': 'success-300',
  'yellow-200': 'success-200',
  'yellow-100': 'success-100',
  'yellow-50': 'success-50',
  
  // Violets/Purple -> Premium
  'purple-500': 'premium',
  'violet-500': 'premium',
  'indigo-500': 'sovereign',
  'purple-400': 'premium-400',
  'violet-400': 'premium-400',
  'indigo-400': 'sovereign-400',
  'purple-600': 'premium-600',
  'violet-600': 'premium-600',
  'indigo-600': 'sovereign-600',
  'purple-700': 'premium-700',
  'violet-700': 'premium-700',
  'indigo-700': 'sovereign-700',
  'purple-800': 'premium-800',
  'violet-800': 'premium-800',
  'indigo-800': 'sovereign-800',
  'purple-900': 'premium-900',
  'violet-900': 'premium-900',
  'indigo-900': 'sovereign-900',
  'purple-300': 'premium-300',
  'violet-300': 'premium-300',
  'indigo-300': 'sovereign-300',
  'purple-200': 'premium-200',
  'violet-200': 'premium-200',
  'indigo-200': 'sovereign-200',
  'purple-100': 'premium-100',
  'violet-100': 'premium-100',
  'indigo-100': 'sovereign-100',
  'purple-50': 'premium-50',
  'violet-50': 'premium-50',
  'indigo-50': 'sovereign-50',
  
  // Cyan/Sky -> Sovereign
  'cyan-500': 'sovereign',
  'sky-500': 'sovereign',
  'teal-500': 'premium',
  'cyan-400': 'sovereign-400',
  'sky-400': 'sovereign-400',
  'teal-400': 'premium-400',
  'cyan-600': 'sovereign-600',
  'sky-600': 'sovereign-600',
  'teal-600': 'premium-600',
  'cyan-700': 'sovereign-700',
  'sky-700': 'sovereign-700',
  'teal-700': 'premium-700',
  'cyan-800': 'sovereign-800',
  'sky-800': 'sovereign-800',
  'teal-800': 'premium-800',
  'cyan-900': 'sovereign-900',
  'sky-900': 'sovereign-900',
  'teal-900': 'premium-900',
  'cyan-300': 'sovereign-300',
  'sky-300': 'sovereign-300',
  'teal-300': 'premium-300',
  'cyan-200': 'sovereign-200',
  'sky-200': 'sovereign-200',
  'teal-200': 'premium-200',
  'cyan-100': 'sovereign-100',
  'sky-100': 'sovereign-100',
  'teal-100': 'premium-100',
  'cyan-50': 'sovereign-50',
  'sky-50': 'sovereign-50',
  'teal-50': 'premium-50',
  
  // Rose/Pink -> Action
  'rose-500': 'action',
  'pink-500': 'action',
  'rose-400': 'action-400',
  'pink-400': 'action-400',
  'rose-600': 'action-600',
  'pink-600': 'action-600',
  'rose-700': 'action-700',
  'pink-700': 'action-700',
  'rose-800': 'action-800',
  'pink-800': 'action-800',
  'rose-900': 'action-900',
  'pink-900': 'action-900',
  'rose-300': 'action-300',
  'pink-300': 'action-300',
  'rose-200': 'action-200',
  'pink-200': 'action-200',
  'rose-100': 'action-100',
  'pink-100': 'action-100',
  'rose-50': 'action-50',
  'pink-50': 'action-50',
  
  // Emerald -> Growth
  'emerald-500': 'growth',
  'emerald-400': 'growth-400',
  'emerald-600': 'growth-600',
  'emerald-700': 'growth-700',
  'emerald-800': 'growth-800',
  'emerald-900': 'growth-900',
  'emerald-300': 'growth-300',
  'emerald-200': 'growth-200',
  'emerald-100': 'growth-100',
  'emerald-50': 'growth-50'
};

function harmonizeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remplacer toutes les occurrences
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      // Chercher avec tous les préfixes possibles
      const patterns = [
        `text-${oldColor}`,
        `bg-${oldColor}`, 
        `border-${oldColor}`,
        `from-${oldColor}`,
        `to-${oldColor}`,
        `via-${oldColor}`,
        `hover:text-${oldColor}`,
        `hover:bg-${oldColor}`,
        `hover:border-${oldColor}`,
        `focus:text-${oldColor}`,
        `focus:bg-${oldColor}`,
        `focus:border-${oldColor}`,
        `active:text-${oldColor}`,
        `active:bg-${oldColor}`,
        `active:border-${oldColor}`,
        `dark:text-${oldColor}`,
        `dark:bg-${oldColor}`,
        `dark:border-${oldColor}`
      ];
      
      const replacements = [
        `text-${newColor}`,
        `bg-${newColor}`,
        `border-${newColor}`,
        `from-${newColor}`,
        `to-${newColor}`,
        `via-${newColor}`,
        `hover:text-${newColor}`,
        `hover:bg-${newColor}`,
        `hover:border-${newColor}`,
        `focus:text-${newColor}`,
        `focus:bg-${newColor}`,
        `focus:border-${newColor}`,
        `active:text-${newColor}`,
        `active:bg-${newColor}`,
        `active:border-${newColor}`,
        `dark:text-${newColor}`,
        `dark:bg-${newColor}`,
        `dark:border-${newColor}`
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        content = content.replace(new RegExp(patterns[i], 'g'), replacements[i]);
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Trouver tous les fichiers
const files = glob.sync('src/**/*.{js,jsx}', { cwd: process.cwd() });
console.log(`🔧 Correction des couleurs restantes sur ${files.length} fichiers...`);

let fixedCount = 0;
files.forEach(file => {
  if (harmonizeFile(file)) {
    console.log(`✅ Corrigé: ${file}`);
    fixedCount++;
  }
});

console.log(`\n🎯 ${fixedCount} fichiers corrigés !`);