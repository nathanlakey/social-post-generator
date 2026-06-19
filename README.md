# AI Social Post Generator

A small, complete example of "an AI-powered tool" — built to learn the pattern,
not just to use it. Read this before touching code.

## What this actually is

Strip away the UI and this app does exactly one new thing compared to a normal
Next.js app: it sends text to Claude's API and gets text back. Everything else
— the form, the styling, the copy button — is regular React you already know.

## The 3 things to understand

### 1. The API key (`.env.local`)

Get a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
— note this is a **different account** from claude.ai. It's a developer/billing
account, and you pay per request (very cheap — this tool costs fractions of a
cent per generation).

Copy `.env.local.example` to `.env.local` and paste your key in. Never commit
`.env.local` to GitHub — it's already in `.gitignore`.

### 2. The API route (`src/app/api/generate/route.ts`)

This is the only file doing anything new. Walk through it slowly:

- **`SYSTEM_PROMPT`** — this is the AI's "job description." It applies to every
  request and never changes. This is where you encode expertise: what the
  output should look like, its format, its constraints.

- **`userPrompt`** — built fresh from the form data each time. This is the
  specific request.

- **The `fetch` call** — sends both prompts to `api.anthropic.com/v1/messages`.
  The `model` field picks which Claude model responds (we're using Sonnet —
  good balance of quality and cost for this kind of task).

- **Parsing the response** — Claude's reply comes back as
  `data.content[0].text`. We told Claude to respond in JSON, so we
  `JSON.parse()` it. This is the "structured output" pattern — instead of
  getting back a paragraph, you get back data your UI can render directly.

### 3. The form component (`src/components/PostGenerator.tsx`)

Completely ordinary React. Collects form input, POSTs it to `/api/generate`,
displays the result. If you've built any form before, this part is nothing new.

## Running it

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and add your real API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## The pattern, generalized

Every "AI feature" you'll build follows this same shape:

1. **Collect input** — a form, an uploaded file, existing data from a database
2. **Write a system prompt** — describe the task, the format, the constraints
3. **Send it to Claude's API** — one `fetch` call
4. **Parse and display the result** — JSON for structured data, plain text
   for prose

The actual skill that takes practice is **#2 — writing good prompts**. If the
output isn't right, 90% of the time the fix is making the system prompt more
specific, not changing your code.

## Ideas for extending this (in order of difficulty)

- **Add a "regenerate" button** — same inputs, ask for different variations.
  No new concepts, just a second button that calls the same endpoint.

- **Add an image upload** — let the user upload a product photo, and have
  Claude describe it as part of the prompt. Claude's API accepts images
  directly (base64-encoded). This teaches multimodal input.

- **Add a "tone" preview** — show example output for each tone option before
  the user picks one. Teaches you to think about UX around AI latency.

- **Save generated posts to Supabase** — now it's a real tool with history.
  This is where it starts looking like an actual product.

- **Add streaming** — instead of waiting for the full response, show text
  as it's generated (like ChatGPT's typing effect). More complex, but makes
  the tool feel faster for longer outputs.

## Deploying

Same as any Next.js app — push to GitHub, import on Vercel, add
`ANTHROPIC_API_KEY` as an environment variable in Vercel's project settings.

## What to tell clients

This entire tool — prompt design, API integration, UI, deployment — is
realistically a $1,500–$2,500 project for a client with a real use case
(review responses, product descriptions, email drafts, etc.). Once you've
built this once, you'll recognize the pattern everywhere.
