
# Leaderboard Implementation Plan for "Til Death Run Us Part"

## 1. Overview

The leaderboard system will add a competitive element to the game, displaying top scores and encouraging repeated play. It will be implemented using Firebase as the backend, with a clean modal UI in the game for viewing scores and entering player names.

## 2. Firebase Setup

### 2.1 Firebase Project Creation
- Create a new Firebase project in the Firebase Console
- Enable Firestore Database (not Realtime Database)
- Set up appropriate security rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Anyone can read leaderboard entries
      match /leaderboard/{entry} {
        allow read: true;
        // Only allow writes with valid score data
        allow create: if request.resource.data.score is number && 
                         request.resource.data.name is string &&
                         request.resource.data.name.size() <= 20 &&
                         request.resource.data.timestamp is timestamp;
      }
    }
  }
  ```

### 2.2 Firebase SDK Integration
- Install Firebase SDK: `npm install firebase`
- Create a Firebase configuration file in the project:

```typescript
// src/core/firebase/FirebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## 3. Leaderboard Data Model

### 3.1 Firestore Collection Structure
- Collection: `leaderboard`
- Document structure:
  ```typescript
  interface LeaderboardEntry {
    name: string;       // Player name
    score: number;      // Player score
    platform: string;   // "mobile" or "desktop"
    timestamp: Date;    // When the score was achieved
    level: number;      // Difficulty level reached
  }
  ```

### 3.2 Leaderboard Service Class

```typescript
// src/core/services/LeaderboardService.ts
import { db } from '../firebase/FirebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  platform: string;
  timestamp: Date;
  level: number;
}

export class LeaderboardService {
  private readonly COLLECTION_NAME = 'leaderboard';
  
  async addScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...entry,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding score:", error);
      throw error;
    }
  }
  
  async getTopScores(count: number = 10, platform?: string): Promise<LeaderboardEntry[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('score', 'desc'),
        limit(count)
      );
      
      if (platform) {
        q = query(q, where('platform', '==', platform));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<LeaderboardEntry, 'id'>
      }));
    } catch (error) {
      console.error("Error getting top scores:", error);
      return [];
    }
  }
  
  async getPlayerRank(score: number, platform?: string): Promise<number> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('score', '>', score)
      );
      
      if (platform) {
        q = query(q, where('platform', '==', platform));
      }
      
      const querySnapshot = await getDocs(q);
      // Rank is the number of scores higher than this one, plus 1
      return querySnapshot.size + 1;
    } catch (error) {
      console.error("Error getting player rank:", error);
      return 0;
    }
  }
}
```

## 4. UI Components

### 4.1 Leaderboard Modal

Create a modal system for displaying the leaderboard:

