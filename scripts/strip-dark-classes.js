const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getAllFiles(dir, exts) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllFiles(fullPath, exts));
        } else if (exts.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

const files = getAllFiles(srcDir, ['.tsx', '.ts', '.css']);

// This regex matches dark: prefixed Tailwind classes including:
// dark:bg-slate-900, dark:bg-[rgba(15,23,42,0.8)], dark:hover:bg-slate-700, dark:border-b, etc.
// It also captures the preceding whitespace so we remove the gap cleanly.
const darkClassRegex = /\s*dark:[a-zA-Z0-9_\-\[\]\/\(\)\.\,\:\#\%\!]+/g;

let totalCleaned = 0;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(darkClassRegex, '');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        totalCleaned++;
        console.log('Cleaned:', path.relative(srcDir, file));
    }
}

console.log(`\nDone. Cleaned ${totalCleaned} files.`);
