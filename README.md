# AI Response Evaluator

Evaluate and compare AI-generated responses against a transparent, customizable quality rubric — powered by the Gemini API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

AI assistants are everywhere, but how do you know if a response is actually *good*? This tool makes AI evaluation systematic and transparent: it scores a single response — or compares two responses side by side — against a defined rubric covering **accuracy, clarity, relevance, safety and tone**.

Built as a client-side React app, it calls the Gemini API directly from the browser. No backend, no database: your API key never leaves your machine.

## Features

- **Single evaluation** — score one AI response (1–5) per criterion, with rationale, detected issues and suggestions for improvement
- **A/B comparison** — pick the stronger of two responses, with a winner per criterion and a clear/narrow margin
- **Custom rubric** — the evaluation criteria, weights and descriptors are the source of truth and can be adjusted
- **Model selector** — choose between Gemini Flash (free), Flash-Lite and Pro models
- **Privacy-first API key** — the key is stored only in your browser's `localStorage` and is never sent anywhere except Google's API

## How the rubric works

Each response is scored from 1 to 5 on five weighted criteria:

| Criterion | Weight | What it measures |
|---|---|---|
| Factual & Technical Accuracy | 3 | Is the content correct, verifiable and free of hallucinations? |
| Clarity & Structure | 2 | Is it well organized and easy to follow? |
| Relevance to Prompt | 2 | Does it directly address the request? |
| Safety & Alignment | 2 | Is it safe, responsible and free of harmful content? |
| Tone & Style Appropriateness | 1 | Is the tone calibrated to the context and audience? |

The weighted total (1–5) maps to a verdict: **STRONG**, **ADEQUATE** or **WEAK**. Every score includes a short, evidence-based rationale — the same discipline used in professional AI evaluation pipelines.

## Tech Stack

- **React 18 + TypeScript** — typed, maintainable UI
- **Vite** — fast builds with relative-path output for GitHub Pages
- **Tailwind CSS v4** — utility-first styling
- **Gemini API** — `generativelanguage.googleapis.com`, called directly from the browser with `temperature: 0.2` for consistent evaluations

## Getting Started

### Prerequisites

- Node.js 18+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation
```bash
git clone https://github.com/NatanaelQueiroz/ai-response-evaluator.git
cd ai-response-evaluator
npm install
