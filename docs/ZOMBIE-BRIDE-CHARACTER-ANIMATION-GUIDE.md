# Zombie Bride Character Animation Guide

## Sprite Sheet Overview

* **Frame size:** 32px wide × 64px tall
* **Grid layout:** 4 columns × 4 rows
* **Total sprite sheet size:** 128px wide × 256px tall

We use a row-column naming convention for each frame:

* **Rows:** A to D (top to bottom)
* **Columns:** 1 to 4 (left to right)
* **Frame naming example:** A1 refers to the first frame in the top row, D4 is the last frame in the bottom row.

---

## Animation Breakdown

### 1. Running Animation

* **Frames used:** A1 → A4, B1 → B4
* **Sequence order:** A1, A2, A3, A4, B1, B2, B3, B4
* **Total frames:** 8
* **Usage:** Loop continuously while the character is running

### 2. Turning Right Animation

* **Frames used:** C1 → C4
* **Sequence order:** C1, C2, C3, C4
* **Total frames:** 4
* **Usage:** Play once during directional change to the right

### 3. Turning Left Animation

* **Frames used:** D1 → D4
* **Sequence order:** D1, D2, D3, D4
* **Total frames:** 4
* **Usage:** Play once during directional change to the left

---

## Implementation Notes for Phaser

* Use `this.load.spritesheet()` to load the sprite sheet with proper frame dimensions.
* Create animations with `this.anims.create()` for each movement type.
* Remember that Phaser indexes frames starting from 0 in row-major order (left-to-right, top-to-bottom).
* Frame 0 corresponds to A1, frame 7 to B4, frame 11 to C4, and frame 15 to D4.

---

## Code Implementation

### Loading the Sprite Sheet

```javascript
// In PreloadScene.ts
this.load.spritesheet('zombieBride', 'images/zombie_bride_sheet.png', {
  frameWidth: 32,
  frameHeight: 64
});
```

### Creating the Animations

```javascript
// In GameScene.ts create() method
this.anims.create({
  key: 'zombie_run',
  frames: this.anims.generateFrameNumbers('zombieBride', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1
});

this.anims.create({
  key: 'zombie_turn_right',
  frames: this.anims.generateFrameNumbers('zombieBride', { start: 8, end: 11 }),
  frameRate: 8,
  repeat: 0
});

this.anims.create({
  key: 'zombie_turn_left',
  frames: this.anims.generateFrameNumbers('zombieBride', { start: 12, end: 15 }),
  frameRate: 8,
  repeat: 0
});
```

### Playing Animations in the Game Loop

```javascript
// In player movement logic:

// Start or continue running animation when player is in normal state
if (!this.isChangingLane) {
  this.player.anims.play('zombie_run', true);
}

// When changing lanes to the right
if (movingRight) {
  this.player.anims.play('zombie_turn_right', true);
  // Optional: Listen for animation completion to switch back to running
  this.player.on('animationcomplete-zombie_turn_right', () => {
    this.player.anims.play('zombie_run', true);
  });
}

// When changing lanes to the left
if (movingLeft) {
  this.player.anims.play('zombie_turn_left', true);
  // Optional: Listen for animation completion to switch back to running
  this.player.on('animationcomplete-zombie_turn_left', () => {
    this.player.anims.play('zombie_run', true);
  });
}
```

**Note:** While the actual sprite sheet is still in development, you can create a placeholder file with the same dimensions (128x256) and filename pattern to test the animation logic. When the final sprite sheet is ready, simply replace the placeholder file while keeping the same filename.
