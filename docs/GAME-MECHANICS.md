# Game Mechanics and Logic

## 1. Core Gameplay

The game is a fast-paced, vertical scrolling runner where the player character is positioned towards the bottom of the screen. The objective is to survive as long as possible by avoiding obstacles while collecting score-boosting items (collectibles). The game world continuously scrolls downwards, simulating the player running upwards.

## 2. Lane System

* **Structure**: The playable area is divided into three distinct vertical lanes: left, center, and right.
* **Player Movement**: The player can switch between these lanes to dodge obstacles and gather collectibles. Movement is initiated by arrow keys (desktop) or swipe gestures (mobile). The player character tweens to the new lane.
* **Lane Coordinates**: Each lane has a defined X-coordinate.
    * `lanes = [gameWidth * 0.25, gameWidth * 0.5, gameWidth * 0.75]`
    * Player Y position is fixed: `playerFixedY = gameHeight * 0.8`

## 3. Collectibles

Collectibles are the primary means of scoring points and gaining advantages.

### 3.1. Regular Collectibles (Orbs)

* **Purpose**: Increase the player's score.
* **Appearance**: Various types of orbs (e.g., 'collectible_pink', 'collectible_purple', 'collectible_red', 'collectible_green').
* **Value**: Each regular orb awards **1 point** (multiplied by the active score multiplier).
* **Spawning Frequency**: Spawn at a **high frequency**.
    * Initial `collectibleSpawnDelay`: `200`ms (Adjustable)
* **Spawning Location**:
    * Spawn at the top of the screen, just above the visible area (Y-position of -50).
    * **Lane Selection Logic**:
        1. Identify all available lanes (0, 1, 2) and shuffle them.
        2. Check each potential lane to see if an *obstacle* has spawned in that same lane very recently (within `laneAvoidanceTime`, e.g., 500ms).
        3. Attempt to spawn in the first available "clear" lane.
        4. If all lanes have recent obstacles, pick the lane with the oldest obstacle (or an empty lane if one exists).
        5. The chosen lane is marked as "recently containing a collectible."
* **Visibility**:
    * Spawn with `alpha = 0` (invisible).
    * Fade in between Y-thresholds (e.g., 25% to 35% down the screen).
* **Movement**: Scroll downwards at the current `gameSpeed`.
* **Animation**: Can have spinning/hover animations.
* **Depth/Layering**: Rendered at `collectible.setDepth(4)`.
* **Collection**: Player overlap collects the orb, score increments, `collectibleSound` plays. If a multiplier is active, floating text shows the points gained.

### 3.2. Special Collectibles

Spawned periodically by `specialCollectibleTimer`.

* **Flower Bouquet (`wedding_bouquet`)**:
    * **Purpose**: Awards a larger score bonus.
    * **Value**: Awards **10 points** (multiplied by the active score multiplier).
    * **Spawn Chance**: `bouquetSpawnChance` (e.g., 0.20 or 20%) when the special timer triggers. (Adjustable)
    * **Collection**: `bouquetSound` plays, floating text shows points.
* **Wedding Band (`wedding_band`)**:
    * **Purpose**: Activates a score multiplier.
    * **Effect**: Activates a **2x score multiplier** for `multiplierDuration` (e.g., 10,000ms or 10 seconds). (Adjustable)
    * **Spawn Chance**: `weddingBandSpawnChance` (e.g., 0.10 or 10%) when the special timer triggers. (Adjustable)
    * **Collection**: `weddingBandsSound` plays, "2X MULTIPLIER!" floating text appears. Multiplier text `x2 POINTS!` shows on UI.
* **Spawning Frequency (Special Collectibles Overall)**:
    * `specialCollectibleSpawnDelay`: e.g., `5000`ms (Adjustable)
* **Spawning Location (Special Collectibles)**:
    * Logic similar to regular collectibles but tries to find a lane clear of *both* recent obstacles and recent collectibles. If not possible, it picks the lane with the oldest item.
* **Visibility**: Same fade-in logic as regular collectibles.
* **Depth/Layering**: Rendered at `collectible.setDepth(4.5)` (between regular collectibles and obstacles).
* **Animation**: Special collectibles have a slight glow/scale tween.

### 3.3. Adjustable Collectible Parameters (Code Snippets from `BaseGameScene.ts`)

```typescript
// Regular Collectible Spawn Rate
protected collectibleSpawnDelay: number = 200; // More frequent collectibles

// Special Collectibles
protected bouquetSpawnChance: number = 0.20; // 20% chance for a bouquet
protected weddingBandSpawnChance: number = 0.10; // 10% chance for a wedding band
protected specialCollectibleSpawnDelay: number = 5000; // Every 5 seconds

// Score Multiplier (from Wedding Band)
protected scoreMultiplier: number = 1; // Default multiplier is 1x (becomes 2)
protected multiplierDuration: number = 10000; // 10 seconds in milliseconds

// Lane Avoidance for Spawning
protected laneAvoidanceTime: number = 500; // Time in ms to avoid spawning in the same lane
```

