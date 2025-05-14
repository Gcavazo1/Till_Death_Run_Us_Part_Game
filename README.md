# Til Death Run Us Part - Vertical Endless Runner

A stylish vertical endless runner game with a gothic zombie bride theme. Run upwards, dodge obstacles, and collect orbs in this spooky, atmospheric game.

## Project Overview

This is a fast-paced arcade-style endless runner built with Phaser 3 and TypeScript. The game features:

- **Vertical scrolling gameplay** with the character running upwards
- **Lane-based movement system** with smooth animations
- **Progressive difficulty** that increases with player score
- **Collectible system** with regular and special items
- **Responsive design** that works on both desktop and mobile devices
- **Atmospheric gothic visuals** with custom character sprites and animations

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/til-death-run-us-part.git
   cd til-death-run-us-part
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:5173 (or the URL shown in your terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## How to Play

**Goal:** Survive as long as possible by dodging obstacles while collecting spirit orbs and special items to maximize your score.

**Controls:**

* **Start Game:** Click/Tap the screen or press the Spacebar
* **Move Left/Right:**
  * **Desktop:** Left/Right Arrow keys
  * **Mobile:** Swipe Left/Right

**Items:**
* **Spirit Orbs:** Basic collectibles that give you 1 point each
* **Wedding Bouquet:** Special collectible worth 10 points
* **Wedding Bands:** Activates a 2x score multiplier for 10 seconds

**Obstacles:**
* **Tombstones and Ghostly Spirits:** Avoid these! Collision ends the game

## Project Structure

```
project/
├── src/
│   ├── core/
│   │   ├── scenes/
│   │   │   └── BaseGameScene.ts     # Core game mechanics shared by all platforms
│   │   ├── utils/
│   │   │   ├── AssetLoader.ts       # Asset loading logic
│   │   │   └── GameMechanicsConfig.ts  # Platform-specific game parameters
│   │   ├── desktop/
│   │   └── DesktopGameScene.ts      # Desktop-specific implementation
│   │   └── mobile/
│   │       └── MobileGameScene.ts       # Mobile-specific implementation
│   │   └── main.ts                      # Entry point with platform detection
│   └── style.css                    # Game styling
├── assets/                          # Game assets (images, audio, fonts)
├── docs/                            # Documentation files
│   ├── GAME-MECHANICS.md            # Detailed game mechanics documentation
│   ├── MOBILE-DESKTOP-CONFIG-GUIDE.md  # Platform-specific configuration guide
│   └── ZOMBIE-BRIDE-CHARACTER-ANIMATION-GUIDE.md  # Character animation documentation
├── index.html                       # Main HTML file
├── vite.config.js                   # Vite build configuration
└── package.json                     # Project dependencies and scripts
```

## Key Features Implementation

### Progressive Difficulty

The game's difficulty increases as the player scores more points:
- Speed increases every 100 points
- Obstacle spawn rate increases
- Collectible spawn rate increases
- Maximum difficulty is capped at level 10

### Character Animation

The zombie bride character uses a sprite sheet with:
- 8-frame running animation
- 4-frame turning right animation 
- 4-frame turning left animation

### Atmospheric Elements

- Flying ravens that cross the screen periodically
- Glowing eyes that peer from the background
- Gothic-themed UI elements and fonts
- Spooky soundtrack and sound effects

## Credits

- **Developer:** Gabriel Cavazos (GigaCode)
- **Contact:** gigacode.developer@gmail.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.