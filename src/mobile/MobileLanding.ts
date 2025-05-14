import Phaser from 'phaser';
import { LeaderboardModal } from '../core/ui/LeaderboardModal';
// AssetLoader import is no longer needed here as PreloadScene handles it.

export class MobileLanding extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private titleText1!: Phaser.GameObjects.Text;
  private titleText2!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;
  private leaderboardButton!: Phaser.GameObjects.Text;
  private leaderboardModal!: LeaderboardModal;
  private isModalOpen: boolean = false;

  constructor() {
    super('MobileLanding');
  }

  // preload() method removed as assets are loaded by PreloadScene

  create() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Setup the background
    this.background = this.add.image(gameWidth / 2, gameHeight / 2, 'background-mobile');
    
    // Scale background to fill screen while maintaining aspect ratio
    this.scaleBackgroundToFit(gameWidth, gameHeight);

    // Title text - first row
    this.titleText1 = this.add.text(
      gameWidth / 2,
      gameHeight * 0.12,
      'TIL DEATH RUN US',
      {
        fontFamily: 'October Crow',
        fontSize: '48px',
        color: '#ff0033',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Title text - second row
    this.titleText2 = this.add.text(
      gameWidth / 2,
      gameHeight * 0.2,
      'PART',
      {
        fontFamily: 'October Crow',
        fontSize: '48px',
        color: '#ff0033',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Add glow effect to titles
    this.titleText1.setShadow(0, 0, '#ff0033', 10, true, true);
    this.titleText2.setShadow(0, 0, '#ff0033', 10, true, true);
    
    // Pulsing "Tap to Play" text
    this.startText = this.add.text(
      gameWidth / 2,
      gameHeight * 0.7,
      'Tap to Play',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    
    // Add leaderboard button
    this.leaderboardButton = this.add.text(
      gameWidth / 2,
      gameHeight * 0.8,
      'Leaderboard',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '28px',
        color: '#ff9adf',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5)
     .setInteractive({ useHandCursor: true });
    
    // Initialize leaderboard modal
    this.leaderboardModal = new LeaderboardModal(this);
    
    // Add pulse animation to start text
    this.tweens.add({
      targets: this.startText,
      scale: { from: 1, to: 1.1 },
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // Add subtle pulse animation to leaderboard button
    this.tweens.add({
      targets: this.leaderboardButton,
      scale: { from: 1, to: 1.05 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // Listen for tap on leaderboard button
    this.leaderboardButton.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.leaderboardModal.show(0, 'mobile');
    });
    
    // Listen for tap to start (only when modal is not open)
    this.input.on('pointerdown', () => {
      if (!this.isModalOpen) {
        this.requestFullscreen();
        this.startGame();
      }
    });
  }
  
  private scaleBackgroundToFit(gameWidth: number, gameHeight: number) {
    // Get the actual dimensions of the loaded image
    const bgWidth = this.background.width;
    const bgHeight = this.background.height;
    
    // Calculate scale factor to fill the screen
    const scaleX = gameWidth / bgWidth;
    const scaleY = gameHeight / bgHeight;
    const scale = Math.max(scaleX, scaleY);
    
    // Apply the scale to ensure the image covers the screen
    this.background.setScale(scale);
  }
  
  private requestFullscreen() {
    // Request fullscreen mode on supported devices
    const elem = document.documentElement as any; // Use 'any' to bypass strict type checking for vendor prefixes
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Mozilla
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Webkit
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
    
    // Lock to portrait orientation if possible
    const orientation = screen.orientation as any; // Cast to any to access potentially non-standard 'lock'
    if (orientation && typeof orientation.lock === 'function') {
      orientation.lock('portrait').catch((err: any) => {
        console.log('Orientation lock not supported or failed:', err);
      });
    } else {
      console.log('Screen Orientation API or lock method not supported.');
    }
  }
  
  private startGame() {
    // Transition to the mobile game scene
    this.scene.start('MobileGameScene');
  }
} 