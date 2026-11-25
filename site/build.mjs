import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';

const VAULT = path.resolve(process.cwd(), '..', 'mbsr-course');
const OUT = path.resolve(process.cwd(), 'dist');

const EXCLUDE_DIRS = new Set(['.obsidian', '.trash', 'Exports', 'Useful', 'Misc Notes', 'Teachers Notes', 'Audio']);
const EXCLUDE_FILES = new Set(['To Do.md', 'Cheat sheet.md', 'Test Compile.md', 'Mistral Edits.md', 'Full Workbook.md', 'Experience.md']);

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
  try { fm = yaml.load(m[1]) || {}; } catch { fm = {}; }
  return { fm, body: text.slice(m[0].length) };
}

const pages = new Map();
const allPages = [];

for (const entry of walk(VAULT)) {
  const raw = fs.readFileSync(entry.abs, 'utf8');
  const { fm, body } = parseFrontmatter(raw);
  const page = {
    name: entry.name.replace(/\.md$/, ''),
    fm,
    body,
  };
  allPages.push(page);
  pages.set(page.name, page);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

for (const p of allPages) p.url = '/' + slugify(p.name);

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function renderMarkdown(page, depthChain = new Set()) {
  let body = page.body;
  const tokens = [];
  const stash = (html) => {
    const token = `@@HTML${tokens.length}@@`;
    tokens.push(html);
    return token;
  };
  const restore = (html) =>
    html.replace(/@@HTML(\d+)@@/g, (whole, idx) => tokens[Number(idx)] ?? '');

  // Embeds first: ![[Page]], ![[image.png]]
  body = body.replace(/!\[\[([^\]]+)\]\]/g, (whole, inner) => {
    const target = inner.split('|')[0].trim();
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(target)) {
      const width = inner.includes('|') ? inner.split('|')[1].trim() : '';
      const w = /^\d+$/.test(width) ? ` width="${width}"` : '';
      return stash(`<img src="/assets/${target}" alt="${esc(target)}"${w}>`);
    }
    const p = pages.get(target);
    if (p && !depthChain.has(target)) {
      const chain = new Set([...depthChain, target]);
      return stash(renderMarkdown(p, chain));
    }
    return stash('');
  });

  // Internal links: [[Page]] or [[Page|label]]
  body = body.replace(/\[\[([^\]]+)\]\]/g, (whole, inner) => {
    const [target, label] = inner.split('|').map(s => s.trim());
    const p = pages.get(target);
    if (p) return stash(`<a href="${p.url}">${esc(label || target)}</a>`);
    return esc(label || target);
  });

  return restore(marked.parse(body));
}

// Navigation from Overall Structure.md
const overall = allPages.find(p => p.name === 'Overall Structure');
const nav = [];
if (overall) {
  let current = null;
  for (const line of overall.body.split('\n')) {
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
nav.site h3 { font-size:.75rem; text-transform:uppercase; letter-spacing:.08em; opacity:.55; margin:1.2rem 0 .3rem; font-weight:600; }
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
figure figcaption { font-size:.85rem; opacity:.7; }
footer { border-top:1px solid var(--rule); margin-top:3rem; padding-top:1rem; font-size:.8rem; opacity:.6; }
@media (max-width:55rem) { main { flex-direction:column; gap:1rem; } nav.site { flex:none; } }
`;

function pageHtml(title, contentHtml, activeUrl, metaSummary) {
  const navHtml = nav.map(section => {
    const lis = section.items
      .map(i => `<li><a href="${i.url}">${esc(i.title)}</a></li>`)
      .join('');
    return `<h3>${esc(section.title)}</h3><ul>${lis}</ul>`;
  }).join('');
  const meta = metaSummary ? `<meta name="description" content="${esc(metaSummary)}">` : '';
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${meta}
<style>${css}</style>
</head>
<body>
<header class="site"><h1>An eight-week mindfulness course</h1><p>Based on the curriculum of Jon Kabat-Zinn</p></header>
<main>
<nav class="site">${navHtml}</nav>
<article>
${contentHtml}
<footer>An eight-week mindfulness course, based on the MBSR curriculum developed by Jon Kabat-Zinn at the University of Massachusetts Medical School. Not provided by, or endorsed by, UMass.</footer>
</article>
</main>
</body>
</html>`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

for (const dir of ['Images', 'Audio']) {
  const src = path.join(VAULT, dir);
  if (fs.existsSync(src)) {
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(OUT, 'assets', f));
    }
  }
}

let count = 0;
for (const page of allPages) {
  if (page.name === 'Overall Structure') continue;
  let content = renderMarkdown(page);
  if (page.fm.audio) {
    content = `<figure><figcaption>Guided practice recording</figcaption><audio controls src="/assets/${esc(page.fm.audio)}"></audio></figure>` + content;
  }
  const title = page.fm.title || page.name;
  const html = pageHtml(title, content, page.url, page.fm.summary || '');
  const file = path.join(OUT, page.url.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  count++;
}

const homeSections = nav.map(s =>
  `<h2>${esc(s.title)}</h2><ul>${s.items.map(i =>
    `<li><a href="${i.url}">${esc(i.title)}</a>${i.summary ? ' <span>' + esc(i.summary) + '</span>' : ''}</li>`
  ).join('')}</ul>`
).join('');
const homeHtml = pageHtml(
  'An eight-week mindfulness course',
  `<p>An eight-week course in mindfulness-based stress reduction: weekly themes, guided practices, and home practice notes. Work through it at your own pace.</p>
<p><a href="/is-this-course-right-for-me">Before you begin, read this.</a></p>
${homeSections}`,
  '/'
);
fs.writeFileSync(path.join(OUT, 'index.html'), homeHtml);
console.log(`Built ${count} pages + index into ${OUT}`);
