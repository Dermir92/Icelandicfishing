# Veidistadur

Mobile-first fishing discovery for Iceland, built as a focused MVP with Next.js, TypeScript, Tailwind CSS, and Leaflet.

## What this version proves

- map-first discovery
- instant search and combined filters
- concise comparison cards
- strong spot detail pages
- source-ready mock data model for future integrations

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

```text
app/                  App Router pages and global layout
components/           Discovery, shared, and UI components
data/                 Typed mock fishing spot dataset
docs/                 Product framing and MVP reasoning
lib/                  Filtering, formatting, and utilities
types/                Core TypeScript domain models
```

## MVP scope

This app is intentionally a discovery product, not a booking engine or live data platform yet. The first release is about helping users answer one question quickly: where should I go fishing in Iceland based on my preferences?
