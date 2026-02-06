# Mind Map

AI-powered mind mapping app built with React Native (Expo). Create mind maps, organize ideas across multiple tabs, and use AI to synthesize creative new ideas from your existing nodes.

## Features

- **Mind Map Canvas** — Drag-and-drop nodes with bezier curve connections
- **Multi-Tab** — Organize different topics in separate tabs
- **Node Editing** — Add, edit, delete, and color-code nodes
- **Auto Layout** — One-click tree layout algorithm
- **Collapse/Expand** — Hide subtrees to focus on what matters
- **AI Synthesis** — Claude or OpenAI analyzes your mind map and suggests creative ideas
- **Responsive** — AI panel on the right (desktop) or bottom (mobile)
- **Persistent Storage** — All data saved locally via AsyncStorage
- **Cross-Platform** — Web, iOS, and Android from one codebase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + React Native |
| Language | TypeScript |
| Routing | Expo Router v6 |
| State | Zustand |
| Storage | AsyncStorage |
| Rendering | react-native-svg + react-native-reanimated |
| Gestures | react-native-gesture-handler |
| AI | Claude API / OpenAI API (user-provided keys) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
npm install
```

### Run

```bash
# Web
npx expo start --web

# Mobile (Expo Go)
npx expo start
```

### Build for Web

```bash
npx expo export --platform web
```

## Project Structure

```
app/                    # Expo Router screens
  _layout.tsx           # Root layout (GestureHandlerRootView)
  index.tsx             # Main screen (tabs + canvas + AI panel)
  settings.tsx          # Settings (API key configuration)
src/
  components/
    mindmap/            # Canvas, Node, ConnectionLines, NodeEditor
    tabs/               # TabBar, TabItem
    ai/                 # AISynthesisPanel, AIResultCard
    common/             # ColorPicker, ConfirmDialog
  store/                # Zustand stores (mindmap, settings)
  services/
    ai/                 # Claude/OpenAI clients, prompt builder
    storage/            # AsyncStorage wrapper
  hooks/                # useDragNode, useLayout, useAISynthesis
  utils/                # Tree layout, geometry, constants
  theme/                # Design tokens
```

## AI Synthesis

1. Go to **Settings** and enter your API key (Claude or OpenAI)
2. Build out your mind map with nodes and branches
3. Click **Generate Ideas** in the AI panel
4. AI analyzes all nodes and suggests 3 creative ideas that connect different branches
5. Click **+ Add to Mind Map** to add any idea as a new node

> **Note:** Claude API works on both web and mobile. OpenAI API may be blocked by CORS on web — use it on mobile or use Claude for web.

## License

MIT
