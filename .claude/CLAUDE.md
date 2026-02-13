# Workspace for 0a4686ac-b620-4771-92cb-96db4f475616

## Company GitHub Repository
- **Repository:** https://github.com/entonomy-dev/designchecker
- **Owner/Repo:** entonomy-dev/designchecker
- **Branch:** main

This workspace is cloned from the company repository.

## Deliverables & Documents

All research, reports, plans, and documents MUST be saved in the
`docs/` directory with a date prefix (YYYY-MM-DD) for future reference:

  docs/2026-02-13_market_research.md
  docs/2026-02-13_technical_feasibility.md
  docs/2026-02-13_competitor_analysis.md

Always include the date prefix so future agents know when the document
was created.

## Application Architecture

This is a **Next.js** application using the App Router.

### Key Directories
- `src/app/` — Pages (each page is a folder with `page.tsx`)
- `documents/` — Working files, research, reports

### Rules
- Do NOT remove `next.config.ts` (required for app detection)
- Do NOT create `index.html` — use `src/app/` for pages
- Use TypeScript (`.tsx`) for all components
- Documents and reports go in `documents/`, NOT in `src/app/`

**Commit and push all deliverables to the GitHub repository.**
Use `git add . && git commit -m 'Add <description>' && git push`
after creating or updating files.

Files are also synced to S3 automatically after execution.