# Wajid Khan — AI Product Portfolio

Live: https://wajids.co.uk/

Four destinations: Product, AI, Projects and Contact. The homepage uses native scroll and CSS 3D transforms to move between spatial chapters. Titles are real HTML links. Dedicated pages and case studies are generated as complete static HTML, so direct URLs, refresh and browser history work without a client router.

## Build and preview

Requires Node.js 22 or later. No packages, backend, API keys or environment variables are needed.

```sh
node scripts/build.mjs
node scripts/check.mjs
python3 -m http.server 8080 --directory _site
```

Open http://localhost:8080. Edit content in `scripts/build.mjs`, styles in `style.css` and homepage interactions in `app.js`. `assets/` contains actual interface captures, a labelled architecture diagram and site identity assets.

## Accessibility

Native scrolling supports touch. The homepage provides chapter buttons, permanent destination links and keyboard chapter navigation with arrow keys, Page Up/Down, Home and End. All links support visible keyboard focus. Inactive spatial chapters are inert. Simple view exposes all four chapters in document order and is the default for reduced motion. Without JavaScript, the same complete list remains usable. CSS 3D has no WebGL dependency; unsupported perspective falls back to simple view.

## Hosting

The existing repository and custom domain are retained. `.github/workflows/deploy.yml` builds `_site/` with the dependency-free generator, then uploads that entire directory to GitHub Pages. The build copies `CNAME`, `.nojekyll`, styles, scripts and all public assets. It generates every destination, case study, custom 404, sitemap and robots file. Source code, project review checkouts, dependencies and test artifacts are excluded from the artifact.

`CNAME` remains `wajids.co.uk`. DNS changes are not required. GitHub Pages should use **GitHub Actions** as its source to avoid competing branch and workflow deployments.

## Project evidence

Reviewed 3 November 2026:

| Project             | Source                                     | Portfolio treatment                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI Red Team Tool    | `ai-redteam-competition-tool` at `f18bcc5` | Actual local interface; TypeScript check passed. Model evaluation requires configured services and credentials; no end-to-end model results claimed.                                                                                       |
| Monster Manor       | `monster-manor` at `e56455f`               | Actual local interface and solo game; rule suite checked. Public deployment and player capacity remain unverified.                                                                                                                         |
| Team Quiz Game      | `quiz-red-ready` at `29d647d`              | Actual local instructions and player-entry captures; Vite build and TypeScript check passed. Full Firebase multiplayer and earned-reward flows remain unverified. The hosted demo differs from this checkout, so no Play link is included. |
| Luma API Playground | `lumalabstest` at `720ab58`                | Labelled architecture diagram. The server references a missing `public/index.html`; no demo link or generated result claimed.                                                                                                              |

Team Quiz Game verification also exercised the original question component in isolation: answer submission, field locking, the twelve-second timer and its next-question signal passed. The host interface was rendered with database traffic blocked; no live game session was created. The local scratch library request was blocked, so scratch interaction was not verified. The hosted URL listed by the repository loads, but its session-entry controls differ and `/instructions` shows its not-found view.

Monster Manor captures depict the existing game. Its assets retain their original licences; see [ASSETS.md](https://github.com/Waaajid/monster-manor/blob/main/convent/ASSETS.md). No model, sound or original project asset bundle is redistributed here. No host credentials or private host URLs are included.

The portfolio has no contact form or analytics. Contact links open email, LinkedIn and GitHub. Manrope is requested from Google Fonts with a system fallback.
