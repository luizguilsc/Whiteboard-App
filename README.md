# Whiteboard MVP (Python + HTML/CSS/JS)

Projeto inicial de whiteboard inspirado em Milanote, mas com identidade própria e base técnica pronta para evoluir.

## 1) Arquitetura ideal (visão de produto)

- **Frontend (SPA leve)**
  - Renderização visual do board com `Konva.js` (canvas interativo).
  - Estado em memória (`elements`, `connections`, `viewport`) com serialização em JSON.
  - Exportações client-side (JSON/PNG/PDF).
- **Backend (FastAPI)**
  - API REST para salvar/carregar boards.
  - Persistência em SQLite no MVP.
  - Fácil extensão para autenticação, versionamento e colaboração.
- **Persistência**
  - Tabela `boards` com `id`, `name`, `data(JSON)`, timestamps.
  - Estrutura `data` flexível para suportar novos tipos de bloco sem migração imediata.

### Fluxo simplificado
1. Usuário edita elementos no canvas.
2. Frontend gera JSON do estado do board.
3. Backend salva no SQLite.
4. Frontend pode reabrir board via API.

## 2) Bibliotecas sugeridas para canvas/whiteboard

- **Konva.js (escolhida no MVP)**: boa API para drag, zoom, seleção, transformações e performance.
- **Fabric.js**: alternativa madura para objetos no canvas.
- **Excalidraw libs**: ótimas para whiteboard colaborativo, porém mais opinativas.
- **Rough.js + custom engine**: estilo desenhado à mão.

## 3) Estrutura de pastas

```txt
.
├── app/
│   ├── api/routes.py
│   ├── core/config.py
│   ├── models/board.py
│   ├── services/board_service.py
│   ├── storage/db.py
│   └── main.py
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── data/                 # criado automaticamente (SQLite)
├── main.py               # atalho de execução
├── requirements.txt
└── README.md
```

## 4) MVP atual implementado

- Canvas navegável (pan + zoom).
- Adição de: texto, sticky note, listas, colunas, tabela editável, pasta navegável, checklist, progresso, retângulo, círculo, seta e imagem.
- Drag & drop com pan separado (botão do meio), seleção mais precisa, redimensionamento e editor contextual (menu suspenso).
- Conexão entre elementos selecionados e movimento de elementos para pastas.
- Importar JSON local e imagem local.
- Exportar JSON, PNG e PDF.
- Salvar/carregar board no backend (SQLite).

## 5) Como rodar localmente

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Abra: `http://127.0.0.1:8000`

## 6) Próximas melhorias (roadmap)

1. **Login e multiusuário** (JWT + refresh token + RBAC).
2. **Colaboração em tempo real** (WebSocket com FastAPI + presença de usuários + locks otimistas).
3. **Templates** (board starter kits por caso de uso).
4. **Histórico e versionamento** (event sourcing ou snapshots incrementais).
5. **Cloud storage** (S3/GCS) para anexos e imagens.
6. **Busca global e tags** em todos os boards.
7. **Permissões por board** (owner/editor/viewer).
8. **Telemetria e observabilidade** (Sentry + OpenTelemetry).
9. **Testes E2E** (Playwright) e suíte de carga para colaboração.
