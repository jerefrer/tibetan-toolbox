# Tibetan Toolbox

A public, neutral directory of free tools for people working with the Tibetan language and Tibetan Buddhist texts: translators, editors and practitioners. Live at <https://tibetantoolbox.org/>.

Maintained by [Frère Jérémy](https://frerejeremy.me). Every tool belongs to its author; this site only links to them.

## What is in it

- A home page with a search box and one tile per need.
- One page per need (type Tibetan, copy from PDFs, phonetics and IAST, dictionaries, converting old documents, pechas and layout, OCR, fonts, finding texts).
- `/all/`: every tool, with search and filters (works without JavaScript as a plain list).
- `/developers/`: libraries for developers.
- `/suggest/`: how to suggest a tool.

The "Type Tibetan" page includes a guide ported from the classical Tibetan course organised by Padmakara.

## Stack

[Eleventy](https://www.11ty.dev/) 3, Nunjucks templates, YAML data in `src/_data/`, plain CSS and a little vanilla JavaScript for search and filters. Light theme only. Deployed to GitHub Pages by `.github/workflows/deploy.yml`, on the custom domain tibetantoolbox.org (`src/CNAME`). Every internal link goes through Eleventy's `url` filter, so a path prefix can be set in `eleventy.config.js` if the site ever moves under one.

## Add a tool

Everything comes from one file: `src/_data/tools.yaml`. Add an entry:

```yaml
- id: my-tool                 # unique, lowercase
  name: My Tool
  url: https://example.org/my-tool/
  author: { name: Author or organisation, url: https://example.org/ }
  description: One or two sentences, only what the tool's own page says.
  needs: [phonetics-iast]     # ids from src/_data/needs.yaml
  platforms: [web, mac]       # web | mac | windows | ios | android (may be empty for libraries)
  free: true
  openSource: false
  developer: false            # true for libraries; they also appear on /developers/
  repo: https://github.com/...   # optional
  language: JavaScript           # libraries
  maintainer: jerefrer           # only for the maintainer's own tools
  teaser: "short note"           # optional: lists the library on the home page
```

Before adding a third-party tool, check that its URL answers with HTTP 200 and that the description matches what the page says. Needs (the topic pages) live in `src/_data/needs.yaml`; the typing guide's content is in `src/_data/typing.yaml`.

Suggestions from visitors arrive as GitHub issues (`.github/ISSUE_TEMPLATE/suggest-a-tool.yml`).

## Build

```bash
npm install
npm run build        # writes _site/
npm run check        # checks internal links and fragments in _site/
npm start            # dev server
```


## Files copied from the course site

`src/downloads/` holds the Jomolhari font (SIL Open Font License, licence file included, by Chris Fynn via Google Fonts) and the Wylie cheat sheet PDF.
