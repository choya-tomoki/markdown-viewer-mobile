---
description: Build and release the Markdown Viewer Mobile app for Android
---

Build the app with the specified profile: $ARGUMENTS

Available profiles and commands:

### Preview Build (testing APK)
```
eas build --platform android --profile preview
```
- Produces an installable APK for testing on physical devices
- Does not require Play Store signing keys
- Use this for internal testing and QA

### Production Build (Play Store AAB)
```
eas build --platform android --profile production
```
- Produces a signed AAB (Android App Bundle) for Play Store submission
- Requires production keystore configuration in `eas.json`
- Verify version number in `app.json` is incremented before building

### Play Store Submission
```
eas submit --platform android
```
- Submits the latest production build to Google Play Store
- Requires Google Play service account key configured in `eas.json`
- Ensure Play Store listing metadata is up to date before submitting

### Steps:
1. Verify `app.json` has the correct version and versionCode
2. Run `npx tsc --noEmit` to verify no type errors
3. Run `npm test` to ensure all tests pass
4. Run the appropriate `eas build` command for the target profile
5. Monitor the build on the EAS dashboard
6. If building for production, run `eas submit --platform android` to submit to the Play Store
