import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const manifestPath = join(root, 'public', 'build', 'manifest.json');

function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let n = bytes;
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i += 1;
    }
    return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

let manifestRaw;
try {
    manifestRaw = readFileSync(manifestPath, 'utf8');
} catch {
    console.error(
        `No se encontró \`${manifestPath}\`. Ejecuta \`npm run build:frontend\` primero.`,
    );
    process.exit(1);
}

/** @type {Record<string, any>} */
const manifest = JSON.parse(manifestRaw);

/** @type {{ key: string; file: string; size: number; isEntry: boolean; imports: string[] }} */
const entries = [];

for (const [key, value] of Object.entries(manifest)) {
    if (value == null || typeof value !== 'object') continue;
    const file = value.file;
    if (typeof file !== 'string') continue;

    const abs = join(root, 'public', 'build', file);
    let size = 0;
    try {
        size = statSync(abs).size;
    } catch {
        // Some entries reference CSS or assets that may not exist the same way
        // depending on build mode; ignore missing.
        continue;
    }

    entries.push({
        key,
        file,
        size,
        isEntry: value.isEntry === true,
        imports: Array.isArray(value.imports) ? value.imports : [],
    });
}

entries.sort((a, b) => b.size - a.size);

console.log('\n### Bundle: top 20 archivos por tamaño (build output)');
for (const e of entries.slice(0, 20)) {
    console.log(
        `- ${formatBytes(e.size).padStart(10)}  ${e.file}${
            e.isEntry ? '  (entry)' : ''
        }`,
    );
}

const target = entries.find((e) => e.file.includes('user-menu-trigger-content'));
if (target) {
    console.log('\n### Chunk sospechoso: user-menu-trigger-content');
    console.log(`- file: ${target.file}`);
    console.log(`- size: ${formatBytes(target.size)}`);
    if (target.imports.length > 0) {
        console.log('- imports (desde manifest):');
        for (const i of target.imports) console.log(`  - ${i}`);
    } else {
        console.log('- imports (desde manifest): (none)');
    }

    const importers = entries.filter((e) => e.imports.includes(target.file));
    if (importers.length > 0) {
        console.log('- imported by:');
        for (const imp of importers) console.log(`  - ${imp.file}`);
    }
} else {
    console.log(
        '\n### Nota\nNo encontré ningún chunk con "user-menu-trigger-content" en el nombre en este build.',
    );
}

