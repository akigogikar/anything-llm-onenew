import fs from 'fs';
import path from 'path';

const exts = new Set(['.css','.scss','.sass','.less','.pcss','.styl','.js','.jsx','.ts','.tsx','.html','.htm','.svg','.vue','.svelte','.astro']);
const excludeDirs = new Set(['node_modules','dist','build','.next','.turbo','.vercel','coverage','storybook-static','vendor','snapshots','.git']);

const tokenColors = {
  '--brand-primary':'#8A63F7',
  '--brand-secondary':'#39C8F0',
  '--brand-accent':'#A48CFF',
  '--bg':'#F8FAFF',
  '--fg':'#101828',
  '--surface':'#FFFFFF',
  '--border':'#E5E7EB',
  '--muted':'#EDF2FF',
  '--muted-fg':'#475467',
  '--success':'#10B981',
  '--warning':'#F59E0B',
  '--error':'#EF4444'
};

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

function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex.slice(0,6),16);
  return [(num>>16)&255,(num>>8)&255,num&255];
}

function nearestToken(hex) {
  const [r,g,b] = hexToRgb(hex);
  let min = Infinity, token = '';
  for (const [t,hx] of Object.entries(tokenColors)) {
    const [r2,g2,b2] = hexToRgb(hx);
    const dist = (r-r2)**2 + (g-g2)**2 + (b-b2)**2;
    if (dist < min) { min = dist; token = t; }
  }
  return token;
}

function guessUsage(line) {
  if (/bg-|background/i.test(line)) return 'background';
  if (/text-|color/i.test(line)) return 'text';
  if (/border/i.test(line)) return 'border';
  if (/shadow/i.test(line)) return 'shadow';
  return '';
}

const root = path.resolve('frontend/src');
const files = walk(root);

const colorRegex = /#([0-9A-Fa-f]{3,8})(?![0-9A-Za-z_])/g;
const tailwindRegex = /\[#([0-9A-Fa-f]{3,8})\]/g;

const rows = [['hex','file','line','context','usage_guess','suggested_token']];
const unique = new Map();

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const lines = fs.readFileSync(file,'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    let m;
    colorRegex.lastIndex = 0;
    while ((m = colorRegex.exec(line))) {
      const hex = ('#'+m[1]).toLowerCase();
      const token = nearestToken(hex);
      const context = line.trim();
      const guess = guessUsage(line);
      rows.push([hex, rel, idx+1, context.replace(/,/g,';'), guess, token]);
      unique.set(hex, token);
    }
    tailwindRegex.lastIndex = 0;
    while ((m = tailwindRegex.exec(line))) {
      const hex = ('#'+m[1]).toLowerCase();
      const token = nearestToken(hex);
      const context = line.trim();
      const guess = guessUsage(line);
      rows.push([hex, rel, idx+1, context.replace(/,/g,';'), guess, token]);
      unique.set(hex, token);
    }
  });
}

fs.writeFileSync('color-audit.csv', rows.map(r=>r.join(',')).join('\n'));
fs.writeFileSync('unique-hexes.csv', ['hex,suggested_token', ...Array.from(unique.entries()).map(([h,t])=>`${h},${t}`)].join('\n'));
