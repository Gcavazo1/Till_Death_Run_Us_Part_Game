import './style.css'
import Phaser from 'phaser'
import { GameConfig } from './core/utils/GameConfig'

// Function to preload custom fonts
function preloadFonts(callback: () => void) {
  // Create a div with each font to force loading
  const fontPreloader = document.createElement('div');
  fontPreloader.style.opacity = '0';
  fontPreloader.style.position = 'absolute';
  fontPreloader.style.top = '-9999px';
  fontPreloader.style.left = '-9999px';
  
  // Create spans with each custom font
  const fonts = ['October Crow', 'Corpsy', 'BloodyTerror'];
  fonts.forEach(font => {
    const span = document.createElement('span');
    span.style.fontFamily = font;
    span.innerText = 'Font Preload';
    fontPreloader.appendChild(span);
  });
  
  // Add to body
  document.body.appendChild(fontPreloader);
  
  // Wait for fonts to load or timeout after 2 seconds
  if (document.fonts && document.fonts.ready) {
    // Modern browsers with Font Loading API
    document.fonts.ready.then(() => {
      console.log('Fonts loaded successfully');
      setTimeout(() => {
        document.body.removeChild(fontPreloader);
        callback();
      }, 50);
    }).catch(() => {
      console.log('Font loading had an error, proceeding anyway');
      document.body.removeChild(fontPreloader);
      callback();
    });
  } else {
    // Fallback for browsers without Font Loading API
    setTimeout(() => {
      document.body.removeChild(fontPreloader);
      callback();
    }, 500);
  }
}

// Function to animate the vows in sequence
function animateVows() {
  const vowLines = document.querySelectorAll('.vow-line');
  const delayBetweenLines = 2000; // 2 seconds between each line
  const vowsContainer = document.getElementById('vows-loader');
  const gameViewport = document.getElementById('game-viewport');
  
  // Calculate total animation time
  const totalAnimationTime = vowLines.length * delayBetweenLines + 2000; // Extra time at end
  
  // Animate each line with a delay
  vowLines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, index * delayBetweenLines);
  });
  
  // After all lines are shown and some extra time has passed, fade out the loader and show the game
  setTimeout(() => {
    if (vowsContainer && gameViewport) {
      // Add fade out animation to the loader
      vowsContainer.classList.add('fade-out');
      
      // After the fade animation completes, hide the loader and show the game
      setTimeout(() => {
        vowsContainer.style.display = 'none';
        gameViewport.style.visibility = 'visible';
        
        // Initialize the app after vows are shown
        initApp();
      }, 1500); // Time for fade out animation to complete
    }
  }, totalAnimationTime);
}

// Initialize the app based on device type
function initApp() {
  // Get the app container
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  // Remove the game viewport that was created in the static HTML
  const existingViewport = document.getElementById('game-viewport');
  if (existingViewport) {
    document.body.removeChild(existingViewport);
  }
  
  if (GameConfig.isMobileDevice()) {
    // Mobile version: Create completely fresh DOM structure
    const mobileContainer = document.createElement('div');
    mobileContainer.id = 'mobile-app';
    mobileContainer.className = 'mobile-view';
    document.body.appendChild(mobileContainer);
    
    // Set up mobile styles
    document.body.className = 'mobile-body';
    createMobileLanding(mobileContainer);
  } else {
    // Desktop version: Create the original desktop structure
    document.body.className = 'desktop-body';
    createDesktopLayout();
  }
}

