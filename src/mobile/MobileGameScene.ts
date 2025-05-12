import { BaseGameScene } from '../core/scenes/BaseGameScene';

export class MobileGameScene extends BaseGameScene {
  constructor() {
    super('MobileGameScene');
  }

  create() {
    // Call the base create method to set up core gameplay elements with mobile mechanics
    super.create();
    
    // Mobile-specific UI adjustments if needed
    this.adjustMobileUI();
    
    // Start the game immediately - we don't need the start prompt anymore
    // since we have the HTML landing page
    this.startGame();
  }
  
  // Implement the abstract method from BaseGameScene
  protected setupBackground(gameWidth: number, gameHeight: number) {
    // Create a background image for the mobile game
    this.background = this.add.image(gameWidth / 2, gameHeight / 2, 'background-mobile-game');
    
    // Scale background to fill screen while maintaining aspect ratio
    const bgWidth = this.background.width;
    const bgHeight = this.background.height;
    
    // Calculate scale factor to fill the screen
    const scaleX = gameWidth / bgWidth;
    const scaleY = gameHeight / bgHeight;
    const scale = Math.max(scaleX, scaleY);
    
    // Apply the scale to ensure the image covers the screen
    this.background.setScale(scale);
    
    // Set depth
    this.background.setDepth(0);
  }
  
  private adjustMobileUI() {
    // Additional mobile-specific UI adjustments that aren't covered by the mechanics config
    this.scoreText.setFontSize('22px');
    this.scoreText.setPosition(20, 20);
    this.scoreText.setDepth(20); // Ensure it's above other elements
    
    // Adjust difficulty text for better visibility on mobile
    this.difficultyText.setFontSize('22px');
    this.difficultyText.setPosition(this.cameras.main.width - 140, 20);
    this.difficultyText.setDepth(20);
  }
  
  // We no longer need to override setupTouchControls as the swipe threshold
  // is now defined in the mechanics config
} 