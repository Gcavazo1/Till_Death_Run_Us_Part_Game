import Phaser from 'phaser';
import { LeaderboardService } from '../services/LeaderboardService';
import { GameConfig } from '../utils/GameConfig';
import { BaseGameScene } from '../scenes/BaseGameScene';

export class NameEntryModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameInput!: HTMLInputElement;
  private leaderboardService: LeaderboardService;
  private score!: number;
  private level!: number;
  private isVisible: boolean = false;
  private onSubmitCallback!: (name: string) => void;
  private scoreText: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.leaderboardService = new LeaderboardService();
    
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    // Create container for all modal elements
    this.container = scene.add.container(gameWidth / 2, gameHeight / 2);
    this.container.setVisible(false);
    
    // Add dark overlay
    const overlay = scene.add.rectangle(
      0, 0, gameWidth * 2, gameHeight * 2, 
      0x000000, 0.7
    );
    
    // Create modal background
    const modalWidth = Math.min(gameWidth * 0.8, 350);
    const modalHeight = Math.min(gameHeight * 0.5, 250);
    
    // Create modal background with rounded corners
    const modal = scene.add.graphics();
    modal.fillStyle(0x1a0522, 1);
    modal.lineStyle(2, 0x3f0086);
    modal.fillRoundedRect(-modalWidth/2, -modalHeight/2, modalWidth, modalHeight, 16);
    modal.strokeRoundedRect(-modalWidth/2, -modalHeight/2, modalWidth, modalHeight, 16);
    
    // Add decorative border with rounded corners
    const border = scene.add.graphics();
    border.lineStyle(1, 0xff0033);
    border.strokeRoundedRect(
      -modalWidth/2 + 5, 
      -modalHeight/2 + 5, 
      modalWidth - 10, 
      modalHeight - 10, 
      13
    );
    
    // Close button (X)
    const closeButton = scene.add.text(
      modalWidth / 2 - 20, -modalHeight / 2 + 20,
      'X', 
      {
        fontFamily: 'BloodyTerror',
        fontSize: '24px',
        color: '#ffffff'
      }
    ).setInteractive({ useHandCursor: true });
    
    closeButton.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.hide();
    });
    
    // Title text
    const title = scene.add.text(
      0, -modalHeight / 2 + 30,
      'HIGH SCORE!',
      {
        fontFamily: 'October Crow',
        fontSize: '28px',
        color: '#ff0033',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Score display - centered in the modal
    const scoreText = scene.add.text(
      0, 0, // Position at center of modal
      'Score: 0',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    this.scoreText = scoreText;
    
    // Create HTML input element for name entry
    this.createNameInput();
    
    // Submit button
    const submitButton = this.createButton(
      0, modalHeight / 2 - 40,
      'SUBMIT',
      () => this.submitScore()
    );
    
    // Add all elements to container
    this.container.add([overlay, modal, border, title, scoreText, closeButton, submitButton]);
    
    // Add to scene's display list and set high depth
    scene.add.existing(this.container);
    this.container.setDepth(1000);
  }
  
  private createNameInput(): void {
    // Create HTML input element
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.font = '16px Arial';
    this.nameInput.style.padding = '8px';
    this.nameInput.style.width = '200px';
    this.nameInput.style.textAlign = 'center';
    this.nameInput.style.backgroundColor = '#460d5d';
    this.nameInput.style.color = 'white';
    this.nameInput.style.border = '1px solid #ff0033';
    this.nameInput.style.borderRadius = '4px';
    this.nameInput.maxLength = 20;
    
    // Hide initially
    this.nameInput.style.display = 'none';
    
    // Add to document
    document.body.appendChild(this.nameInput);
    
    // Handle Enter key
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitScore();
      }
    });
  }
  
  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const buttonWidth = 120;
    const buttonHeight = 40;
    
    const container = this.scene.add.container(x, y);
    
    // Create rounded button background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x3f0086, 1);
    bg.lineStyle(2, 0xff0033);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    
    const label = this.scene.add.text(
      0, 0,
      text,
      {
        fontFamily: 'BloodyTerror',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', (_: Phaser.Input.Pointer, __: number, ___: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      callback();
    });
    
    // Add hover effects
    container.on('pointerover', () => {
      // Clear existing graphics
      bg.clear();
      
      // Redraw with hover color
      bg.fillStyle(0x630faa, 1);
      bg.lineStyle(2, 0xff0033);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });
    
    container.on('pointerout', () => {
      // Clear existing graphics
      bg.clear();
      
      // Redraw with normal color
      bg.fillStyle(0x3f0086, 1);
      bg.lineStyle(2, 0xff0033);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });
    
    return container;
  }
  
  show(score: number, level: number, callback?: (name: string) => void): void {
    this.score = score;
    this.level = level;
    this.onSubmitCallback = callback || (() => {});
    
    // Set modal open flag in the scene
    if (this.scene instanceof BaseGameScene) {
      (this.scene as any).isModalOpen = true;
    }
    
    // Update score text
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Position and show name input
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    // Calculate position for input (must convert from Phaser coordinates to DOM coordinates)
    const scaleX = window.innerWidth / gameWidth;
    const scaleY = window.innerHeight / gameHeight;
    
    const inputX = (gameWidth / 2 - 100) * scaleX;
    const inputY = (gameHeight / 2) * scaleY;
    
    this.nameInput.style.left = `${inputX}px`;
    this.nameInput.style.top = `${inputY}px`;
    this.nameInput.style.display = 'block';
    this.nameInput.value = '';
    this.nameInput.focus();
    
    // Show modal with animation
    this.container.setVisible(true);
    this.isVisible = true;
    
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.8, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  hide(): void {
    // Hide input element
    this.nameInput.style.display = 'none';
    
    // Set modal closed flag in the scene
    if (this.scene instanceof BaseGameScene) {
      (this.scene as any).isModalOpen = false;
    }
    
    // Hide modal with animation
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1, to: 0.8 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
      }
    });
  }
  
  private async submitScore(): Promise<void> {
    if (!this.isVisible) return;
    
    const name = this.nameInput.value.trim() || 'Anonymous';
    
    try {
      await this.leaderboardService.addScore({
        name: name,
        score: this.score,
        level: this.level,
        platform: GameConfig.isMobileDevice() ? 'mobile' : 'desktop'
      });
      
      // Call the callback with the entered name
      this.onSubmitCallback(name);
      
      // Hide modal
      this.hide();
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Could add error handling UI here
    }
  }
  
  destroy(): void {
    // Clean up HTML element when scene is destroyed
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
  }
} 