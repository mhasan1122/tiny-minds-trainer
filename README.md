# Brain Kids Game

An educational kids game built with Expo and React Native. Help children learn colors, counting, shapes, memory, and animal sounds through fun, interactive mini games.

## Features

- **5 Mini Games**
  - **Color Match** — Match colors correctly
  - **Counting Fun** — Count to 10
  - **Shape Match** — Find and identify shapes
  - **Memory Cards** — Find matching pairs
  - **Animal Sounds** — Guess animals by their sounds

- **Difficulty Levels** — Easy, Medium, and Hard modes
- **Star Rewards** — Earn stars for completed games
- **Sound Effects** — Toggle on/off for game sounds
- **Responsive Design** — Works on mobile, tablet, and desktop (web)
- **Dark & Light Themes** — Automatic theme based on system preference

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your phone (for testing on device)
- iOS Simulator (macOS) or Android Emulator (optional)

## Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS (requires Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android

# Run in web browser
npm run web
```

After running `npm start`, scan the QR code with Expo Go (Android) or the Camera app (iOS) to open the app on your device.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm run build` | Export for production |
| `npm run build:web` | Export web build |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset project to blank state |

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with theme
│   ├── index.tsx           # Welcome screen
│   ├── games.tsx           # Game selection
│   ├── reward.tsx          # Rewards screen
│   └── game/               # Individual game screens
│       ├── colors.tsx
│       ├── counting.tsx
│       ├── shapes.tsx
│       ├── memory.tsx
│       └── animals.tsx
├── components/             # Reusable UI components
├── constants/              # Game data, colors, config
├── contexts/               # React context (GameContext, etc.)
├── hooks/                  # Custom hooks (sound, animations)
└── scripts/                # Build & utility scripts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Optional. API base URL (default: `https://www.capsulethis.com`) |

## Tech Stack

- **Expo** 54 — React Native framework
- **Expo Router** — File-based navigation
- **TypeScript** — Type safety
- **React Native Reanimated** — Animations
- **Lucide React Native** — Icons
- **Nunito** — Custom fonts via `@expo-google-fonts/dev`

## Building for Production

```bash
# Create production build
npm run build

# Web-specific build
npm run build:web
```

## License

Private — All rights reserved.
