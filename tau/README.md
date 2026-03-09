# Tau CLI

Tau is a terminal user interface application built using the Ink framework. It is intended for personal development usage and features an expanding set of tools.

## Prerequisites

- **Node.js**: `v16.0.0` or higher
- **npm**: v7 or higher
- **GitHub CLI (`gh`)**: For the `repo-status` command.
- **Docker** or **Podman**: For the `clean-up` command.

## Local Development & Build

To install dependencies and build the project for local development:

```bash
git clone <repository_url>
cd tau
npm install
npm run build
```

During development, you can use the watch script to automatically rebuild files as they change:

```bash
npm run dev
```

## Installation

To install `tau` globally on your system so you can run it from any directory, you can link it:

```bash
cd tau
npm run build
npm link
```

You can now run `tau` from anywhere in your terminal.

## Available Commands

### `tau hello-world`

Displays a colorful, creative ASCII graphic greeting. Uses `ink-big-text` and `ink-gradient` for a stylized appearance.

### `tau repo-status`

Checks the status of your Git repository and Pull Requests.

- Retrieves `git status` for the current working directory.
- Lists any open Pull Requests in the current repository using the `gh` CLI.
- Lists any open Pull Requests assigned to you globally using the currently authenticated `gh` user.

### `tau clean-up`

Cleans up unused Docker or Podman resources to free up space.

- Automatically detects whether `docker` or `podman` is installed on your system.
- Explicitly lists all the actions that will be performed (e.g. removing unused containers, images, volumes, networks, and build caches).
- Prompts for confirmation before executing the destructive `system prune -a --volumes -f` command.

## Scripts overview

- `npm run build`: Compiles the TypeScript source code to JavaScript.
- `npm run dev`: Runs the TypeScript compiler in watch mode for development.
- `npm test`: Runs formatting checks (`prettier`), linting (`xo`), and tests (`ava`).

## License

MIT
