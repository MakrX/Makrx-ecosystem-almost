# Contributing to MakrX

Thanks for helping improve the MakrX ecosystem! This guide covers how we work and what we expect from contributions.

## Scope & Structure
- Review the [architecture overview](docs/ARCHITECTURE.md) for how services fit together.
- Each application maintains its own README with details:
  - [Makrcave Backend](makrcave-backend/README.md)
  - [MakrX Store Backend](makrx-store-backend/README.md)
  - [MakrX Store Frontend](makrx-store-frontend/README.md)
  - [Gateway Frontend](frontend/gateway-frontend/README.md)
  - [Makrcave Frontend](frontend/makrcave-frontend/README.md)

## Experiments

Prototype or archived services belong in [/experimental/](experimental/). Each experiment must live in its own folder and include a README containing:

- Purpose and scope
- Status (prototype, archived, etc.)
- Owner
- Last updated date
- Link to the [promotion checklist](experimental/PROMOTION_CHECKLIST.md)

### Promotion workflow

1. Flesh out tests, documentation, and deployment artifacts.
2. Complete the [promotion checklist](experimental/PROMOTION_CHECKLIST.md).
3. Move the service out of `/experimental` and update [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites
- Node.js LTS (18+)
- Python 3.11+
- Docker 20+
- JavaScript package manager: `npm`
- Environment template: `.env.production.template` in repo root (service-specific `.env.example` files live in each app)

## Local Development
1. `cp .env.production.template .env`
2. `docker-compose up -d postgres keycloak`
3. Start a backend (example):
   ```bash
   cd makrcave-backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
4. Start a frontend (example):
   ```bash
   cd frontend/gateway-frontend
   npm install
   npm run dev
   ```

## Docker Build Contexts

Never include the following in Docker build contexts:

- `node_modules` or other dependency directories
- compiled output such as `dist/` or build caches
- secrets, environment files, or credentials
- large media, test fixtures, or sample datasets

`.dockerignore` files are audited quarterly to keep images lean. For how build contexts are used in automation, see the [CI/CD pipeline docs](docs/DEPLOYMENT.md#ci-cd-pipeline).

## Branching Model
- `feature/<topic>` for new features
- `fix/<bug>` for bug fixes
- `chore/<task>` for tooling or maintenance
- `docs/<change>` for documentation
Always branch from `main` and keep in sync via `git fetch origin` and `git rebase origin/main` (or merge if preferred).

## Commits & Pull Requests
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Review the [PR review checklist](docs/PR_REVIEW_CHECKLIST.md) before submitting.
- PR checklist:
  - [ ] Tests updated
  - [ ] OpenAPI specs regenerated
  - [ ] Alembic migrations added and applied
  - [ ] Documentation updated
  - [ ] Update `.dockerignore` when adding heavy folders
  - [ ] CHANGELOG.md updated
  - [ ] Feature flags default to safe values

## Changelog

We maintain a root [`CHANGELOG.md`](CHANGELOG.md) using the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantic Versioning](https://semver.org/).
Include an entry under the **Unreleased** section for any user-facing change in your pull request. During release tagging, entries are moved to a new version heading.

## Coding Standards
- **TypeScript/JavaScript**: ESLint + Prettier; 2‑space indent
- **Python**: Black + flake8; 4‑space indent

## Testing & Migrations
- Run `npm test` for JS/TS packages
- Run backend test suites (`pytest` where available)
- Apply DB migrations with Alembic: `alembic upgrade head`
- Create new migrations with `alembic revision --autogenerate -m "msg"`

## API Contracts
- Canonical contract lives in [docs/API.md](docs/API.md)
- Each backend exposes `/openapi.json`
- Version APIs using `/api/v{n}` and bump the major version for breaking changes

## Issue Triage & Security
- Triage issues with labels (`bug`, `feature`, `docs`, etc.)
- Report security concerns per [SECURITY.md](docs/SECURITY.md)
- Architectural decisions: record ADRs under [docs/adr/](docs/adr/README.md) using `YYYYMMDD-short-title.md`

Happy hacking!
