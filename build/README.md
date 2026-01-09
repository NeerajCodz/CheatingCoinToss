# CoinFlip Build Artifacts

This folder contains release builds of the CoinFlip app.

## Files

### Android
- `coinflip_1.0.0.apk` - Direct install APK (for manual installation via ADB or file manager)
- `coinflip_1.0.0.aab` - Android App Bundle (for Google Play Store upload)

### Signing
- `coinflip.keystore` - Release signing keystore (PRIVATE)
- `credentials.json` - Keystore passwords (PRIVATE)

## Installation

### APK (Direct Install)
```bash
adb install -r coinflip_1.0.0.apk
```

### AAB (Play Store)
1. Upload `coinflip_1.0.0.aab` to Google Play Console
2. Signing is handled by Play App Signing

## Version History
- **v1.0.0** (2026-01-10) - Initial release
  - 3D coin flip animation
  - Magnetometer-based tilt detection
  - Haptic feedback
  - Hidden stealth mode toggle

## Notes
- iOS builds require macOS + Xcode (not included in Windows builds)
- For iOS: Use EAS Build or Mac environment
