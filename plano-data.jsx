/* global React */
// Initial demo content for the canvas — mix of all element types

const PLANO_FOLDERS = [
  { id: "f-active", name: "Em andamento", count: 4, color: "var(--accent)" },
  { id: "f-product", name: "Produto", count: 3, color: "oklch(0.65 0.14 220)", active: true, current: "lançamento q3" },
  { id: "f-research", name: "Pesquisa", count: 7, color: "oklch(0.62 0.14 145)" },
  { id: "f-marketing", name: "Marketing", count: 2, color: "oklch(0.62 0.14 305)" },
  { id: "f-archived", name: "Arquivados", count: 12, color: "var(--ink-mute)", section: "outros" },
];

const PLANO_CHILDREN = {
  "f-product": [
    { id: "f-launch", name: "Lançamento Q3", count: 14, current: true },
    { id: "f-roadmap", name: "Roadmap 2026", count: 9 },
    { id: "f-research-int", name: "Insights de usuários", count: 5 },
  ],
};

const PLANO_INITIAL_ELEMENTS = [
  // Title sticky
  {
    id: "el-title", type: "sticky",
    x: 60, y: 60, w: 280, h: 110,
    color: "yellow",
    text: "Lançamento Q3 — onboarding redesign",
    meta: "amanda · 14 abr",
  },
  // Big intro card with goal
  {
    id: "el-goal", type: "card",
    x: 60, y: 200, w: 320, h: 170,
    title: "Objetivo",
    body: "Reduzir o time-to-first-aha de 4'30\" para menos de 90 segundos. Nova ativação focada em valor concreto, não em tour de features.",
    tag: { label: "north star", dot: true },
    meta: "v3 · 12 cmt",
  },
  // Brainstorm cluster — 3 sticky notes
  { id: "el-s1", type: "sticky", x: 480, y: 60, w: 200, h: 130, color: "pink",
    text: "checklist guiado dentro do produto, não tour separado",
    meta: "thiago" },
  { id: "el-s2", type: "sticky", x: 700, y: 90, w: 200, h: 130, color: "blue",
    text: "pular onboarding deve ser visível mas não óbvio",
    meta: "amanda" },
  { id: "el-s3", type: "sticky", x: 590, y: 220, w: 200, h: 130, color: "green",
    text: "primeiro projeto pré-populado com exemplo real",
    meta: "rita" },

  // Image board
  {
    id: "el-img1", type: "image",
    x: 940, y: 60, w: 240, h: 170,
    caption: "ref · linear onboarding", placeholder: "moodboard frame 01",
  },
  {
    id: "el-img2", type: "image",
    x: 1200, y: 60, w: 240, h: 170,
    caption: "ref · arc browser",
    placeholder: "moodboard frame 02",
  },

  // Shapes — diamond decision + circle milestone
  {
    id: "el-shape1", type: "shape",
    x: 380, y: 410, w: 130, h: 130,
    shape: "diamond", label: "novo usuário?",
  },
  {
    id: "el-shape2", type: "shape",
    x: 940, y: 480, w: 110, h: 110,
    shape: "circle", label: "Beta",
  },

  // Checklist
  {
    id: "el-check", type: "checklist",
    x: 60, y: 410, w: 290, h: 280,
    title: "Sprint 21",
    items: [
      { id: "c1", text: "Mapear estado atual do funil", done: true },
      { id: "c2", text: "Entrevistar 5 usuários novos", done: true },
      { id: "c3", text: "Wireframe v1 do checklist", done: true },
      { id: "c4", text: "Protótipo navegável", done: false },
      { id: "c5", text: "Teste com 8 participantes", done: false },
      { id: "c6", text: "Spec técnica + handoff", done: false },
    ],
  },

  // Column 1 — descobertas
  {
    id: "el-col1", type: "column",
    x: 1480, y: 60, w: 240, h: 320,
    color: "oklch(0.65 0.14 220)",
    title: "Descobertas",
    items: [
      { id: "i1", text: "Tour atual ignora 73% dos usuários", done: false },
      { id: "i2", text: "Pessoas voltam pra docs depois do tour", done: false },
      { id: "i3", text: "Empty states são o gargalo real", done: false },
      { id: "i4", text: "Plan free não diferencia experiência", done: true },
    ],
  },
  // Column 2 — em prototipação
  {
    id: "el-col2", type: "column",
    x: 1740, y: 60, w: 240, h: 320,
    color: "var(--accent)",
    title: "Em prototipação",
    items: [
      { id: "j1", text: "Checklist contextual flutuante", done: false },
      { id: "j2", text: "Workspace com dados de exemplo", done: false },
      { id: "j3", text: "Pulse de ativação no dia 3", done: false },
    ],
  },
  // Column 3 — descartadas
  {
    id: "el-col3", type: "column",
    x: 2000, y: 60, w: 240, h: 320,
    color: "var(--ink-mute)",
    title: "Descartadas",
    items: [
      { id: "k1", text: "Vídeo de boas-vindas obrigatório", done: true },
      { id: "k2", text: "Modal de tour multi-passos", done: true },
    ],
  },

  // Audio
  {
    id: "el-audio", type: "audio",
    x: 940, y: 270, w: 320, h: 90,
    title: "entrevista — usuário p4",
    duration: "08:42",
    progress: 0.32,
  },
  // File
  {
    id: "el-file1", type: "file",
    x: 1280, y: 270, w: 220, h: 70,
    name: "metricas-funnel-v3.xlsx",
    size: "184 kb",
    ext: "xls",
  },
  {
    id: "el-file2", type: "file",
    x: 1280, y: 360, w: 220, h: 70,
    name: "tracking-events.py",
    size: "12 kb",
    ext: "py",
  },

  // Link / embed
  {
    id: "el-link", type: "link",
    x: 700, y: 410, w: 220, h: 200,
    title: "First-time user experience patterns",
    host: "growth.design",
    placeholder: "preview · growth.design",
  },

  // Section header card
  {
    id: "el-section", type: "card",
    x: 60, y: 720, w: 320, h: 100,
    title: "Próximos passos",
    body: "validar hipótese 03 com prototipo navegável até sex 25/abr.",
    tag: { label: "esta semana", dot: true },
    meta: "—",
  },
];

