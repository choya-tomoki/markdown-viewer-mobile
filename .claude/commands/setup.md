---
description: Scaffold the Markdown Viewer Mobile Expo project from scratch
---

Set up the project with the following steps:

1. Create the Expo project using the TypeScript template: `npx create-expo-app@latest . --template blank-typescript`
2. Install all required dependencies listed in CLAUDE.md
3. Set up the project directory structure as defined in DESIGN.md:
   - `src/screens/`
   - `src/components/`
   - `src/stores/`
   - `src/hooks/`
   - `src/services/`
   - `src/navigation/`
   - `src/types/`
   - `src/utils/`
   - `src/constants/`
4. Configure `app.json` with proper app name, slug, Android package name, and permissions
5. Configure `tsconfig.json` with strict mode enabled and proper path aliases
6. Set up React Navigation with a basic navigator structure
7. Create the basic App entry point that wraps the app in navigation and safe area providers
8. Verify the app launches successfully with `npx expo start`

Follow the conventions in CLAUDE.md strictly.
