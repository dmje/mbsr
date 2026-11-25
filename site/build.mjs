import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';

const VAULT = path.resolve(process.cwd(), '..', 'mbsr-course');
const OUT = path.resolve(process.cwd(), 'dist');

const EXCLUDE_DIRS = new Set(['.obsidian', '.trash', 'Exports', 'Useful', 'Misc Notes', "Teachers Notes", 'Audio']);
const EXCLUDE_FILES = new Set(['To Do.md', 'Cheat sheet.md', 'Test Compile.md', 'Mistral Edits.md', 'Full Workbook.md', 'Test canvas.canvas', 'Experience.md']);

const USEFUL_DIR = path.join(VAULT, 'Useful');

marked.setOptions({ gfm: true, breaks: false });

function walk(dir, base = '') {
  const entries = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) {
      if (EXCLUDE_DIRS.has(name.name)) continue;
      entries.push(...walk(path.join(dir, name.name), base ? base + '/' + name.name : name.name));
    } else if (name.name.endsWith('.md')) {
      if (EXCLUDE_FILES.has(name.name)) continue;
      entries.push({ abs: path.join(dir, name.name), base, name: name.name });
    }
  }
  return entries;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: text };
  let fm = {};
  try { fm = yaml.load(m[1]) || {}; } catch (e) { fm = {}; }
  return { fm, body: text.slice(m[0].length) };
}

// Index pages by exact basename (Obsidian link target) and by vault-relative path.
const pages = new Map();   // basename -> page
const byPath = new Map();  // vault-relative .md path -> page
const allPages = [];

for (const entry of walk(VAULT)) {
  const raw = fs.readFileSync(entry.abs, 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const relPath = entry.base ? entry.base + '/' + entry.name : entry.name;
  const page = {
    name: entry.name.replace(/\.md$/, ''),
    relPath,
    url: null,
    fm,
    body,
    abs: entry.abs,
  };
  allPages.push(page);
  pages.set(page.name, page);
  byPath.set(relPath, page);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function urlForTarget(target) {
  const p = pages.get(target);
  if (p) return p.url;
  return null;
}

// Convert Obsidian embeds and links to HTML, then markdown to HTML.
function renderPage(page, depthChain = new Set()) {
  if (page.html !== undefined) return page.html;
  let body = page.body;

  // Embeds: ![[Page]] or ![[Page| anything]]
  body = body.replace(/!\[\[([^\]]+)\]\]/g, (whole, inner) => {
    const target = inner.split('|')[0].trim();
    // Image embeds
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(target)) {
      const width = inner.includes('|') ? inner.split('|')[1].trim() : '';
      const w = width && /^\d+$/.test(width) ? ` width="${width}"` : '';
      return `<img src="/assets/${target.replace(/\|.*$/, '')}" alt="${target}"${w}>`;
    }
    const p = pages.get(target);
    if (p && !depthChain.has(target)) {
      depthChain = new Set([...depthChain, target]);
      return renderPage(p, depthChain);
    }
    return '';
  });

  // Internal links: [[Page]] or [[Page|label]]
  body = body.replace(/\[\[([^\]]+)\]\]/g, (whole, inner) => {
    const [target, label] = inner.split('|').map(s => s.trim());
    const url = urlForTarget(target);
    if (url) return `<a href="${url}">${label || target}</a>`;
    return label || target;
  });

  page.html = marked.parse(body);
  return page.html;
}

// Assign URLs
for (const p of allPages) {
  p.url = '/' + slugify(p.name);
}

// Navigation source of truth: Overall Structure.md
const overall = allPages.find(p => p.name === 'Overall Structure');
const nav = [];
if (overall) {
  const lines = overall.body.split('\n');
  let current = null;
  for (const line of lines) {
    const h = line.match(/^##+\s+(.*)$/);
    if (h) {
      current = { title: h[1].trim(), items: [] };
      nav.push(current);
      continue;
    }
    const li = line.match(/^\s*-\s+\[\[([^\]]+)\]\]/);
    if (li && current) {
      const target = li[1].split('|')[0].trim();
      const p = pages.get(target);
      if (p) current.items.push({ title: target, url: p.url, summary: p.fm.summary || '' });
    }
  }
}

