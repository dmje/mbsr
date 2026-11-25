# MBSR course site build

This folder holds the build that turns the Obsidian vault (`mbsr-course/`) into the static course website. The vault is the single source of truth: never edit anything in `site/README-adjacent output`; edit content in Obsidian.

## How it works

1. `site/build.mjs` walks `mbsr-course/`, skipping the excluded folders and files listed in the script.
2. Each markdown page keeps its YAML frontmatter (add `title:`, `summary:`, and optionally `audio: <filename.mp3>`). Frontmatter is stripped from the public HTML.
3. Obsidian syntax is converted:
   - `[[Some Page]]` and `[[Some Page|label]]` become ordinary internal links.
   - `![[Some Page]]` includes the target page's content inline.
   - `![[image.png|400]]` becomes an image tag (images live in `Images/`).
4. `Overall Structure.md` is the navigation source of truth. Tags like `## Week Three` and their `[[links]]` generate sidebar and homepage navigation. Adding a page to Overall Structure is how you put it on the site.
5. Output is a fully static site in `site/dist/`. No server, no database: the whole thing can be dropped onto SpaceFast as-is.

## Running locally

Requires Node 18+.

```bash
cd site
npm install
npm run build
npx serve dist   # or any static server
```

## Publishing

- **Prototype**: POST the files in `site/dist/` to `https://api.spacefast.com/v1/publish` as multipart (`files=@...`). Anonymous Spaces are view-session only and expire unless claimed: claim at https://my.spacefast.com/claim if it should persist.
- **Real space**: claim a Space, then `sf publish` from the desktop (see SpaceFast docs). Point a domain at the Space afterwards; if SpaceFast hosts the DNS zone, adding a subdomain is just an inventory action.

## Conventions for new content

- New pages go in the right week folder inside `Course Workbook/` (or at vault root for standalone pages).
- Add YAML frontmatter: `title:` (display title), optionally `summary:`, `audio:`, and for Mistral-authored drafts `author: Mistral` (used only for tracking, never rendered).
- Add the page to `Overall Structure.md` under the right week. A page not in Overall Structure does not appear in the nav (it still gets built and is reachable by link).
- Audio files do not live in git. Keep them in `mbsr-course/Audio/` locally (gitignored) and upload at publish time.