const PLANO_INITIAL_CONNECTIONS = [
  { id: "cn-1", from: "el-goal", to: "el-s1", fromSide: "r", toSide: "l", style: "curve", arrow: true },
  { id: "cn-2", from: "el-s1", to: "el-s3", fromSide: "b", toSide: "t", style: "curve", arrow: false },
  { id: "cn-3", from: "el-s2", to: "el-s3", fromSide: "b", toSide: "t", style: "dashed", arrow: false },
  { id: "cn-4", from: "el-s3", to: "el-shape1", fromSide: "b", toSide: "t", style: "straight", arrow: true, label: "explorar" },
  { id: "cn-5", from: "el-shape1", to: "el-check", fromSide: "l", toSide: "r", style: "curve", arrow: true, label: "sim" },
  { id: "cn-6", from: "el-shape1", to: "el-link", fromSide: "r", toSide: "l", style: "curve", arrow: true, label: "ref" },
  { id: "cn-7", from: "el-img1", to: "el-img2", fromSide: "r", toSide: "l", style: "straight", arrow: false },
];

const PLANO_COLLABORATORS = [
  { id: "u1", name: "Amanda", initials: "AM", color: "oklch(0.62 0.18 28)", x: 800, y: 320 },
  { id: "u2", name: "Thiago", initials: "TH", color: "oklch(0.6 0.16 235)", x: 1340, y: 200 },
];

window.PLANO_FOLDERS = PLANO_FOLDERS;
window.PLANO_CHILDREN = PLANO_CHILDREN;
window.PLANO_INITIAL_ELEMENTS = PLANO_INITIAL_ELEMENTS;
window.PLANO_INITIAL_CONNECTIONS = PLANO_INITIAL_CONNECTIONS;
window.PLANO_COLLABORATORS = PLANO_COLLABORATORS;