// Create the original desktop layout structure and start the game
function createDesktopLayout() {
  console.log('Loading desktop version with original layout...');
  
  // Create the main game viewport container
  const gameViewport = document.createElement('div');
  gameViewport.id = 'game-viewport';
  document.body.appendChild(gameViewport);
  
  // Create header
  const header = document.createElement('div');
  header.id = 'game-header';
  const title = document.createElement('h1');
  title.id = 'game-title';
  title.innerText = 'TIL DEATH RUN US PART';
  header.appendChild(title);
  gameViewport.appendChild(header);
  
  // Create main content area
  const mainContent = document.createElement('div');
  mainContent.id = 'game-main';
  gameViewport.appendChild(mainContent);
  
  // Create background left and right
  const bgLeft = document.createElement('div');
  bgLeft.id = 'background-left';
  mainContent.appendChild(bgLeft);
  
  const bgRight = document.createElement('div');
  bgRight.id = 'background-right';
  mainContent.appendChild(bgRight);
  
  // Create iPhone frame
  const iphoneFrame = document.createElement('div');
  iphoneFrame.id = 'iphone-frame';
  mainContent.appendChild(iphoneFrame);
  
  // Create app container for the game
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  iphoneFrame.appendChild(appContainer);
  
  // Create footer
  const footer = document.createElement('div');
  footer.id = 'game-footer';
  
  const copyright = document.createElement('p');
  copyright.id = 'copyright';
  copyright.innerText = '© 2025 Til Death Run Us Part Game | All Rights Reserved';
  
  const credits = document.createElement('p');
  credits.id = 'credits';
  credits.innerHTML = 'Developed by Gabriel Cavazos (GigaCode) | <a href="mailto:gigacode.developer@gmail.com">gigacode.developer@gmail.com</a>';
  
  footer.appendChild(copyright);
  footer.appendChild(credits);
  gameViewport.appendChild(footer);
  
  // Start the desktop game using the config
  window.game = new Phaser.Game(GameConfig.getDesktopConfig());
}

// Create a mobile landing page
function createMobileLanding(container: HTMLElement) {
  console.log('Loading mobile landing page...');
  
  // Set full viewport styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  
  // Create mobile landing page with background image
  const landingPage = document.createElement('div');
  landingPage.className = 'mobile-landing';
  
  // Add title
  const titleContainer = document.createElement('div');
  titleContainer.className = 'title-container';
  
  const title1 = document.createElement('h1');
  title1.innerText = 'TIL DEATH RUN US';
  title1.className = 'title-text title-line1';
  
  const title2 = document.createElement('h1');
  title2.innerText = 'PART';
  title2.className = 'title-text title-line2';
  
  titleContainer.appendChild(title1);
  titleContainer.appendChild(title2);
  
  // Add tap to play button
  const playButton = document.createElement('button');
  playButton.innerText = 'Tap to Play';
  playButton.className = 'play-button';
  
  // Add pulsing animation
  let growing = true;
  setInterval(() => {
    if (growing) {
      playButton.style.transform = 'scale(1.1)';
      playButton.style.opacity = '1';
    } else {
      playButton.style.transform = 'scale(1.0)';
      playButton.style.opacity = '0.7';
    }
    growing = !growing;
  }, 400);
  
  // Add event listener to start game
  playButton.addEventListener('click', () => {
    requestFullscreen();
    startMobileGameFullScreen();
  });
  
  // Add elements to page
  landingPage.appendChild(titleContainer);
  landingPage.appendChild(playButton);
  container.appendChild(landingPage);
}

// Start mobile game in full screen
function startMobileGameFullScreen() {
  // Clear body
  document.body.innerHTML = '';
  
  // Create new game container
  const gameContainer = document.createElement('div');
  gameContainer.id = 'mobile-game';
  gameContainer.className = 'mobile-game-container';
  document.body.appendChild(gameContainer);
  
  // Start the mobile game with config
  window.game = new Phaser.Game(GameConfig.getMobileConfig());
  
  // Make sure the canvas fills the screen
  const resize = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
    }
  };
  
  // Ensure canvas is properly sized
  window.addEventListener('resize', resize);
  setTimeout(resize, 100);
}

// Request fullscreen mode
function requestFullscreen() {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
}

// Add Phaser game to Window interface
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

// Initialize the animation sequence after preloading fonts
document.addEventListener('DOMContentLoaded', () => {
  preloadFonts(() => {
    // Start vow animation sequence after fonts are loaded
    animateVows();
  });
});