```typescript
// src/core/ui/LeaderboardModal.ts
import Phaser from 'phaser';
import { LeaderboardService, LeaderboardEntry } from '../services/LeaderboardService';
import { GameConfig } from '../utils/GameConfig';

export class LeaderboardModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private leaderboardService: LeaderboardService;
  private entries: LeaderboardEntry[] = [];
  private isVisible: boolean = false;
  private modalWidth: number;
  private modalHeight: number;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.leaderboardService = new LeaderboardService();
    
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    this.modalWidth = Math.min(gameWidth * 0.8, 400);
    this.modalHeight = Math.min(gameHeight * 0.8, 550);
    
    // Create container for all modal elements
    this.container = scene.add.container(gameWidth / 2, gameHeight / 2);
    this.container.setVisible(false);
    
    // Add dark overlay behind modal
    const overlay = scene.add.rectangle(
      0, 0, gameWidth * 2, gameHeight * 2, 
      0x000000, 0.7
    );
    
    // Create modal background with gothic styling
    const modal = scene.add.rectangle(
      0, 0, this.modalWidth, this.modalHeight,
      0x1a0522, 1
    ).setStrokeStyle(2, 0x3f0086);
    
    // Add a decorative border
    const border = scene.add.rectangle(
      0, 0, this.modalWidth - 10, this.modalHeight - 10,
      0x1a0522, 0
    ).setStrokeStyle(1, 0xff0033);
    
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
    
    // Platform toggle buttons (desktop/mobile)
    const platformText = scene.add.text(
      0, -this.modalHeight / 2 + 70,
      'Platform:',
      {
        fontFamily: 'Corpsy',
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
    
    closeButton.on('pointerdown', () => {
      this.hide();
    });
    
    // Add all elements to container
    this.container.add([overlay, modal, border, title, platformText, closeButton]);
    
    // Add to scene's display list
    scene.add.existing(this.container);
    
    // Set depth to ensure it appears above game elements
    this.container.setDepth(1000);
  }
  
  async show(platform?: string): Promise<void> {
    // Load data before showing
    await this.loadLeaderboardData(platform);
    this.createLeaderboardEntries();
    
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
      }
    });
  }
  
  private async loadLeaderboardData(platform?: string): Promise<void> {
    this.entries = await this.leaderboardService.getTopScores(10, platform);
  }
  
  private createLeaderboardEntries(): void {
    // Clear existing entries
    this.container.getAll('type', 'LeaderboardEntry').forEach(child => {
      this.container.remove(child, true);
    });
    
    // Create header
    const rankHeader = this.scene.add.text(-this.modalWidth/2 + 30, -this.modalHeight/2 + 100, 'RANK', {
      fontFamily: 'Corpsy',
      fontSize: '16px',
      color: '#ff9adf'
    });
    rankHeader.setData('type', 'LeaderboardEntry');
    
    const nameHeader = this.scene.add.text(-this.modalWidth/2 + 90, -this.modalHeight/2 + 100, 'NAME', {
      fontFamily: 'Corpsy',
      fontSize: '16px',
      color: '#ff9adf'
    });
    nameHeader.setData('type', 'LeaderboardEntry');
    
    const scoreHeader = this.scene.add.text(this.modalWidth/2 - 80, -this.modalHeight/2 + 100, 'SCORE', {
      fontFamily: 'Corpsy',
      fontSize: '16px',
      color: '#ff9adf'
    });
    scoreHeader.setData('type', 'LeaderboardEntry');
    
    this.container.add([rankHeader, nameHeader, scoreHeader]);
    
    // Add divider line
    const divider = this.scene.add.line(
      0, -this.modalHeight/2 + 125, 
      -this.modalWidth/2 + 20, 0, 
      this.modalWidth/2 - 20, 0,
      0x3f0086
    );
    divider.setData('type', 'LeaderboardEntry');
    this.container.add(divider);
    
    // Add entries
    this.entries.forEach((entry, index) => {
      const yPos = -this.modalHeight/2 + 150 + (index * 40);
      
      // Rank
      const rank = this.scene.add.text(-this.modalWidth/2 + 30, yPos, `${index + 1}`, {
        fontFamily: 'BloodyTerror',
        fontSize: '18px',
        color: index < 3 ? '#ffff00' : '#ffffff'
      });
      rank.setData('type', 'LeaderboardEntry');
      
      // Name
      const name = this.scene.add.text(-this.modalWidth/2 + 90, yPos, entry.name, {
        fontFamily: 'Corpsy',
        fontSize: '16px',
        color: '#ffffff'
      });
      name.setData('type', 'LeaderboardEntry');
      
      // Score
      const score = this.scene.add.text(this.modalWidth/2 - 80, yPos, `${entry.score}`, {
        fontFamily: 'BloodyTerror',
        fontSize: '18px',
        color: '#ffffff',
        align: 'right'
      });
      score.setData('type', 'LeaderboardEntry');
      
      this.container.add([rank, name, score]);
    });
  }
}
```

### 4.2 Name Entry Modal

Create a name entry modal for when players achieve a high score:

