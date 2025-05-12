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