# Monday Dashboard → GitHub Pages via GitHub Actions

## Objetivo

Criar um dashboard estático gerado automaticamente a partir dos dados do Monday.com,
hospedado no GitHub Pages, e atualizado via GitHub Actions sempre que houver uma
alteração no board do Monday.

---

## Arquitetura

```
Monday.com (webhook automação)
        │
        │  POST repository_dispatch
        ▼
GitHub Actions (workflow)
        │
        ├── 1. Busca dados via Monday GraphQL API
        ├── 2. Executa script de build (Node.js)
        ├── 3. Gera dist/index.html (dashboard estático)
        │
        ▼
GitHub Pages (deploy automático)
        │
        ▼
URL pública: https://<user>.github.io/<repo>/
```

---

## Triggers do workflow

| Trigger | Quando dispara |
|---|---|
| `repository_dispatch` (tipo `monday_updated`) | Monday webhook → GitHub API em tempo real |
| `schedule: cron "*/30 * * * *"` | Fallback polling a cada 30 min |
| `push: branches: [main]` | Ao commitar mudanças no código |

---

## Estrutura de arquivos do projeto

```
monday-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← trigger + build + deploy
├── scripts/
│   └── build.mjs               ← busca Monday API, gera dist/index.html
├── src/
│   └── template.html           ← template HTML do dashboard
├── package.json
└── dist/                       ← gerado em runtime, nunca commitado (.gitignore)
```

---

## Workflow (.github/workflows/deploy.yml)

```yaml
name: Build & Deploy Monday Dashboard

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [monday_updated]
  schedule:
    - cron: "*/30 * * * *"

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - run: npm ci

      - name: Build dashboard
        run: node scripts/build.mjs
        env:
          MONDAY_API_TOKEN: ${{ secrets.MONDAY_API_TOKEN }}
          MONDAY_BOARD_ID:  ${{ secrets.MONDAY_BOARD_ID }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## Script de build (scripts/build.mjs)

```js
import fs from "fs/promises";
import path from "path";

const API_TOKEN = process.env.MONDAY_API_TOKEN;
const BOARD_ID  = process.env.MONDAY_BOARD_ID;

// 1. Busca dados do Monday via GraphQL
async function fetchBoardData() {
  const query = `
    query {
      boards(ids: [${BOARD_ID}]) {
        name
        items_page(limit: 200) {
          items {
            id
            name
            column_values {
              id
              text
              value
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_TOKEN,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`Monday API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.boards[0];
}

// 2. Gera HTML a partir dos dados
function generateHTML(board) {
  const items = board.items_page.items;
  const rows = items
    .map((item) => {
      const cols = item.column_values.map((c) => `<td>${c.text ?? ""}</td>`).join("");
      return `<tr><td>${item.name}</td>${cols}</tr>`;
    })
    .join("\n");

  const headers = ["Name", ...items[0]?.column_values.map((c) => c.id) ?? []];
  const ths = headers.map((h) => `<th>${h}</th>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${board.name} — Dashboard</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-gray-50 p-8 font-sans">
  <h1 class="text-2xl font-bold text-gray-900 mb-2">${board.name}</h1>
  <p class="text-sm text-gray-400 mb-6">Last updated: ${new Date().toUTCString()}</p>
  <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
    <table class="w-full text-sm text-left text-gray-700">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>${ths}</tr>
      </thead>
      <tbody class="divide-y divide-gray-100">${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

// 3. Escreve dist/index.html
const board = await fetchBoardData();
const html  = generateHTML(board);
await fs.mkdir(path.resolve("dist"), { recursive: true });
await fs.writeFile(path.resolve("dist/index.html"), html, "utf8");
console.log(`✓ Dashboard gerado: ${board.items_page.items.length} itens`);
```

---

## Secrets necessários no GitHub

| Secret | Valor |
|---|---|
| `MONDAY_API_TOKEN` | Token da API do Monday (Settings → Administration → API) |
| `MONDAY_BOARD_ID` | ID numérico do board (aparece na URL: monday.com/boards/**123456789**) |

Configurar em: **Repo → Settings → Secrets and variables → Actions → New repository secret**

---

## Como configurar o webhook no Monday

No board do Monday:
1. **Integrations → Automation** → Create automation
2. Trigger: `"When any column changes"` (ou `"When item created"`, etc.)
3. Action: `"Send a webhook"`
   - **URL:** `https://api.github.com/repos/SEU_USER/SEU_REPO/dispatches`
   - **Headers:**
     ```
     Authorization: Bearer SEU_GITHUB_PAT
     Accept: application/vnd.github+json
     Content-Type: application/json
     ```
   - **Body:**
     ```json
     { "event_type": "monday_updated" }
     ```

> O **GitHub PAT** precisa do escopo `repo` (ou `workflow`).
> Gerar em: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
> O PAT fica salvo no Monday, **nunca** no repositório.

---

## Referências de projeto similar

Este briefing foi criado a partir do projeto **ai-response-evaluator**
(`github.com/NatanaelQueiroz/ai-response-evaluator`), que usa a mesma
stack GitHub Actions + `actions/deploy-pages@v4` para deploy no GitHub Pages.
O padrão de secrets (chave nunca no código, sempre em `${{ secrets.X }}`)
e o workflow base são idênticos.
