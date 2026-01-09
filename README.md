# CoinFlip - Secret Rigged Coin Toss App

A React Native coin toss app that **appears completely fair** but allows the device owner to secretly rig outcomes using the phone's **Magnetometer sensor**.

## 🎯 Features

### Core Functionality
- **🪙 Realistic 3D Coin Flip Animation**
  - Multi-axis rotation with perspective
  - Hero-style toss with spring physics
  - Smooth 1.8s animation with bounce landing
  - Distinct gold (Heads) and silver (Tails) coin designs

- **📱 Hidden Magnetometer-Based Rigging**
  - Tilt phone **LEFT** → Always **HEADS** + light vibration
  - Tilt phone **RIGHT** → Always **TAILS** + heavy vibration
  - Hold **FLAT** → True 50/50 random + no vibration
  - Threshold: Magnetometer X-axis ±5 units

- **🎭 Stealth Mode (Safety Switch)**
  - **Double-tap** the black background to toggle cheat mode
  - When OFF: All flips become fair 50/50, no vibration regardless of tilt
  - **No visible UI indication** - completely hidden

- **✨ Cartoon-Style Result Animation**
  - "HEADS!" or "TAILS!" text zooms in with bounce
  - Color-matched: Gold for heads, Silver for tails
  - Auto-fades after 1.5 seconds

## 🛠️ Tech Stack

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Styling:** React Native StyleSheet (pure)
- **Sensors:** expo-sensors (Magnetometer)
- **Haptics:** expo-haptics
- **Animations:** React Native Reanimated 4

## 📱 DEMO
https://github.com/user-attachments/assets/79efa4c8-1e46-41be-b86b-d6dc67755db2

## 🚀 Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Start Metro bundler
pnpm start

# Run on Android device
pnpm android
```

### Local Build (APK)
```bash
# Set environment variables
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

# Build release APK
cd android
.\gradlew assembleRelease
cd ..

# Copy to build folder
Copy-Item android\app\build\outputs\apk\release\app-release.apk .\build\CoinFlip.apk
```

### Install on Device
```bash
# Via ADB
adb install -r .\build\CoinFlip.apk

# Launch app
adb shell am start -n com.neerajcodz.coinflip/.MainActivity
```

## 🎮 How to Use

### Basic Usage
1. Open the app (black screen with coin and "Flip Coin" button)
2. **Tilt the phone** to desired position:
   - **Left edge down** (Magnetometer X < -5) → Forces **HEADS**
   - **Right edge down** (Magnetometer X > 5) → Forces **TAILS**
   - **Flat/upright** (Magnetometer X between -5 and +5) → Random result
3. Tap **"Flip Coin"** button
4. Feel the **haptic feedback** (if tilted)
5. Watch the 3D coin flip animation
6. See the animated result text

### Stealth Mode (Safety Switch)
- **Double-tap** anywhere on the black background
- Cheat mode toggles ON/OFF silently
- When **OFF**: Phone ignores all tilts, always gives fair 50/50 results
- Perfect for handing phone to skeptics

### Magnetometer Values Reference
| Phone Position | Magnetometer X | Result | Haptics |
|---------------|---------------|--------|----------|
| Left tilt (-15°) | -8 to -20 | HEADS | Light |
| Flat (0°) | -5 to +5 | Random | None |
| Right tilt (+15°) | +4 to +20 | TAILS | Heavy |

## 🏗️ Project Structure

```
CoinFlip/
├── App.tsx                 # Main app with coin flip logic
├── app.json               # Expo config (package: com.coinflip.app)
├── babel.config.js        # Babel + Reanimated plugin
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── android/               # Native Android project (after prebuild)
│   └── keystore/
│       └── coinflip.keystore  # Release signing key
├── build/                 # Output folder
│   ├── CoinFlip.apk      # Release APK
│   ├── coinflip.keystore # Signing key backup
│   └── credentials.json  # Signing credentials
└── credentials.json       # Local signing config
```

## 🔐 Build Configuration

### Signing Credentials
- **Keystore:** `android/keystore/coinflip.keystore`
- **Alias:** `coinflip-key`
- **Passwords:** Stored in `credentials.json`

### EAS Build (Alternative)
```bash
# Cloud build via Expo Application Services
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest build --platform android --profile preview
```

## 📋 Requirements

### Development
- Node.js 18+
- pnpm 8+
- Expo CLI
- Android device with USB debugging (or emulator)

### Local Build
- JDK 17 (Microsoft OpenJDK or Oracle)
- Android SDK (via Android Studio)
- Gradle (included in project)

## 🧪 Testing

### Physical Device (Recommended)
```bash
# Connect phone via USB
adb devices

# Install and test
adb install -r .\build\CoinFlip.apk

# View logs for debugging
adb logcat | Select-String "Magnetometer|Deciding"
```

### Emulator
- Open **Extended Controls** (Ctrl+Shift+P or "..." button)
- Go to **Virtual sensors**
- Adjust **Y-Rot** slider:
  - `-15` → Heads
  - `0` → Random
  - `+15` → Tails

## 🎯 Key Implementation Details

### Tilt Detection
```typescript
const TILT_THRESHOLD = 5; // Magnetometer X-axis units

if (magnetometerX < -TILT_THRESHOLD) {
  // Left tilt → HEADS
} else if (magnetometerX > TILT_THRESHOLD) {
  // Right tilt → TAILS
} else {
  // Flat → Random 50/50
}
```

### Animation Stages
1. **Launch:** Coin tosses up with scale bounce
2. **Spin:** 4 full rotations (rotateX) + 2 spins (rotateZ)
3. **Fall:** Spring physics landing
4. **Reveal:** Final bounce + text zoom animation

### Haptic Feedback
- **Light:** `Haptics.ImpactFeedbackStyle.Light` (Heads)
- **Heavy:** `Haptics.ImpactFeedbackStyle.Heavy` (Tails)
- **None:** Flat position or Stealth Mode OFF

## 🤝 Contributing

This is a demonstration project for sensor-based interactions in React Native.

## 👤 Author
<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/neerajcodz">
        <img src="https://github.com/neerajcodz.png" width="100" height="100" style="border: 3px solid #4CAF50; border-radius: 50%;">
        <br>
        <sub><b>Neeraj Sathish Kumar</b></sub>
      </a>
    </td>
  </tr>
</table>

</div>

## �📄 License

MIT License - Educational/Demo purposes

## ⚠️ Disclaimer

This app is for **educational purposes** to demonstrate:
- React Native sensor APIs
- Reanimated animations
- Haptic feedback integration
- Hidden UI interactions

**Use responsibly and ethically.** Do not use for gambling, cheating, or deceptive purposes.

---

**Built with React Native + Expo** | **Powered by Magnetometer Magic** ✨
