import Phaser from 'phaser';
import { BaseGameScene } from '../core/scenes/BaseGameScene';

export class DesktopGameScene extends BaseGameScene {
  private platform!: Phaser.GameObjects.Rectangle;
  private startPrompt!: Phaser.GameObjects.Group;

  constructor() {
    super('DesktopGameScene');
  }

  create() {
    // Call the base class create method
    super.create();
    
    // Show start screen
    this.createStartPrompt();
  }
  
  // Implement the abstract method from BaseGameScene
  protected setupBackground(gameWidth: number, gameHeight: number) {
    // Setup background for desktop version
    this.background = this.add.image(gameWidth / 2, gameHeight / 2, 'background');
    this.background.setDisplaySize(gameWidth, gameHeight);
    
    // Create platform (this is specific to desktop version)
    this.platform = this.add.rectangle(
      gameWidth / 2, 
      gameHeight / 2, 
      gameWidth * 0.5, // platform width
      gameHeight * 1.2, // platform height (larger than screen to show perspective)
      0x444444 // dark gray color
    );
    this.platform.setAlpha(0); // completely transparent
    this.platform.setDepth(1);
  }
  
  private createStartPrompt() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    // Create a group for start screen elements
    this.startPrompt = this.add.group();
    
    // Semi-transparent overlay
    const overlay = this.add.rectangle(
      gameWidth / 2, 
      gameHeight / 2, 
      gameWidth, 
      gameHeight, 
      0x000000
    ).setAlpha(0.7);
    overlay.setDepth(50);
    
    // Title text with gothic styling - first row
    const titleText1 = this.add.text(
      gameWidth / 2,
      gameHeight * 0.35,
      'TIL DEATH RUN US',
      {
        fontFamily: 'October Crow',
        fontSize: '38px',
        color: '#ff0033',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(51);
    
    // Title text with gothic styling - second row
    const titleText2 = this.add.text(
      gameWidth / 2,
      gameHeight * 0.43,
      'PART',
      {
        fontFamily: 'October Crow',
        fontSize: '38px',
        color: '#ff0033',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(51);
    
    // Add glow effect to titles
    titleText1.setShadow(0, 0, '#ff0033', 10, true, true);
    titleText2.setShadow(0, 0, '#ff0033', 10, true, true);
    
    // Pulsing "Press to Start" text
    const startText = this.add.text(
      gameWidth / 2,
      gameHeight * 0.6,
      'Press to Start',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '34px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(51);
    
    // Add pulse animation to start text
    this.tweens.add({
      targets: startText,
      scale: { from: 1, to: 1.1 },
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // Add elements to group
    this.startPrompt.add(overlay);
    this.startPrompt.add(titleText1);
    this.startPrompt.add(titleText2);
    this.startPrompt.add(startText);
    
    // Add interaction to start the game
    this.input.once('pointerdown', () => {
      this.removeStartPrompt();
      this.startGame();
    });
    
    // Also listen for spacebar
    this.cursors.space?.once('down', () => {
      this.removeStartPrompt();
      this.startGame();
    });
  }
  
  private removeStartPrompt() {
    this.startPrompt.clear(true, true);
  }
  
  // Override showGameOver with desktop-specific UI
  protected showGameOver() {
    // Use the base class implementation for consistent game over screen
    super.showGameOver();
  }
} 