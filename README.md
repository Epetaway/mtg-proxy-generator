# MTG Proxy Generator (Search-Enabled)

Build custom MTG proxy galleries by searching for cards via the free [Scryfall API](https://scryfall.com). This tool helps proxy users preview and compile cards into a printable format using realistic dimensions.

## ✨ Features
- 🔍 Live card search using Scryfall
- 🎴 Click-to-add cards to a printable gallery
- 🖼️ Card display set to 2.5" x 3.5" (real-world MTG dimensions)
- ⚙️ Built with HTML, CSS, and jQuery (no backend required)

## 🚀 Getting Started

1. Clone the repo:

```bash
git clone https://github.com/your-username/mtg-proxy-generator.git
cd mtg-proxy-generator

---

## Deploy on GitHub Pages

This is a static site (no build step). Two options:

### Option A — with GitHub Actions (recommended)
1. Push to a repo (default branch `main`).
2. Ensure the included workflow `.github/workflows/pages.yml` exists on `main`.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Push to `main` again (or rerun the workflow).

### Option B — without Actions
1. In **Settings → Pages**, set **Source** to **Deploy from a branch**.
2. Choose branch `main` and folder `/root`.
3. Save. Pages will serve from `https://<you>.github.io/<repo>/`.

> Paths are relative (`./main.js`), so both project pages and user pages will work without extra config.
