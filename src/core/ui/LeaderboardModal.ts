import Phaser from 'phaser';
import { LeaderboardService } from '../services/LeaderboardService';
import type { LeaderboardEntry } from '../services/LeaderboardService';
import { GameConfig } from '../utils/GameConfig';
import { BaseGameScene } from '../scenes/BaseGameScene';

export class LeaderboardModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private leaderboardService: LeaderboardService;
  private entries: LeaderboardEntry[] = [];
  private isVisible: boolean = false;
  private modalWidth: number;
  private modalHeight: number;
  private playerScore: number = 0;
  private platformButtons: { [key: string]: Phaser.GameObjects.Container } = {};
  private currentPlatform: string = 'all';
  private maxEntriesToShow: number = 7; // Limit to 7 entries to prevent overlap
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.leaderboardService = new LeaderboardService();
    
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    this.modalWidth = Math.min(gameWidth * 0.9, 400);
    this.modalHeight = Math.min(gameHeight * 0.9, 550);
    
    // Create container for all modal elements
    this.container = scene.add.container(gameWidth / 2, gameHeight / 2);
    this.container.setVisible(false);
    
    // Add dark overlay behind modal
    const overlay = scene.add.rectangle(
      0, 0, gameWidth * 2, gameHeight * 2, 
      0x000000, 0.7
    );
    
    // Create modal background with gothic styling and rounded corners
    const modal = scene.add.graphics();
    modal.fillStyle(0x1a0522, 1);
    modal.lineStyle(2, 0x3f0086);
    modal.fillRoundedRect(-this.modalWidth/2, -this.modalHeight/2, this.modalWidth, this.modalHeight, 16);
    modal.strokeRoundedRect(-this.modalWidth/2, -this.modalHeight/2, this.modalWidth, this.modalHeight, 16);
    
    // Title text
    const title = scene.add.text(
      0, -this.modalHeight / 2 + 30,
      'LEADERBOARD',
      {
        fontFamily: 'October Crow',
        fontSize: '32px',
        color: '#ff0033',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Platform toggle buttons label
    const platformText = scene.add.text(
      0, -this.modalHeight / 2 + 70,
      'Platform:',
      {
        fontFamily: 'BloodyModes',
        fontSize: '16px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Close button
    const closeButton = scene.add.text(
      this.modalWidth / 2 - 20, -this.modalHeight / 2 + 20,
      'X', 
      {
        fontFamily: 'BloodyTerror',
        fontSize: '24px',
        color: '#ffffff'
      }
    ).setInteractive({ useHandCursor: true });
    
    closeButton.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation(); // Prevent event from bubbling to scene's global input listener
      this.hide();
    });
    
    // Add all elements to container
    this.container.add([overlay, modal, closeButton, title, platformText]);
    
    // Add to scene's display list
    scene.add.existing(this.container);
    
    // Set depth to ensure it appears above game elements
    this.container.setDepth(1000);
    
    // Create platform filter buttons after the container is fully set up
    this.createPlatformButtons();
  }
  
  private createPlatformButtons(): void {
    const platformTypes = [
      { key: 'all', label: 'ALL', x: -70 },
      { key: 'desktop', label: 'DESKTOP', x: 0 },
      { key: 'mobile', label: 'MOBILE', x: 70 }
    ];
    
    // Clear any existing platform buttons
    Object.values(this.platformButtons).forEach(button => {
      this.container.remove(button, true);
    });
    this.platformButtons = {};
    
    platformTypes.forEach(platform => {
      // Create a container for each button within the modal's container
      const buttonContainer = this.scene.add.container(platform.x, -this.modalHeight / 2 + 100);
      
      // Create button background
      const buttonWidth = 60;
      const buttonHeight = 30;
      
      const bg = this.scene.add.graphics();
      bg.fillStyle(platform.key === this.currentPlatform ? 0x630faa : 0x3f0086, 1);
      bg.lineStyle(1, 0xff0033);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      
      // Create text label
      const label = this.scene.add.text(
        0, 0,
        platform.label,
        {
          fontFamily: 'BloodyModes',
          fontSize: '12px',
          color: '#ffffff',
          align: 'center'
        }
      ).setOrigin(0.5);
      
      // Add items to the button container
      buttonContainer.add([bg, label]);
      
      // Make button interactive
      buttonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Handle click event with proper event stopping
      buttonContainer.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
        // Stop propagation to prevent the event from bubbling up
        event.stopPropagation();
        
        // Change platform
        this.changePlatform(platform.key);
      });
      
      // Store reference to button data
      buttonContainer.setData('key', platform.key);
      buttonContainer.setData('bg', bg);
      buttonContainer.setData('label', label);
      
      // Add button container to modal container
      this.container.add(buttonContainer);
      
      // Store reference to button
      this.platformButtons[platform.key] = buttonContainer;
    });
  }
  
  private changePlatform(platform: string): void {
    if (this.currentPlatform === platform) return;
    
    // Update active state of buttons
    Object.entries(this.platformButtons).forEach(([key, buttonContainer]) => {
      const isActive = key === platform;
      
      // Get the background from the button container
      const bg = buttonContainer.getData('bg');
      
      // Clear the existing graphics
      bg.clear();
      
      // Redraw with new color
      bg.fillStyle(isActive ? 0x630faa : 0x3f0086, 1);
      bg.lineStyle(1, 0xff0033);
      
      const buttonWidth = 60;
      const buttonHeight = 30;
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
    });
    
    this.currentPlatform = platform;
    
    // Reload data with new platform filter
    this.loadLeaderboardData(platform === 'all' ? undefined : platform);
  }
  
  async show(playerScore?: number, platform?: string): Promise<void> {
    this.playerScore = playerScore || 0;
    
    // Set modal open flag in the scene
    if (this.scene instanceof BaseGameScene) {
      (this.scene as any).isModalOpen = true;
    } else if ((this.scene as any).isModalOpen !== undefined) {
      // Support other scene types that have the isModalOpen property
      (this.scene as any).isModalOpen = true;
    }
    
    // Set default platform if not specified
    if (!platform && !this.isVisible) {
      platform = GameConfig.isMobileDevice() ? 'mobile' : 'all';
    }
    
    // Update platform buttons if specified
    if (platform) {
      this.changePlatform(platform);
    }
    
    // Load data before showing
    await this.loadLeaderboardData(
      this.currentPlatform === 'all' ? undefined : this.currentPlatform
    );
    
    // Make the entire container interactive to block clicks
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    this.container.removeAllListeners('pointerdown');
    this.container.setInteractive(new Phaser.Geom.Rectangle(
      -gameWidth, -gameHeight, gameWidth * 2, gameHeight * 2
    ), Phaser.Geom.Rectangle.Contains);
    
    this.container.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });
    
    this.container.setVisible(true);
    this.isVisible = true;
    
    // Add animation for appearing
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  hide(): void {
    // Set modal closed flag in the scene
    if (this.scene instanceof BaseGameScene) {
      (this.scene as any).isModalOpen = false;
    } else if ((this.scene as any).isModalOpen !== undefined) {
      // Support other scene types that have the isModalOpen property
      (this.scene as any).isModalOpen = false;
    }
    
    // Add animation for disappearing
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1, to: 0.8 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
        
        // Extra cleanup to catch any stray elements
        this.cleanupStrayElements();
      }
    });
  }
  
  private async loadLeaderboardData(platform?: string): Promise<void> {
    try {
      this.entries = await this.leaderboardService.getTopScores(10, platform);
      this.createLeaderboardEntries();
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
    }
  }
  
  private createLeaderboardEntries(): void {
    // Clear existing entries
    this.container.getAll().forEach(child => {
      if (child.getData('type') === 'LeaderboardEntry') {
        this.container.remove(child, true);
      }
    });
    
    // Create header
    const rankHeader = this.scene.add.text(
      -this.modalWidth/2 + 30, 
      -this.modalHeight/2 + 130, 
      'RANK', {
        fontFamily: 'October Crow',
        fontSize: '19px',
        color: '#ff9adf'
      }
    );
    rankHeader.setData('type', 'LeaderboardEntry');
    
    const nameHeader = this.scene.add.text(
      -this.modalWidth/2 + 105, 
      -this.modalHeight/2 + 130, 
      'NAME', {
        fontFamily: 'October Crow',
        fontSize: '19px',
        color: '#ff9adf'
      }
    );
    nameHeader.setData('type', 'LeaderboardEntry');
    
    const scoreHeader = this.scene.add.text(
      this.modalWidth/2 - 80, 
      -this.modalHeight/2 + 130, 
      'SCORE', {
        fontFamily: 'October Crow',
        fontSize: '19px',
        color: '#ff9adf'
      }
    );
    scoreHeader.setData('type', 'LeaderboardEntry');
    
    this.container.add([rankHeader, nameHeader, scoreHeader]);
    
    // Show only the top entries to prevent overlap with share button
    const entriesToShow = this.entries.slice(0, this.maxEntriesToShow);
    
    // Add entries
    entriesToShow.forEach((entry, index) => {
      const yPos = -this.modalHeight/2 + 180 + (index * 40);
      const isPlayerScore = this.playerScore > 0 && entry.score === this.playerScore;
      
      // Rank
      const rank = this.scene.add.text(
        -this.modalWidth/2 + 30, 
        yPos, 
        `${index + 1}`, 
        {
          fontFamily: 'BloodyTerror',
          fontSize: '18px',
          color: isPlayerScore ? '#ff0033' : (index < 3 ? '#ffff00' : '#ffffff')
        }
      );
      rank.setData('type', 'LeaderboardEntry');
      
      // Name (truncate if too long)
      let displayName = entry.name;
      if (displayName.length > 12) {
        displayName = displayName.substring(0, 10) + '...';
      }
      
      const name = this.scene.add.text(
        -this.modalWidth/2 + 90, 
        yPos, 
        displayName, 
        {
          fontFamily: 'BloodyModes',
          fontSize: '16px',
          color: isPlayerScore ? '#ff0033' : '#ffffff'
        }
      );
      name.setData('type', 'LeaderboardEntry');
      
      // Score
      const score = this.scene.add.text(
        this.modalWidth/2 - 80, 
        yPos, 
        `${entry.score}`, 
        {
          fontFamily: 'BloodyTerror',
          fontSize: '18px',
          color: isPlayerScore ? '#ff0033' : '#ffffff',
          align: 'right'
        }
      );
      score.setData('type', 'LeaderboardEntry');
      
      this.container.add([rank, name, score]);
    });
    
    // If there are more entries than we can show, add a message
    if (this.entries.length > this.maxEntriesToShow) {
      const moreEntries = this.scene.add.text(
        0, -this.modalHeight/2 + 180 + (this.maxEntriesToShow * 40),
        `+ ${this.entries.length - this.maxEntriesToShow} more...`,
        {
          fontFamily: 'BloodyModes',
          fontSize: '16px',
          color: '#999999',
          align: 'center'
        }
      ).setOrigin(0.5);
      moreEntries.setData('type', 'LeaderboardEntry');
      this.container.add(moreEntries);
    }
    
    // If no entries, show message
    if (this.entries.length === 0) {
      const noScores = this.scene.add.text(
        0, 0,
        'No scores yet. Be the first!',
        {
          fontFamily: 'BloodyModes',
          fontSize: '16px',
          color: '#ffffff',
          align: 'center'
        }
      ).setOrigin(0.5);
      noScores.setData('type', 'LeaderboardEntry');
      this.container.add(noScores);
    }
    
    // Add share button at the bottom using the improved approach
    const shareButton = this.createShareButton();
    shareButton.setData('type', 'LeaderboardEntry');
    this.container.add(shareButton);
  }
  
  private createShareButton(): Phaser.GameObjects.Container {
    // Create a container for the share button
    const buttonContainer = this.scene.add.container(0, this.modalHeight / 2 - 30);
    
    // Button dimensions
    const buttonWidth = 180;
    const buttonHeight = 40;
    
    // Create button background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x3f0086, 1);
    bg.lineStyle(2, 0xff0033);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    
    // Create button text
    const label = this.scene.add.text(
      0, 0,
      'SHARE YOUR SCORE',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Add elements to container
    buttonContainer.add([bg, label]);
    
    // Make button interactive
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Handle button events with proper event stopping
    buttonContainer.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      // Stop propagation to prevent the event from bubbling up
      event.stopPropagation();
      
      // Share leaderboard
      this.shareLeaderboard();
    });
    
    // Add hover effects
    buttonContainer.on('pointerover', () => {
      // Clear existing graphics
      bg.clear();
      
      // Redraw with hover color
      bg.fillStyle(0x630faa, 1);
      bg.lineStyle(2, 0xff0033);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });
    
    buttonContainer.on('pointerout', () => {
      // Clear existing graphics
      bg.clear();
      
      // Redraw with normal color
      bg.fillStyle(0x3f0086, 1);
      bg.lineStyle(2, 0xff0033);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });
    
    return buttonContainer;
  }
  
  private shareLeaderboard(): void {
    // Create share text with game title and URL
    const gameTitle = 'Til Death Run Us Part';
    const shareText = `Check out my score in '${gameTitle}'! Can you beat it? Play now!`;
    const shareUrl = window.location.href;

    // Only use Web Share API - no clipboard fallbacks
    if (navigator.share) {
      navigator.share({
        title: gameTitle,
        text: shareText,
        url: shareUrl
      })
      .then(() => {
        console.log('Successfully shared');
      })
      .catch(err => {
        console.error('Error sharing:', err);
        this.showToast('Sharing failed. Please try again.');
      });
    } else {
      // Show message that sharing is not supported
      this.showToast('Sharing not supported on this device.');
      console.error('Web Share API not supported');
    }
  }
  
  private showToast(message: string): void {
    // Create toast message as part of the container
    const toast = this.scene.add.text(
      0, -this.modalHeight / 2 - 30,
      message,
      {
        fontFamily: 'BloodyModes',
        fontSize: '16px',
        backgroundColor: '#460d5d',
        padding: { x: 15, y: 10 },
        color: '#ffffff'
      }
    ).setOrigin(0.5, 0).setAlpha(0);
    
    // Mark toast as part of leaderboard for cleanup
    toast.setData('type', 'LeaderboardEntry');
    this.container.add(toast);
    
    // Animation for appearing and disappearing
    this.scene.tweens.add({
      targets: toast,
      alpha: { from: 0, to: 1 },
      y: { from: -this.modalHeight / 2 - 50, to: -this.modalHeight / 2 - 30 },
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: toast,
          alpha: 0,
          delay: 2000,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            // Ensure toast is removed from container
            this.container.remove(toast, true);
          }
        });
      }
    });
  }
  
  // Add new method to clean up any stray elements that might have been created
  private cleanupStrayElements(): void {
    // Look for any text objects with "ALL", "DESKTOP", or "MOBILE" at the scene level
    this.scene.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        const text = child as Phaser.GameObjects.Text;
        if (text.text === 'ALL' || text.text === 'DESKTOP' || text.text === 'MOBILE') {
          // If found directly in scene (not part of our container), destroy it
          let isPartOfContainer = false;
          this.container.iterate((containerChild: Phaser.GameObjects.GameObject) => {
            if (containerChild === text) {
              isPartOfContainer = true;
              return false; // Stop iteration
            }
            return true; // Continue iteration
          });
          
          if (!isPartOfContainer) {
            text.destroy();
          }
        }
      }
      // Also look for graphics objects with our platform button styling
      if (child instanceof Phaser.GameObjects.Graphics) {
        // Check if it's part of our container
        let isPartOfContainer = false;
        this.container.iterate((containerChild: Phaser.GameObjects.GameObject) => {
          if (containerChild === child) {
            isPartOfContainer = true;
            return false; // Stop iteration
          }
          return true; // Continue iteration
        });
        
        if (!isPartOfContainer) {
          child.destroy();
        }
      }
    });
  }
} 