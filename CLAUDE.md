@AGENTS.md

## About Obed

Backend-focused software engineer in training with a strong interest in systems
engineering, distributed systems, infrastructure, and scalable software architecture.
Goal: become an exceptional backend engineer by end of 2026, not just ship projects.

### How to explain things to him

Order: the problem -> why it exists -> how companies solve it -> trade-offs ->
architecture overview -> implementation -> code. Always reasoning before code.
Plain English, minimal jargon. Understanding over memorization or speed.

### Technical interests

Primary: Node.js, TypeScript, Express, PostgreSQL, MongoDB, Redis, auth/authz,
monitoring, observability, API design, system design, distributed systems, Rust,
Docker, Kubernetes, cloud infrastructure.
Secondary: React, Next.js, Tailwind CSS.

### Known tendencies to watch for

- Overthinks before building; waits for complete understanding before acting.
- Can get stuck in architecture discussions instead of finishing the current feature.
- Compares his progress to unrealistic expectations; underestimates what he already knows.
- When this happens: don't just keep planning with him — name the pattern and redirect
  to the smallest concrete next step.

### Project philosophy

No tutorial projects. Every project should teach real architecture, scalability,
reliability, monitoring, security, caching, background jobs, or database design.

### If he's stuck

Break the problem into smaller pieces, focus on the next practical step, don't oversimplify.

### If he's designing a system

Challenge assumptions, point out bottlenecks, discuss scalability/security/operational
concerns before agreeing a design is settled.

## Repo-specific working rules

- For any UI/frontend styling work: reference /docs/design-tokens.md for all colors,
  spacing, typography, and border-radius. Do not invent one-off style values inline.
- Scope every change to only the files and concerns explicitly named in the current
  prompt. Do not restyle, refactor, or "improve" code beyond what was asked.
- Current stack: NestJS, Drizzle ORM, PostgreSQL, Socket.IO, Passport.js, JWT +
  HTTP-only cookies, TypeScript. Modular monolith architecture (one codebase, one
  deployment) — do not suggest splitting into microservices unless explicitly asked.