const css = `
:root { --ink:#2c2a28; --paper:#faf8f4; --accent:#4a6fa5; --rule:#e5e0d8; }
* { box-sizing:border-box; }
body { margin:0; font-family:Georgia,'Iowan Old Style',serif; color:var(--ink); background:var(--paper); line-height:1.65; }
header.site { padding:1rem 1.5rem; border-bottom:3px double var(--rule); }
header.site h1 { margin:0; font-size:1.25rem; font-weight:normal; letter-spacing:.04em; }
header.site p { margin:.2rem 0 0; font-size:.85rem; opacity:.7; }
main { display:flex; gap:3rem; max-width:76rem; margin:0 auto; padding:2rem 1.5rem; }
nav.site { flex:0 0 15rem; font-size:.9rem; }
nav.site h3 { font-size:.75rem; text-transform:uppercase; letter-spacing:.08em; opacity:.55; margin:1.2rem 0 .3rem; }
nav.site ul { list-style:none; margin:0; padding:0; }
nav.site a { text-decoration:none; color:var(--ink); display:block; padding:.15rem 0; }
nav.site a:hover { color:var(--accent); }
article { flex:1; max-width:38rem; }
article h1 { font-weight:normal; line-height:1.2; margin-top:0; }
article h2 { margin-top:2.2rem; font-weight:600; font-size:1.15rem; }
article img { max-width:100%; height:auto; }
article blockquote { border-left:3px solid var(--rule); margin:1.5rem 0; padding:.2rem 0 .2rem 1.2rem; color:#5a5550; font-style:italic; }
article table { border-collapse:collapse; width:100%; margin:1.2rem 0; font-size:.92rem; }
article th, article td { border:1px solid var(--rule); padding:.45rem .6rem; text-align:left; }
article th { background:#f1ede6; font-weight:600; }
audio { width:100%; margin:1rem 0; }
footer { border-top:1px solid var(--rule); margin-top:3rem; padding-top:1rem; font-size:.8rem; opacity:.6; }
@media (max-width:55rem) { main { flex-direction:column; gap:1rem; } nav.site { flex:none; } }
`;

function pageHtml(title, contentHtml, activeUrl) {
  const navHtml = nav.map(section => {
    const lis = section.items.map(i => `<li><a href="${i.url}"${i.url === activeUrl ? ' class="active"' : ''}>${i.title}</a></li>`).join('');
    return \`<h3>${section.title}</h3><ul>${lis}</ul>\`;
  }).join('');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${page.metaSummary ? \`<meta name="description" content="${page.metaSummary}">\` : ''}
<style>${css}</style>
</head>
<body>
<header class="site"><h1>An eight-week mindfulness course</h1><p>Based on the curriculum of Jon Kabat-Zinn</p></header>
<main>
<nav class="site">${navHtml}</nav>
<article>
${contentHtml}
<footer>An eight-week mindfulness course. Based on the MBSR curriculum developed by Jon Kabat-Zinn at the University of Massachusetts Medical School. This course is not provided by, or endorsed by, UMass.</footer>
</article>
</main>
</body>
</html>`;
}

// Build all pages
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

// Copy images
const imagesDir = path.join(VAULT, 'Images');
if (fs.existsSync(imagesDir)) {
  for (const f of fs.readdirSync(imagesDir)) {
    fs.copyFileSync(path.join(imagesDir, f), path.join(OUT, 'assets', f));
  }
}
// Copy audio if present locally (gitignored convention)
const audioDir = path.join(VAULT, 'Audio');
if (fs.existsSync(audioDir)) {
  for (const f of fs.readdirSync(audioDir)) {
    fs.copyFileSync(path.join(audioDir, f), path.join(OUT, 'assets', f));
  }
}

for (const page of allPages) {
  if (page.name === 'Overall Structure') continue;
  let content = renderPage(page);
  // Audio player
  if (page.fm.audio) {
    const audioTag = \`<figure><figcaption>Guided practice recording</figcaption><audio controls src="/assets/${page.fm.audio}"></audio></figure>\`;
    content = audioTag + content;
  }
  const title = page.fm.title || page.name;
  const metaSummary = page.fm.summary || '';
  const html = pageHtml(title, content, page.url, metaSummary);
  const file = path.join(OUT, page.url.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// Homepage: hero + nav
const homeSections = nav.map(s => \`<h2>${s.title}</h2><ul>${s.items.map(i => \`<li><a href="${i.url}">${i.title}</a>\${i.summary ? ' <span>' + i.summary + '</span>' : ''}</li>\`).join('')}</ul>\`).join('');
const homeHtml = pageHtml('An eight-week mindfulness course', \`
<p>An eight-week course in mindfulness-based stress reduction: weekly themes, guided practices, and home practice notes. Work through it at your own pace.</p>
<p><a href="/is-this-course-right-for-me">Before you begin, read this.</a></p>
${homeSections}
\`, '/');
fs.writeFileSync(path.join(OUT, 'index.html'), homeHtml);

console.log(\`Built ${allPages.length - 1} pages + index into ${OUT}\`);
