import Phaser from 'phaser';
import { GameMechanicsConfig } from '../utils/GameMechanicsConfig';
import type { GameMechanicsParameters } from '../utils/GameMechanicsConfig';

export abstract class BaseGameScene extends Phaser.Scene {
  // Game mechanics configuration (loaded based on platform)
  protected mechanics: GameMechanicsParameters;
  
  // Game objects
  protected player!: Phaser.Physics.Arcade.Sprite;
  protected background!: Phaser.GameObjects.Image;
  protected obstacles!: Phaser.Physics.Arcade.Group;
  protected collectibles!: Phaser.Physics.Arcade.Group; // Group for collectible orbs
  protected ravens!: Phaser.GameObjects.Group; // Group for visual raven effects
  protected spookyEyes!: Phaser.GameObjects.Group; // Group for spooky eyes visual effects
  protected backgroundMusic!: Phaser.Sound.BaseSound;
  protected backgroundMusicAlt!: Phaser.Sound.BaseSound; // Alternative music track
  
  // Sound effects
  protected startSound!: Phaser.Sound.BaseSound;
  protected swipeSound!: Phaser.Sound.BaseSound;
  protected bouquetSound!: Phaser.Sound.BaseSound;
  protected weddingBandsSound!: Phaser.Sound.BaseSound;
  protected gameOverSound!: Phaser.Sound.BaseSound;
  protected collectibleSound!: Phaser.Sound.BaseSound;
  protected collideSound!: Phaser.Sound.BaseSound;
  
  // Sound control flags
  protected gameOverSoundPlaying: boolean = false;

  // Game state
  protected lanes!: number[]; // X-coordinates for the center of each vertical lane
  protected currentLane: number = 1; // Start in the middle lane (index 1)
  protected gameSpeed: number = 300; // Speed at which the game scrolls
  protected score: number = 0;
  protected scoreText!: Phaser.GameObjects.Text;
  protected isGameOver: boolean = false;
  protected gameStarted: boolean = false; // Track if game has started
  protected obstacleTimer!: Phaser.Time.TimerEvent;
  protected obstacleSpawnDelay: number = 2000; // Store the delay separately to manage it
  protected collectibleTimer!: Phaser.Time.TimerEvent; // Timer for spawning collectibles
  protected collectibleSpawnDelay: number = 200; // More frequent collectibles (was 400)
  protected ravenTimer!: Phaser.Time.TimerEvent; // Timer for spawning ravens
  protected spookyEyesTimer!: Phaser.Time.TimerEvent; // Timer for spawning spooky eyes
  
  // Special collectibles
  protected specialCollectibleTimer!: Phaser.Time.TimerEvent;
  protected bouquetSpawnChance: number = 0.20; // 20% chance for a bouquet when special timer triggers
  protected weddingBandSpawnChance: number = 0.10; // 10% chance for a wedding band when special timer triggers
  protected specialCollectibleSpawnDelay: number = 5000; // Every 5 seconds, attempt to spawn a special collectible
  
  // Score multiplier system
  protected scoreMultiplier: number = 1; // Default multiplier is 1x
  protected multiplierActive: boolean = false;
  protected multiplierTimer!: Phaser.Time.TimerEvent;
  protected multiplierDuration: number = 10000; // 10 seconds in milliseconds
  protected multiplierText!: Phaser.GameObjects.Text;
  
  // Lane tracking for spawn collision avoidance
  protected recentObstacleLanes: {lane: number, time: number}[] = [];
  protected recentCollectibleLanes: {lane: number, time: number}[] = [];
  protected laneAvoidanceTime: number = 500; // Time in ms to avoid spawning in the same lane
  
  // Player movement
  protected isChangingLane: boolean = false;
  protected playerFixedY!: number;

  // Input
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Progressive difficulty system
  protected difficultyLevel: number = 1;
  protected nextSpeedIncreaseThreshold: number = 100; // First threshold at 100 points
  protected pointsPerSpeedIncrease: number = 100; // Increase speed every 100 points
  protected speedIncreaseAmount: number = 30; // Add 30 to gameSpeed each threshold
  protected speedIncreasePercentage: number = 0.10; // Reduce spawn delays by 10% each threshold
  protected maxDifficultyLevel: number = 10; // Cap difficulty increases to prevent impossible gameplay
  protected difficultyText!: Phaser.GameObjects.Text; // Display current difficulty level

  constructor(key: string) {
    super(key);
    // Get platform-specific mechanics configuration
    this.mechanics = GameMechanicsConfig.getMechanicsConfig();
  }

