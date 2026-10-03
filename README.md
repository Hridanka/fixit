# fixit

Paste an error, get a diagnosis and a fix. fixit analyzes error messages (or a captured error page) with AI, explains what went wrong, and shows the corrected code side by side with the original — with a chat panel for follow-up questions.

## What it does

- **Paste an error** — or click **Load a buggy example** to try a sample.
- **Fix it with AI** — the analyzer returns structured findings: what the error is, why it happened, and the fix, shown as error cards.
- **Side-by-side diff** — original vs. fixed code, with copy and download buttons.
- **Chat panel** — ask follow-up questions about the error and the fix (chat history clears on reload).
- **Offline fallback** — if the AI is unavailable, a built-in rule-based checker analyzes common errors and clearly labels its results.

## Built with

- TanStack Start (React 19, server functions)
- TypeScript
- Tailwind CSS v4
- Lovable AI Gateway (Anthropic) for analysis and chat
- Vitest for tests

## Getting started

```sh
git clone <this-repository-url>
cd fixit
npm install
npm run dev
```

Open http://localhost:8080.

### AI setup

The app calls the Lovable AI Gateway using the `LOVABLE_API_KEY` environment variable, with an optional `AI_MODEL` override. When you run the project in Lovable, this is configured for you. Running it elsewhere? Set the variables yourself.

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Lint with ESLint |

## CLI section

The site's CLI install command (`pip install fixit-cli`) is a placeholder — no real package exists yet. Replace it with your actual install instructions if you publish one.

## License

All rights reserved.
