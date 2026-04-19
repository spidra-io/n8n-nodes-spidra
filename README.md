# Spidra n8n Node

Official [n8n](https://n8n.io) community node for [Spidra](https://spidra.io).

[Spidra](https://spidra.io) is an AI-powered web scraping platform that lets you extract structured data from any website, including dynamic, JavaScript-heavy, and bot-protected pages without writing code.

## Features

- **Scrape** — Extract content from up to 3 URLs in a single request. Supports browser actions (click, scroll, type, wait), proxy rotation, screenshots, and AI-powered structured extraction
- **Batch Scrape** — Scrape large lists of URLs as a single job with full progress tracking, cancel, and retry support
- **Crawl** — Crawl an entire website from a root URL with AI-guided navigation. Spidra follows links, extracts data from every page, and returns structured results
- **Logs** — Browse and retrieve your past scrape logs
- **Usage** — Monitor your API credit and bandwidth consumption
- **AI Agent support** — Use this node as a tool inside n8n's AI Agent node

All resources support both **Run** (submit and wait for results) and **Submit + Get Status** (async pattern for long-running jobs).

## Installation

In your n8n instance go to **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-spidra
```

Requires n8n version **1.0.0 or higher**.

## Credentials

You need a Spidra API key:

1. Sign up or log in at [app.spidra.io](https://app.spidra.io)
2. Go to **Settings → API Keys** and create a key
3. In n8n, add a new **Spidra API** credential and paste your key

## Resources

- [Spidra Documentation](https://docs.spidra.io)
- [Spidra Dashboard](https://app.spidra.io)
- [Report an issue](https://github.com/spidra-io/n8n-nodes-spidra/issues)
