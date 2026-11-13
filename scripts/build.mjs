import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
const origin = "https://wajids.co.uk";
const agentPages = [];
const cssVersion = createHash("sha1").update(readFileSync(path.join(root, "style.css"))).digest("hex").slice(0, 8);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const destinations = [
  ["Product", "/product/"],
  ["AI", "/ai/"],
  ["Projects", "/projects/"],
  ["Contact", "/contact/"],
];
const arrow = '<span aria-hidden="true">↗</span>';
const link = (url, text, cls = "text-link") =>
  `<a class="${cls}" href="${url}"${url.startsWith("https:") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text} ${arrow}</a>`;
const header = (active = "") =>
  `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="Wajid Khan home">Wajid Khan<span>.</span></a><nav aria-label="Main navigation">${destinations.map(([label, url]) => `<a href="${url}"${label === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav></header>`;
const footer = () =>
  `<footer class="site-footer"><a href="/" class="footer-name">Wajid Khan<span>AI Product Manager · London</span></a><p>Good questions. Thoughtful systems.</p><a href="mailto:wajithkhan05@gmail.com">Say hello ${arrow}</a></footer>`;
const head = (title, description, url) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#F5F3ED"><title>${title} — Wajid Khan</title><meta name="description" content="${description}"><link rel="canonical" href="https://wajids.co.uk${url}"><link rel="describedby" href="/llms.txt">${url.endsWith("/") ? `<link rel="alternate" type="text/markdown" href="${url}index.md" title="${title} in Markdown">` : ""}<meta property="og:title" content="${title} — Wajid Khan"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:url" content="https://wajids.co.uk${url}"><meta property="og:image" content="https://wajids.co.uk/assets/social.png"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet"><link rel="stylesheet" href="/style.css?v=${cssVersion}"><script src="/app.js" defer></script></head>`;

// Generate agent-readable text from the same content as the human pages.
function toMarkdown(html) {
  return html
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/g, "")
    .replace(/<div class="page-context">[\s\S]*?<\/div>/g, "")
    .replace(/<span aria-hidden="true">[\s\S]*?<\/span>/g, "")
    .replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/g, (_, alt) =>
      alt ? `\n\nInterface image: ${alt}\n\n` : "",
    )
    .replace(
      /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g,
      (_, level, text) => `\n\n${"#".repeat(Number(level))} ${text}\n\n`,
    )
    .replace(
      /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
      (_, href, text) =>
        `[${text.trim()}](${href.startsWith("/") ? origin + href : href})`,
    )
    .replace(/<br\s*\/?\s*>/g, " ")
    .replace(/<\/(?:span|strong|b)>/g, " ")
    .replace(/<\/(?:p|div|section|article|figure|figcaption|main)>/g, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
async function page(url, title, description, content, active = "", cls = "") {
  const location =
    url === "/"
      ? "index.html"
      : url === "/404.html"
        ? "404.html"
        : `${url.slice(1)}index.html`;
  await mkdir(path.dirname(path.join(out, location)), { recursive: true });
  await writeFile(
    path.join(out, location),
    `${head(title, description, url)}<body class="${cls}">${header(active)}${content}${cls === "home" ? "" : footer()}</body></html>`,
  );
  if (url.endsWith("/")) {
    const text = toMarkdown(content);
    const markdown = `${text.startsWith("# ") ? text : `# ${title} — Wajid Khan\n\n${text}`}\n\nCanonical page: ${origin}${url}\n`;
    await writeFile(path.join(out, `${url.slice(1)}index.md`), markdown);
    agentPages.push({ title, url, markdown });
  }
}
const hero = (n, title, headline, intro) =>
  `<section class="page-hero"><div class="page-context"><a href="/">Home</a><span>0${n} / ${title}</span></div><h1>${headline}</h1><p class="page-lead">${intro}</p></section>`;
const row = (n, title, text, question) =>
  `<article class="decision-row"><span class="row-number">${n}</span><h3>${title}</h3><div><p>${text}</p><p class="decision-question">${question}</p></div></article>`;
await page(
  "/product/",
  "Product",
  "How Wajid Khan approaches discovery, prioritisation, delivery and product decisions with engineering.",
  `<main id="main" class="content-main">${hero(1, "Product", "Find the problem.<br>Make the decisions.<br>Ship the useful thing.", "I work across discovery, system design, delivery and evaluation. My job is to make the next decision clearer, for the team building the product and the people using it.")}<section class="editorial-section"><div class="section-intro"><p class="section-label">How I work</p><h2>Evidence before a roadmap.<br>Clarity before a sprint.</h2></div>${row("01", "Frame the problem", "Start with the user’s task, the friction they encounter and the workaround they use today. Turn interviews, observed behaviour and feedback into a problem statement the team can challenge.", "What evidence would change our mind?")}${row("02", "Choose what matters", "Prioritise by user value, uncertainty, effort and dependencies. Make the trade-off explicit: what does this release need to prove, and what can wait? A roadmap should communicate those decisions.", "What is the smallest useful thing we can test?")}${row("03", "Make delivery concrete", "Work with engineering on workflows, data contracts, failure states and acceptance criteria. Keep scope negotiable as implementation exposes new constraints. Review what the user can actually do, alongside what the system can produce.", "What happens when the happy path fails?")}${row("04", "Learn from the release", "Define success criteria before shipping. Use feedback, product behaviour and evaluation results to decide whether to iterate, change direction or stop. Separate an interesting demo from evidence of a useful product.", "What would make us invest in the next iteration?")}</section><section class="statement-panel"><p class="section-label">The bridge to engineering</p><h2>A shared picture of<br>what should happen.</h2><p>Clear requirements are more than a feature list. I use workflow diagrams, explicit state, schemas and examples to connect the product intent with implementation and testing.</p>${link("/ai/", "Explore my AI practice")}</section><section class="next-section"><span>See the decisions in practice</span>${link("/projects/", "Selected projects")}</section></main>`,
  "Product",
);
await page(
  "/ai/",
  "AI systems",
  "LLMs, agent orchestration, context engineering, evaluation, guardrails and practical AI governance.",
  `<main id="main" class="content-main">${hero(2, "AI", "A model is a capability.<br>The product is the<br>system around it.", "I work on the connections: what the system knows, what it can do, how it hands work between steps, and how we judge the result.")}<section class="system-strip" aria-label="An illustrative AI workflow"><p>Illustrative system design</p><div><span>User intent</span><b>→</b><span>Context + state</span><b>→</b><span>Models + tools</span><b>→</b><span>Checks + review</span></div><p>Explicit contracts between every step. Feedback across the whole workflow.</p></section><section class="editorial-section"><div class="section-intro"><p class="section-label">Technical product practice</p><h2>Go beyond the prompt.</h2></div>${row("01", "Orchestrate deliberately", "Choose between a direct LLM call, a fixed workflow and specialist agents based on the task. Define model routing, tool permissions, hand-offs and failure behaviour. Use MCP, A2A and API integration where their contracts fit the system.", "More autonomy needs clearer boundaries.")}${row("02", "Engineer the context", "Separate durable state from conversation history and task context. Decide what to retrieve, retain, update and exclude. Use typed structures and JSON schemas to make inputs and outputs inspectable. Validate the content as well as the shape.", "More context can also mean more cost, stale information and contradictions.")}${row("03", "Evaluate the behaviour", "Build representative evaluation sets, including accuracy, bias and failure cases. Version prompts, compare changes and define release criteria. Use model judgment to assist review while checking its limitations against human assessment.", "A convincing response is not evidence of a reliable workflow.")}${row("04", "Design the guardrails", "Put checks at the boundaries: input handling, tool access, structured output validation and review before consequential actions. Define timeouts, retry limits and a useful fallback when a model or service fails.", "Controls should address a named failure mode.")}${row("05", "Account for the experience", "Text, images, video and voice have different latency, feedback and cost patterns. Design progress, cancellation and recovery around those differences. Account for token usage, generation counts, audio minutes and retries when choosing models and limits.", "Measure the whole task, including the failed attempts.")}</section><section class="statement-panel"><p class="section-label">Practical AI governance</p><h2>Turn a risk into<br>a product requirement.</h2><p>Privacy, permitted data use, misuse and bias need concrete decisions. I work with engineering, security and legal specialists to clarify the constraints, translate them into product behaviour, and agree evidence for review.</p><p>My focus is product requirements, evaluation and traceable controls. Legal interpretation and formal assurance belong with qualified specialists.</p>${link("/projects/ai-red-team/", "Read the red-team case study")}</section><section class="next-section"><span>From system thinking to working code</span>${link("/projects/", "Explore the projects")}</section></main>`,
  "AI",
);
const projects = [
  {
    slug: "coding-agent-aggregator",
    name: "Coding Agent Aggregator",
    type: "Open source · TypeScript / Node.js / React / MCP",
    description:
      "A local-first daemon that lets a manager coding agent delegate work to worker agents in isolated git worktrees, with one control plane to approve, review and merge.",
    image: "aggregator.jpg",
    alt: "The Coding Agent Aggregator overview board running against mock agents: tasks moving through working, ready to review and needs attention, with an approvals counter.",
    status: "Open source (MIT) · Tests and CI pass · Real Codex and Gemini CLIs unverified",
    repo: "coding-agent-aggregator",
    commit: "913ed68",
  },
  {
    slug: "ai-red-team",
    name: "AI Red Team Tool",
    type: "AI evaluation · Next.js / TypeScript",
    description:
      "A workspace for probing model behaviour, reviewing judgments and collecting findings.",
    image: "redteam.jpg",
    alt: "The actual AI Red Team Tool running locally, showing conversation controls and the evaluation dashboard.",
    status: "Local interface verified · Model runs require services",
    repo: "ai-redteam-competition-tool",
    commit: "f18bcc5",
  },
  {
    slug: "monster-manor",
    name: "Monster Manor",
    type: "Multiplayer systems · Node.js / Socket.IO / three.js",
    description:
      "A first-person escape game with shared puzzles, server-owned state and a house that fights back.",
    image: "monster-manor.jpg",
    alt: "Monster Manor running locally, showing character selection in the haunted hall.",
    status: "Local game verified · Public deployment unverified",
    repo: "monster-manor",
    commit: "e56455f",
  },
  {
    slug: "team-quiz-game",
    name: "Team Quiz Game",
    type: "Game mechanics · React / TypeScript / Vite",
    description:
      "A team party game built around matching answers, timed questions and separate host and player experiences.",
    image: "team-quiz.jpg",
    alt: "Actual Team Quiz Game instructions running locally, explaining the matching-answer mechanic, team strategy and timed rounds.",
    status: "Local interface verified · Full multiplayer flow unverified",
    repo: "quiz-red-ready",
    commit: "29d647d",
  },
  {
    slug: "luma-playground",
    name: "Luma API Playground",
    type: "Multimodal integration · Express / REST APIs",
    description:
      "An integration experiment for video generation, status handling and generation timing.",
    image: "luma-architecture.svg",
    alt: "Architecture diagram showing a missing client interface, Express routes and the Luma API.",
    status: "Code study · Frontend missing from repository",
    repo: "lumalabstest",
    commit: "720ab58",
  },
];
const [latest, ...others] = projects;
await page(
  "/", "AI Product Manager",
  "Wajid Khan, AI Product Manager in London. I specify AI systems and build them to test whether the specification holds. Case studies state what ran and what didn’t.",
  `<main id="main" class="new-home">
    <section class="hero-new"><div class="wrap"><h1>AI product manager. I build what I <em>specify.</em></h1><p class="hero-lede">I’m Wajid, based in London. I work on the decisions between an idea and a working AI product: what the system knows, what it may do, and how we judge the result. Then I build it, with AI coding agents, to find out if I was right.</p><div class="hero-actions"><a class="btn" href="/projects/">See the work ${arrow}</a><a class="btn ghost" href="/contact/">Get in touch</a></div><div class="hero-meta"><span><b>${projects.length}</b> public projects</span><span><b>Honest status</b> on every case study: what ran, what didn’t</span><span><b>London</b>, UK</span></div></div></section>
    <section class="latest" aria-labelledby="latest-title"><div class="wrap latest-grid"><div><p class="eyebrow">Latest · open source</p><h2 id="latest-title">${latest.name}</h2><p>${latest.description} It started as a written specification that I directed, then was built with AI coding agents to test whether the approval and merge model held up.</p><ul class="facts"><li><b>MIT</b>licensed, free to use</li><li><b>61</b>daemon tests, real git and PTYs</li><li><b>2 OS</b>CI on Linux and macOS</li><li><b>4</b>milestones implemented</li></ul>${link("/projects/" + latest.slug + "/", "Read the case study", "text-link")} &nbsp; ${link("https://github.com/Waaajid/" + latest.repo, "GitHub", "text-link")}</div><figure class="latest-shot"><img src="/assets/${latest.image}" alt="${latest.alt}" width="1568" height="400"><figcaption>The overview board in demo mode, with mock agents.</figcaption></figure></div></section>
    <section class="work"><div class="wrap"><div class="section-head"><h2>More work, with the caveats</h2>${link("/projects/", "All projects", "text-link")}</div><div class="cards">${others.map((p) => `<a class="card" href="/projects/${p.slug}/"><img src="/assets/${p.image}" alt="" width="1440" height="900" loading="lazy"><h3>${p.name}</h3><p class="meta">${p.type}</p><p>${p.description}</p></a>`).join("")}</div></div></section>
    <section class="approach"><div class="wrap"><p class="eyebrow">How I work</p><div class="approach-grid"><div><h3>Frame the problem</h3><p>Start from the user’s task and the workaround they use today. Decide what evidence would change the plan.</p></div><div><h3>Specify the system</h3><p>Workflows, state, schemas and failure behaviour that engineering can build and test against.</p></div><div><h3>Check the behaviour</h3><p>Evaluate what the system does, including the failures, before calling it a product.</p></div></div><p style="margin-top:32px">${link("/product/", "Product approach", "text-link")} &nbsp; ${link("/ai/", "AI systems practice", "text-link")}</p></div></section>
    <section class="contact-new"><div class="wrap"><p class="eyebrow">Contact</p><h2>Have a hard product question? <em>Let’s talk.</em></h2><a class="contact-mail" href="mailto:wajithkhan05@gmail.com">wajithkhan05@gmail.com</a></div></section>
    <div class="new-footer"><span>Wajid Khan · AI Product Manager · London</span><a href="https://github.com/Waaajid" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a><a href="https://www.linkedin.com/in/waajidkhan/" target="_blank" rel="noopener noreferrer">LinkedIn ${arrow}</a></div>
  </main>`, "", "home",
);
await page(
  "/projects/",
  "Projects",
  "Selected public projects: AI Red Team Tool, Monster Manor, Team Quiz Game and Luma API Playground, with evidence and honest status.",
  `<main id="main" class="content-main">${hero(3, "Projects", "Working ideas.<br>Visible decisions.", "A selection from my public GitHub. Each study separates what the code implements, what I could run, and what still needs verification.")}<section class="project-list" aria-label="Selected projects">${projects.map((p, i) => `<article class="project-feature"><div class="project-heading"><span class="row-number">0${i + 1}</span><h2><a href="/projects/${p.slug}/">${p.name} ${arrow}</a></h2><p>${p.type}</p></div><a class="project-image" href="/projects/${p.slug}/" tabindex="-1" aria-hidden="true"><img src="/assets/${p.image}" alt="" width="1440" height="900" loading="lazy"></a><div class="project-summary"><p>${p.description}</p><div><p class="project-status">${p.status}</p>${link(`/projects/${p.slug}/`, "Read the case study")}</div></div></article>`).join("")}</section><section class="next-section"><span>More experiments, in the open</span>${link("https://github.com/Waaajid", "Explore GitHub")}</section></main>`,
  "Projects",
);
const section = (title, ...text) =>
  `<section class="case-section"><h2>${title}</h2><div>${text.map((t) => `<p>${t}</p>`).join("")}</div></section>`;
const diagram = (steps, caption) =>
  `<figure class="architecture"><figcaption>Architecture diagram · Based on reviewed code</figcaption><div>${steps.map((s) => `<span>${s}</span>`).join('<b aria-hidden="true">→</b>')}</div><p>${caption}</p></figure>`;
for (const p of projects) {
  let body = "";
  if (p.slug === "coding-agent-aggregator")
    body =
      section(
        "The problem",
        "Running several coding agents on one repository goes wrong in predictable ways: they overwrite each other’s files, a blocked permission prompt goes unnoticed in a terminal, and the person coordinating ends up shuttling status between a manager agent and a markdown file.",
        "This project is for developers who already use more than one coding-agent CLI and want one place to see all of them, approve what needs approving, and merge what is good.",
      ) +
      section(
        "My contribution",
        "The repository starts from a written product specification, protocol and data model (five documents, all in the repo). I directed that design, and the implementation was built with AI coding agents working against it. It is open source under the MIT licence.",
        "Several spec decisions were changed once the system met reality, and each is recorded in the README under deliberate differences. The clearest example is that the manager agent holds a separate credential that cannot approve its own merge.",
      ) +
      diagram(
        [
          "Manager agent / MCP",
          "Daemon + SQLite",
          "Worker agent in git worktree",
          "Approval queue",
          "Diff review + merge",
        ],
        "The manager delegates through MCP tools. Each worker runs in its own worktree on its own branch. Permission requests and merges wait in one queue for a human decision, shown in a web and mobile control plane.",
      ) +
      section(
        "The implementation",
        "A Node.js daemon owns task state, worktrees, agent processes and approvals. Adapters normalise Claude Code, Codex and configurable CLIs. A hook intercepts Claude’s tool calls and fails closed. The React control plane streams live terminals and diffs over WebSocket, and an MCP server exposes delegate, status, diff, feedback and merge to the manager.",
        "Approval policies run from asking for everything to automatically allowing side-effect-free commands. Edits outside a worktree always need a human.",
      ) +
      section(
        "The trade-offs",
        "Isolation by worktree removes file collisions but costs disk and setup time for dependencies, which the per-repository configuration partly handles by copying or symlinking.",
        "Headless Codex runs in its own sandbox and cannot be gated by the approval queue, so the API warns when a gating policy is requested for it. Workers are children of the daemon, so a hard kill leaves a failed task and a kept worktree to retry.",
        "A manager can target any git repository on the machine. Scoping that is not implemented and is listed as a known limit.",
      ) +
      section(
        "Current status",
        "Type-checking and 61 daemon tests pass, covering real git operations, pseudo-terminals, the hook script and mock agent CLIs. The MCP server is tested over stdio. Continuous integration runs on Linux and macOS. The interface shown above was captured running locally against mock agents.",
        "The Codex, Gemini and Antigravity CLIs were not available during development, so their flags are unverified against the real binaries and can be overridden in configuration. No claim is made about performance with real long-running agent sessions.",
        `Source, specifications and licence: ${link("https://github.com/Waaajid/coding-agent-aggregator", "github.com/Waaajid/coding-agent-aggregator")}`,
      );
  if (p.slug === "ai-red-team")
    body =
      section(
        "The problem",
        "Model testing creates a lot of conversations. The difficult part is turning those attempts into findings that someone else can inspect, reproduce and judge.",
        "This project is aimed at people investigating model behaviour, with manual exploration and automated probing in the same workspace.",
      ) +
      section(
        "My contribution",
        "My public project brings together the conversation interface, automated probe workflow, judgment, ranking and finding export. The code makes the path from a test attempt to reviewable evidence visible.",
        "The repository is the evidence for this study; the project is presented without a claim of independent validation or sole authorship.",
      ) +
      diagram(
        [
          "Conversation / probe",
          "Next.js API routes",
          "Target model",
          "Judgment + ranking",
          "Findings / export",
        ],
        "React interfaces connect to a runner for probe generation, testing and judgment. Browser storage and server persistence routes hold conversations and findings.",
      ) +
      section(
        "The implementation",
        "The runner manages session start, pause, resume and stop; a probe queue; finding filters; and session statistics. Separate services handle model calls and ranking. The interface includes settings, findings and log views.",
        "The API layer routes requests between hosted assistant models and a configurable target model endpoint. Rate limiting and backoff are implemented for assistant requests. Export logic selects findings for structured JSON output.",
      ) +
      section(
        "The trade-offs",
        "Automated judgment helps sort the volume of probes, but a high model score is not proof of a vulnerability. Human review and reproduction remain necessary.",
        "Local storage and file persistence make a personal experiment easier to run. They also leave work to do around access control, data retention and shared use before treating it as a hosted service.",
        "Model endpoints, keys and rate limits are operational dependencies. The interface can be inspected without presenting an unconfigured model run as a successful evaluation.",
      ) +
      section(
        "Current status",
        "The local interface and TypeScript check were verified during this portfolio review. Conversation creation and the dashboard, findings and settings views were checked without credentials.",
        "The dashboard’s connection labels are not live health checks: target connectivity returns true in the current code, and assistant availability checks the configured model list. They do not verify a successful API call.",
        "End-to-end probe generation, target-model responses and judgment were not verified: they require configured model services and credentials. No vulnerability findings or competition results are claimed.",
      );
  if (p.slug === "monster-manor")
    body =
      section(
        "The problem",
        "A group escape game needs shared progress without every player needing to understand the server. Players explore independently, but keys, doors, monsters and the countdown must tell the same story.",
        "Monster Manor is designed for people playing together on laptops, with an optional host screen and a separate solo mode. The README’s intended group size is a design target, not a verified capacity result.",
      ) +
      section(
        "My contribution",
        "My public game project connects a first-person browser experience with a server-owned rules engine, group coordination and host controls. It includes rule tests, bot tooling and deployment configuration.",
        "The case study focuses on the implementation visible in the repository. Third-party models, textures and sound retain their original licences and credits.",
      ) +
      diagram(
        [
          "Browser / three.js",
          "Socket.IO events",
          "Node.js game state",
          "Rules + monsters",
          "State updates",
        ],
        "Shared level and configuration modules keep the server and browser aligned. The host view observes the same game; solo sessions get separate in-memory state.",
      ) +
      section(
        "The implementation",
        "Express serves the game, three.js renders the house and Socket.IO carries updates. The server owns puzzle stages, item locations, doors, catches and monster behaviour. Players report movement, which the server checks for plausibility.",
        "The game includes difficulty settings, hiding, shared clues, a map and adaptive rendering quality. Solo sessions and a host-controlled group game use the same underlying rules.",
      ) +
      '<figure class="case-image"><img src="/assets/monster-game.png" alt="Actual local solo gameplay: a flashlight illuminates a manor corridor, with the shared puzzle objective and player controls visible." width="1440" height="900" loading="lazy"><figcaption>Local solo gameplay, captured during the review.</figcaption></figure>' +
      section(
        "The trade-offs",
        "Keeping the game in memory makes a small shared session straightforward, but a process restart loses the session. The Cloud Run configuration therefore targets a single instance with WebSocket-friendly settings.",
        "Client-reported movement is practical for responsiveness, with server checks to limit implausible updates. It is a different trust model from a fully authoritative movement simulation.",
        "Rendering detail competes with laptop performance. Merged furniture meshes, limited active lights and automatic resolution and shadow reductions help manage that budget.",
      ) +
      section(
        "Current status",
        "The game was run locally for this review, including character selection, solo entry and the rendered house. The repository’s rule test suite passed.",
        "A public live game URL and multiplayer capacity were not verified. Deployment scripts and bot tooling are implementation evidence, rather than proof of a successful production deployment.",
      ) +
      section(
        "Asset credits",
        `The interface capture is from the working local game. The project credits Kenney and Quaternius assets, Google Fonts, three.js example assets, generated artwork and project-created procedural assets. ${link("https://github.com/Waaajid/monster-manor/blob/main/convent/ASSETS.md", "Read the complete asset and licence record")}`,
      );
  if (p.slug === "team-quiz-game")
    body =
      section(
        "The problem",
        "A party game needs to explain its central idea quickly, then keep a room of players moving together. Here, the goal is to match teammates’ answers rather than find one correct answer.",
        "The intended users are groups playing in teams and a host managing the session. The product challenge is the hand-off from nickname entry to team selection, timed answers, shared results and rewards.",
      ) +
      section(
        "My contribution",
        "This public project brings together the matching-answer mechanic, the player onboarding journey and a separate host dashboard. The React implementation connects those screens through shared quiz state and Firebase session services.",
        "The focus of this study is the interaction design and implementation visible in the repository: making the rules understandable, managing time pressure and separating the host’s controls from the player’s task.",
      ) +
      diagram(
        [
          "Player / host routes",
          "React QuizContext",
          "Firebase sessions",
          "Answers + round state",
        ],
        "Vite serves the React interface. Session services create, join and subscribe to Firebase Realtime Database records for teams, players, answers and game phases. This diagram describes the code; it does not establish a verified multiplayer session.",
      ) +
      section(
        "The player journey",
        "Nickname entry leads to a session-code screen. After a session is joined, the code provides team selection, a waiting view and a host-started quiz. The instructions describe three rounds of four questions, with twelve seconds for each answer.",
        "The question component includes a countdown, answer submission, a waiting state and a next-question signal. Round summaries display winners and matching answers. Dice-roll and scratch-card reward screens extend the game beyond the final score.",
      ) +
      '<figure class="case-image"><img src="/assets/team-quiz-entry.jpg" alt="Actual local player entry after nickname submission, asking for a game session code. No team or session data has been fabricated." width="1440" height="900" loading="lazy"><figcaption>Actual local player entry. Joining a team requires a configured game session.</figcaption></figure>' +
      section(
        "The trade-offs",
        "A shared Firebase session can coordinate the room, but the interface still needs clear ownership of the timer, question progression and recovery after a refresh. Nickname and team state live in React memory, so a page reload restarts onboarding.",
        "The active session scorer groups answers after lowercasing and trimming. A separate fuzzy-matching helper exists, but it is not wired into that scorer. Consistent rules between scoring and the result display are an important next check.",
        "Reward screens introduce their own dependencies. The dice screen expects earned rolls and references sound files absent from this checkout. The scratch interaction loads an external library. Rendering a reward screen alone does not verify the complete winner-to-reward journey.",
      ) +
      section(
        "Current status",
        "The current checkout builds successfully and passes its TypeScript check. Nickname validation, keyboard submission, session-code entry and instructions were checked in the running local app. The captures show those actual interfaces, without added session data or game results.",
        "The original question component was also checked in isolation: submission locks the answer field, the twelve-second countdown exposes the next action, and that action emits a next-question signal. The host dashboard was rendered with database requests blocked; the local scratch interaction could not be verified because its external library request was blocked.",
        "The host dashboard, timer, round summaries, dice screen and scratch-card view are present in the implementation. Full session creation, cross-device team play, scoring, round progression and the earned-reward flow have not been verified together.",
        "The repository’s hosted demo responds, but its session-entry flow differs from this checkout and its instructions route shows a not-found view. A public playthrough of this version has not been verified, so no Play link is provided.",
      );
  if (p.slug === "luma-playground")
    body =
      section(
        "The problem",
        "Video generation is asynchronous. Sending a prompt is only the first step: a client also needs to track a generation, surface errors and help the user understand the wait.",
        "This experiment explores an Express integration with text-to-video and image-to-video API routes, intended for trying generation options and inspecting service responses.",
      ) +
      section(
        "My contribution",
        "My public integration experiment contains the server request flow, image upload handling, generation status retrieval and request timing. Those are the parts supported by the current code.",
      ) +
      section(
        "The implementation",
        "Express routes submit generation requests, retrieve individual generation status and list generations. Axios handles upstream calls. Multer accepts image uploads; API credentials are read from a request header or environment variable.",
        "The root route tries to serve public/index.html. That frontend file is absent from the reviewed checkout, so the current repository cannot provide the advertised browser playground on its own.",
      ) +
      section(
        "The trade-offs",
        "The integration separates submission from status retrieval, matching an asynchronous service. A complete user experience would also need clear polling behaviour, cancellation expectations and recovery from failed requests.",
        "Before a public deployment, credential handling, upload constraints and server-side request validation would need a separate review. No generation has been run as part of this portfolio review.",
      ) +
      section(
        "Current status",
        "Architecture study based on code review. The diagram above is explicitly an architecture diagram, not a product screenshot.",
        "The UI is missing and end-to-end generation was not tested. The README’s placeholder demo link has been omitted.",
      );
  const caption =
    p.slug === "coding-agent-aggregator"
      ? "Actual interface captured locally in demo mode with mock agents. No real agent runs shown."
      : p.slug === "luma-playground"
      ? "Architecture diagram. The frontend is missing from the reviewed repository."
      : p.slug === "ai-red-team"
        ? "Actual local interface. Connection labels are not live health checks; model services were not verified."
        : "Actual interface captured from the project running locally. No sample results added.";
  await page(
    `/projects/${p.slug}/`,
    p.name,
    p.description,
    `<main id="main" class="content-main case-study"><section class="case-hero"><div class="page-context"><a href="/projects/">← All projects</a><span>${p.type}</span></div><h1>${p.name}</h1><p class="page-lead">${p.description}</p><div class="case-meta"><p>${p.status}</p>${link(`https://github.com/Waaajid/${p.repo}`, "View repository")}</div></section><figure class="case-image"><img src="/assets/${p.image}" alt="${p.alt}" width="1440" height="900"><figcaption>${caption}</figcaption></figure>${body}<p class="review-note">Source reviewed at ${link(`https://github.com/Waaajid/${p.repo}/tree/${p.commit}`, p.commit)} · Portfolio review: 3 November 2026.</p><section class="next-section"><span>Continue exploring</span>${link("/projects/", "All projects")}</section></main>`,
    "Projects",
  );
}
await page(
  "/contact/",
  "Contact",
  "Contact Wajid Khan, AI Product Manager in London, by email, LinkedIn or GitHub.",
  `<main id="main" class="content-main contact-page">${hero(4, "Contact", "Start with<br>a good question.", "Have a product problem, an AI workflow to untangle, or a role worth talking about? I’d like to hear about it.")}<section class="contact-links" aria-label="Contact Wajid"><a href="mailto:wajithkhan05@gmail.com"><span>Email</span><strong>wajithkhan05@gmail.com</strong>${arrow}</a><a href="https://www.linkedin.com/in/waajidkhan/" target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><strong>Let’s connect</strong>${arrow}</a><a href="https://github.com/Waaajid" target="_blank" rel="noopener noreferrer"><span>GitHub</span><strong>Explore the code</strong>${arrow}</a></section><div class="contact-note"><span class="status-dot"></span><p>Based in London, UK.<br>For teams, collaborators and curious people.</p></div></main>`,
  "Contact",
);
await page(
  "/404.html",
  "Page not found",
  "Find your way back to Wajid Khan’s portfolio.",
  `<main id="main" class="content-main">${hero(0, "Page not found", "A little off course.", "This page doesn’t exist. The main sections are always within reach.")}<div class="error-links">${destinations.map(([label, url]) => link(url, label)).join("")}</div></main>`,
);
await cp(path.join(root, "assets"), path.join(out, "assets"), {
  recursive: true,
});
for (const file of ["style.css", "app.js", "CNAME", ".nojekyll"])
  await cp(path.join(root, file), path.join(out, file));
await writeFile(
  path.join(out, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://wajids.co.uk/sitemap.xml\n",
);
await writeFile(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", ...destinations.map((d) => d[1]), ...projects.map((p) => `/projects/${p.slug}/`)].map((url) => `<url><loc>https://wajids.co.uk${url}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  path.join(out, "llms.txt"),
  `# Wajid Khan

> Wajid Khan is an AI Product Manager based in London, UK. His portfolio connects product discovery and delivery with AI systems knowledge: LLMs, agent workflows, context engineering, orchestration, evaluation, guardrails, multimodal experiences, latency, cost and practical AI governance.

Wajid works across problem framing, prioritisation, roadmaps, success criteria, delivery, experimentation and collaboration with engineering. His approach connects user evidence with explicit workflows, state models, schemas, failure behaviour and release decisions.

Relevant role contexts include AI product management and technical product roles that combine discovery, delivery and decisions about AI system behaviour. The portfolio provides concrete examples and source links for assessing fit against a specific role.

This is Wajid’s own public portfolio. Each case study distinguishes project implementation, local verification and outstanding deployment or multiplayer checks, with its source review date. His AI governance work concerns product requirements and collaboration with engineering, security and legal specialists. Formal legal interpretation belongs with qualified specialists.

## Profile and capabilities

- [Product approach](${origin}/product/index.md): Discovery, problem framing, prioritisation, roadmaps, acceptance criteria, engineering collaboration, delivery and learning after release.
- [AI systems practice](${origin}/ai/index.md): LLMs, specialist agents, model routing, MCP, A2A, APIs, context selection, structured state, JSON schemas, evaluation, guardrails, multimodal experiences, latency, cost and governance.
- [Full portfolio text](${origin}/llms-full.txt): All destination pages and case studies, generated from the same content as the website.

## Project evidence

${projects.map((p) => `- [${p.name}](${origin}/projects/${p.slug}/index.md): ${p.description} Status: ${p.status}. Source reviewed at ${p.commit}.`).join("\n")}

## Contact

- [Contact page](${origin}/contact/index.md): Public contact details for roles, collaboration and product conversations.
- [Email Wajid](mailto:wajithkhan05@gmail.com): wajithkhan05@gmail.com.
- [LinkedIn](https://www.linkedin.com/in/waajidkhan/): Wajid’s professional profile.
- [GitHub](https://github.com/Waaajid): Public repositories and implementation evidence.

## Optional

- [Visual homepage](${origin}/): Four destinations: Product, AI, Projects and Contact.
- [Projects index](${origin}/projects/index.md): Selected work and links to each case study.
- [Sitemap](${origin}/sitemap.xml): Canonical website page URLs.
`,
);
await writeFile(
  path.join(out, "llms-full.txt"),
  `# Wajid Khan — AI Product Manager\n\n> Public portfolio content for readers and agents. Wajid Khan is based in London, UK. The sections below are generated from the website’s destination pages and case studies; project verification limits and review dates are preserved.\n\n${agentPages
    .filter((p) => p.url !== "/")
    .map((p) => `---\n\nSource: ${origin}${p.url}\n\n${p.markdown}`)
    .join("\n\n")}\n`,
);
console.log(
  `Built ${5 + projects.length} portfolio pages and custom 404 in _site/`,
);
