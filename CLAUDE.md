# Markdown Viewer Mobile - Claude Code Guide

## Project Overview
Expo-based mobile Markdown viewer/editor application with WYSIWYG editing capabilities. This is the mobile companion to the desktop Markdown Viewer, designed for on-the-go reading and editing of Markdown files on Android devices.

## Tech Stack
- **Framework**: Expo SDK 52+ (managed workflow)
- **UI**: React Native + TypeScript
- **Editor**: @10play/tentap-editor (ProseMirror-based rich text editor for React Native)
- **State Management**: Zustand
- **File System**: expo-file-system (with SAF for Android storage access)
- **Navigation**: React Navigation (native stack + bottom tabs)
- **Styling**: React Native StyleSheet API
- **Syntax Highlighting**: react-native-syntax-highlighter or similar

## Architecture
- **Screens** (`src/screens/`): Top-level screen components corresponding to navigation routes.
- **Components** (`src/components/`): Reusable UI components organized by feature area.
- **Stores** (`src/stores/`): Zustand stores for global state management.
- **Hooks** (`src/hooks/`): Custom React hooks for shared logic.
- **Services** (`src/services/`): File system operations, storage access, and other platform interactions.
- **Navigation** (`src/navigation/`): React Navigation configuration and type definitions.
- **Types** (`src/types/`): Shared TypeScript type definitions.
- **Utils** (`src/utils/`): Pure utility functions.
- **Constants** (`src/constants/`): App-wide constants (colors, dimensions, config values).

## Key Conventions
- Always use TypeScript strict mode
- Use functional React components with hooks only (no class components)
- State management through Zustand stores (`src/stores/`)
- File system operations go through service layer (`src/services/`) - never call expo-file-system directly from components
- Use async/await for all asynchronous operations
- Use React Native StyleSheet.create() for all styles - no inline style objects
- Navigation typing must be strict - define param lists in `src/navigation/types.ts`
- Use expo-secure-store for sensitive settings and preferences

## Security Rules (CRITICAL)
- Never expose raw file system paths to the UI layer
- Use Android Storage Access Framework (SAF) via expo-file-system for external storage access
- Use expo-secure-store for any sensitive settings or tokens
- Validate all file paths before file system operations
- Sanitize Markdown content before rendering to prevent injection
- Do not store credentials or API keys in app state or AsyncStorage

## File Naming Conventions
- Components: PascalCase (e.g., `FileList.tsx`, `EditorToolbar.tsx`)
- Screens: PascalCase with 'Screen' suffix (e.g., `HomeScreen.tsx`, `EditorScreen.tsx`)
- Stores: camelCase with 'Store' suffix (e.g., `fileStore.ts`, `editorStore.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useFiles.ts`, `useEditor.ts`)
- Services: camelCase with 'Service' suffix (e.g., `fileService.ts`, `storageService.ts`)
- Types: PascalCase in `.ts` files (e.g., `types/FileNode.ts`)
- Constants: camelCase (e.g., `colors.ts`, `layout.ts`)

## Build & Run Commands
- `npx expo start` - Start Expo development server
- `npx expo start --android` - Start and open on Android device/emulator
- `npx expo start --clear` - Start with cleared Metro cache
- `eas build --platform android --profile preview` - Build APK for testing
- `eas build --platform android --profile production` - Build AAB for Play Store
- `eas submit --platform android` - Submit to Google Play Store
- `npm test` - Run Jest test suite
- `npx tsc --noEmit` - Type-check without emitting files
- `npm run lint` - Run ESLint

## Important Dependencies
- expo - Expo SDK and managed workflow runtime
- expo-file-system - File system access and SAF integration
- expo-document-picker - Native file/folder picker
- expo-secure-store - Secure storage for sensitive data
- expo-status-bar - Status bar configuration
- @10play/tentap-editor - Rich text / Markdown WYSIWYG editor
- @react-navigation/native - Navigation framework
- @react-navigation/native-stack - Native stack navigator
- @react-navigation/bottom-tabs - Bottom tab navigator
- react-native-screens - Native screen containers
- react-native-safe-area-context - Safe area insets
- react-native-gesture-handler - Touch gesture handling
- react-native-reanimated - Animation library
- zustand - State management
- react-native-markdown-display - Markdown rendering in read mode

## Testing
- Use Jest with React Native Testing Library for unit and component tests
- Test files alongside source: `Component.test.tsx`
- Use `@testing-library/react-native` for component rendering and interaction
- Mock expo modules using jest.mock() in `__mocks__/` directory
- Run `npx tsc --noEmit` to verify TypeScript compilation
- Test on Android emulator via `npx expo start --android`

## Common Patterns

### Adding a new screen
1. Create screen component in `src/screens/` (e.g., `SettingsScreen.tsx`)
2. Add screen type to navigation param list in `src/navigation/types.ts`
3. Register screen in the appropriate navigator in `src/navigation/`
4. Create any associated components in `src/components/`

### Adding a new component
1. Create component file in appropriate `src/components/` subdirectory
2. Define props interface with TypeScript
3. Create styles using `StyleSheet.create()` at the bottom of the file
4. Handle touch interactions and gestures as needed
5. Add to parent component or screen

### Adding a Zustand store
1. Create store in `src/stores/` (e.g., `settingsStore.ts`)
2. Define state interface and actions
3. Export typed hook from the store file (e.g., `useSettingsStore`)
4. Use in components via the exported hook

### Adding a service
1. Create service in `src/services/` (e.g., `fileService.ts`)
2. Encapsulate all platform-specific API calls (expo-file-system, etc.)
3. Export async functions that components/stores can call
4. Handle errors and return typed results
