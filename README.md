# 🏆 Fantacalcio Assistant - Setup e Avvio

## 📋 Prerequisiti
- Node.js 18+ installato
- npm o yarn

## 🚀 Setup Iniziale

### 1. Crea la struttura delle cartelle

```bash
mkdir fantacalcio-assistant
cd fantacalcio-assistant

# Crea la struttura delle cartelle
mkdir -p src/components/Layout
mkdir -p src/components/PlayerCard  
mkdir -p src/components/Modals
mkdir -p src/stores
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p public
```

### 2. Copia i file che ti ho fornito

Posiziona ogni file nella sua cartella:
- `package.json` → nella root del progetto
- `vite.config.ts` → nella root
- `tsconfig.json` → nella root
- `src/types/index.ts` → in src/types/
- `src/stores/auctionStore.ts` → in src/stores/
- `src/App.tsx` → in src/
- `src/components/Layout/TopBar.tsx` → in src/components/Layout/
- `src/components/Layout/MainPanel.tsx` → in src/components/Layout/
- `src/components/PlayerCard/PlayerCard.tsx` → in src/components/PlayerCard/

### 3. Crea i file mancanti

#### `tsconfig.node.json` (nella root)
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `tailwind.config.js` (nella root)
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### `postcss.config.js` (nella root)
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f7fafc;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}
```

#### `src/main.tsx`
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `index.html` (nella root)
```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fantacalcio Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 4. Installa le dipendenze

```bash
npm install
```

### 5. Avvia l'applicazione

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

## 📁 File ancora da creare

Ti servono ancora questi componenti per completare l'app:

### Componenti essenziali mancanti:
- `src/components/Layout/SidePanel.tsx`
- `src/components/SearchBar.tsx`
- `src/components/AlternativePlayers.tsx`
- `src/components/Modals/ImportModal.tsx`
- `src/hooks/useHotkeys.ts`
- `src/hooks/usePlayerSearch.ts`
- `src/utils/dataParser.ts`

## 🎯 Come usare l'app

1. **Prima volta**: Importa il file Excel da fantacalcio-py
2. **Durante l'asta**: 
   - Cerca il giocatore chiamato
   - Segui il semaforo (verde/giallo/rosso)
   - Inserisci il prezzo e marca l'acquisto
3. **I dati vengono salvati** automaticamente nel browser

## 🐛 Troubleshooting

Se hai errori:
1. Assicurati di aver creato tutti i file
2. Controlla che le dipendenze siano installate
3. Verifica la struttura delle cartelle

## 🚀 Build per produzione

```bash
npm run build
```

I file compilati saranno in `dist/`