# Wajid Khan — AI Product Portfolio

A responsive portfolio with an interactive 3D system visual, detailed project stories, an expertise explorer, and email and LinkedIn contact links.

## Run locally

```sh
python3 -m http.server 8080
```

Open http://www.wajids.co.uk

## Hosting

- Branch: `main`
- Framework: none / static HTML
- Build command: none
- Publish directory: `.` (repository root)

Connect this repository to a static host, or upload `index.html`, `style.css` and `app.js` together. No package installation, backend, API keys or environment variables are required.

## Files

- `index.html`: page structure, profile, outcomes and contact links.
- `style.css`: typography, colours, layout and responsive styles.
- `app.js`: 3D canvas visual, project details, expertise panels, tabs and dialogs.

Fonts load from Google Fonts with local fallbacks. The 3D visual uses projected 3D coordinates on Canvas with no external JavaScript dependencies. It supports reduced-motion preferences and a pause control.

## Validation

JavaScript syntax and checks for section anchors, unique IDs, contact links and all nine detail panels passed. Visual browser testing is still pending.
