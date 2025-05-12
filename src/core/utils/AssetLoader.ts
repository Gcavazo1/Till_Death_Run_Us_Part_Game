import Phaser from 'phaser';

/**
 * AssetLoader class handles centralized asset loading for both desktop and mobile platforms
 */
export class AssetLoader {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Loads common assets needed by both desktop and mobile versions
   */
  loadCommonAssets(): void {
    // Player sprite sheet for animations
    this.scene.load.spritesheet('zombieBride', '/images/zombie_bride_sheet.png', {
      frameWidth: 32,
      frameHeight: 64
    });
    
    // Legacy player assets (kept as fallbacks)
    this.scene.load.image('player', '/images/zombie_bride_back.png');
    this.scene.load.image('player-left', '/images/zombie_bride_left.png');
    this.scene.load.image('player-right', '/images/zombie_bride_right.png');
    
    // Obstacle assets
    this.scene.load.image('tombstone', '/images/tombstone.png');
    this.scene.load.image('spirit_orb', '/images/spirit_orb.png');
    
    // Collectible assets
    this.scene.load.image('collectible_pink', '/images/pink_collectible.png');
    this.scene.load.image('collectible_purple', '/images/purple_collectible.png');
    this.scene.load.image('collectible_red', '/images/red_collectible.png');
    this.scene.load.image('collectible_green', '/images/green_collectible.png');
    
    // Special collectibles
    this.scene.load.image('wedding_bouquet', '/images/wedding_bouquet.png');
    this.scene.load.image('wedding_band', '/images/wedding_bands.png');
    
    // Visual effects
    this.scene.load.image('raven_left', '/images/raven_left.png');
    this.scene.load.image('raven_right', '/images/raven_right.png');
    
    // Spooky eyes visual effects
    this.scene.load.image('blue_eyes', '/images/blue_eyes.png');
    this.scene.load.image('red_eyes', '/images/red_eyes.png');
    this.scene.load.image('green_eyes', '/images/green_eyes.png');
    this.scene.load.image('yellow_eyes', '/images/yellow_eyes.png');
    
    // UI assets
    this.scene.load.image('game-over', '/images/game_over.png');
    
    // Audio - Background Music
    this.scene.load.audio('background-music', '/music/spooky_scary_skeletons.mp3');
    this.scene.load.audio('background-music-alt', '/music/spooky_time.mp3');
    
    // Sound Effects
    this.scene.load.audio('start-sound', '/audio/start.mp3');
    this.scene.load.audio('swipe-sound', '/audio/swipe.mp3');
    this.scene.load.audio('bouquet-sound', '/audio/bouquet.mp3');
    this.scene.load.audio('wedding-bands-sound', '/audio/wedding_bands.mp3');
    this.scene.load.audio('game-over-sound', '/audio/game_over.mp3');
    this.scene.load.audio('collectible-sound', '/audio/collectible.mp3');
    this.scene.load.audio('collide-sound', '/audio/collide.mp3');
  }
  
  /**
   * Loads desktop-specific assets
   */
  loadDesktopAssets(): void {
    // Desktop background
    this.scene.load.image('background', '/images/background.png');
  }
  
  /**
   * Loads mobile-specific assets
   */
  loadMobileAssets(): void {
    // Mobile background (using same background for now, could be optimized versions later)
    this.scene.load.image('background-mobile-game', '/images/background.png');
    
    // Mobile landing page background
    this.scene.load.image('background-mobile', '/images/background_mobile.png');
  }
} 