```typescript
// src/core/ui/NameEntryModal.ts
import Phaser from 'phaser';
import { LeaderboardService } from '../services/LeaderboardService';
import { GameConfig } from '../utils/GameConfig';

export class NameEntryModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameInput: HTMLInputElement;
  private leaderboardService: LeaderboardService;
  private score: number;
  private level: number;
  private isVisible: boolean = false;
  private onSubmitCallback: (name: string) => void;
  
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
    
    const modal = scene.add.rectangle(
      0, 0, modalWidth, modalHeight,
      0x1a0522, 1
    ).setStrokeStyle(2, 0x3f0086);
    
    // Add decorative border
    const border = scene.add.rectangle(
      0, 0, modalWidth - 10, modalHeight - 10,
      0x1a0522, 0
    ).setStrokeStyle(1, 0xff0033);
    
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
    
    // Score display
    const scoreText = scene.add.text(
      0, -modalHeight / 2 + 70,
      'Score: 0',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    this.scoreText = scoreText;
    
    // Name entry prompt
    const promptText = scene.add.text(
      0, -modalHeight / 2 + 110,
      'Enter your name:',
      {
        fontFamily: 'Corpsy',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Create HTML input element for name entry
    this.createNameInput(gameWidth, gameHeight);
    
    // Submit button
    const submitButton = this.createButton(
      0, modalHeight / 2 - 40,
      'SUBMIT',
      () => this.submitScore()
    );
    
    // Add all elements to container
    this.container.add([overlay, modal, border, title, scoreText, promptText, submitButton]);
    
    // Add to scene's display list and set high depth
    scene.add.existing(this.container);
    this.container.setDepth(1000);
  }
  
  private createNameInput(gameWidth: number, gameHeight: number): void {
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
    
    const bg = this.scene.add.rectangle(
      0, 0, buttonWidth, buttonHeight,
      0x3f0086, 1
    ).setStrokeStyle(2, 0xff0033);
    
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
    container.on('pointerdown', callback, this);
    
    // Add hover effects
    container.on('pointerover', () => {
      bg.setFillStyle(0x630faa);
    });
    
    container.on('pointerout', () => {
      bg.setFillStyle(0x3f0086);
    });
    
    return container;
  }
  
  show(score: number, level: number, callback?: (name: string) => void): void {
    this.score = score;
    this.level = level;
    this.onSubmitCallback = callback || (() => {});
    
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
```

## 5. Integration with Game Scenes

### 5.1 Game Over Integration

Modify the `showGameOver` method in `BaseGameScene.ts` to check if the score is a high score:

```typescript
// src/core/scenes/BaseGameScene.ts (modified)
import { LeaderboardService } from '../services/LeaderboardService';
import { NameEntryModal } from '../ui/NameEntryModal';
import { LeaderboardModal } from '../ui/LeaderboardModal';

export abstract class BaseGameScene extends Phaser.Scene {
  // Add new properties
  protected leaderboardService: LeaderboardService;
  protected nameEntryModal: NameEntryModal;
  protected leaderboardModal: LeaderboardModal;
  
  // In the create method, initialize the services
  create() {
    // Existing code...
    
    // Initialize leaderboard service and modals
    this.leaderboardService = new LeaderboardService();
    this.nameEntryModal = new NameEntryModal(this);
    this.leaderboardModal = new LeaderboardModal(this);
  }
  
  // Modify the showGameOver method
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
    ).setAlpha(0.7).setDepth(30);
    
    // Create a container for all game over elements
    const gameOverContainer = this.add.container(gameWidth / 2, gameHeight / 2).setDepth(35);
    
    // Game over image (full screen width)
    const gameOverImage = this.add.image(0, 0, 'game-over');
    const scaleX = gameWidth / gameOverImage.width * 1;
    const scaleY = gameHeight / gameOverImage.height * 1;
    gameOverImage.setScale(Math.min(scaleX, scaleY));
    
    // Display final score with shadow for better visibility
    const finalScoreText = this.add.text(
      0, 
      gameOverImage.height * 0.2,
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
    
    // Add leaderboard button
    const leaderboardButton = this.add.text(
      0,
      gameOverImage.height * 0.4,
      'Leaderboard',
      {
        fontFamily: 'BloodyTerror',
        fontSize: '20px',
        color: '#ff9adf',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5)
     .setInteractive({ useHandCursor: true });
    
    leaderboardButton.on('pointerdown', () => {
      this.leaderboardModal.show(
        GameConfig.isMobileDevice() ? 'mobile' : 'desktop'
      );
    });
    
    // Add items to container
    gameOverContainer.add([gameOverImage, finalScoreText, restartText, leaderboardButton]);
    
    // Fade in the game over screen
    this.tweens.add({
      targets: [darkOverlay, gameOverContainer],
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2'
    });
    
    // Check if this is a high score
    this.checkHighScore();
    
    // Add tap to restart functionality
    this.input.once('pointerdown', () => {
      this.restartGame();
    });
  }
  
  // Add method to check for high score
  private async checkHighScore(): Promise<void> {
    try {
      // Get the top 10 scores for this platform
      const platform = GameConfig.isMobileDevice() ? 'mobile' : 'desktop';
      const topScores = await this.leaderboardService.getTopScores(10, platform);
      
      // Check if current score would make the top 10
      const isHighScore = topScores.length < 10 || this.score > topScores[topScores.length - 1].score;
      
      if (isHighScore) {
        // Delay showing the name entry modal slightly to allow game over screen to appear first
        this.time.delayedCall(1000, () => {
          this.nameEntryModal.show(this.score, this.difficultyLevel);
        });
      }
    } catch (error) {
      console.error("Error checking high score:", error);
    }
  }
}
```

