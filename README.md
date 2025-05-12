# Til Death Run Us Part - Vertical Endless Runner

A stylish vertical endless runner game with a gothic zombie bride theme. Run upwards, dodge obstacles, and collect orbs in this spooky, atmospheric game.

## Project Structure

The project uses Phaser 3 and Vite. Key files include:

- `src/main.ts`: Main entry point, sets up Phaser game instance.
- `src/core/scenes/BaseGameScene.ts`: Core game logic and mechanics (player movement, spawning, collisions, scoring, difficulty). Shared between potential future platform variations.
- `src/desktop/DesktopGameScene.ts`: Desktop-specific scene implementation (currently used).
- `src/core/utils/AssetLoader.ts`: Handles loading of all game assets.
- `src/core/utils/GameMechanicsConfig.ts`: Defines game parameters like speed, spawn rates, player size, etc.
- `assets/`: Contains all image, font, and audio assets.
- `index.html` & `src/style.css`: HTML structure and CSS for layout, including the iPhone frame and header/footer.
- `vite.config.js`: Vite configuration, ensures assets are copied during build.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `docs/ZOMBIE-BRIDE-CHARACTER-ANIMATION-GUIDE.md`: Documentation for character sprite animations.

## Running the Game

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open the game in your browser (usually `http://localhost:5173`).

## How to Play

**Goal:** Survive as long as possible by dodging obstacles while collecting spirit orbs and special items to maximize your score. The game speeds up over time!

**Controls:**

*   **Start Game:** Click/Tap the screen or press the Spacebar.
*   **Change Lanes:**
    *   **Desktop:** Left/Right Arrow keys.
    *   **Mobile:** Swipe Left/Right.

## Gameplay Features

*   **Vertical Endless Runner:** Character runs "upwards" automatically.
*   **Lane-Based Movement:** Switch between three distinct lanes to avoid obstacles.
*   **Animated Character:** Zombie bride uses sprite sheet animations for running and turning.
*   **Obstacles:** Dodge tombstones and ghostly spirit orbs.
*   **Collectibles:** Gather spirit orbs for points. Special wedding bands activate a score multiplier, and wedding bouquets give bonus points.
*   **Progressive Difficulty:** Game speed increases and obstacles/collectibles spawn faster as your score rises.
*   **Gothic Atmosphere:** Features a zombie bride character, graveyard theme, spooky music, and visual effects like flying ravens and peering eyes.
*   **Responsive Layout:** Framed within an iPhone image with a themed header and footer.

## Assets Used

*   **Player:** 
    * `zombie_bride_sheet.png` (sprite sheet for animations: running, turning left/right)
    * Legacy static images: `zombie_bride_back.png`, `zombie_bride_left.png`, `zombie_bride_right.png`
*   **Obstacles:** `tombstone.png`, `spirit_orb.png`
*   **Collectibles:** `pink_collectible.png`, `purple_collectible.png`, `red_collectible.png`, `green_collectible.png`, `wedding_bouquet.png`, `wedding_bands.png`
*   **Background & UI:** `background.png`, `game_over.png`, `iphone_background_landscape08.jpg`
*   **Visual Effects:** `raven_left.png`, `raven_right.png`, `blue_eyes.png`, `red_eyes.png`, `green_eyes.png`, `yellow_eyes.png`
*   **Audio:** `spooky_scary_skeletons.mp3`, `spooky_time.mp3`, various SFX (`start.mp3`, `swipe.mp3`, `bouquet.mp3`, `wedding_bands.mp3`, `game_over.mp3`, `collectible.mp3`, `collide.mp3`)
*   **Fonts:** `OctoberCrow.ttf`, `Corpsy.otf`

## Credits

*   **Developer:** Gabriel Cavazos (GigaCode)
*   **Support:** gigacode.developer@gmail.com

*(Asset sources should be added here if applicable)*