  create() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Setup background music (but don't play it yet)
    this.backgroundMusic = this.sound.add('background-music', {
      volume: 0.5,
      loop: true
    });
    
    // Setup alternative background music
    this.backgroundMusicAlt = this.sound.add('background-music-alt', {
      volume: 0.5,
      loop: true
    });
    
    // Setup sound effects
    this.startSound = this.sound.add('start-sound', { volume: 0.7 });
    this.swipeSound = this.sound.add('swipe-sound', { volume: 0.6 });
    this.bouquetSound = this.sound.add('bouquet-sound', { volume: 0.7 });
    this.weddingBandsSound = this.sound.add('wedding-bands-sound', { volume: 0.7 });
    this.gameOverSound = this.sound.add('game-over-sound', { volume: 0.8 });
    this.collectibleSound = this.sound.add('collectible-sound', { volume: 0.7 });
    this.collideSound = this.sound.add('collide-sound', { volume: 0.8 });

    // Define lanes based on mechanic config (platform-specific)
    this.lanes = this.mechanics.laneWidthPercentages.map(p => gameWidth * p);
    this.playerFixedY = gameHeight * this.mechanics.playerFixedYPosition;

    // Setup background - Note: Implementation may vary between desktop/mobile
    this.setupBackground(gameWidth, gameHeight);
    
    // Create animations for the zombie bride character
    this.createPlayerAnimations();
    
    // Create player character at the bottom-center lane
    // Try to use sprite sheet first, fall back to static image if not available
    if (this.textures.exists('zombieBride')) {
      this.player = this.physics.add.sprite(this.lanes[this.currentLane], this.playerFixedY, 'zombieBride');
    } else {
      console.warn('Using static images as fallback for zombie bride');
      this.player = this.physics.add.sprite(this.lanes[this.currentLane], this.playerFixedY, 'player');
    }
    
    this.player.setDisplaySize(this.mechanics.playerSize, this.mechanics.playerSize); // Platform-specific size
    this.player.setVisible(false); // Hide player until game starts

    // Setup obstacles group
    this.obstacles = this.physics.add.group();
    
    // Setup collectibles group
    this.collectibles = this.physics.add.group();
    
    // Setup ravens group for visual effects
    this.ravens = this.add.group();

    // Setup spooky eyes group for visual effects
    this.spookyEyes = this.add.group();

    // Add score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'BloodyTerror',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.scoreText.setVisible(false); // Hide score until game starts
    
    // Add multiplier text
    this.multiplierText = this.add.text(16, 60, '', {
      fontSize: '24px',
      fontFamily: 'BloodyTerror',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.multiplierText.setVisible(false);
    
    // Add difficulty level text (hidden until game starts)
    this.difficultyText = this.add.text(gameWidth - 150, 16, 'Speed: 1', {
      fontSize: '18px',
      fontFamily: 'BloodyTerror',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.difficultyText.setVisible(false);

    // Setup collision detection for obstacles
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      (obj1, obj2) => {
        this.hitObstacle(obj1 as Phaser.Physics.Arcade.Sprite, obj2 as Phaser.Physics.Arcade.Sprite);
      },
      undefined,
      this
    );
    
    // Setup collision detection for collectibles
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      (obj1, obj2) => {
        this.collectOrb(obj1 as Phaser.Physics.Arcade.Sprite, obj2 as Phaser.Physics.Arcade.Sprite);
      },
      undefined,
      this
    );

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.setupTouchControls();
    
    // Set depth to ensure player is above platform but below obstacles
    this.player.setDepth(10);
    
    // Initialize game parameters from mechanics config
    this.gameSpeed = this.mechanics.gameSpeed;
    this.obstacleSpawnDelay = this.mechanics.obstacleSpawnDelay;
    this.collectibleSpawnDelay = this.mechanics.collectibleSpawnDelay;
    this.specialCollectibleSpawnDelay = this.mechanics.specialCollectibleSpawnDelay;
    this.laneAvoidanceTime = this.mechanics.laneAvoidanceTime;
    this.bouquetSpawnChance = this.mechanics.bouquetSpawnChance;
    this.weddingBandSpawnChance = this.mechanics.weddingBandSpawnChance;
    this.multiplierDuration = this.mechanics.multiplierDuration;
    this.difficultyLevel = this.mechanics.difficultyLevel;
    this.pointsPerSpeedIncrease = this.mechanics.pointsPerSpeedIncrease;
    this.speedIncreaseAmount = this.mechanics.speedIncreaseAmount;
    this.speedIncreasePercentage = this.mechanics.speedIncreasePercentage;
    this.maxDifficultyLevel = this.mechanics.maxDifficultyLevel;
  }

  // Method to be implemented by platform-specific scenes
  protected abstract setupBackground(gameWidth: number, gameHeight: number): void;

  /**
   * Creates all animations for the player character
   */
  protected createPlayerAnimations(): void {
    // Check if zombieBride texture exists
    if (!this.textures.exists('zombieBride')) {
      console.warn('Zombie bride sprite sheet not found. Animations will not be created.');
      return;
    }
    
    // Running animation (A1-A4, B1-B4 - frames 0-7)
    this.anims.create({
      key: 'zombie_run',
      frames: this.anims.generateFrameNumbers('zombieBride', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1 // Loop continuously
    });
    
    // Turn right animation (C1-C4 - frames 8-11)
    this.anims.create({
      key: 'zombie_turn_right',
      frames: this.anims.generateFrameNumbers('zombieBride', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: 0 // Play once
    });
    
    // Turn left animation (D1-D4 - frames 12-15)
    this.anims.create({
      key: 'zombie_turn_left',
      frames: this.anims.generateFrameNumbers('zombieBride', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: 0 // Play once
    });
  }

  protected startGame() {
    // Show player and score
    this.player.setVisible(true);
    this.scoreText.setVisible(true);
    this.difficultyText.setVisible(true);
    
    // Start the game
    this.gameStarted = true;
    
    // Start player running animation if sprite sheet is available
    if (this.textures.exists('zombieBride') && this.anims.exists('zombie_run')) {
      this.player.anims.play('zombie_run', true);
    }
    
    // Play start sound
    this.startSound.play();
    
    // Get the last played track from local storage
    let lastPlayedTrack = localStorage.getItem('lastPlayedMusicTrack');
    
    // If no record exists or last played was alt, play the main track
    if (!lastPlayedTrack || lastPlayedTrack === 'alt') {
      this.backgroundMusic.play();
      localStorage.setItem('lastPlayedMusicTrack', 'main');
    } else {
      // Otherwise play the alternative track
      this.backgroundMusicAlt.play();
      localStorage.setItem('lastPlayedMusicTrack', 'alt');
    }
    
    // Reset difficulty parameters
    this.difficultyLevel = this.mechanics.difficultyLevel;
    this.nextSpeedIncreaseThreshold = this.mechanics.pointsPerSpeedIncrease;
    this.gameSpeed = this.mechanics.gameSpeed; // Reset to initial speed from config
    this.difficultyText.setText(`Speed: ${this.difficultyLevel}`);
    
    // Start generating obstacles
    this.obstacleSpawnDelay = this.mechanics.obstacleSpawnDelay; // Reset to initial value from config
    this.startObstacleTimer();
    
    // Start generating collectibles
    this.collectibleSpawnDelay = this.mechanics.collectibleSpawnDelay; // Reset from config
    this.startCollectibleTimer();
    
    // Start raven visual effects
    this.startRavenTimer();
    
    // Start spooky eyes visual effects
    this.startSpookyEyesTimer();
    
    // Start generating special collectibles
    this.startSpecialCollectibleTimer();
    
    // Reset multiplier
    this.scoreMultiplier = this.mechanics.scoreMultiplier;
    this.multiplierActive = false;
    this.multiplierText.setVisible(false);
  }

  protected startObstacleTimer() {
    // Remove existing timer if it exists
    if (this.obstacleTimer) {
      this.obstacleTimer.remove();
    }
    
    // Create a new timer with current delay value
    this.obstacleTimer = this.time.addEvent({
      delay: this.obstacleSpawnDelay,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });
  }
  
  protected startCollectibleTimer() {
    // Remove existing timer if it exists
    if (this.collectibleTimer) {
      this.collectibleTimer.remove();
    }
    
    // Create a new timer with current delay value
    this.collectibleTimer = this.time.addEvent({
      delay: this.collectibleSpawnDelay,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true
    });
  }

  protected startRavenTimer() {
    // Create a timer for spawning ravens
    this.ravenTimer = this.time.addEvent({
      delay: Phaser.Math.Between(3000, 8000), // Random time between 3-8 seconds
      callback: () => {
        this.spawnRaven();
        
        // Create a new timer with a new random delay instead of modifying the existing one
        this.startRavenTimer();
      },
      callbackScope: this,
      loop: false
    });
  }

  protected startSpookyEyesTimer() {
    // Create a timer for spawning spooky eyes
    this.spookyEyesTimer = this.time.addEvent({
      delay: Phaser.Math.Between(4000, 10000), // Random time between 4-10 seconds
      callback: () => {
        this.spawnSpookyEyes();
        
        // Create a new timer with a new random delay
        this.startSpookyEyesTimer();
      },
      callbackScope: this,
      loop: false
    });
  }

  protected startSpecialCollectibleTimer() {
    // Remove existing timer if it exists
    if (this.specialCollectibleTimer) {
      this.specialCollectibleTimer.remove();
    }
    
    // Create a new timer for special collectibles
    this.specialCollectibleTimer = this.time.addEvent({
      delay: this.specialCollectibleSpawnDelay,
      callback: this.attemptSpawnSpecialCollectible,
      callbackScope: this,
      loop: true
    });
  }
  
  protected attemptSpawnSpecialCollectible() {
    if (!this.gameStarted || this.isGameOver) return;
    
    // Determine if we'll spawn a special collectible
    const random = Math.random();
    
    if (random < this.weddingBandSpawnChance) {
      // Spawn a wedding band (very rare)
      this.spawnSpecialCollectible('wedding_band');
    } else if (random < this.weddingBandSpawnChance + this.bouquetSpawnChance) {
      // Spawn a flower bouquet (uncommon)
      this.spawnSpecialCollectible('wedding_bouquet');
    }
  }
  
  protected spawnSpecialCollectible(type: 'wedding_band' | 'wedding_bouquet') {
    console.log(`Spawning special collectible: ${type}`);
    
    // Create array of available lanes and shuffle them for random selection
    const availableLanes = [0, 1, 2]; // Assuming 3 lanes
    Phaser.Utils.Array.Shuffle(availableLanes);
    
    // Try to find a lane that's not recently occupied by an obstacle or collectible
    let selectedLane = -1;
    for (const lane of availableLanes) {
      if (this.isLaneClearFromObstacles(lane) && this.isLaneClearFromCollectibles(lane)) {
        selectedLane = lane;
        break;
      }
    }
    
    // If all lanes have obstacles/collectibles, try to find the best lane
    if (selectedLane === -1) {
      // Get current time to calculate age of obstacles/collectibles
      const currentTime = this.time.now;
      
      // Find lane with oldest obstacle/collectible (or none)
      let oldestTime = currentTime;
      let bestLane = 0;
      
      for (let lane = 0; lane < this.lanes.length; lane++) {
        const obstacleInLane = this.recentObstacleLanes.find(entry => entry.lane === lane);
        const collectibleInLane = this.recentCollectibleLanes.find(entry => entry.lane === lane);
        
        // Calculate the oldest time anything was in this lane
        let oldestTimeInLane = currentTime;
        
        if (obstacleInLane && collectibleInLane) {
          // Both an obstacle and a collectible in this lane, use the older time
          oldestTimeInLane = Math.min(obstacleInLane.time, collectibleInLane.time);
        } else if (obstacleInLane) {
          oldestTimeInLane = obstacleInLane.time;
        } else if (collectibleInLane) {
          oldestTimeInLane = collectibleInLane.time;
        } else {
          // No obstacle or collectible in this lane, use it
          selectedLane = lane;
          break;
        }
        
        // If this lane has the oldest obstacle/collectible so far, remember it
        if (oldestTimeInLane < oldestTime) {
          oldestTime = oldestTimeInLane;
          bestLane = lane;
        }
      }
      
      // If we didn't find an empty lane, use the one with oldest obstacle/collectible
      if (selectedLane === -1) {
        selectedLane = bestLane;
      }
    }
    
    // Record this lane as recently used for collectibles
    this.recentCollectibleLanes.push({
      lane: selectedLane,
      time: this.time.now
    });
    
    const xPos = this.lanes[selectedLane];
    const yPos = -50; // Just above the visible screen
    
    // Create the special collectible with its type
    const collectible = this.collectibles.create(xPos, yPos, type);
    
    // Store the collectible type in a custom data property
    collectible.setData('type', type);
    
    // Set appropriate size based on collectible type
    if (type === 'wedding_band') {
      collectible.setDisplaySize(32, 32);
    } else { // wedding_bouquet
      collectible.setDisplaySize(32, 32);
    }
    
    // Make collectible initially invisible like obstacles
    collectible.setAlpha(0);
    
    // Set depth to be ABOVE regular collectibles but BELOW obstacles
    collectible.setDepth(4.5);
    
    // Add a slight glow effect for special collectibles
    this.tweens.add({
      targets: collectible,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    console.log(`Special collectible created: ${type}, lane: ${selectedLane}`);
  }
  
  protected startMultiplierTimer() {
    // Remove existing timer if it exists
    if (this.multiplierTimer) {
      this.multiplierTimer.remove();
    }
    
    // Set multiplier active
    this.scoreMultiplier = 2;
    this.multiplierActive = true;
    
    // Show multiplier text
    this.multiplierText.setText('x2 POINTS!');
    this.multiplierText.setVisible(true);
    
    // Add flash effect to multiplier text
    this.tweens.add({
      targets: this.multiplierText,
      alpha: { from: 1, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Create timer to end multiplier effect
    this.multiplierTimer = this.time.addEvent({
      delay: this.multiplierDuration,
      callback: () => {
        // End multiplier effect
        this.scoreMultiplier = 1;
        this.multiplierActive = false;
        this.multiplierText.setVisible(false);
        
        // Stop any active tweens on the multiplier text
        this.tweens.killTweensOf(this.multiplierText);
      },
      callbackScope: this,
      loop: false
    });
  }

  update() {
    // Don't update game logic if game hasn't started or is over
    if (!this.gameStarted || this.isGameOver) return;
    
    // Update score display
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Check if we need to increase difficulty
    this.checkDifficultyProgression();
    
    // Handle keyboard input
    this.handleInput();
    
    // Scroll existing obstacles downward to simulate player running upwards
    this.obstacles.getChildren().forEach(child => {
      const obstacle = child as Phaser.Physics.Arcade.Sprite;
      obstacle.y += this.gameSpeed * (1/60); // Adjust based on your game's frame rate
      
      // Fade in obstacles as they move down the screen
      const gameHeight = this.cameras.main.height;
      const fadeInThreshold = gameHeight * 0.25; // Start fading in from top 1/4 of screen
      const fullVisibilityThreshold = gameHeight * 0.35; // Fully visible by 35% down
      
      if (obstacle.y < fadeInThreshold) {
        // Completely invisible at the top
        obstacle.setAlpha(0);
      } else if (obstacle.y >= fadeInThreshold && obstacle.y <= fullVisibilityThreshold) {
        // Gradually increase opacity between the thresholds
        const fadeProgress = (obstacle.y - fadeInThreshold) / (fullVisibilityThreshold - fadeInThreshold);
        obstacle.setAlpha(fadeProgress);
      } else {
        // Fully visible below the threshold
        obstacle.setAlpha(1);
      }
      
      // Remove obstacles that have gone off the bottom of the screen
      if (obstacle.y > this.cameras.main.height + obstacle.height) {
        obstacle.destroy();
      }
    });
    
    // Scroll existing collectibles downward
    this.collectibles.getChildren().forEach(child => {
      const collectible = child as Phaser.Physics.Arcade.Sprite;
      collectible.y += this.gameSpeed * (1/60);
      
      // Apply the same fade-in logic as obstacles
      const gameHeight = this.cameras.main.height;
      const fadeInThreshold = gameHeight * 0.25;
      const fullVisibilityThreshold = gameHeight * 0.35;
      
      if (collectible.y < fadeInThreshold) {
        // Completely invisible at the top
        collectible.setAlpha(0);
      } else if (collectible.y >= fadeInThreshold && collectible.y <= fullVisibilityThreshold) {
        // Gradually increase opacity between the thresholds
        const fadeProgress = (collectible.y - fadeInThreshold) / (fullVisibilityThreshold - fadeInThreshold);
        collectible.setAlpha(fadeProgress);
      } else {
        // Fully visible below the threshold
        collectible.setAlpha(1);
      }
      
      // Log collectible positions every few frames for debugging
      if (Math.random() < 0.01) { // Log only occasionally to avoid console spam
        console.log(`Collectible position: (${collectible.x}, ${collectible.y}), alpha: ${collectible.alpha}, visible: ${collectible.visible}`);
      }
      
      // Remove collectibles that have gone off the bottom of the screen
      if (collectible.y > this.cameras.main.height + collectible.height) {
        collectible.destroy();
      }
    });
    
    // Update raven positions
    this.ravens.getChildren().forEach(child => {
      const raven = child as Phaser.GameObjects.Image;
      const direction = raven.getData('direction');
      const gameWidth = this.cameras.main.width;
      
      // Move raven based on direction
      if (direction === 'right') {
        raven.x += 2; // Move right
        if (raven.x > gameWidth + 40) {
          raven.destroy(); // Remove when off screen
        }
      } else {
        raven.x -= 2; // Move left
        if (raven.x < -40) {
          raven.destroy(); // Remove when off screen
        }
      }
    });
  }

  protected collectOrb(player: Phaser.Physics.Arcade.Sprite, collectible: Phaser.Physics.Arcade.Sprite) {
    // Check if it's a special collectible
    const collectibleType = collectible.getData('type');
    
    if (collectibleType === 'wedding_band') {
      // Wedding band - activate score multiplier
      this.startMultiplierTimer();
      
      // Play wedding bands sound
      this.weddingBandsSound.play();
      
      // Visual feedback
      this.tweens.add({
        targets: player,
        alpha: { from: 1, to: 0.4 },
        duration: 150,
        yoyo: true,
        repeat: 2
      });
      
      // Display a floating text feedback
      this.showFloatingText(collectible.x, collectible.y, '2X MULTIPLIER!', 0xffff00);
      
    } else if (collectibleType === 'wedding_bouquet') {
      // Flower bouquet - add 10 points (with multiplier if active)
      const pointsToAdd = 10 * this.scoreMultiplier;
      this.score += pointsToAdd;
      
      // Play bouquet sound
      this.bouquetSound.play();
      
      // Check if we need to increase difficulty after adding points
      this.checkDifficultyProgression();
      
      // Visual feedback
      this.tweens.add({
        targets: player,
        alpha: { from: 1, to: 0.6 },
        duration: 120,
        yoyo: true,
        repeat: 1
      });
      
      // Display a floating text feedback
      this.showFloatingText(collectible.x, collectible.y, `+${pointsToAdd}`, 0x00ffff);
      
    } else {
      // Regular orb - add 1 point (with multiplier if active)
      const pointsToAdd = 1 * this.scoreMultiplier;
      this.score += pointsToAdd;
      
      // Play collectible sound for regular orbs
      this.collectibleSound.play();
      
      // Check if we need to increase difficulty after adding points
      this.checkDifficultyProgression();
      
      // Simple flash effect on player
      this.tweens.add({
        targets: player,
        alpha: { from: 1, to: 0.6 },
        duration: 100,
        yoyo: true
      });
      
      // Show points if multiplier is active
      if (this.multiplierActive) {
        this.showFloatingText(collectible.x, collectible.y, `+${pointsToAdd}`, 0xffffff);
      }
    }
    
    // Destroy the collectible
    collectible.destroy();
  }
  
  protected showFloatingText(x: number, y: number, message: string, color: number) {
    // Create floating text at the given position
    const text = this.add.text(x, y, message, {
      fontSize: '24px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Set it above player but below UI
    text.setDepth(9);
    
    // Animate the text floating upward and fading out
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  protected handleInput() {
    // Change lanes (left/right arrows or swipes)
    if (!this.isChangingLane) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) && this.currentLane > 0) {
        this.changeLane(this.currentLane - 1, 'left');
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) && this.currentLane < this.lanes.length - 1) {
        this.changeLane(this.currentLane + 1, 'right');
      }
    }
  }
  
  protected changeLane(newLane: number, direction: 'left' | 'right' = 'right') {
    if (this.isChangingLane) return;
    
    this.isChangingLane = true;
    this.currentLane = newLane;
    
    // Play swipe sound
    this.swipeSound.play();
    
    // Use animations if available, otherwise fall back to static images
    if (this.textures.exists('zombieBride')) {
      // Play the appropriate turn animation based on direction
      const animKey = direction === 'left' ? 'zombie_turn_left' : 'zombie_turn_right';
      if (this.anims.exists(animKey)) {
        this.player.anims.play(animKey, true);
      }
    } else {
      // Fall back to static textures
      this.player.setTexture(direction === 'left' ? 'player-left' : 'player-right');
    }
    
    // Tween the player to the new lane
    this.tweens.add({
      targets: this.player,
      x: this.lanes[this.currentLane],
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.isChangingLane = false;
        // Switch back to running forward after lane change animation
        if (this.textures.exists('zombieBride') && this.anims.exists('zombie_run')) {
          this.player.anims.play('zombie_run', true);
        } else {
          this.player.setTexture('player');
        }
      }
    });
  }

  protected setupTouchControls() {
    let startX: number;
    let startY: number;
    const swipeThreshold = this.mechanics.swipeThreshold;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startX = pointer.x;
      startY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.isGameOver || this.isChangingLane) return;

      const swipeX = pointer.x - startX;
      const swipeY = pointer.y - startY;
      
      // Only respond to horizontal swipes for lane changes
      if (Math.abs(swipeX) > Math.abs(swipeY) && Math.abs(swipeX) > swipeThreshold) {
        if (swipeX < 0 && this.currentLane > 0) {
          this.changeLane(this.currentLane - 1, 'left');
        } else if (swipeX > 0 && this.currentLane < this.lanes.length - 1) {
          this.changeLane(this.currentLane + 1, 'right');
        }
      }
    });
  }

  protected spawnRaven() {
    if (!this.gameStarted || this.isGameOver) return;
    
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    // Randomly decide if raven comes from left or right
    const fromLeft = Phaser.Math.Between(0, 1) === 0;
    
    // Set raven position and texture based on direction
    const ravenY = Phaser.Math.Between(gameHeight * 0.1, gameHeight * 0.4); // Upper part of screen
    let raven: Phaser.GameObjects.Image;
    
    if (fromLeft) {
      // Spawn from left side
      raven = this.add.image(-40, ravenY, 'raven_left');
      raven.setData('direction', 'right'); // Moving right
    } else {
      // Spawn from right side
      raven = this.add.image(gameWidth + 40, ravenY, 'raven_right');
      raven.setData('direction', 'left'); // Moving left
    }
    
    // Set raven size
    raven.setDisplaySize(40, 40);
    
    // Set depth to be above background but below game elements
    raven.setDepth(2);
    
    // Add to ravens group
    this.ravens.add(raven);
    
    // Add a subtle flapping animation
    this.tweens.add({
      targets: raven,
      y: raven.y + 5,
      duration: 300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1 // Loop forever
    });
  }

  // Helper method to check if a lane is recently occupied by obstacles
  protected isLaneClearFromObstacles(lane: number): boolean {
    // Clean up old entries
    const currentTime = this.time.now;
    this.recentObstacleLanes = this.recentObstacleLanes.filter(
      entry => currentTime - entry.time < this.laneAvoidanceTime
    );
    
    // Check if lane is occupied
    return !this.recentObstacleLanes.some(entry => entry.lane === lane);
  }
  
  // Helper method to check if a lane is recently occupied by collectibles
  protected isLaneClearFromCollectibles(lane: number): boolean {
    // Clean up old entries
    const currentTime = this.time.now;
    this.recentCollectibleLanes = this.recentCollectibleLanes.filter(
      entry => currentTime - entry.time < this.laneAvoidanceTime
    );
    
    // Check if lane is occupied
    return !this.recentCollectibleLanes.some(entry => entry.lane === lane);
  }

  protected spawnCollectible() {
    if (!this.gameStarted || this.isGameOver) return;
    
    // Add debug logging
    console.log("Spawning collectible");
    
    // Create array of available lanes and shuffle them for random selection
    const availableLanes = [0, 1, 2]; // Assuming 3 lanes
    Phaser.Utils.Array.Shuffle(availableLanes);
    
    // Try to find a lane that's not recently occupied by an obstacle
    let selectedLane = -1;
    for (const lane of availableLanes) {
      if (this.isLaneClearFromObstacles(lane)) {
        selectedLane = lane;
        break;
      }
    }
    
    // If all lanes have obstacles, pick any lane (with a preference for least recent obstacle)
    if (selectedLane === -1) {
      // Get current time to calculate age of obstacles
      const currentTime = this.time.now;
      
      // Find lane with oldest obstacle (or none)
      let oldestLaneTime = currentTime;
      let oldestLane = 0;
      
      for (let lane = 0; lane < this.lanes.length; lane++) {
        const obstacleInLane = this.recentObstacleLanes.find(entry => entry.lane === lane);
        
        if (!obstacleInLane) {
          // No obstacle in this lane, use it
          selectedLane = lane;
          break;
        } else if (obstacleInLane.time < oldestLaneTime) {
          // Found lane with older obstacle
          oldestLaneTime = obstacleInLane.time;
          oldestLane = lane;
        }
      }
      
      // If we didn't find an empty lane, use the one with oldest obstacle
      if (selectedLane === -1) {
        selectedLane = oldestLane;
      }
    }
    
    // Record this lane as recently used for collectibles
    this.recentCollectibleLanes.push({
      lane: selectedLane,
      time: this.time.now
    });
    
    const xPos = this.lanes[selectedLane];
    const yPos = -50; // Just above the visible screen
    
    // Randomly select which collectible type to spawn (pink, purple, red, green)
    const collectibleTypes = ['collectible_pink', 'collectible_purple', 'collectible_red', 'collectible_green'];
    const collectibleType = collectibleTypes[Phaser.Math.Between(0, collectibleTypes.length - 1)];
    
    // Add more debug logging
    console.log(`Using collectible type: ${collectibleType} at position (${xPos}, ${yPos})`);
    
    // Create the collectible
    const collectible = this.collectibles.create(xPos, yPos, collectibleType);
    
    // Set appropriate size for collectible
    collectible.setDisplaySize(24, 24);
    
    // Make collectible initially invisible like obstacles
    collectible.setAlpha(0);
    
    // Set depth to be BELOW obstacles (obstacles are 5, so collectibles should be 4)
    collectible.setDepth(4);
    
    // Final debug confirmation
    console.log(`Created collectible: ${collectible.texture.key}, visible: ${collectible.visible}, alpha: ${collectible.alpha}`);
  }

  protected spawnObstacle() {
    if (!this.gameStarted || this.isGameOver) return;
    
    // Create array of available lanes and shuffle them for random selection
    const availableLanes = [0, 1, 2]; // Assuming 3 lanes
    Phaser.Utils.Array.Shuffle(availableLanes);
    
    // Try to find a lane that's not recently occupied by a collectible
    let selectedLane = -1;
    for (const lane of availableLanes) {
      if (this.isLaneClearFromCollectibles(lane)) {
        selectedLane = lane;
        break;
      }
    }
    
    // If all lanes are occupied by collectibles, try to find the lane with the oldest collectible
    if (selectedLane === -1) {
      // Get current time to calculate age of collectibles
      const currentTime = this.time.now;
      
      // Find lane with oldest collectible (or none)
      let oldestLaneTime = currentTime;
      let oldestLane = 0;
      
      for (let lane = 0; lane < this.lanes.length; lane++) {
        const collectibleInLane = this.recentCollectibleLanes.find(entry => entry.lane === lane);
        
        if (!collectibleInLane) {
          // No collectible in this lane, use it
          selectedLane = lane;
          break;
        } else if (collectibleInLane.time < oldestLaneTime) {
          // Found lane with older collectible
          oldestLaneTime = collectibleInLane.time;
          oldestLane = lane;
        }
      }
      
      // If we didn't find an empty lane, use the one with oldest collectible
      if (selectedLane === -1) {
        selectedLane = oldestLane;
      }
    }
    
    // Record this lane as recently used for obstacles
    this.recentObstacleLanes.push({
      lane: selectedLane,
      time: this.time.now
    });
    
    const xPos = this.lanes[selectedLane];
    const yPos = -50; // Just above the visible screen
    
    // Randomly select obstacle type
    const obstacleType = Phaser.Math.Between(0, 1) === 0 ? 'tombstone' : 'spirit_orb';
    
    // Create the obstacle
    const obstacle = this.obstacles.create(xPos, yPos, obstacleType);
    
    // Set the appropriate size based on obstacle type
    if (obstacleType === 'tombstone') {
      obstacle.setDisplaySize(40, 40);

      // Add dancing animation to tombstones
      this.tweens.add({
        targets: obstacle,
        angle: {
          from: -8, // Start angle
          to: 8,   // End angle
          duration: 700, // Duration of one swing
          ease: 'Sine.easeInOut',
          yoyo: true, // Swing back and forth
          repeat: -1 // Loop indefinitely
        }
      });
      
      // Add subtle scale pulsing for tombstones
      this.tweens.add({
        targets: obstacle, 
        scaleX: { from: 0.25, to: 0.4 }, 
        scaleY: { from: 0.25, to: 0.4 },
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

    } else { // spirit_orb
      obstacle.setDisplaySize(32, 38);
      
      // Add wobble animation to spirit orbs
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x + 10, // Wobble 10px left and right
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // Scale pulsing for the spirit orb
      this.tweens.add({
        targets: obstacle, 
        scaleX: 0.85, 
        scaleY: 0.85,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
    
    // Make obstacle initially invisible
    obstacle.setAlpha(0);
    
    // Set depth for obstacles (ensure they are ABOVE collectibles)
    obstacle.setDepth(5);
  }

  protected hitObstacle(player: Phaser.Physics.Arcade.Sprite, _obstacle: Phaser.Physics.Arcade.Sprite) {
    if (this.isGameOver) return; // Prevent multiple calls if already game over
    
    this.isGameOver = true;
    player.setTint(0xff0000);
    
    // Play immediate collision sound (only once)
    this.collideSound.play();
    
    // Stop the timers
    this.obstacleTimer.remove();
    this.collectibleTimer.remove();
    if (this.ravenTimer) {
      this.ravenTimer.remove();
    }
    if (this.spookyEyesTimer) {
      this.spookyEyesTimer.remove();
    }
    if (this.specialCollectibleTimer) {
      this.specialCollectibleTimer.remove();
    }
    
    // Fade out the music
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.tweens.add({
        targets: this.backgroundMusic,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          this.backgroundMusic.stop();
        }
      });
    }
    
    if (this.backgroundMusicAlt && this.backgroundMusicAlt.isPlaying) {
      this.tweens.add({
        targets: this.backgroundMusicAlt,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          this.backgroundMusicAlt.stop();
        }
      });
    }
    
    // Short delay before showing game over to let collision sound play first
    this.time.delayedCall(300, () => {
      // Show game over screen
      this.showGameOver();
    });
  }

  // Platform-specific implementation for game over screen
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
    
    // Display restart instruction with glowing effect - moved much higher
    const restartText = this.add.text(
      0, 
      gameOverImage.height * 0.3, // Moved up from 0.5
      'Tap to Restart',
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
    
    // Add tap to restart functionality
    this.input.once('pointerdown', () => {
      this.restartGame();
    });
  }

  // Add restart method to reset everything including music
  protected restartGame() {
    // Stop any playing music and sounds
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
    
    if (this.backgroundMusicAlt) {
      this.backgroundMusicAlt.stop();
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
    this.obstacleSpawnDelay = 2000;
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
    
    // Short delay before restarting to ensure cleanup is complete
    this.time.delayedCall(100, () => {
      this.scene.restart();
    });
  }

  protected checkDifficultyProgression() {
    // Check if we've reached the threshold for increasing difficulty
    if (this.score >= this.nextSpeedIncreaseThreshold && this.difficultyLevel < this.maxDifficultyLevel) {
      // Increase difficulty level
      this.difficultyLevel++;
      
      // Calculate next threshold
      this.nextSpeedIncreaseThreshold += this.pointsPerSpeedIncrease;
      
      // Increase game speed
      this.gameSpeed += this.speedIncreaseAmount;
      
      // Reduce spawn delays to make obstacles and collectibles appear more frequently
      this.obstacleSpawnDelay = Math.max(800, this.obstacleSpawnDelay * (1 - this.speedIncreasePercentage));
      this.collectibleSpawnDelay = Math.max(100, this.collectibleSpawnDelay * (1 - this.speedIncreasePercentage));
      
      // Update timers with new delays
      this.startObstacleTimer();
      this.startCollectibleTimer();
      
      // Update difficulty display
      this.difficultyText.setText(`Speed: ${this.difficultyLevel}`);
      
      // Visual indication of speed increase
      this.flashDifficultyText();
      
      console.log(`Difficulty increased to level ${this.difficultyLevel}. New game speed: ${this.gameSpeed}`);
    }
  }
  
  protected flashDifficultyText() {
    // Flash the difficulty text to indicate speed increase
    this.difficultyText.setColor('#ff0000'); // Red for emphasis
    
    // Create a tween to flash the text
    this.tweens.add({
      targets: this.difficultyText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.difficultyText.setColor('#ffffff'); // Back to white
      }
    });
  }

  protected spawnSpookyEyes() {
    if (!this.gameStarted || this.isGameOver) return;
    
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    // Choose a random eyes type
    const eyesTypes = ['blue_eyes', 'red_eyes', 'green_eyes', 'yellow_eyes'];
    const eyesType = eyesTypes[Phaser.Math.Between(0, eyesTypes.length - 1)];
    
    // Choose if eyes appear on left or right side
    const onLeftSide = Phaser.Math.Between(0, 1) === 0;
    
    // Position for the eyes - in the lower half of the screen, outside the lanes
    const eyesY = Phaser.Math.Between(gameHeight * 0.5, gameHeight * 0.7); // Lower half of screen
    
    // X position - either left or right of lanes
    let eyesX: number;
    if (onLeftSide) {
      // Left side - between edge and first lane
      eyesX = Phaser.Math.Between(10, this.lanes[0] - 30);
    } else {
      // Right side - between last lane and edge
      eyesX = Phaser.Math.Between(this.lanes[2] + 30, gameWidth - 10);
    }
    
    // Create the eyes
    const eyes = this.add.image(eyesX, eyesY, eyesType);
    
    // Set appropriate size
    eyes.setDisplaySize(24, 12);
    
    // Make eyes initially invisible
    eyes.setAlpha(0);
    
    // Set depth to be above background but below lanes and obstacles
    eyes.setDepth(1);
    
    // Add to spooky eyes group
    this.spookyEyes.add(eyes);
    
    // Add fade in/out animation
    this.tweens.add({
      targets: eyes,
      alpha: { from: 0, to: 0.8 },
      duration: 1500,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Remove eyes after animation completes
        eyes.destroy();
      }
    });
    
    // Add subtle glowing effect
    this.tweens.add({
      targets: eyes,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 700,
      yoyo: true,
      ease: 'Sine.easeInOut',
      repeat: 2
    });
  }
} 