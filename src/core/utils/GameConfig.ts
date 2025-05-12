import Phaser from 'phaser';
import { DesktopGameScene } from '../../desktop/DesktopGameScene';
import { MobileGameScene } from '../../mobile/MobileGameScene';
import { MobileLanding } from '../../mobile/MobileLanding';
import { PreloadScene } from '../scenes/PreloadScene';

/**
 * Central configuration class for game settings
 */
export class GameConfig {
  /**
   * Desktop game configuration
   */
  static getDesktopConfig(): Phaser.Types.Core.GameConfig {
    return {
      type: Phaser.AUTO,
      width: 291,
      height: 550,
      parent: 'app',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      backgroundColor: '#000000',
      scene: [PreloadScene, DesktopGameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      pixelArt: true,
      transparent: false
    };
  }

  /**
   * Mobile game configuration
   */
  static getMobileConfig(): Phaser.Types.Core.GameConfig {
    return {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'mobile-game',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      backgroundColor: '#000000',
      scene: [PreloadScene, MobileLanding, MobileGameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      pixelArt: true,
      input: {
        activePointers: 2 // Support multi-touch
      }
    };
  }

  /**
   * Check if current device is mobile
   */
  static isMobileDevice(): boolean {
    // Check for mobile screen size
    const isMobileSize = window.innerWidth <= 768;
    
    // Check for mobile user agent
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Return true if either condition is met
    return isMobileSize || isMobileAgent;
  }
} 