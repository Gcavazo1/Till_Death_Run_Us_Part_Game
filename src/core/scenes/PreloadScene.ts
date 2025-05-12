import Phaser from 'phaser';
import { AssetLoader } from '../utils/AssetLoader';
import { GameConfig } from '../utils/GameConfig';
import { SceneManager } from '../utils/SceneManager';

export class PreloadScene extends Phaser.Scene {
  private assetLoader!: AssetLoader;
  private sceneManager!: SceneManager;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.assetLoader = new AssetLoader(this);
    this.sceneManager = new SceneManager(this);

    // Display a simple loading message or progress bar (optional)
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      font: '20px Arial',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // Setup error handler for missing sprite sheet
    this.load.on('loaderror', (fileObj: any) => {
      if (fileObj.key === 'zombieBride') {
        console.error('Failed to load zombie bride sprite sheet. Creating placeholder.');
        
        // Create placeholder message for the user
        const errorText = this.add.text(width / 2, height / 2 + 40, 
          'Missing sprite sheet: please add zombie_bride_sheet.png\nto assets/images/ directory.', 
          {
            font: '16px Arial',
            color: '#ff0000',
            align: 'center'
          }
        );
        errorText.setOrigin(0.5, 0.5);
        
        // Wait 3 seconds before continuing
        this.time.delayedCall(3000, () => {
          errorText.destroy();
          // Allow game to continue using static images as fallback
          console.log('Continuing with static images as fallback...');
        });
      }
    });

    // Load common assets
    this.assetLoader.loadCommonAssets();

    // Load platform-specific assets
    if (GameConfig.isMobileDevice()) {
      this.assetLoader.loadMobileAssets();
    } else {
      this.assetLoader.loadDesktopAssets();
    }

    // Handle load completion
    this.load.on('complete', () => {
      loadingText.destroy(); // Remove loading text
      console.log('Assets loaded. Transitioning to next scene.');
      this.sceneManager.goToNextScene(); // Use SceneManager to transition
    });
  }

  create(): void {
    // The 'complete' event in preload will handle the transition
    // This create method can be left empty or used for other setup if needed
    console.log('PreloadScene create method called.');
  }
} 