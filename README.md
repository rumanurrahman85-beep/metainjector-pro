# MetaInjector Pro — Professional SVG Metadata Studio

**Single + Batch Upload | AI + Rule Hybrid | ZIP Export | Dark Neon Theme**

A professional-grade SVG metadata injector with a sleek dark/neon interface. Upload one or many SVG files, generate SEO-optimized metadata with AI (Gemini) or offline rules, and download individually or as a ZIP batch.

## Features

| Feature | Description |
|---------|-------------|
| **Single Upload** | Upload one SVG, edit metadata, download |
| **Batch Upload** | Upload multiple SVGs, process all at once, download as ZIP |
| **AI Mode** | Gemini 3.1 Flash-Lite API analyzes images for human-like metadata |
| **Rule Mode** | Offline filename analysis + keyword database. No API needed |
| **Auto-Fallback** | If AI fails, instantly switches to Rule Mode |
| **ZIP Export** | Download all processed files + CSV summary in one ZIP |
| **Live Preview** | See the exact XML metadata before downloading |
| **Platform Optimized** | Shutterstock, Adobe Stock, Freepik, Getty, Dreamstime, Alamy, Vecteezy |
| **Dark Neon Theme** | Professional black/cyan/purple gradient design |

## Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0f` | Deep black |
| Card | `#1a1a25` | Dark gray |
| Cyan | `#00f0ff` | Primary accent, buttons |
| Purple | `#b829f7` | Secondary accent |
| Green | `#00ff88` | Success states |
| Pink | `#ff2d7d` | Error states |
| Orange | `#ffaa00` | Warning states |

## Files

| File | Purpose |
|------|---------|
| `index.html` | UI with embedded CSS |
| `app.js` | Engine (AI + Rules + Injection + ZIP) |
| `README.md` | This file |

## Deploy to GitHub Pages

1. Create new repo: `metainjector-pro`
2. Upload these 3 files
3. Settings → Pages → Deploy from branch `main` → **Click Save**
4. Wait 1-2 minutes
5. Visit: `https://yourusername.github.io/metainjector-pro/`

## Local Use (No Server Needed)

Simply double-click `index.html` — it works in any browser without a server.

## Get Free Gemini API Key

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in → Create API Key
3. Paste into the app
4. Free: 1,500 requests/day

## Workflow

```
Upload (Single or Batch)
    |
    v
AI Mode (Gemini) ──fails?──> Rule Mode (Offline)
    |                                |
    v                                v
Edit Metadata (per file)      Edit Metadata (per file)
    |                                |
    +------------+------------+
                 |
    Single: Download file
    Batch:  Download ZIP with all files + CSV
```

## License

MIT — Free for personal and commercial use.
