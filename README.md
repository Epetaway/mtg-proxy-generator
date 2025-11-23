
# TCG Portfolio App

A full-featured TCG collection, pricing, and proxy generator app based on the original MTG Proxy Generator.

## Features
- MTG proxy generator (Scryfall-powered)
- Collection management (add, edit, delete, filter)
- Pricing integration (Scryfall, future TCGplayer/eBay ready)
- CSV export (generic & Card Kingdom)
- DEMO vs PERSONAL mode (data separation)
- Progressive Web App (PWA) for Android installability

## Getting Started
1. **Clone the repo**
2. **Install dependencies**
	```sh
	cd client && npm install
	cd ../server && npm install
	```
3. **Run in DEMO mode** (default)
	```sh
	cd client && npm run dev
	cd ../server && npm run dev
	```
4. **Switch to PERSONAL mode**
	- Edit `client/.env` and set `VITE_APP_MODE=PERSONAL`
	- PERSONAL data is stored in `local_collection` (never committed)

## PWA & Mobile
- The app is installable as a PWA on Android and desktop (Add to Home Screen).
- Works offline for viewing collection and proxy generator (when assets are cached).

## Deployment
- Frontend can be deployed to GitHub Pages or similar for demo mode.
- Backend runs locally for personal mode.

## Data Safety
- Demo/sample data only in repo and demo mode.
- Personal data is never committed or pushed.

## Future: Native Android Client
- API endpoints are mobile-client ready for future React Native/Android integration.

---
For full details, see the master prompt and docs in each folder.