## 4. Obstacles

* **Purpose**: Primary challenge; collision results in game over.
* **Appearance**: Themed items like 'tombstone' or 'spirit_orb'.
* **Spawning Frequency**: Spawn at a **lower frequency** than regular collectibles.
    * Initial `obstacleSpawnDelay`: `2000`ms (Adjustable)
* **Spawning Location**:
    * Spawn at the top of the screen (Y-position of -50).
    * **Lane Selection Logic**:
        1. Identify all available lanes and shuffle them.
        2. Check each potential lane to see if a *collectible* (regular or special) has spawned in that same lane very recently (within `laneAvoidanceTime`).
        3. Attempt to spawn in the first available "clear" lane.
        4. If all lanes have recent collectibles, pick the lane with the oldest collectible (or an empty lane if one exists).
        5. The chosen lane is marked as "recently containing an obstacle."
* **Visibility**:
    * Spawn with `alpha = 0` (invisible).
    * Fade in between Y-thresholds (e.g., 25% to 35% down the screen).
* **Movement**: Scroll downwards at the current `gameSpeed`.
* **Animation**:
    * Tombstones: Dancing animation (angle tween).
    * Spirit Orbs: Wobble (X-position tween) and scale pulsing.
* **Depth/Layering**: Rendered at `obstacle.setDepth(5)` (in front of all collectibles).
* **Collision**: Player overlap ends the game (`isGameOver = true`), `collideSound` plays, player tints red, game over screen is shown.

### 4.1. Adjustable Obstacle Parameters (Code Snippets from `BaseGameScene.ts`)

```typescript
// Obstacle Spawn Rate
protected obstacleSpawnDelay: number = 2000; // Slower than collectibles

// Lane Avoidance for Spawning
protected laneAvoidanceTime: number = 500; // Time in ms to avoid spawning in the same lane
```

## 5. Progressive Difficulty System

The game's difficulty increases as the player scores more points.

* **Mechanism**:
    * Starts at `difficultyLevel = 1`.
    * When `score` reaches `nextSpeedIncreaseThreshold`, `difficultyLevel` increments.
    * `nextSpeedIncreaseThreshold` is then increased by `pointsPerSpeedIncrease`.
* **Effects of Increased Difficulty**:
    1. `gameSpeed` increases by `speedIncreaseAmount`.
    2. `obstacleSpawnDelay` decreases by `speedIncreasePercentage` (min cap, e.g., 800ms).
    3. `collectibleSpawnDelay` decreases by `speedIncreasePercentage` (min cap, e.g., 100ms).
* **Maximum Difficulty**: Capped at `maxDifficultyLevel` (e.g., 10).
* **Feedback**: `difficultyText` on UI updates (e.g., "Speed: 2"), and flashes briefly.

### 5.1. Adjustable Difficulty Parameters (Code Snippets from `BaseGameScene.ts`)

```typescript
// Progressive Difficulty System
protected difficultyLevel: number = 1;
protected nextSpeedIncreaseThreshold: number = 100; // First threshold at 100 points
protected pointsPerSpeedIncrease: number = 100; // Increase speed every 100 points
protected speedIncreaseAmount: number = 30; // Add 30 to gameSpeed each threshold
protected speedIncreasePercentage: number = 0.10; // Reduce spawn delays by 10% each threshold
protected maxDifficultyLevel: number = 10; // Cap difficulty increases

// Initial Game Speed (also base for progression)
protected gameSpeed: number = 300;
```

## 6. Other Gameplay Elements

* **Ravens**: Visual-only elements that fly across the screen periodically. They have their own spawn timer (`ravenTimer`) and do not interact with gameplay directly. They are rendered at `raven.setDepth(2)`.
* **Floating Text**: Used to provide feedback for score gains (e.g., "+10", "+1") and multiplier activation ("2X MULTIPLIER!").
* **Sound Effects**: Various sounds for starting game, swipe, collecting items, collision, and game over.
* **Background Music**: Plays during gameplay and fades out on game over.

## 7. Gameplay Dynamic and Strategy

The core loop involves:

* **Constant Vigilance**: Players must watch for incoming obstacles.
* **Greed vs. Safety**: The high frequency of collectibles encourages players to frequently switch lanes to maximize their score. The special collectibles (especially Wedding Bands for score multiplication) further incentivize this.
* **Risk Management**: This active pursuit of collectibles inherently puts the player at risk of maneuvering into the path of a less frequent but deadly obstacle. The lane avoidance logic at spawn time aims to prevent unfair instant overlaps at the top of the screen, but the player must still anticipate and react as items scroll down. The progressive difficulty ensures the challenge ramps up over time.

The goal of this design is to create a thrilling experience where players are tempted by a flood of scoring opportunities while carefully navigating dangers, making quick decisions about lane choices under increasing pressure.
