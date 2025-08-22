import fs from 'fs';
import path from 'path';

const exts = new Set(['.css','.scss','.sass','.less','.pcss','.styl','.js','.jsx','.ts','.tsx','.html','.htm','.svg','.vue','.svelte','.astro']);
const excludeDirs = new Set(['node_modules','dist','build','.next','.turbo','.vercel','coverage','storybook-static','vendor','snapshots','.git']);

const mapIndex = process.argv.indexOf('--map');
if (mapIndex === -1) {
  console.error('Usage: node scripts/onenew-color-codemod.mjs --map <mapping.csv>');
  process.exit(1);
}
const mapFile = process.argv[mapIndex + 1];
const mapping = {};
fs.readFileSync(mapFile, 'utf8').split(/\r?\n/).slice(1).forEach(line => {
  if (!line.trim()) return;
  const [hex, token] = line.split(',');
  if (hex && token) mapping[hex.trim().toLowerCase()] = token.trim();
});

function walk(dir, files=[]) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.isDirectory()) {
      if (excludeDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name), files);
    } else {
      if (exts.has(path.extname(entry.name))) files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function replaceAll(content, hex, token) {
  const base = hex.toLowerCase().replace('#','');
  const tokenName = token.match(/--[^)]+/)[0];
  const simple = new RegExp(`#${base}(?![0-9A-Fa-f])`, 'gi');
  content = content.replace(simple, token);

  const tw = new RegExp(`\[#${base}\]`, 'gi');
  content = content.replace(tw, `[${token}]`);

  const alpha = new RegExp(`#${base}([0-9A-Fa-f]{2})`, 'gi');
  content = content.replace(alpha, (_,a) => {
    const alphaDec = (parseInt(a,16)/255).toFixed(2).replace(/\.0+$/,'');
    return `rgb(var(${tokenName}-rgb) / ${alphaDec})`;
  });

  const twAlpha = new RegExp("\\[#"+base+"([0-9A-Fa-f]{2})\\]", 'gi');
  content = content.replace(twAlpha, (_,a) => {
    const alphaDec = (parseInt(a,16)/255).toFixed(2).replace(/\.0+$/,'');
    return `[rgb(var(${tokenName}-rgb) / ${alphaDec})]`;
  });

  return content;
}

const root = path.resolve('frontend/src');
const files = walk(root);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [hex, token] of Object.entries(mapping)) {
    content = replaceAll(content, hex, token);
  }
  if (content !== orig) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, content);
  }
}
