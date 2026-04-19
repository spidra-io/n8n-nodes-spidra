# Contributing to n8n-nodes-spidra

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** this repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-nodes-spidra.git
   cd n8n-nodes-spidra
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build**:
   ```bash
   npm run build
   ```

## Making Changes

- Create a new branch for your change:
  ```bash
  git checkout -b fix/your-fix-name
  ```
- Make your changes in `nodes/Spidra/Spidra.node.ts` or `credentials/SpidraApi.credentials.ts`
- Run `npm run build` to make sure everything compiles with no errors
- Test locally in n8n using:
  ```bash
  N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-spidra" n8n start
  ```

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a Pull Request against the `main` branch of this repo
3. Describe what you changed and why

## Publishing

Releases are handled by the maintainers. When a new GitHub Release is created, GitHub Actions automatically builds and publishes the package to npm. Contributors do not need to worry about this.

## Questions?

Open an issue or reach out at [hello@spidra.io](mailto:hello@spidra.io).
