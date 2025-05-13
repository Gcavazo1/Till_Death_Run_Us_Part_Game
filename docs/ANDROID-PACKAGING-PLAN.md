# Android Packaging Plan for "Til Death Run Us Part" using Capacitor

This document outlines the steps required to package the existing Vite/Phaser web game project into a native Android application (`.apk`) using Capacitor. This allows for distribution outside of mobile browsers, potentially resolving browser-specific throttling issues and enabling distribution via direct download or app stores.

## Goals

1.  Package the web game into a runnable Android `.apk`.
2.  Configure necessary native elements (icons, splash screen).
3.  Establish a repeatable build process.
4.  Outline steps for creating a release-ready (signed) `.apk`.

## Core Technology

*   **Capacitor:** Toolchain for building cross-platform native apps with web technologies.
*   **Android Studio:** Official IDE for Android development (includes SDK, build tools, emulators).
*   **Node.js/npm:** For managing project dependencies and running scripts.
*   **Vite:** For building the web application bundle.

## Phase 1: Prerequisites & Setup

1.  **Install Required Tools:**
    *   **Node.js & npm:** Already installed for the project.
    *   **Java Development Kit (JDK):** Required for Android development. Version 11 or later recommended. Verify installation with `java -version`. ([OpenJDK](https://openjdk.java.net/) recommended).
    *   **Android Studio:** Download and install the latest stable version from the official Android Developers website.
        *   During setup, ensure the **Android SDK**, **Android SDK Platform-Tools**, and **Android SDK Build-Tools** are installed via the SDK Manager within Android Studio. An API level like 33 or 34 is a good target.

2.  **Install Capacitor CLI and Core:**
    *   Open your project terminal in the root directory.
    *   Run: `npm install @capacitor/cli @capacitor/core`

3.  **Install Capacitor Android Platform:**
    *   Run: `npm install @capacitor/android`

4.  **Initialize Capacitor:**
    *   Run: `npx cap init`
    *   Follow the prompts:
        *   **App Name:** `Til Death Run Us Part` (or similar)
        *   **App ID:** Use reverse domain notation (e.g., `com.gigacode.tildeathrunuspart`). *This must be unique if you plan to publish.*
    *   This creates the `capacitor.config.ts` (or `.json`) file.

5.  **Configure `capacitor.config.ts`:**
    *   Open the generated `capacitor.config.ts`.
    *   **Crucially, set the `webDir`:** This tells Capacitor where your Vite build output is located.
      ```typescript
      import { CapacitorConfig } from '@capacitor/cli';

      const config: CapacitorConfig = {
        appId: 'com.gigacode.tildeathrunuspart', // Use your chosen ID
        appName: 'Til Death Run Us Part',      // Use your chosen name
        webDir: 'dist', // <-- Make sure this matches Vite's output directory
        bundledWebRuntime: false // Recommended for modern projects
        // server: { // Optional: for live reload during dev, not needed for build plan
        //   androidScheme: 'http'
        // }
      };

      export default config;
      ```

6.  **Add the Android Platform Project:**
    *   Run: `npx cap add android`
    *   This command creates the native `android` directory in your project root, containing the Android Studio project files.

## Phase 2: Android Studio & Initial Build

1.  **Open Android Project:**
    *   Run: `npx cap open android`
    *   This will launch Android Studio with your native Android project.

2.  **Android Studio Setup:**
    *   Allow Android Studio to perform any necessary **Gradle syncs**. This might take some time on the first open as it downloads dependencies.
    *   Accept any prompts to update Gradle or other build tools if recommended by Android Studio.

3.  **First Web Build & Sync:**
    *   In your project terminal (not Android Studio's terminal), run the standard web build:
        `npm run build`
    *   Copy the web assets into the native project:
        `npx cap sync android`
        *(This copies the contents of your `webDir` ('dist') into `android/app/src/main/assets/public`)*

4.  **Run on Emulator/Device (Debug Build):**
    *   In Android Studio:
        *   Select a target device (either a connected physical device with USB debugging enabled or an emulator created via the AVD Manager).
        *   Click the "Run 'app'" button (green play icon).
    *   This will build the `.apk`, install it, and launch it on the target device/emulator.
    *   Verify the game loads and runs within the native wrapper.

## Phase 3: Native Configuration & Enhancements

1.  **App Icons:**
    *   Android requires icons in various sizes.
    *   **Method 1 (Recommended):** Use Android Studio's **Asset Studio** (`Right-click 'res' folder > New > Image Asset`) to generate adaptive icons from a source image.
    *   **Method 2 (Manual):** Create `.png` files for different densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) and place them in the corresponding `android/app/src/main/res/mipmap-*` folders.
    *   Reference: [Capacitor Android Icons Docs](https://capacitorjs.com/docs/guides/splash-screens-and-icons#android)

2.  **Splash Screen:**
    *   Provides a loading screen while the WebView initializes.
    *   Install the plugin: `npm install @capacitor/splash-screen`
    *   Run sync: `npx cap sync`
    *   Configure in `capacitor.config.ts`:
      ```typescript
      // capacitor.config.ts
      const config: CapacitorConfig = {
        // ... other options
        plugins: {
          SplashScreen: {
            launchShowDuration: 3000, // Duration in ms
            launchAutoHide: true,
            backgroundColor: "#000000", // Match your theme
            androidSplashResourceName: "splash", // Name of the drawable resource
            // ... other options (see docs)
          }
        }
      };
      ```
    *   Generate splash screen resources (or manually create them) and place them in `android/app/src/main/res/drawable*` folders named appropriately (e.g., `splash.png`). Consider using adaptive drawables.
    *   Reference: [Capacitor Splash Screen Docs](https://capacitorjs.com/docs/apis/splash-screen)

3.  **Status Bar:**
    *   Control the appearance (color, style, visibility).
    *   Install plugin: `npm install @capacitor/status-bar`
    *   Use the API in your web code (`main.ts` or game scene `create`) to hide or style it:
      ```typescript
      import { StatusBar, Style } from '@capacitor/status-bar';

      // Example: Hide status bar (call when game starts)
      const hideStatusBar = async () => {
        await StatusBar.hide();
      };

      // Example: Set style (if visible)
      const setStatusBarStyle = async () => {
        await StatusBar.setStyle({ style: Style.Dark }); // Or Style.Light
        await StatusBar.setBackgroundColor({ color: '#000000' }); // Optional
      };
      ```
    *   Reference: [Capacitor Status Bar Docs](https://capacitorjs.com/docs/apis/status-bar)

4.  **Fullscreen & Orientation Lock:**
    *   **Fullscreen:** Often achieved by hiding the Status Bar (see above) and potentially the Navigation Bar (more complex, might use Android immersive mode via themes or plugins). Start with hiding the status bar.
    *   **Orientation Lock:** Edit `android/app/src/main/AndroidManifest.xml`. Find the `<activity android:name=".MainActivity">` tag and add `android:screenOrientation="landscape"` (or `"portrait"`).
      ```xml
      <activity
          android:name=".MainActivity"
          android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
          android:label="@string/title_activity_main"
          android:launchMode="singleTask"
          android:theme="@style/AppTheme.NoActionBarLaunch"
          android:screenOrientation="landscape"> <!-- Or portrait -->
          <!-- ... existing intent-filter ... -->
      </activity>
      ```

5.  **(Optional) Handle Android Back Button:**
    *   By default, it might exit the app. You might want it to pause, show a menu, or confirm exit.
    *   Install plugin: `npm install @capacitor/app`
    *   Add a listener in your web code:
      ```typescript
      import { App } from '@capacitor/app';

      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          // Example: Ask user if they want to exit
          const confirmExit = confirm('Exit Til Death Run Us Part?');
          if (confirmExit) {
            App.exitApp();
          }
        } else {
          // If there's web history (less likely in a game), allow default back navigation
          window.history.back();
        }
      });
      ```
    *   Reference: [Capacitor App API Docs](https://capacitorjs.com/docs/apis/app#addlistenerbackbutton)

## Phase 4: Building a Signed Release `.apk`

*Debug `.apk` files built via "Run 'app'" are not suitable for distribution as they are signed with a generic debug key.*

1.  **Generate a Keystore:**
    *   This file contains your private signing key. **BACK IT UP SECURELY AND REMEMBER THE PASSWORDS! Loss means you cannot update your app.**
    *   Open a terminal (not necessarily the project one).
    *   Use the `keytool` command (part of the JDK):
      ```bash
      keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
      ```
    *   Replace `my-release-key.keystore` and `my-key-alias` with your desired names.
    *   It will prompt you for passwords (keystore and key) and distinguishing information (Name, Org, etc.). Remember the passwords!
    *   Move the generated `.keystore` file to a secure location (outside the project's main directory is often recommended, but accessible for builds).

2.  **Configure Gradle for Signing:**
    *   Store your keystore passwords securely. Avoid hardcoding them directly in `build.gradle`. Common methods:
        *   Using environment variables.
        *   Using a `gradle.properties` file (add this file to `.gitignore`!).
    *   Create or edit `android/gradle.properties` (create if it doesn't exist):
      ```properties
      # gradle.properties (ensure this file is in .gitignore!)
      MYAPP_RELEASE_STORE_FILE=my-release-key.keystore # Path relative to android/app, or absolute path
      MYAPP_RELEASE_KEY_ALIAS=my-key-alias
      MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
      MYAPP_RELEASE_KEY_PASSWORD=your_key_password
      ```
    *   Edit `android/app/build.gradle`. Find the `android { ... }` block and add a `signingConfigs` section and reference it in `buildTypes.release`:
      ```groovy
      // android/app/build.gradle

      // Add this within the android { ... } block, BEFORE buildTypes
      signingConfigs {
          release {
              storeFile file(MYAPP_RELEASE_STORE_FILE)
              storePassword MYAPP_RELEASE_STORE_PASSWORD
              keyAlias MYAPP_RELEASE_KEY_ALIAS
              keyPassword MYAPP_RELEASE_KEY_PASSWORD
              // For newer Gradle versions, you might need V1 and V2 signing enabled:
              // v1SigningEnabled true
              // v2SigningEnabled true
          }
      }

      android {
          // ...compileSdkVersion, defaultConfig, etc...

          buildTypes {
              release {
                  minifyEnabled false // Or true if using ProGuard/R8
                  proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
                  signingConfig signingConfigs.release // Reference the signing config
              }
          }
          // ... other configurations (compileOptions, etc.)
      }
      ```

3.  **Build Signed `.apk` via Android Studio:**
    *   Ensure your web build (`npm run build`) and Capacitor sync (`npx cap sync android`) are up-to-date.
    *   In Android Studio:
        *   Go to `Build > Generate Signed Bundle / APK...`
        *   Select **APK**, click Next.
        *   Provide the path to your Keystore file (`.keystore`), the Keystore password, the Key alias, and the Key password. Check "Remember passwords" if desired (use with caution). Click Next.
        *   Choose the **release** build variant.
        *   Select Signature Version **V1** and **V2**.
        *   Click **Finish**.
    *   Android Studio will build the signed `.apk`. It will usually notify you where it's located (typically `android/app/release/app-release.apk`).

## Phase 5: Distribution

1.  **Direct Distribution (Sideloading):**
    *   Take the generated `app-release.apk`.
    *   Host it somewhere users can download it (e.g., GitHub Releases page for your repo, personal website).
    *   Instruct users they will need to enable "Install from unknown sources" in their Android settings to install the `.apk`.

2.  **(Optional) Google Play Store:**
    *   Requires a Google Play Developer account (one-time fee).
    *   Requires creating store listing assets (screenshots, descriptions).
    *   Requires compliance with Google Play policies.
    *   Involves uploading the signed `.apk` (or preferably an `.aab` - Android App Bundle, generated similarly via `Build > Generate Signed Bundle / APK... > Android App Bundle`) to the Play Console.

---

This plan provides a comprehensive roadmap. Remember to test thoroughly at each stage, especially after adding native configurations and when building the release version. Consult the official Capacitor documentation for the most up-to-date details and advanced options.