### 5.2 Main Menu Integration

Add a leaderboard button to either the desktop or mobile landing screens:

```typescript
// In DesktopGameScene.ts - modify createStartPrompt method
private createStartPrompt() {
  // Existing code...
  
  // Add leaderboard button
  const leaderboardButton = this.createButton(
    0, gameHeight * 0.7,
    'LEADERBOARD',
    () => {
      this.leaderboardModal.show();
    }
  );
  
  // Add elements to group
  this.startPrompt.add(leaderboardButton);
  
  // Existing code...
}

// Helper method to create a styled button
private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
  const buttonWidth = 180;
  const buttonHeight = 50;
  
  const container = this.add.container(x, y);
  
  const bg = this.add.rectangle(
    0, 0, buttonWidth, buttonHeight,
    0x3f0086, 1
  ).setStrokeStyle(2, 0xff0033);
  
  const label = this.add.text(
    0, 0,
    text,
    {
      fontFamily: 'BloodyTerror',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }
  ).setOrigin(0.5);
  
  container.add([bg, label]);
  container.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
  container.on('pointerdown', callback, this);
  
  // Add hover effects
  container.on('pointerover', () => {
    bg.setFillStyle(0x630faa);
  });
  
  container.on('pointerout', () => {
    bg.setFillStyle(0x3f0086);
  });
  
  return container;
}
```

## 6. Social Media Sharing (Optional Enhancement)

Add social sharing functionality to the leaderboard:

```typescript
// In LeaderboardModal.ts - add method for sharing
private createShareButton(): Phaser.GameObjects.Container {
  const shareButton = this.createButton(
    0, this.modalHeight / 2 - 40,
    'SHARE YOUR SCORE',
    () => this.shareLeaderboard()
  );
  
  return shareButton;
}

private shareLeaderboard(): void {
  // Create share text
  const shareText = `Check out my score of ${this.playerScore} in 'Til Death Run Us Part'! Can you beat it? Play now: [your-game-url]`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'Til Death Run Us Part - Leaderboard',
      text: shareText,
      url: window.location.href
    }).catch(err => console.error('Error sharing:', err));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        // Show a message that text was copied
        this.showToast('Score copied to clipboard!');
      })
      .catch(err => console.error('Error copying text:', err));
  }
}

private showToast(message: string): void {
  const gameWidth = this.scene.cameras.main.width;
  const toast = this.scene.add.text(
    gameWidth / 2, 20,
    message,
    {
      fontFamily: 'Corpsy',
      fontSize: '16px',
      backgroundColor: '#460d5d',
      padding: { x: 15, y: 10 },
      color: '#ffffff'
    }
  ).setOrigin(0.5, 0).setAlpha(0).setDepth(2000);
  
  // Fade in and out
  this.scene.tweens.add({
    targets: toast,
    alpha: { from: 0, to: 1 },
    y: { from: 0, to: 40 },
    duration: 300,
    ease: 'Power2',
    onComplete: () => {
      this.scene.tweens.add({
        targets: toast,
        alpha: 0,
        delay: 2000,
        duration: 300,
        ease: 'Power2',
        onComplete: () => toast.destroy()
      });
    }
  });
}
```

## 7. Implementation Plan

### Phase 1: Firebase Setup and Basic Integration
1. Create Firebase project
2. Configure Firestore Database
3. Implement FirebaseConfig.ts
4. Implement LeaderboardService.ts
5. Test basic operations

### Phase 2: UI Components
1. Implement NameEntryModal.ts
2. Implement LeaderboardModal.ts
3. Style modals to match the gothic theme

### Phase 3: Game Integration
1. Modify BaseGameScene.ts for high score checks
2. Update game over screen with leaderboard button
3. Add leaderboard button to start screens
4. Test full integration

### Phase 4: Polish and Optimization
1. Add animations and transitions
2. Optimize Firebase reads/writes
3. Add social sharing functionality
4. Final testing

## 8. Potential Future Enhancements

1. **Weekly/Monthly Leaderboards**: Time-based leaderboards that reset periodically
2. **Achievements**: Track and display player achievements 
3. **Friend Challenges**: Allow players to challenge friends to beat their scores
4. **Leaderboard Categories**: Add separate categories for highest level reached, longest time alive, etc.
5. **Custom Avatars**: Allow players to select or upload profile pictures
6. **Rewards**: Offer in-game rewards for high scores or achievements

