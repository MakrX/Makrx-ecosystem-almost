# Development Setup

Follow these steps to set up a local development environment.

## Node.js

This project targets **Node.js 20**. Use [nvm](https://github.com/nvm-sh/nvm) to install and manage the correct version:

```bash
nvm install
nvm use
npm install
```

## Python

Backend services use **Python 3.11**. Manage versions with [pyenv](https://github.com/pyenv/pyenv):

```bash
pyenv install 3.11
pyenv local 3.11
pip install -r requirements.txt  # install Python dependencies
```

## Package Managers

- **JavaScript**: uses `npm`.
  - `npm install` – install dependencies
  - `npm run lint` – run ESLint
  - `npm run format` – format with Prettier
- **Python**: use `pip` (or [uv](https://github.com/astral-sh/uv)) for dependency management.

## Basic Commands

```bash
npm run dev      # start development server
npm test         # run tests
npm run build    # build for production
```

For Python services run `pytest` or project-specific commands as needed.

## Editor

VS Code users can install the recommended extensions and optionally add workspace preferences in `.vscode/settings.json`.
