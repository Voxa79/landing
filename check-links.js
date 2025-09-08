#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fonction pour lire récursivement tous les fichiers JSX
function findJSXFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJSXFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour vérifier les liens dans un fichier
function checkLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Chercher les href= qui ne devraient pas être là
  const hrefMatches = content.match(/href\s*=\s*["'][^"']*["']/g);
  if (hrefMatches) {
    hrefMatches.forEach((match, index) => {
      const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
      issues.push({
        type: 'href_found',
        line: lineNumber,
        match: match,
        suggestion: 'Remplacer par <Link to="..."> de React Router'
      });
    });
  }
  
  // Chercher les <a> tags qui devraient être des <Link>
  const aTagMatches = content.match(/<a\s+[^>]*>/g);
  if (aTagMatches) {
    aTagMatches.forEach((match, index) => {
      // Ignorer les liens externes (http, https, #, mailto)
      if (!match.includes('href="http') && 
          !match.includes('href="#') && 
          !match.includes('href="mailto') &&
          !match.includes('href="{') &&
          match.includes('href="/"')) {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'internal_a_tag',
          line: lineNumber,
          match: match,
          suggestion: 'Remplacer <a> par <Link> pour les liens internes'
        });
      }
    });
  }
  
  return issues;
}

// Fonction principale
function main() {
  console.log('🔍 Vérification des liens dans le projet...\n');
  
  const projectRoot = './src';
  const jsxFiles = findJSXFiles(projectRoot);
  
  let totalIssues = 0;
  
  jsxFiles.forEach(filePath => {
    const issues = checkLinksInFile(filePath);
    
    if (issues.length > 0) {
      console.log(`📄 ${filePath}:`);
      issues.forEach(issue => {
        console.log(`   ❌ Ligne ${issue.line}: ${issue.type}`);
        console.log(`      ${issue.match}`);
        console.log(`      💡 ${issue.suggestion}\n`);
      });
      totalIssues += issues.length;
    }
  });
  
  if (totalIssues === 0) {
    console.log('✅ Aucun problème de lien détecté ! Tous les liens semblent utiliser React Router correctement.');
  } else {
    console.log(`⚠️  ${totalIssues} problème(s) de lien détecté(s) dans ${jsxFiles.filter(f => checkLinksInFile(f).length > 0).length} fichier(s).`);
  }
  
  // Vérifier les routes définies
  console.log('\n🗺️  Vérification des routes...');
  
  const appPath = './src/App.jsx';
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    const routes = appContent.match(/<Route\s+path="([^"]*)"[^>]*>/g);
    
    if (routes) {
      console.log('📋 Routes définies:');
      routes.forEach(route => {
        const pathMatch = route.match(/path="([^"]*)"/);
        if (pathMatch) {
          console.log(`   • ${pathMatch[1]}`);
        }
      });
    }
  }
}

// Exécuter si c'est le module principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}