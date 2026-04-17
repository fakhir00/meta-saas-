const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/**/*.js');
let allCss = '';

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract <style jsx>{`...`}</style> blocks
  const styleRegex = /<style jsx>\{`([\s\S]*?)`\}<\/style>/g;
  let match;
  let newContent = content;
  let hasStyles = false;
  
  while ((match = styleRegex.exec(content)) !== null) {
    hasStyles = true;
    allCss += `\n/* Styles from ${file} */\n` + match[1];
    // Remove the style block and any immediately preceding comment
    newContent = newContent.replace(/\{\/\*\s*═══\s*STYLES\s*═══\s*\*\/\}\s*/g, '');
    newContent = newContent.replace(match[0], '');
  }
  
  if (hasStyles) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Extracted styles from ${file}`);
  }
});

// Append to globals.css
const globalsPath = 'app/globals.css';
let globalsContent = fs.readFileSync(globalsPath, 'utf8');
globalsContent += '\n\n/* ═════ EXTRACTED COMPONENT STYLES ═════ */\n' + allCss;
fs.writeFileSync(globalsPath, globalsContent, 'utf8');

console.log('Appended all styles to globals.css');
