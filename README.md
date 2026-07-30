# FORJA – App de Registro de Treinos

PWA (Progressive Web App) para registro e acompanhamento de treinos físicos.

## Funcionalidades

- **Registro de treinos** — nome, grupos musculares, exercícios com séries/reps/peso
- **Temporizador de descanso** — configurável com presets (30s, 1min, 1:30, 2min, 3min) e tempo personalizado
- **Progresso** — heatmap de consistência, volume semanal, recordes pessoais, frequência por grupo muscular
- **Modo claro/escuro** — toggle instantâneo com persistência
- **100% offline** — todos os dados salvos localmente via localStorage + Service Worker
- **Installable** — compatível com PWABuilder para gerar APK (Android) e IPA (iOS)

## Deploy no GitHub Pages

1. Suba todos os arquivos para um repositório público
2. Ative GitHub Pages na branch `main`, pasta `/` (root)
3. Acesse via `https://seu-usuario.github.io/forja/`

## Gerar APK via PWABuilder

1. Acesse [pwabuilder.com](https://pwabuilder.com)
2. Cole a URL do seu GitHub Pages
3. Selecione Android → gere o APK
4. Instale diretamente ou publique na Play Store

## Estrutura

```
forja/
├── index.html          # App principal (todas as telas)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (cache offline)
├── css/
│   └── style.css       # Tema dark/light, layout mobile
├── js/
│   ├── db.js           # Camada de dados (localStorage)
│   ├── timer.js        # Módulo do temporizador
│   ├── charts.js       # Gráficos em canvas puro
│   └── app.js          # Lógica principal
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Identidade Visual

- **Nome:** FORJA
- **Cor principal:** `#FF5733` (laranja-fogo)
- **Fundos:** `#0F1117` (dark) / `#F0F2F7` (light)
- **Tipografia:** Barlow Condensed (títulos/números) + Inter (corpo)
