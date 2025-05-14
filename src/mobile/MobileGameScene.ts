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
  
  // Override showGameOver to remove the leaderboard button for mobile
  protected showGameOver() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    // Play game over music (looping)
    this.gameOverSound.play({
      loop: true,
      volume: 0.8
    });
    
    // Create a dark overlay across the entire screen
    const darkOverlay = this.add.rectangle(
      gameWidth / 2,
      gameHeight / 2,
      gameWidth,
      gameHeight,
      0x000000
    ).setAlpha(0.7).setDepth(30); // Very high depth to be above everything
    
    // Create a container for all game over elements
    const gameOverContainer = this.add.container(gameWidth / 2, gameHeight / 2).setDepth(35);
    
    // Game over image (full screen width)
    const gameOverImage = this.add.image(0, 0, 'game-over');
    const scaleX = gameWidth / gameOverImage.width * 1; // 100% of screen width
    const scaleY = gameHeight / gameOverImage.height * 1; // 100% of screen height
    gameOverImage.setScale(Math.min(scaleX, scaleY));
    
    // Display final score with shadow for better visibility
    const finalScoreText = this.add.text(
      0, 
      gameOverImage.height * 0.2, // Moved up from 0.35
      `Final Score: ${this.score}`,
      { 
        fontFamily: 'BloodyTerror',
        fontSize: '28px', 
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    // Add shadow to the text
    finalScoreText.setShadow(2, 2, '#000000', 2, true, true);
    
    // Display restart instruction with glowing effect
    const restartText = this.add.text(
      0, 
      gameOverImage.height * 0.3,
      'Tap to Return to Menu',
      { 
        fontFamily: 'BloodyTerror',
        fontSize: '24px', 
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5);
    
    // Add items to container
    gameOverContainer.add([gameOverImage, finalScoreText, restartText]);
    
    // Add pulse effect to restart text
    this.tweens.add({
      targets: restartText,
      alpha: { from: 0.8, to: 1 },
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    // Fade in the game over screen
    this.tweens.add({
      targets: [darkOverlay, gameOverContainer],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2'
    });
    
    // Check if this is a high score
    this.checkHighScore();
    
    // Add tap to restart functionality with safety check
    this.input.on('pointerdown', () => {
      if (!this.isModalOpen) {
        this.restartGame();
      }
    }, this);
  }
  
  // Override restartGame to go back to landing screen
  protected restartGame() {
    // Reset modal flag
    this.isModalOpen = false;
    
    // Remove the pointerdown listener
    this.input.off('pointerdown');
    
    // Stop any playing music and sounds
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
    
    if (this.backgroundMusicAlt) {
      this.backgroundMusicAlt.stop();
    }

    if (this.backgroundMusicCorpseBride) {
      this.backgroundMusicCorpseBride.stop();
    }
    
    if (this.backgroundMusicEndlessBride) {
      this.backgroundMusicEndlessBride.stop();
    }
    
    if (this.gameOverSound) {
      this.gameOverSound.stop();
    }
    
    // Stop any playing sound effects
    this.sound.stopAll();
    
    // Kill all tweens
    this.tweens.killAll();
    
    // Clean up all existing game objects
    this.obstacles.clear(true, true);
    this.collectibles.clear(true, true);
    this.ravens.clear(true, true);
    this.spookyEyes.clear(true, true);
    
    // Remove all timers
    if (this.obstacleTimer) this.obstacleTimer.remove();
    if (this.collectibleTimer) this.collectibleTimer.remove();
    if (this.ravenTimer) this.ravenTimer.remove();
    if (this.spookyEyesTimer) this.spookyEyesTimer.remove();
    if (this.specialCollectibleTimer) this.specialCollectibleTimer.remove();
    if (this.multiplierTimer) this.multiplierTimer.remove();
    
    // Reset game variables
    this.score = 0;
    this.gameSpeed = 300;
    this.obstacleSpawnDelay = 1600;
    this.collectibleSpawnDelay = 200;
    this.specialCollectibleSpawnDelay = 5000;
    this.difficultyLevel = 1;
    this.nextSpeedIncreaseThreshold = this.pointsPerSpeedIncrease;
    this.scoreMultiplier = 1;
    this.multiplierActive = false;
    this.isGameOver = false;
    this.gameStarted = false;
    
    // Reset player
    this.player.setTint(0xffffff); // Remove any tint
    this.player.setAlpha(1); // Reset alpha
    this.player.anims.stop(); // Stop any animations playing
    
    // Clear lane tracking arrays
    this.recentObstacleLanes = [];
    this.recentCollectibleLanes = [];
    
    // Different from base implementation: 
    // Instead of restarting this scene, go back to the MobileLanding scene
    this.scene.start('MobileLanding');
  }
} 