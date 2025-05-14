import { GameConfig } from './GameConfig';

/**
 * Interface defining all tunable game mechanics parameters
 */
export interface GameMechanicsParameters {
  // Core gameplay
  gameSpeed: number;
  playerSize: number;
  
  // Spawn timing
  obstacleSpawnDelay: number;
  collectibleSpawnDelay: number;
  specialCollectibleSpawnDelay: number;
  laneAvoidanceTime: number;
  
  // Special collectibles
  bouquetSpawnChance: number; 
  weddingBandSpawnChance: number;
  
  // Score multiplier
  scoreMultiplier: number;
  multiplierDuration: number;
  
  // Difficulty progression
  difficultyLevel: number;
  pointsPerSpeedIncrease: number;
  speedIncreaseAmount: number;
  speedIncreasePercentage: number;
  maxDifficultyLevel: number;
  
  // Input settings
  swipeThreshold: number; // Minimum pixel distance to register a swipe
  
  // Visual settings
  playerFixedYPosition: number; // As percentage of screen height
  laneWidthPercentages: number[]; // Array of percentages for lane positions
}

/**
 * Desktop configuration - using exact current values from BaseGameScene
 * to maintain identical behavior
 */
const desktopMechanics: GameMechanicsParameters = {
  // Core gameplay
  gameSpeed: 340,
  playerSize: 58,
  
  // Spawn timing
  obstacleSpawnDelay: 1450,
  collectibleSpawnDelay: 170,
  specialCollectibleSpawnDelay: 7500,
  laneAvoidanceTime: 500,
  
  // Special collectibles
  bouquetSpawnChance: 0.2,
  weddingBandSpawnChance: 0.05,
  
  // Score multiplier
  scoreMultiplier: 1,
  multiplierDuration: 10000,
  
  // Difficulty progression
  difficultyLevel: 1,
  pointsPerSpeedIncrease: 100,
  speedIncreaseAmount: 35,
  speedIncreasePercentage: 0.12,
  maxDifficultyLevel: 10,
  
  // Input settings
  swipeThreshold: 50, // Standard swipe threshold for desktop
  
  // Visual settings - maintain existing layout
  playerFixedYPosition: 0.8,
  laneWidthPercentages: [0.25, 0.5, 0.75]
};

/**
 * Mobile configuration - adjusted values for mobile experience
 * These can be fine-tuned independently without affecting desktop
 */
const mobileMechanics: GameMechanicsParameters = {
  // Core gameplay - slower on mobile to compensate for faster browser rendering
  gameSpeed: 110, // Reduced from 350 to be slower than desktop (300)
  playerSize: 56,
  
  // Spawn timing - slower spawn rates to compensate for mobile 
  obstacleSpawnDelay: 1400,
  collectibleSpawnDelay: 150, // Increased from 180 to be slower than desktop
  specialCollectibleSpawnDelay: 7500, // Increased from 4500 to be slower than desktop
  laneAvoidanceTime: 500, // Keep the same
  
  // Special collectibles - keep the same chance rates
  bouquetSpawnChance: 0.2,
  weddingBandSpawnChance: 0.05,
  
  // Score multiplier - longer duration to compensate for slower speed
  scoreMultiplier: 1,
  multiplierDuration: 10000, // Increased from 8000 to compensate for slower movement
  
  // Difficulty progression - slower progression on mobile
  difficultyLevel: 1,
  pointsPerSpeedIncrease: 100, // Increased from 80 to slow down progression
  speedIncreaseAmount: 30, // Reduced from 35 to make speed increases less dramatic
  speedIncreasePercentage: 0.10, // Reduced from 0.12 for slower difficulty scaling
  maxDifficultyLevel: 10,
  
  // Input settings
  swipeThreshold: 30, // Keep the same for easy controls
  
  // Visual settings - using the existing mobile lane layout
  playerFixedYPosition: 0.8, 
  laneWidthPercentages: [0.3, 0.5, 0.7]
};

/**
 * Central configuration class for game mechanics
 */
export class GameMechanicsConfig {
  /**
   * Get the appropriate mechanics configuration based on platform
   */
  static getMechanicsConfig(): GameMechanicsParameters {
    return GameConfig.isMobileDevice() ? mobileMechanics : desktopMechanics;
  }
  
  /**
   * Get desktop-specific mechanics configuration
   */
  static getDesktopMechanicsConfig(): GameMechanicsParameters {
    return desktopMechanics;
  }
  
  /**
   * Get mobile-specific mechanics configuration
   */
  static getMobileMechanicsConfig(): GameMechanicsParameters {
    return mobileMechanics;
  }
}

/**
 * Development tools for testing and tuning mechanics
 * These tools are only for development/testing
 */
export class MechanicsTestingTools {
  // Store reference to active scene for hot updating
  private static activeScene: any = null;
  
  /**
   * Register a scene for testing
   */
  static registerScene(scene: any): void {
    this.activeScene = scene;
  }
  
  /**
   * Update a single parameter and apply to active scene
   */
  static updateParameter(
    key: keyof GameMechanicsParameters, 
    value: any, 
    platform: 'mobile' | 'desktop' | 'both' = 'both'
  ): void {
    if (platform === 'mobile' || platform === 'both') {
      (mobileMechanics as any)[key] = value;
    }
    
    if (platform === 'desktop' || platform === 'both') {
      (desktopMechanics as any)[key] = value;
    }
    
    // Apply to active scene if available
    if (this.activeScene) {
      (this.activeScene as any)[key] = value;
    }
  }
} 