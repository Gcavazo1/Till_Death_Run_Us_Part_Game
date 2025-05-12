import Phaser from 'phaser';
import { GameConfig } from './GameConfig'; // Assuming GameConfig is in the same directory

/**
 * SceneManager class handles transitions between different game scenes.
 */
export class SceneManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Transitions to the appropriate first scene after preloading.
   * For mobile, it goes to MobileLanding.
   * For desktop, it goes to DesktopGameScene.
   */
  goToNextScene(): void {
    if (GameConfig.isMobileDevice()) {
      console.log('Transitioning to MobileLanding scene...');
      this.scene.scene.start('MobileLanding');
    } else {
      console.log('Transitioning to DesktopGameScene...');
      this.scene.scene.start('DesktopGameScene');
    }
  }

  /**
   * Starts a specific game scene by its key.
   * @param sceneKey The key of the scene to start.
   */
  goToScene(sceneKey: string): void {
    console.log(`Transitioning to scene: ${sceneKey}...`);
    this.scene.scene.start(sceneKey);
  }

  // Add other transition methods as needed, e.g.:
  // goToGameOverScene(), goToMainMenu(), etc.
} 