
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'client/src';
const files = [];

function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(n)) {
      files.push(p);
    }
  }
}

walk(ROOT);

let changed = 0;
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  
  // Chercher les liens internes avec href
  if (/<a\s+href="\//.test(src)) {
    // Ajouter l'import Link si pas présent
    if (!/import.*Link.*from.*wouter/.test(src)) {
      const importMatch = src.match(/import.*from ['"]wouter['"];?/);
      if (importMatch) {
        // Ajouter Link à l'import existant
        src = src.replace(
          /import\s*\{([^}]*)\}\s*from\s*['"]wouter['"];?/,
          (match, imports) => {
            const cleanImports = imports.trim();
            if (!cleanImports.includes('Link')) {
              return `import { ${cleanImports}, Link } from 'wouter';`;
            }
            return match;
          }
        );
      } else {
        // Ajouter un nouvel import
        src = `import { Link } from 'wouter';\n${src}`;
      }
    }
    
    // Convertir <a href="/..."> en <Link href="/...">
    src = src.replace(
      /<a\s+href="(\/[^"]+)"\s*([^>]*)>/g,
      '<Link href="$1" $2>'
    );
    
    // Convertir </a> en </Link>
    src = src.replace(/<\/a>/g, '</Link>');
    
    fs.writeFileSync(f, src, 'utf8');
    changed++;
    console.log('Updated links in', f);
  }
}

console.log('Done. Files changed:', changed);
