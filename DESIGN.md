# Markdown Viewer Mobile - Design Document

## 1. Overview

### 1.1 Application Name

**Markdown Viewer Mobile**

### 1.2 Purpose and Goals

Markdown Viewer Mobile is a React Native (Expo) application for Android that brings the desktop Markdown Viewer experience to mobile devices. It provides WYSIWYG rendering and editing of Markdown files with a mobile-first interface, porting the core functionality of the Electron-based desktop application to a touch-optimized environment.

Primary Goals:

- Render Markdown files in WYSIWYG format directly on mobile devices (no split-pane source/preview)
- Enable in-place WYSIWYG editing with a touch-friendly formatting toolbar
- Provide file browsing via Android's Storage Access Framework (SAF) for secure, scoped file access
- Support tabbed interface for working with multiple files simultaneously
- Maintain feature parity with the desktop version where possible, adapting UX patterns for mobile
- Save edited files back to their original location on the device
- Persist user preferences (theme, font family, font size) across sessions

### 1.3 Target Users

- Software engineers who review and edit Markdown on-the-go
- Technical writers who need to make quick edits to documentation from their phone or tablet
- Knowledge workers who maintain notes and documentation in Markdown format
- Students and researchers who use Markdown for note-taking
- Any user who wants a clean, distraction-free Markdown editor on Android

### 1.4 Comparison with Existing Mobile Markdown Editors

| App | Strengths | Markdown Viewer Mobile Differentiator |
|-----|-----------|---------------------------------------|
| **JotterPad** | Polished UI, cloud sync, Fountain/LaTeX support, subscription model | Free and open-source, true WYSIWYG (not split-pane), no subscription required, direct local file editing |
| **iA Writer** | Excellent typography, focus mode, content blocks, cross-platform | Android-first optimization, WYSIWYG editing (iA Writer uses source mode), open technology stack, GFM table editing |
| **Markor** | Open-source, offline-first, supports ToDo lists, no account needed | True WYSIWYG rendering (Markor is source-only with preview toggle), richer formatting toolbar, tab management, modern UI |
| **Obsidian Mobile** | Plugin ecosystem, Live Preview mode, vault-based organization | Simpler and more focused, faster startup, lighter resource usage, true WYSIWYG without hybrid source view |
| **Typora (no mobile)** | Desktop gold standard for WYSIWYG Markdown | Brings the Typora-like experience to mobile, which Typora itself does not offer |

### 1.5 Relationship to Desktop Version

This application is a port of the Electron-based Markdown Viewer desktop application. The following table summarizes the mapping between desktop and mobile technologies:

| Concern | Desktop (Electron) | Mobile (Expo/React Native) |
|---------|--------------------|-----------------------------|
| Runtime | Electron v41 (Chromium + Node.js) | Expo SDK 52+ (React Native / Hermes) |
| Editor | Milkdown (ProseMirror + Remark) | @10play/tentap-editor (Tiptap/ProseMirror) |
| File Tree | react-arborist (virtualized tree) | Custom FlatList-based tree component |
| File System | Node.js fs module + chokidar | expo-file-system + SAF |
| File Dialogs | Electron dialog API | expo-document-picker + SAF |
| Tabs | Custom + @dnd-kit drag-and-drop | Custom ScrollView-based tab bar |
| State | Zustand + localStorage (persist) | Zustand + AsyncStorage (persist) |
| Themes | CSS custom properties + data attribute | React Native theme context + StyleSheet |
| Navigation | Single window with sidebar | Drawer (file browser) + Stack (editor) |
| Build | electron-forge + Vite | EAS Build (Expo Application Services) |

---

## 2. Architecture

### 2.1 Overall Architecture Diagram

```
+------------------------------------------------------------------+
|                    Expo / React Native Application                |
|                                                                    |
|  +------------------------------+  +---------------------------+  |
|  |       JS Thread (Hermes)     |  |        UI Thread          |  |
|  |                              |  |                           |  |
|  |  +------------------------+  |  |  +---------------------+  |  |
|  |  |   React Component Tree |  |  |  |  Native View        |  |  |
|  |  |                        |  |  |  |  Hierarchy           |  |  |
|  |  |  +------------------+  |  |  |  |                     |  |  |
|  |  |  | Expo Router      |  |  |  |  |  DrawerLayout       |  |  |
|  |  |  | (Navigation)     |  |  |  |  |  +-ScrollView (Tabs)|  |  |
|  |  |  +------------------+  |  |  |  |  +-WebView (Editor) |  |  |
|  |  |  +------------------+  |  |  |  |  +-FlatList (Files)  |  |  |
|  |  |  | Zustand Stores   |  |  |  |  +---------------------+  |  |
|  |  |  | (State Mgmt)     |  |  |  |                           |  |
|  |  |  +------------------+  |  |  +---------------------------+  |
|  |  |  +------------------+  |  |                                  |
|  |  |  | TenTap Bridge    |  |  |  +---------------------------+  |
|  |  |  | (Editor <-> RN)  |  |  |  |   WebView Thread          |  |
|  |  |  +------------------+  |  |  |                           |  |
|  |  +------------------------+  |  |  +---------------------+  |  |
|  |                              |  |  |  Tiptap/ProseMirror |  |  |
|  |  +------------------------+  |  |  |  Editor Instance    |  |  |
|  |  | Service Layer          |  |  |  |  (WYSIWYG)          |  |  |
|  |  |                        |  |  |  +---------------------+  |  |
|  |  |  FileSystemService     |  |  |                           |  |
|  |  |  StorageService        |  |  +---------------------------+  |
|  |  |  PermissionService     |  |                                  |
|  |  +------------------------+  |                                  |
|  +------------------------------+                                  |
|           |                                                        |
|           v                                                        |
|  +------------------------------+                                  |
|  |   Native Modules (Expo)      |                                  |
|  |                              |                                  |
|  |   expo-file-system (SAF)     |                                  |
|  |   expo-document-picker       |                                  |
|  |   @react-native-async-storage|                                  |
|  |   react-native-webview       |                                  |
|  +------------------------------+                                  |
+------------------------------------------------------------------+
           |
           v
+------------------------------------------------------------------+
|              Android OS / File System                              |
|                                                                    |
|   +------------------+  +-------------------+  +--------------+  |
|   | Internal Storage |  | External Storage  |  | SD Card      |  |
|   | (App Sandbox)    |  | (SAF Scoped)      |  | (SAF Scoped) |  |
|   +------------------+  +-------------------+  +--------------+  |
+------------------------------------------------------------------+
```

### 2.2 Thread Model

React Native operates on multiple threads. Understanding them is essential for performance:

```
+-------------------+     +-------------------+     +-------------------+
|   JS Thread       |     |   UI Thread       |     |  WebView Thread   |
|   (Hermes Engine)  |     |   (Main/Native)    |     |  (Editor Only)    |
|                   |     |                   |     |                   |
| - React rendering |     | - Native views    |     | - Tiptap editor   |
| - State updates   |     | - Touch handling  |     | - ProseMirror     |
| - Business logic  |     | - Animations      |     | - DOM rendering   |
| - Navigation      |     | - Layout          |     | - Markdown parse  |
| - File I/O calls  |     | - Gestures        |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                          |
         +------- New Arch (JSI) --+                          |
         |                         |                          |
         +---- TenTap Bridge (postMessage) -------------------+
```

**JS Thread (Hermes)**: Executes all JavaScript / TypeScript code including React component rendering, Zustand state management, navigation logic, and service layer calls to native modules.

**UI Thread (Native)**: Handles native view rendering, touch event processing, gesture recognition, layout computation, and native animations. With Expo SDK 52+ and the New Architecture, communication between JS and UI threads uses the JavaScript Interface (JSI) for synchronous, bridgeless calls.

**WebView Thread**: The TenTap editor runs inside a WebView, executing Tiptap/ProseMirror in a separate web context. Communication between the React Native JS thread and the WebView uses TenTap's bridge mechanism (based on `postMessage`).

### 2.3 Component Hierarchy

```
App (Expo Router Root Layout)
|
+-- ThemeProvider
    |
    +-- DrawerNavigator
        |
        +-- FileBrowserDrawer (Drawer Content)
        |   |
        |   +-- DrawerHeader (folder name, open folder button)
        |   +-- FileTreeList (recursive FlatList)
        |       |
        |       +-- FileTreeItem (file/folder row)
        |
        +-- EditorStack (Main Content)
            |
            +-- EditorScreen
            |   |
            |   +-- TabBar (horizontal ScrollView)
            |   |   |
            |   |   +-- Tab (individual tab, pressable)
            |   |
            |   +-- EditorContainer
            |   |   |
            |   |   +-- TenTapEditor (WebView-based WYSIWYG)
            |   |   +-- EditorToolbar (formatting buttons)
            |   |   +-- EmptyState (when no file is open)
            |   |
            |   +-- StatusBar (file info footer)
            |
            +-- SettingsScreen (modal presentation)
                |
                +-- ThemeSelector
                +-- FontFamilyPicker
                +-- FontSizeControl
                +-- AboutSection
```

### 2.4 Navigation Structure

```
RootLayout (_layout.tsx)
|
+-- DrawerLayout (drawer/_layout.tsx)
    |
    +-- DrawerContent: FileBrowserDrawer
    |   (Custom drawer content with file tree)
    |
    +-- Screens:
        |
        +-- (editor) - EditorScreen [default/index]
        |   Main editor view with tabs and TenTap
        |
        +-- settings - SettingsScreen [modal presentation]
            Bottom sheet or full-screen settings
```

Expo Router file structure:

```
app/
+-- _layout.tsx              # Root layout (ThemeProvider, fonts)
+-- (drawer)/
    +-- _layout.tsx          # Drawer navigator layout
    +-- (editor)/
    |   +-- _layout.tsx      # Stack layout for editor screens
    |   +-- index.tsx        # Main editor screen
    +-- settings.tsx         # Settings screen (modal)
```

### 2.5 Data Flow Diagram

```
User Action               React Native               Native/WebView         File System
    |                          |                          |                      |
    |  Tap "Open Folder"       |                          |                      |
    +------------------------->|                          |                      |
    |                          |  SAF.requestDir           |                      |
    |                          | PermissionsAsync()       |                      |
    |                          +------------------------->|                      |
    |                          |                          |  OS Folder Picker    |
    |                          |                          +--------------------->|
    |                          |                          |<---------------------+
    |                          |  directoryUri            |                      |
    |                          |<-------------------------+                      |
    |                          |  SAF.readDir              |                      |
    |                          | AsyncRecursive()          |                      |
    |                          +------------------------->|                      |
    |                          |                          |  readdir (SAF)       |
    |                          |                          +--------------------->|
    |                          |                          |<---------------------+
    |                          |  treeData                |                      |
    |                          |<-------------------------+                      |
    |  File tree rendered      |                          |                      |
    |<-------------------------+                          |                      |
    |                          |                          |                      |
    |  Tap file in tree        |                          |                      |
    +------------------------->|                          |                      |
    |                          |  SAF.readFile             |                      |
    |                          |  AsStringAsync()         |                      |
    |                          +------------------------->|                      |
    |                          |                          |  read file (SAF)     |
    |                          |                          +--------------------->|
    |                          |                          |<---------------------+
    |                          |  content (string)        |                      |
    |                          |<-------------------------+                      |
    |                          |                          |                      |
    |                          |  editor.setContent()     |                      |
    |                          +-----+                    |                      |
    |                          |     | TenTap Bridge      |                      |
    |                          |     | (postMessage)      |                      |
    |                          |     +---> WebView        |                      |
    |  WYSIWYG Markdown        |          (Tiptap)        |                      |
    |<-------------------------+                          |                      |
    |                          |                          |                      |
    |  Edit content            |                          |                      |
    +------------------------->|  (WebView touch events)  |                      |
    |                          |<---- onChange callback    |                      |
    |                          |  Zustand: markDirty()    |                      |
    |                          |                          |                      |
    |  Tap "Save"              |                          |                      |
    +------------------------->|                          |                      |
    |                          |  SAF.writeFile            |                      |
    |                          | AsStringAsync()          |                      |
    |                          +------------------------->|                      |
    |                          |                          |  write file (SAF)    |
    |                          |                          +--------------------->|
    |                          |                          |<---------------------+
    |                          |  success                 |                      |
    |                          |<-------------------------+                      |
    |  "Saved" toast           |                          |                      |
    |<-------------------------+                          |                      |
```

---

## 3. Tech Stack

### 3.1 Core Technology Matrix

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Expo SDK | 52+ | Managed workflow, OTA updates, EAS Build, comprehensive native module set |
| Runtime | React Native | 0.76+ | New Architecture (Fabric, TurboModules) for improved performance |
| JS Engine | Hermes | Built-in | Optimized for React Native, fast startup, low memory footprint |
| Language | TypeScript | 5.x | Type safety, same language as desktop version, developer productivity |
| Navigation | Expo Router | 4.x | File-based routing, deep linking, type-safe navigation, Drawer support |
| Editor | @10play/tentap-editor | 0.9+ | Tiptap/ProseMirror-based WYSIWYG, React Native WebView integration, toolbar support, bridge extensions |
| WebView | react-native-webview | 13.x | Required peer dependency for TenTap, renders the editor |
| File System | expo-file-system | Latest | SAF support for Android scoped storage, read/write files, directory access |
| File Picker | expo-document-picker | Latest | System file picker integration, MIME type filtering |
| State Management | Zustand | 5.x | Same as desktop, lightweight, middleware support (persist) |
| Persistence | @react-native-async-storage/async-storage | Latest | Key-value storage for Zustand persist middleware, settings storage |
| Gestures | react-native-gesture-handler | Latest | Required by Expo Router/Drawer, swipe gestures for drawer |
| Animations | react-native-reanimated | 3.x | Required by Expo Router/Drawer, smooth drawer animations |
| Safe Area | react-native-safe-area-context | Latest | Handles notch/status bar insets, required by React Navigation |
| Screens | react-native-screens | Latest | Native screen containers, required by React Navigation/Expo Router |
| Status Bar | expo-status-bar | Latest | Control system status bar appearance per theme |
| Splash Screen | expo-splash-screen | Latest | Branded loading screen while app initializes |
| Icons | @expo/vector-icons | Latest | Icon set for toolbar, file tree, UI elements |

### 3.2 Dependency List

#### Production Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-file-system": "~18.0.0",
  "expo-document-picker": "~13.0.0",
  "expo-status-bar": "~2.0.0",
  "expo-splash-screen": "~0.29.0",
  "@expo/vector-icons": "^14.0.0",
  "react": "^18.3.0",
  "react-native": "~0.76.0",
  "@10play/tentap-editor": "^0.9.0",
  "react-native-webview": "^13.0.0",
  "zustand": "^5.0.0",
  "@react-native-async-storage/async-storage": "^2.0.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-safe-area-context": "~4.14.0",
  "react-native-screens": "~4.4.0"
}
```

#### Development Dependencies

```json
{
  "typescript": "~5.6.0",
  "@types/react": "~18.3.0",
  "@babel/core": "^7.25.0",
  "eslint": "^9.0.0",
  "eslint-config-expo": "~8.0.0",
  "prettier": "^3.4.0"
}
```

### 3.3 Library Selection Rationale

**@10play/tentap-editor over Milkdown**: Milkdown is designed for web browsers and has no official React Native support. TenTap wraps Tiptap (also ProseMirror-based, like Milkdown) inside a WebView with a native bridge, providing proper mobile keyboard handling, native toolbar rendering, and bridge extensions for bidirectional communication. Both editors share the same ProseMirror foundation, ensuring comparable WYSIWYG quality.

**expo-file-system over react-native-fs**: expo-file-system is maintained by the Expo team, integrates seamlessly with the managed workflow, includes SAF (Storage Access Framework) support for Android 11+ scoped storage requirements, and receives regular updates aligned with Expo SDK releases.

**Expo Router over React Navigation (direct)**: Expo Router provides file-based routing built on top of React Navigation, offering automatic deep linking, type-safe routes, and a familiar file-system-based structure. It supports Drawer, Stack, and Tab navigators with minimal configuration.

**AsyncStorage over expo-secure-store for settings**: Settings data (theme preference, font size, font family) is non-sensitive and benefits from the simpler key-value API of AsyncStorage. expo-secure-store is reserved for credentials or tokens, which this app does not handle. AsyncStorage also integrates directly with Zustand's `persist` middleware.

---

## 4. Project Structure

```
markdown-viewer-mobile/
|
+-- app/                              # Expo Router pages (file-based routing)
|   +-- _layout.tsx                   # Root layout: ThemeProvider, font loading
|   +-- (drawer)/                     # Drawer navigator group
|       +-- _layout.tsx               # Drawer layout: file browser as drawer content
|       +-- (editor)/                 # Editor stack group
|       |   +-- _layout.tsx           # Stack layout for editor screens
|       |   +-- index.tsx             # Main editor screen (tabs + editor + status bar)
|       +-- settings.tsx              # Settings screen (modal presentation)
|
+-- src/
|   +-- components/                   # Reusable UI components
|   |   +-- Editor/                   # TenTap editor wrapper
|   |   |   +-- EditorContainer.tsx   # Editor layout container
|   |   |   +-- TenTapEditor.tsx      # TenTap initialization and bridge config
|   |   |   +-- EditorToolbar.tsx     # Formatting toolbar (bold, italic, headers...)
|   |   |   +-- EmptyState.tsx        # "No file open" placeholder
|   |   |
|   |   +-- FileTree/                 # File browser components
|   |   |   +-- FileBrowserDrawer.tsx  # Drawer content container
|   |   |   +-- DrawerHeader.tsx      # Folder name display + open button
|   |   |   +-- FileTreeList.tsx      # Recursive file/folder list
|   |   |   +-- FileTreeItem.tsx      # Individual file/folder row
|   |   |
|   |   +-- TabBar/                   # Tab management
|   |   |   +-- TabBar.tsx            # Horizontal scrollable tab container
|   |   |   +-- Tab.tsx               # Individual tab (pressable, closeable)
|   |   |
|   |   +-- SettingsPanel/            # Settings UI
|   |   |   +-- SettingsScreen.tsx    # Full settings layout
|   |   |   +-- ThemeSelector.tsx     # Light/Dark toggle
|   |   |   +-- FontFamilyPicker.tsx  # Font family selector
|   |   |   +-- FontSizeControl.tsx   # Font size +/- control
|   |   |
|   |   +-- StatusBar/                # File information bar
|   |   |   +-- EditorStatusBar.tsx   # File path, encoding, char count
|   |   |
|   |   +-- common/                   # Shared UI primitives
|   |       +-- IconButton.tsx        # Pressable icon button
|   |       +-- Divider.tsx           # Visual separator
|   |       +-- Toast.tsx             # Toast notification
|   |
|   +-- stores/                       # Zustand state stores
|   |   +-- appStore.ts               # App settings (theme, font, sidebar)
|   |   +-- tabStore.ts               # Tab state (open tabs, active tab)
|   |   +-- fileTreeStore.ts          # File tree state (opened folder, tree data)
|   |   +-- editorStore.ts            # Editor state (scroll positions, dirty flag)
|   |
|   +-- hooks/                        # Custom React hooks
|   |   +-- useFileOperations.ts      # File read/write/save operations
|   |   +-- useTheme.ts               # Theme application and switching
|   |   +-- useBackHandler.ts         # Android back button handling
|   |   +-- useKeyboardHeight.ts      # Keyboard visibility and height tracking
|   |   +-- usePermissions.ts         # SAF permission management
|   |
|   +-- services/                     # Business logic / native module wrappers
|   |   +-- fileSystemService.ts      # expo-file-system + SAF operations
|   |   +-- storageService.ts         # AsyncStorage wrapper
|   |   +-- markdownService.ts        # Markdown <-> HTML conversion helpers
|   |   +-- permissionService.ts      # Android permission helpers
|   |
|   +-- themes/                       # Theme definitions
|   |   +-- colors.ts                 # Color palette (light + dark)
|   |   +-- typography.ts             # Font families and size scales
|   |   +-- spacing.ts                # Spacing/layout constants
|   |   +-- ThemeContext.tsx           # React Context for theme
|   |   +-- editorThemes.ts           # TenTap CSS themes (light + dark)
|   |
|   +-- types/                        # TypeScript type definitions
|   |   +-- FileNode.ts               # File/folder tree node type
|   |   +-- TabData.ts                # Tab data structure
|   |   +-- AppSettings.ts            # Settings/preferences types
|   |   +-- navigation.ts             # Navigation parameter types
|   |
|   +-- constants/                    # Application constants
|       +-- fileTypes.ts              # Supported file extensions
|       +-- fonts.ts                  # Font family definitions
|       +-- layout.ts                 # Layout dimensions
|
+-- assets/                           # Static assets
|   +-- icon.png                      # App icon (1024x1024)
|   +-- splash.png                    # Splash screen image
|   +-- adaptive-icon.png             # Android adaptive icon
|   +-- fonts/                        # Custom font files (if bundled)
|
+-- app.json                          # Expo configuration
+-- eas.json                          # EAS Build configuration
+-- tsconfig.json                     # TypeScript configuration
+-- babel.config.js                   # Babel configuration
+-- package.json                      # Dependencies and scripts
+-- .eslintrc.js                      # ESLint configuration
+-- DESIGN.md                         # This design document
+-- CLAUDE.md                         # Claude Code project guide
+-- README.md                         # Project README
```

---

## 5. Component Design

### 5.1 EditorScreen (`app/(drawer)/(editor)/index.tsx`)

The primary screen of the application, housing the tab bar, editor, and status bar.

```
+-----------------------------------------------+
| [=] Tab1 | Tab2* | Tab3              [gear]    |
+-----------------------------------------------+
|                                               |
|  # Heading                                    |
|                                               |
|  Paragraph text with **bold** and *italic*    |
|                                               |
|  - List item 1                                |
|  - List item 2                                |
|    - Nested item                              |
|                                               |
|  ```javascript                                |
|  const hello = "world";                       |
|  ```                                          |
|                                               |
|  | Col 1 | Col 2 | Col 3 |                   |
|  |-------|-------|-------|                    |
|  | A     | B     | C     |                   |
|                                               |
+-----------------------------------------------+
| /Documents/notes/README.md | UTF-8 | 1,234 ch |
+-----------------------------------------------+
| [B] [I] [H1] [H2] ["] [<>] [-] [v] [link]   |
+-----------------------------------------------+
```

**Props**: None (route component).

**State Management**:
- Reads `activeTab` and `tabs` from `tabStore`
- Reads `theme`, `fontFamily`, `fontSize` from `appStore`
- Uses `useFileOperations` hook for save functionality
- Uses `useBackHandler` for Android back button

**Key Behavior**:
- Renders `TabBar` at top, `TenTapEditor` in the center, `EditorStatusBar` below the editor, and `EditorToolbar` above the keyboard
- When no file is open, shows `EmptyState` with instructions
- The editor toolbar appears at the bottom, docked above the soft keyboard when keyboard is visible
- Gear icon in the tab bar area opens the settings screen
- Hamburger icon opens the file browser drawer

**Mobile-Specific Considerations**:
- `KeyboardAvoidingView` wraps the toolbar to keep it visible above the soft keyboard
- `SafeAreaView` ensures content does not overlap with system status bar or navigation bar
- Android back button closes drawer if open, otherwise prompts to save unsaved changes

### 5.2 TenTapEditor (`src/components/Editor/TenTapEditor.tsx`)

Wrapper around `@10play/tentap-editor` that manages the WebView-based WYSIWYG editor.

```typescript
interface TenTapEditorProps {
  content: string;                    // Markdown content to display
  onChange: (markdown: string) => void; // Callback when content changes
  theme: 'light' | 'dark';           // Current theme
  fontFamily: string;                 // Editor font family
  fontSize: number;                   // Editor font size (px)
  editable: boolean;                  // Whether editing is enabled
}
```

**State Management**:
- Uses `useEditorBridge` from TenTap to create the editor instance
- Bridge extensions: `TenTapStartKit` (includes Bold, Italic, Heading, BulletList, OrderedList, Code, CodeBlock, Blockquote, HorizontalRule, Link, Image, TaskList, Strikethrough, Underline)
- Custom CSS injected via `CoreBridge.configureCSS()` for theming and font settings

**Key Behavior**:
- Initializes editor with markdown content converted to HTML
- Listens for content changes via the bridge and converts HTML back to markdown for the `onChange` callback
- Applies theme-specific CSS (light or dark) to the WebView content
- Applies font family and font size as CSS variables in the WebView
- Supports all GFM extensions: tables, task lists (checkboxes), strikethrough

**Mobile-Specific Considerations**:
- Sets `avoidIosKeyboard: true` in editor bridge config (Android handles this differently)
- WebView must have `scrollEnabled: true` for long documents
- Touch targets for inline formatting (e.g., toggling a checkbox) must be at least 44x44 points
- Custom CSS ensures table cells have adequate padding for finger tapping

### 5.3 EditorToolbar (`src/components/Editor/EditorToolbar.tsx`)

Formatting toolbar providing quick access to Markdown formatting commands.

```typescript
interface EditorToolbarProps {
  editor: EditorBridge;               // TenTap editor bridge instance
}
```

**Button Layout** (horizontally scrollable):

```
| B | I | S | H1 | H2 | H3 | " | <> | - | [] | -- | link | img | undo | redo |
```

| Icon | Action | TenTap Command |
|------|--------|----------------|
| **B** | Bold | `editor.toggleBold()` |
| *I* | Italic | `editor.toggleItalic()` |
| ~~S~~ | Strikethrough | `editor.toggleStrike()` |
| H1 | Heading 1 | `editor.toggleHeading(1)` |
| H2 | Heading 2 | `editor.toggleHeading(2)` |
| H3 | Heading 3 | `editor.toggleHeading(3)` |
| " | Blockquote | `editor.toggleBlockquote()` |
| <> | Code | `editor.toggleCode()` |
| - | Bullet List | `editor.toggleBulletList()` |
| [] | Task List | `editor.toggleTaskList()` |
| -- | Horizontal Rule | `editor.setHorizontalRule()` |
| link | Insert Link | `editor.setLink()` |
| img | Insert Image | Custom bridge |
| undo | Undo | `editor.undo()` |
| redo | Redo | `editor.redo()` |

**State Management**:
- Uses `useBridgeState(editor)` to track active formatting states (e.g., `isBoldActive`, `isItalicActive`)
- Active states are reflected visually with highlighted button backgrounds

**Mobile-Specific Considerations**:
- Toolbar is placed at the bottom of the screen, directly above the keyboard
- Wrapped in `KeyboardAvoidingView` with `behavior="height"` on Android
- Horizontal `ScrollView` allows access to all buttons on narrow screens
- Each button has a minimum touch target of 44x44 points
- Active state uses a distinct background color and icon tint

### 5.4 FileBrowserDrawer (`src/components/FileTree/FileBrowserDrawer.tsx`)

The drawer content that provides file system navigation.

```typescript
interface FileBrowserDrawerProps {
  navigation: DrawerNavigationProp;   // Drawer navigation object
}
```

```
+----------------------------------+
|  [<] Markdown Viewer Mobile      |
+----------------------------------+
|  [folder icon] Open Folder       |
+----------------------------------+
|                                  |
|  v Documents/                    |
|    v notes/                      |
|      [doc] README.md             |
|      [doc] guide.md             |
|      [doc] changelog.md          |
|    > archive/                    |
|    [doc] index.md                |
|                                  |
|                                  |
|  Recent Folders                  |
|  /storage/.../Documents          |
|  /storage/.../Projects           |
+----------------------------------+
```

**State Management**:
- Reads `openedFolderPath` and `treeData` from `fileTreeStore`
- Dispatches `setOpenedFolderPath`, `setTreeData` actions
- Uses `useFileOperations` hook for reading file content

**Key Behavior**:
- "Open Folder" button triggers `StorageAccessFramework.requestDirectoryPermissionsAsync()`
- Upon receiving a directory URI, recursively reads the directory and populates the tree
- Tapping a `.md` file reads its content and opens it in a new tab (or activates existing tab)
- Tapping a folder expands/collapses its children
- Drawer can be opened via swipe gesture from the left edge or hamburger button
- Shows "Recent Folders" section at bottom for quick access to previously opened directories

**Mobile-Specific Considerations**:
- Drawer width is 85% of screen width (max 360dp) for comfortable touch interaction
- File/folder rows have a minimum height of 48dp with adequate left indentation per depth level
- Swipe-from-edge gesture opens the drawer (handled by react-native-gesture-handler)
- Long-press on a file could show a context menu (Phase 2)

### 5.5 FileTreeList (`src/components/FileTree/FileTreeList.tsx`)

Recursive list component for displaying the file/folder hierarchy.

```typescript
interface FileTreeListProps {
  nodes: TreeNode[];                  // Array of file/folder nodes
  depth: number;                      // Current nesting depth (for indentation)
  onFilePress: (node: TreeNode) => void; // Callback when a file is tapped
}
```

**State Management**:
- Local state: `expandedFolders: Set<string>` tracks which folders are expanded
- Toggle folder expansion on tap

**Key Behavior**:
- Renders a `FlatList` (or `SectionList`) for virtualized performance with large directory trees
- Each item is a `FileTreeItem` showing an icon (folder/document), name, and expand indicator
- Folders show a chevron (right when collapsed, down when expanded)
- Files show a document icon with `.md` badge
- Items are indented by `depth * 16dp` from the left edge

**Mobile-Specific Considerations**:
- Uses `FlatList` for virtualization (important for directories with hundreds of files)
- `getItemLayout` is provided for consistent row heights (48dp) to enable smooth scrolling
- Ripple effect (`android_ripple`) on each row for native Android touch feedback

### 5.6 TabBar (`src/components/TabBar/TabBar.tsx`)

Horizontal scrollable tab container for managing open files.

```typescript
// No external props - reads entirely from tabStore
```

**Layout**:

```
+----------------------------------------------------------+
| [=] | Tab1.md | Tab2.md* | Tab3.md |        [+] [gear]  |
+----------------------------------------------------------+
```

**State Management**:
- Reads `tabs`, `activeTabId` from `tabStore`
- Dispatches `setActiveTab`, `closeTab` actions

**Key Behavior**:
- Renders tabs in a horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`
- Active tab is visually distinguished with a bottom border accent and different background
- Each tab shows the file name and a close button (X)
- Dirty indicator: a dot before the filename for unsaved changes
- Tapping a tab activates it; tapping the X closes it
- When the active tab is closed, the adjacent tab becomes active
- Auto-scrolls to bring the active tab into view using `scrollTo`
- The hamburger icon (=) at the far left opens the drawer
- The gear icon at the far right opens settings

**Mobile-Specific Considerations**:
- Tab minimum width is 100dp; maximum is 200dp
- Close button touch target is 36x36dp (visible icon is smaller)
- No drag-and-drop reordering (complex gesture conflicts with scroll; deferred to Phase 3)
- Long-press on a tab shows a context menu: "Close", "Close Others", "Close All"

### 5.7 EditorStatusBar (`src/components/StatusBar/EditorStatusBar.tsx`)

Slim footer bar showing metadata about the currently active file.

```typescript
// No external props - reads from tabStore
```

**Layout**:

```
+----------------------------------------------------------+
| /Documents/notes/README.md    |  UTF-8  |  1,234 chars   |
+----------------------------------------------------------+
```

**State Management**:
- Reads `activeTab` from `tabStore` (via `getActiveTab()`)

**Key Behavior**:
- Displays the file path (truncated from the left if too long)
- Shows encoding (always UTF-8 for this version)
- Shows character count of the current content
- Hidden when no file is open

**Mobile-Specific Considerations**:
- Height is 28dp (compact) to maximize editor space
- Font size is 11sp for readability without consuming space
- File path uses `numberOfLines={1}` with `ellipsizeMode="head"` to truncate from the left

### 5.8 SettingsScreen (`app/(drawer)/settings.tsx`)

Full-screen settings view, presented modally.

```typescript
// Route component - no external props
```

**Layout**:

```
+----------------------------------+
|  [<] Settings                    |
+----------------------------------+
|                                  |
|  APPEARANCE                      |
|  +----------------------------+  |
|  | Theme                      |  |
|  | [Light] [Dark] [System]    |  |
|  +----------------------------+  |
|                                  |
|  TYPOGRAPHY                      |
|  +----------------------------+  |
|  | Font Family                |  |
|  | [v] System Default         |  |
|  +----------------------------+  |
|  | Font Size                  |  |
|  | [-] 16px [+]               |  |
|  +----------------------------+  |
|                                  |
|  PREVIEW                         |
|  +----------------------------+  |
|  | The quick brown fox jumps  |  |
|  | over the lazy dog.         |  |
|  +----------------------------+  |
|                                  |
|  ABOUT                           |
|  +----------------------------+  |
|  | Version     1.0.0          |  |
|  | License     MIT            |  |
|  +----------------------------+  |
+----------------------------------+
```

**State Management**:
- Reads and writes `theme`, `fontFamily`, `fontSize` from `appStore`
- All changes are applied immediately (no "Save" button needed)
- Zustand persist middleware saves settings to AsyncStorage automatically

**Font Options** (mapped from desktop version):

| Label | Value (React Native fontFamily) |
|-------|---------------------------------|
| System Default | `undefined` (uses platform default) |
| Noto Sans | `"NotoSans"` (bundled or system) |
| Roboto | `"Roboto"` (Android system font) |
| Serif | `"serif"` (platform serif) |
| Monospace | `"monospace"` (platform mono) |
| Noto Sans JP | `"NotoSansJP"` (bundled, Japanese) |
| Roboto Slab | `"RobotoSlab"` (bundled or Google Fonts) |

**Font Size Range**: 10px to 32px, adjustable in 1px increments with +/- buttons or a slider.

**Mobile-Specific Considerations**:
- Uses `ScrollView` for the settings body to handle small screens
- Theme toggle uses large, tappable buttons (not a small toggle switch)
- Font family picker uses a `Picker` component or custom modal list
- Font size control uses `Pressable` +/- buttons with a numeric display
- Preview text updates in real-time as settings change

---

## 6. State Management

All state management uses Zustand, matching the desktop application's pattern. The `persist` middleware with AsyncStorage replaces the desktop's `localStorage` persistence.

### 6.1 Store Architecture

```
+------------------+     +------------------+     +------------------+
|   appStore       |     |   tabStore       |     | fileTreeStore    |
|                  |     |                  |     |                  |
| - theme          |     | - tabs[]         |     | - openedFolder   |
| - fontFamily     |     | - activeTabId    |     |   Path           |
| - fontSize       |     |                  |     |   (SAF URI)      |
| - recentFolders  |     | + openTab()      |     | - treeData[]     |
|                  |     | + closeTab()     |     | - selectedFile   |
| + toggleTheme()  |     | + setActiveTab() |     |                  |
| + setFont*()     |     | + updateContent()|     | + setTreeData()  |
| + addRecent()    |     | + markDirty()    |     | + setSelected()  |
|                  |     | + markClean()    |     | + reset()        |
| [persisted]      |     | + reorderTabs()  |     |                  |
+------------------+     +------------------+     +------------------+

+------------------+
|  editorStore     |
|                  |
| - scrollPos{}    |
|                  |
| + setScroll()    |
| + getScroll()    |
+------------------+
```

### 6.2 appStore

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  // State
  theme: Theme;
  fontFamily: string;
  fontSize: number;
  recentFolders: Array<{ uri: string; name: string }>;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  addRecentFolder: (uri: string, name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontFamily: '',  // empty = system default
      fontSize: 16,
      recentFolders: [],

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setFontFamily: (font) => set({ fontFamily: font }),
      setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(32, size)) }),
      addRecentFolder: (uri, name) =>
        set((state) => {
          const filtered = state.recentFolders.filter((f) => f.uri !== uri);
          return {
            recentFolders: [{ uri, name }, ...filtered].slice(0, 10),
          };
        }),
    }),
    {
      name: 'markdown-viewer-mobile-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 6.3 tabStore

```typescript
import { create } from 'zustand';
import type { TabData } from '../types/TabData';

interface TabState {
  tabs: TabData[];
  activeTabId: string | null;

  openTab: (tab: TabData) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabDirty: (tabId: string) => void;
  markTabClean: (tabId: string) => void;
  reorderTabs: (fromId: string, toId: string) => void;
  getActiveTab: () => TabData | undefined;
  hasUnsavedChanges: () => boolean;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (tab) =>
    set((state) => {
      const existing = state.tabs.find((t) => t.id === tab.id);
      if (existing) {
        return { activeTabId: tab.id };
      }
      return { tabs: [...state.tabs, tab], activeTabId: tab.id };
    }),

  closeTab: (tabId) =>
    set((state) => {
      const index = state.tabs.findIndex((t) => t.id === tabId);
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        if (newTabs.length > 0) {
          const newIndex = Math.min(index, newTabs.length - 1);
          newActiveId = newTabs[newIndex].id;
        } else {
          newActiveId = null;
        }
      }
      return { tabs: newTabs, activeTabId: newActiveId };
    }),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateTabContent: (tabId, content) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, content } : t)),
    })),

  markTabDirty: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty: true } : t)),
    })),

  markTabClean: (tabId) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)),
    })),

  reorderTabs: (fromId, toId) =>
    set((state) => {
      const tabs = [...state.tabs];
      const fromIndex = tabs.findIndex((t) => t.id === fromId);
      const toIndex = tabs.findIndex((t) => t.id === toId);
      if (fromIndex === -1 || toIndex === -1) return state;
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    }),

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId);
  },

  hasUnsavedChanges: () => {
    const state = get();
    return state.tabs.some((t) => t.isDirty);
  },
}));
```

### 6.4 fileTreeStore

```typescript
import { create } from 'zustand';
import type { TreeNode } from '../types/FileNode';

interface FileTreeState {
  openedFolderUri: string | null;    // SAF URI (not file path)
  openedFolderName: string | null;
  treeData: TreeNode[];
  selectedFileUri: string | null;

  setOpenedFolder: (uri: string | null, name: string | null) => void;
  setTreeData: (data: TreeNode[]) => void;
  setSelectedFile: (uri: string | null) => void;
  reset: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set) => ({
  openedFolderUri: null,
  openedFolderName: null,
  treeData: [],
  selectedFileUri: null,

  setOpenedFolder: (uri, name) =>
    set({ openedFolderUri: uri, openedFolderName: name }),
  setTreeData: (data) => set({ treeData: data }),
  setSelectedFile: (uri) => set({ selectedFileUri: uri }),
  reset: () =>
    set({
      openedFolderUri: null,
      openedFolderName: null,
      treeData: [],
      selectedFileUri: null,
    }),
}));
```

### 6.5 editorStore

```typescript
import { create } from 'zustand';

interface EditorState {
  scrollPositions: Record<string, number>;

  setScrollPosition: (fileUri: string, position: number) => void;
  getScrollPosition: (fileUri: string) => number;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  scrollPositions: {},

  setScrollPosition: (fileUri, position) =>
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [fileUri]: position },
    })),

  getScrollPosition: (fileUri) => get().scrollPositions[fileUri] ?? 0,
}));
```

---

## 7. Type Definitions

### 7.1 FileNode (`src/types/FileNode.ts`)

```typescript
/**
 * Represents a node in the file tree.
 * Uses SAF URIs instead of file system paths.
 */
export interface TreeNode {
  /** Unique identifier (SAF URI) */
  id: string;
  /** Display name (file or folder name) */
  name: string;
  /** Full SAF URI */
  uri: string;
  /** Whether this node is a folder */
  isFolder: boolean;
  /** Child nodes (for folders) */
  children?: TreeNode[];
  /** MIME type (for files) */
  mimeType?: string;
  /** File size in bytes (for files) */
  size?: number;
  /** Last modified timestamp (for files) */
  lastModified?: number;
}
```

### 7.2 TabData (`src/types/TabData.ts`)

```typescript
/**
 * Data structure for an open editor tab.
 */
export interface TabData {
  /** Unique identifier (SAF URI of the file) */
  id: string;
  /** Display name (file name) */
  name: string;
  /** SAF URI for file operations */
  uri: string;
  /** Current Markdown content */
  content: string;
  /** Whether the tab has unsaved changes */
  isDirty: boolean;
}
```

### 7.3 AppSettings (`src/types/AppSettings.ts`)

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  fontFamily: string;
  fontSize: number;
  recentFolders: RecentFolder[];
}

export interface RecentFolder {
  uri: string;
  name: string;
}
```

---

## 8. Services

### 8.1 fileSystemService (`src/services/fileSystemService.ts`)

Abstraction layer over `expo-file-system` and `StorageAccessFramework`.

```typescript
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import type { TreeNode } from '../types/FileNode';

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mkdn'];

export const fileSystemService = {
  /**
   * Request directory access via SAF.
   * Returns the granted directory URI or null if cancelled.
   */
  async requestDirectoryAccess(): Promise<string | null> {
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return null;
    return permissions.directoryUri;
  },

  /**
   * Read a directory recursively and build a tree of TreeNode.
   * Filters for Markdown files and folders only.
   * Excludes hidden files/folders (starting with ".").
   */
  async readDirectoryRecursive(
    dirUri: string,
    depth: number = 0,
    maxDepth: number = 10
  ): Promise<TreeNode[]> {
    if (depth >= maxDepth) return [];

    const entries = await StorageAccessFramework.readDirectoryAsync(dirUri);
    const nodes: TreeNode[] = [];

    for (const entryUri of entries) {
      const name = decodeURIComponent(
        entryUri.split('%2F').pop() || entryUri.split('/').pop() || ''
      );

      // Skip hidden files/folders
      if (name.startsWith('.')) continue;

      const isFolder = !name.includes('.'); // Heuristic; refine with stat

      if (isFolder) {
        const children = await this.readDirectoryRecursive(
          entryUri, depth + 1, maxDepth
        );
        // Only include folders that contain markdown files (directly or nested)
        if (children.length > 0) {
          nodes.push({
            id: entryUri,
            name,
            uri: entryUri,
            isFolder: true,
            children,
          });
        }
      } else {
        const ext = '.' + name.split('.').pop()?.toLowerCase();
        if (MARKDOWN_EXTENSIONS.includes(ext)) {
          nodes.push({
            id: entryUri,
            name,
            uri: entryUri,
            isFolder: false,
            mimeType: 'text/markdown',
          });
        }
      }
    }

    // Sort: folders first (alphabetical), then files (alphabetical)
    return nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Read file content as UTF-8 string.
   */
  async readFileContent(uri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  },

  /**
   * Write content to a file via SAF.
   */
  async writeFileContent(uri: string, content: string): Promise<void> {
    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  },

  /**
   * Extract a human-readable folder name from a SAF URI.
   */
  extractFolderName(uri: string): string {
    const decoded = decodeURIComponent(uri);
    const parts = decoded.split('/');
    return parts[parts.length - 1] || 'Documents';
  },
};
```

### 8.2 markdownService (`src/services/markdownService.ts`)

Helpers for Markdown processing. TenTap works with HTML internally, so we need conversion utilities.

```typescript
/**
 * Note: TenTap's bridge handles Markdown <-> HTML conversion internally
 * when using the appropriate extensions. These utilities are for
 * edge cases and external operations (export, share).
 */
export const markdownService = {
  /**
   * Count characters in a Markdown string (excluding front matter).
   */
  countCharacters(markdown: string): number {
    return markdown.length;
  },

  /**
   * Count words in a Markdown string.
   */
  countWords(markdown: string): number {
    const text = markdown
      .replace(/```[\s\S]*?```/g, '')   // Remove code blocks
      .replace(/`[^`]*`/g, '')          // Remove inline code
      .replace(/[#*_~\[\]()>|-]/g, ''); // Remove Markdown syntax
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    return words.length;
  },

  /**
   * Extract the first heading from Markdown content.
   */
  extractTitle(markdown: string): string | null {
    const match = markdown.match(/^#{1,6}\s+(.+)$/m);
    return match ? match[1].trim() : null;
  },
};
```

---

## 9. Theme System

### 9.1 Color Palette (`src/themes/colors.ts`)

```typescript
export const lightColors = {
  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#f6f8fa',
  bgTertiary: '#eaeef2',

  // Text
  textPrimary: '#1f2328',
  textSecondary: '#656d76',
  textTertiary: '#8b949e',

  // Borders
  borderColor: '#d0d7de',
  borderLight: '#e1e4e8',

  // Accent
  accentColor: '#0969da',
  accentLight: 'rgba(9, 105, 218, 0.15)',

  // Status bar
  statusBarBg: '#0969da',
  statusBarText: '#ffffff',

  // Tab bar
  tabBarBg: '#f6f8fa',
  tabActiveBg: '#ffffff',
  tabHoverBg: 'rgba(208, 215, 222, 0.32)',

  // Sidebar / Drawer
  drawerBg: '#f6f8fa',
  drawerBorder: '#d0d7de',

  // Editor
  editorBg: '#ffffff',

  // Misc
  dangerColor: '#cf222e',
  successColor: '#1a7f37',
};

export const darkColors = {
  bgPrimary: '#0d1117',
  bgSecondary: '#161b22',
  bgTertiary: '#21262d',

  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textTertiary: '#656d76',

  borderColor: '#30363d',
  borderLight: '#21262d',

  accentColor: '#58a6ff',
  accentLight: 'rgba(56, 139, 253, 0.15)',

  statusBarBg: '#1f6feb',
  statusBarText: '#ffffff',

  tabBarBg: '#161b22',
  tabActiveBg: '#0d1117',
  tabHoverBg: 'rgba(177, 186, 196, 0.12)',

  drawerBg: '#161b22',
  drawerBorder: '#30363d',

  editorBg: '#0d1117',

  dangerColor: '#f85149',
  successColor: '#3fb950',
};

export type ColorPalette = typeof lightColors;
```

### 9.2 Editor CSS Themes (`src/themes/editorThemes.ts`)

CSS strings injected into the TenTap WebView via `CoreBridge.configureCSS()`.

```typescript
export const lightEditorCSS = `
  * {
    background-color: #ffffff;
    color: #1f2328;
    font-family: var(--editor-font-family, -apple-system, BlinkMacSystemFont,
      'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif);
    font-size: var(--editor-font-size, 16px);
  }

  h1, h2, h3, h4, h5, h6 {
    color: #1f2328;
    border-bottom: 1px solid #d0d7de;
    padding-bottom: 0.3em;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  a { color: #0969da; }

  blockquote {
    border-left: 3px solid #d0d7de;
    padding-left: 1rem;
    color: #656d76;
  }

  code {
    background-color: #f6f8fa;
    color: #1f2328;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono',
      Menlo, monospace;
    font-size: 0.9em;
  }

  pre code {
    display: block;
    padding: 16px;
    overflow-x: auto;
    line-height: 1.45;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    border: 1px solid #d0d7de;
    padding: 8px 12px;
    min-width: 60px;
  }

  th {
    background-color: #f6f8fa;
    font-weight: 600;
  }

  .ProseMirror {
    padding: 16px;
    min-height: 100vh;
    outline: none;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #656d76;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
  }

  ul[data-type="taskList"] li input[type="checkbox"] {
    margin-right: 8px;
    margin-top: 4px;
    width: 18px;
    height: 18px;
  }

  hr {
    border: none;
    border-top: 2px solid #d0d7de;
    margin: 1.5em 0;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

export const darkEditorCSS = `
  * {
    background-color: #0d1117;
    color: #e6edf3;
    font-family: var(--editor-font-family, -apple-system, BlinkMacSystemFont,
      'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif);
    font-size: var(--editor-font-size, 16px);
  }

  h1, h2, h3, h4, h5, h6 {
    color: #e6edf3;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.3em;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  a { color: #58a6ff; }

  blockquote {
    border-left: 3px solid #30363d;
    padding-left: 1rem;
    color: #8b949e;
  }

  code {
    background-color: #161b22;
    color: #e6edf3;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono',
      Menlo, monospace;
    font-size: 0.9em;
  }

  pre code {
    display: block;
    padding: 16px;
    overflow-x: auto;
    line-height: 1.45;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    border: 1px solid #30363d;
    padding: 8px 12px;
    min-width: 60px;
  }

  th {
    background-color: #161b22;
    font-weight: 600;
  }

  .ProseMirror {
    padding: 16px;
    min-height: 100vh;
    outline: none;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #484f58;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
  }

  ul[data-type="taskList"] li input[type="checkbox"] {
    margin-right: 8px;
    margin-top: 4px;
    width: 18px;
    height: 18px;
  }

  hr {
    border: none;
    border-top: 2px solid #30363d;
    margin: 1.5em 0;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;
```

### 9.3 ThemeContext (`src/themes/ThemeContext.tsx`)

```typescript
import { createContext, useContext } from 'react';
import type { ColorPalette } from './colors';

interface ThemeContextValue {
  colors: ColorPalette;
  isDark: boolean;
  editorCSS: string;
  editorTheme: object;  // TenTap native theme object
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
```

### 9.4 Theme Application Strategy

The theme is applied at multiple levels:

1. **React Native views**: Via `ThemeContext` providing a `colors` object used in `StyleSheet.create()` or inline styles.
2. **System status bar**: Via `expo-status-bar`'s `<StatusBar style="light" />` or `"dark"`.
3. **TenTap editor (WebView)**: Via `CoreBridge.configureCSS()` injecting the appropriate CSS string, and via the `theme` prop on `useEditorBridge()` for native toolbar styling.
4. **Drawer**: Via `drawerStyle` and `drawerContentStyle` props on the Drawer navigator.

When the theme changes:
- `appStore.theme` is updated
- `ThemeProvider` re-renders with new colors
- The TenTap editor is re-initialized with the new CSS (via `key` prop change or bridge message)

---

## 10. Feature List

### 10.1 Phase 1 (MVP)

Core features required for a usable Markdown viewer and editor.

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Open single file | Use `expo-document-picker` to select and open a `.md` file | Must |
| 2 | WYSIWYG rendering | Render Markdown in WYSIWYG format via TenTap editor | Must |
| 3 | In-place editing | Edit Markdown directly in the rendered WYSIWYG view | Must |
| 4 | Save file | Save edited content back to the original file location | Must |
| 5 | Formatting toolbar | Bottom toolbar with bold, italic, headings, lists, code, links | Must |
| 6 | GFM support | Tables, task lists (checkboxes), strikethrough | Must |
| 7 | Dark/Light theme | Theme toggle with system theme detection option | Must |
| 8 | Font size adjustment | Increase/decrease editor font size (10-32px) | Must |
| 9 | Status bar | Show file path, encoding, character count | Must |
| 10 | Empty state | Helpful UI when no file is open, with "Open File" button | Must |
| 11 | Android back button | Proper back navigation (close drawer, prompt save) | Must |

### 10.2 Phase 2 (Enhanced)

Features that bring the app closer to desktop parity and improve daily usability.

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 12 | Folder browsing | Open a folder via SAF, display file tree in drawer | High |
| 13 | Tab management | Open multiple files in tabs, switch between them | High |
| 14 | Font family selection | Choose from multiple font families (7 options) | High |
| 15 | Recent folders | Track and display recently opened folders | High |
| 16 | Search in file | Find text within the current document | High |
| 17 | Search and replace | Find and replace text in current document | Medium |
| 18 | Share/Export | Share Markdown content or export as text | Medium |
| 19 | Create new file | Create a new Markdown file in the current folder | Medium |
| 20 | Unsaved changes prompt | Warn before closing a tab or app with unsaved changes | Medium |
| 21 | Image preview | Display inline images referenced in Markdown | Medium |

### 10.3 Phase 3 (Advanced)

Power-user features and polish.

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 22 | File watching | Detect external changes to open files (polling-based) | Medium |
| 23 | Auto-save | Automatically save after a configurable idle period | Medium |
| 24 | Syntax highlighting | Code block syntax highlighting (via TenTap CodeBlock extension) | Medium |
| 25 | Tab reordering | Long-press drag to reorder tabs | Low |
| 26 | Math rendering | KaTeX rendering for LaTeX math blocks | Low |
| 27 | Split view (tablet) | Side-by-side source and preview on tablets | Low |
| 28 | Keyboard shortcuts | External keyboard shortcuts (Ctrl+S, Ctrl+B, etc.) | Low |
| 29 | Table of contents | Auto-generated heading outline in drawer or modal | Low |
| 30 | Mermaid diagrams | Render Mermaid diagram syntax | Low |

---

## 11. Mobile-Specific Considerations

### 11.1 Touch Interactions and Gestures

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | File tree item | Open file / toggle folder |
| Tap | Tab | Activate tab |
| Tap | Toolbar button | Apply formatting |
| Tap | Editor content | Position cursor / interact with checkbox |
| Long press | Tab | Show context menu (Close, Close Others) |
| Long press | File tree item | Show context menu (Phase 2) |
| Swipe right from left edge | Anywhere | Open file browser drawer |
| Swipe left on drawer | Drawer open | Close file browser drawer |
| Pinch to zoom | Editor (future) | Adjust font size temporarily |

### 11.2 Keyboard Handling

The soft keyboard is a critical interaction point on mobile:

```
+-----------------------------------------------+
|  [=] Tab1.md | Tab2.md*                        |
+-----------------------------------------------+
|                                               |
|  Content area (shrinks when keyboard opens)   |
|                                               |
+-----------------------------------------------+
| file.md | UTF-8 | 1,234 ch                    |
+-----------------------------------------------+
| [B] [I] [H1] [H2] ["] [<>] [-] [link]        |  <-- Toolbar
+-----------------------------------------------+
| q w e r t y u i o p                           |  <-- Soft keyboard
| a s d f g h j k l                             |
| z x c v b n m                                 |
| [123] [space] [return]                         |
+-----------------------------------------------+
```

**Implementation details**:
- Use `KeyboardAvoidingView` with `behavior="height"` on Android to resize the editor area when the keyboard appears
- The formatting toolbar is positioned directly above the keyboard using absolute positioning with keyboard height tracking
- `useKeyboardHeight` hook tracks keyboard visibility and height via `Keyboard.addListener('keyboardDidShow')` and `keyboardDidHide`
- The editor WebView adjusts its height when the keyboard appears to prevent content from being hidden
- When the keyboard is dismissed, the toolbar moves back to the bottom of the screen

### 11.3 Screen Size Adaptation

**Phone (< 600dp width)**:
- Drawer overlays the content (modal drawer)
- Tab bar scrolls horizontally, tabs have a compact width
- Settings screen is full-screen
- Toolbar uses small icons with horizontal scroll

**Tablet (>= 600dp width)** (Phase 3):
- Drawer can be permanently visible (side-by-side mode)
- Tab bar has more space, tabs can be wider
- Settings could be presented as a side panel
- Consider split view: file tree + editor side by side

```typescript
import { useWindowDimensions } from 'react-native';

function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= 600;
}
```

### 11.4 Permission Model (Android Storage)

Android's scoped storage model (introduced in Android 10, enforced from Android 11+) requires using SAF for accessing files outside the app's sandbox.

**Permission flow**:

```
User taps "Open Folder"
        |
        v
StorageAccessFramework.requestDirectoryPermissionsAsync()
        |
        v
Android system folder picker dialog
        |
        v
User selects a folder and grants access
        |
        v
App receives SAF URI with read/write permissions
        |
        v
App can read/write files within that folder tree
```

**Key considerations**:
- SAF URIs are content URIs (`content://`), not file paths (`/storage/`)
- Permissions persist across app restarts (via `takePersistableUriPermission`, handled by expo-file-system)
- The app cannot access arbitrary file paths; only URIs granted through SAF
- `expo-document-picker` uses the system document picker which also returns SAF URIs
- No `READ_EXTERNAL_STORAGE` or `WRITE_EXTERNAL_STORAGE` permissions needed in `AndroidManifest.xml` (SAF handles this)

### 11.5 Battery and Performance

**Performance optimizations**:
- File tree uses `FlatList` with virtualization (only renders visible items)
- Editor is a single WebView instance; avoid creating/destroying WebViews on tab switch (cache HTML content instead)
- Zustand selectors prevent unnecessary re-renders (`useAppStore((s) => s.theme)` instead of `useAppStore()`)
- Avoid re-initializing the TenTap editor on every tab switch; instead, update content via bridge methods
- Debounce `onChange` callbacks from the editor (300ms) to reduce state update frequency during rapid typing

**Battery considerations**:
- No background file watching by default (unlike desktop's chokidar); use polling only when app is in foreground (Phase 3)
- No network requests (fully offline app)
- WebView rendering is GPU-accelerated on Android

### 11.6 Offline Capability

The app is fully offline by design:
- No network requests for any core functionality
- All files are read from and written to local storage via SAF
- Settings are stored locally via AsyncStorage
- No cloud sync or remote API calls
- The editor and all its dependencies are bundled with the app

### 11.7 Android Back Button Handling

```
Back button pressed
        |
        v
Is the drawer open?
   |          |
  Yes         No
   |          |
   v          v
Close      Are there unsaved changes?
drawer        |              |
             Yes             No
              |              |
              v              v
  Show "Discard changes?"   Exit app
  dialog                   (or go back)
     |           |
   Save      Discard
     |           |
     v           v
  Save file   Exit app
  then exit
```

---

## 12. Security

### 12.1 File Access Scoping

- The app only accesses files through SAF URIs explicitly granted by the user
- No root access or broad file system permissions are requested
- `AndroidManifest.xml` does not include `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, or `MANAGE_EXTERNAL_STORAGE`
- File URIs are validated before any read/write operation

### 12.2 Network Security

- The app makes zero network requests
- No analytics, telemetry, or crash reporting services
- No third-party SDKs that phone home
- The WebView (TenTap editor) does not load any remote content
- CSP-equivalent: the WebView's `source` is set to local HTML only, with no external resource loading

### 12.3 Data Storage Security

- Settings (theme, font preferences) are stored via AsyncStorage (unencrypted, non-sensitive)
- No user credentials, tokens, or sensitive data are stored
- File content exists only in memory while a tab is open; it is not cached to disk
- Recent folder URIs are stored in AsyncStorage (these are opaque content URIs, not actual file paths)

### 12.4 WebView Security

```typescript
// TenTap WebView security settings
<WebView
  javaScriptEnabled={true}          // Required for editor
  domStorageEnabled={false}         // No localStorage needed
  allowFileAccess={false}           // No file:// access
  allowUniversalAccessFromFileURLs={false}
  mixedContentMode="never"          // No HTTP content
  originWhitelist={['about:blank']} // Restrict navigation
/>
```

### 12.5 Security Checklist

| # | Item | Status | Description |
|---|------|--------|-------------|
| 1 | No broad storage permissions | Required | Use SAF exclusively, no MANAGE_EXTERNAL_STORAGE |
| 2 | No network access | Required | Fully offline, no internet permission needed |
| 3 | SAF URI validation | Required | Validate URIs before read/write operations |
| 4 | WebView isolation | Required | No file:// access, no external URLs |
| 5 | No sensitive data storage | Required | No credentials or PII stored |
| 6 | No remote code execution | Required | All JavaScript is bundled with the app |
| 7 | Content URI scope check | Recommended | Verify URI is within granted directory tree |
| 8 | Input sanitization for editor | Recommended | TenTap/Tiptap sanitizes HTML by default |

---

## 13. Build and Release Process

### 13.1 Development

```bash
# Install dependencies
npm install

# Start development server (Expo Go or dev client)
npx expo start

# Run on Android emulator
npx expo run:android

# Run on physical device (USB or wireless)
npx expo start --dev-client
```

### 13.2 Build (EAS Build)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to Expo account
eas login

# Configure EAS (creates eas.json)
eas build:configure

# Development build (includes dev tools)
eas build --platform android --profile development

# Preview build (release mode, internal distribution)
eas build --platform android --profile preview

# Production build (for Google Play)
eas build --platform android --profile production
```

**eas.json configuration**:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 13.3 Testing

| Level | Tool | Scope |
|-------|------|-------|
| Unit Tests | Jest + React Native Testing Library | Stores, services, utility functions |
| Component Tests | React Native Testing Library | Individual component rendering and interaction |
| Integration Tests | Detox or Maestro | Full user flows (open file, edit, save) |
| Manual Testing | Physical Android device | Touch interactions, keyboard, performance |

### 13.4 Google Play Store Release

**Prerequisites**:

1. **Google Play Developer Account**: $25 one-time registration fee
2. **Closed Testing Requirement** (for new personal developer accounts as of Nov 2023):
   - Must set up a closed testing track with at least 12 testers
   - Testers must opt in and be active for at least 14 consecutive days
   - After 14 days, you can request production access
3. **Privacy Policy**: Required for all apps, must be hosted at a public URL
4. **App Signing**: Google Play App Signing is mandatory for new apps (Google manages the signing key)
5. **Target API Level**: Must target the latest required API level (currently API 34 / Android 14 for new apps)

**Release steps**:

```
1. Create Google Play Developer account ($25)
2. Generate app signing key (or let Google manage it)
3. Create app listing in Google Play Console
   - App name, description, screenshots
   - Privacy policy URL
   - Content rating questionnaire
   - Target audience declaration
4. Build production AAB
   $ eas build --platform android --profile production
5. Upload AAB to internal testing track
6. Add 12+ testers, wait 14 days
7. Request production access
8. Submit for review
9. Publish to Google Play Store
```

**App listing requirements**:

| Asset | Specification |
|-------|---------------|
| App icon | 512x512 PNG |
| Feature graphic | 1024x500 PNG |
| Phone screenshots | Min 2, 16:9 or 9:16, 320-3840px |
| Tablet screenshots | Recommended, 16:9 or 9:16 |
| Short description | Max 80 characters |
| Full description | Max 4000 characters |
| Privacy policy | Public URL |

---

## 14. Implementation Phases

### Step 1: Project Scaffolding

**Goal**: Create the Expo project with TypeScript, configure all dependencies, and establish the project structure.

**Tasks**:
- Initialize project with `npx create-expo-app markdown-viewer-mobile --template blank-typescript`
- Install all production dependencies (see Section 3.2)
- Configure `app.json` with app name, slug, icon, splash screen, Android package name
- Set up `tsconfig.json` with strict mode
- Create the complete directory structure (see Section 4)
- Configure Expo Router in `app.json` (`"scheme": "markdown-viewer"`)
- Set up ESLint and Prettier
- Create `CLAUDE.md` with project conventions

**Completion Criteria**: `npx expo start` launches the app with a blank screen, project structure is in place, TypeScript compiles without errors.

### Step 2: Navigation and Layout

**Goal**: Implement the Drawer + Stack navigation structure with placeholder screens.

**Tasks**:
- Create `app/_layout.tsx` with root Stack
- Create `app/(drawer)/_layout.tsx` with Drawer navigator
- Create `app/(drawer)/(editor)/_layout.tsx` with Stack layout
- Create `app/(drawer)/(editor)/index.tsx` with placeholder EditorScreen
- Create `app/(drawer)/settings.tsx` with placeholder SettingsScreen
- Implement custom drawer content component (`FileBrowserDrawer`) with placeholder
- Configure drawer width, gesture handling, and swipe behavior
- Add hamburger button to open drawer
- Add gear icon to navigate to settings

**Completion Criteria**: Drawer opens/closes with swipe and button, navigation between editor and settings works, Android back button closes drawer.

### Step 3: Theme System

**Goal**: Implement light/dark theme switching with system theme detection.

**Tasks**:
- Create color palette definitions (`src/themes/colors.ts`)
- Create `ThemeContext` and `ThemeProvider`
- Implement `useColorScheme` integration for system theme detection
- Create `appStore` with theme state and persist middleware
- Apply theme to all navigation containers (drawer, stack)
- Apply theme to system status bar via `expo-status-bar`
- Create editor CSS strings for light and dark themes
- Create the `SettingsScreen` with working theme toggle

**Completion Criteria**: Toggling theme changes all UI colors, system theme preference is detected, theme choice persists across app restarts.

### Step 4: File Operations (Single File)

**Goal**: Open a single Markdown file from device storage and display its content.

**Tasks**:
- Create `fileSystemService` with `readFileContent` and `writeFileContent`
- Create `useFileOperations` hook with `openFile` and `saveFile` functions
- Implement "Open File" using `expo-document-picker` with MIME filter for `text/markdown`
- Create `tabStore` with single-tab support (open, close, update content, dirty flag)
- Create `EmptyState` component with "Open File" button
- Wire up file content to a basic `Text` component (before editor integration)
- Implement save functionality (write content back to SAF URI)

**Completion Criteria**: User can pick a `.md` file, its content is displayed, and edits can be saved back.

### Step 5: TenTap Editor Integration

**Goal**: Replace the placeholder text display with the TenTap WYSIWYG editor.

**Tasks**:
- Install `@10play/tentap-editor` and `react-native-webview`
- Create `TenTapEditor` component with `useEditorBridge`
- Configure bridge extensions: `TenTapStartKit` for full GFM support
- Apply theme CSS via `CoreBridge.configureCSS()`
- Implement `onChange` callback to update tab content in store
- Create `EditorToolbar` with formatting buttons
- Wire up toolbar buttons to editor bridge commands (`toggleBold`, `toggleItalic`, etc.)
- Use `useBridgeState` to show active formatting state on toolbar buttons
- Handle `KeyboardAvoidingView` to keep toolbar above soft keyboard
- Implement font family and font size application via CSS variables

**Completion Criteria**: Markdown files render in WYSIWYG mode, all formatting buttons work, content changes are tracked, toolbar stays above keyboard.

### Step 6: Tab Management

**Goal**: Support opening multiple files in tabs.

**Tasks**:
- Extend `tabStore` to support multiple tabs
- Create `TabBar` component with horizontal `ScrollView`
- Create `Tab` component with active state, dirty indicator, and close button
- Implement tab switching (updates editor content via bridge)
- Handle tab close with unsaved changes prompt
- Auto-scroll tab bar to show active tab
- Implement long-press context menu on tabs (Close, Close Others, Close All)
- Implement `EditorStatusBar` showing file path, encoding, character count

**Completion Criteria**: Multiple files can be opened in tabs, switching tabs updates the editor, tabs show dirty state, close button and context menu work.

### Step 7: File Browser Drawer

**Goal**: Implement folder browsing via SAF in the drawer.

**Tasks**:
- Create `fileSystemService.requestDirectoryAccess` using SAF
- Create `fileSystemService.readDirectoryRecursive` for tree building
- Create `fileTreeStore` with folder URI, tree data, and selected file
- Create `DrawerHeader` with folder name and "Open Folder" button
- Create `FileTreeList` with recursive rendering using `FlatList`
- Create `FileTreeItem` with folder/file icons, expand/collapse, indentation
- Wire file tap to open file in editor tab
- Wire folder tap to expand/collapse children
- Add to `appStore`: recent folders tracking
- Show recent folders in drawer when no folder is open

**Completion Criteria**: User can open a folder, navigate the file tree, tap files to open them in tabs, folders expand/collapse correctly.

### Step 8: Settings Screen

**Goal**: Complete the settings screen with all customization options.

**Tasks**:
- Implement `ThemeSelector` with Light/Dark/System options
- Implement `FontFamilyPicker` with 7 font options
- Implement `FontSizeControl` with +/- buttons and numeric display (10-32px range)
- Implement live preview of font settings
- Ensure all settings persist via Zustand + AsyncStorage
- Apply font settings to the TenTap editor CSS in real-time
- Add "About" section with version, license info

**Completion Criteria**: All settings options work, changes apply immediately to the editor, settings persist across app restarts.

### Step 9: Polish and Edge Cases

**Goal**: Handle edge cases, improve error handling, and polish the UI.

**Tasks**:
- Handle empty files gracefully
- Handle very large files (show warning for files > 1MB)
- Handle binary files (reject with error message)
- Handle files with unsupported encodings
- Implement error boundaries for crash recovery
- Add loading states (file reading, directory scanning)
- Add toast notifications for save success/failure
- Polish animations (drawer open/close, tab switch)
- Handle screen rotation gracefully
- Test on multiple Android versions (11, 12, 13, 14)
- Test on multiple screen sizes (small phone, large phone, tablet)
- Optimize FlatList performance for large directories
- Debounce editor onChange for performance

**Completion Criteria**: App handles all edge cases gracefully, no crashes on unexpected input, loading states are visible, notifications provide user feedback.

### Step 10: Build, Test, and Release Preparation

**Goal**: Prepare the app for Google Play Store release.

**Tasks**:
- Create app icon (1024x1024) and adaptive icon
- Create splash screen image
- Configure `app.json` with final metadata (version, package name, permissions)
- Set up EAS Build profiles (development, preview, production)
- Build production AAB
- Create Google Play Developer account
- Prepare store listing (title, description, screenshots, feature graphic)
- Write and host privacy policy
- Complete content rating questionnaire
- Upload to internal testing track
- Recruit 12+ testers for closed testing
- Monitor for 14 days of testing activity
- Fix any issues found during testing
- Request production access and submit for review

**Completion Criteria**: App is published on Google Play Store (or submitted for review), all store listing requirements are met.

### Implementation Timeline

```
Step 1  ####................  Project Scaffolding
Step 2  ....####............  Navigation + Layout
Step 3  ........###.........  Theme System
Step 4  ...........####.....  File Operations (Single File)
Step 5  ...............#####  TenTap Editor Integration
Step 6  ........########....  Tab Management
Step 7  ............######..  File Browser Drawer
Step 8  ................###.  Settings Screen
Step 9  .................###  Polish + Edge Cases
Step 10 ....................# Build + Release

Weeks:  1  2  3  4  5  6  7  8
```

Steps 1-5 are strictly sequential (each depends on the previous). Steps 6-7 can be partially parallelized with Step 5 (tab UI can be built while editor integration is finalized). Steps 8-9 can overlap. Step 10 begins after all features are stable.

Estimated total timeline: 6-8 weeks for a solo developer working part-time.

---

## 15. Key Technical Decisions and Trade-offs

### 15.1 TenTap vs. Milkdown

**Decision**: Use TenTap (@10play/tentap-editor) instead of Milkdown.

**Rationale**: Milkdown is a web-only library with no React Native bindings. While it could theoretically run in a raw WebView, it would lack native keyboard integration, native toolbar rendering, and the bridge layer that TenTap provides. TenTap is purpose-built for React Native with Tiptap (also ProseMirror-based), providing native toolbar components, keyboard management, and a typed bridge for bidirectional communication between React Native and the WebView editor.

**Trade-off**: Milkdown uses Remark/Unified for Markdown parsing (identical AST as the desktop version), while TenTap uses Tiptap's built-in Markdown extension. This means Markdown round-trip behavior may differ slightly between desktop and mobile (e.g., whitespace handling, list formatting). However, both produce valid, readable Markdown.

### 15.2 SAF vs. Direct File Access

**Decision**: Use Storage Access Framework (SAF) exclusively.

**Rationale**: Android 11+ enforces scoped storage, making direct file path access unreliable. SAF provides a future-proof, permission-model-compliant approach that works across all Android versions from 5.0+. It also avoids the need for dangerous permissions (`MANAGE_EXTERNAL_STORAGE`) that would trigger additional Google Play review scrutiny.

**Trade-off**: SAF URIs are opaque content URIs, making file path display less intuitive (e.g., `content://com.android.externalstorage.documents/tree/primary%3ADocuments`). The service layer must decode these URIs into human-readable names. SAF also has performance overhead compared to direct file access, particularly for recursive directory reads.

### 15.3 Expo Managed Workflow vs. Bare Workflow

**Decision**: Use Expo managed workflow with EAS Build.

**Rationale**: The managed workflow provides a streamlined development experience with zero native code management, automatic dependency compatibility, OTA update capability, and EAS Build for CI/CD. All required native modules (file system, document picker, WebView) are available as Expo-compatible packages.

**Trade-off**: Some advanced native customizations may require ejecting to bare workflow in the future. However, Expo's Config Plugins system can handle most native configuration needs without ejecting.

### 15.4 No File Watching (MVP)

**Decision**: Defer file watching to Phase 3, use manual refresh.

**Rationale**: Unlike the desktop version which uses chokidar for real-time file watching, Android does not provide an efficient file system watching API for arbitrary directories accessed via SAF. Implementing file watching would require polling (reading directory listings periodically), which has battery and performance implications on mobile.

**Trade-off**: If a user edits a file externally and then switches back to the app, they will not see the updated content automatically. A "Refresh" action can be added to manually reload the file tree and open file content.

### 15.5 No Tab Drag-and-Drop (MVP)

**Decision**: Defer tab drag-and-drop reordering to Phase 3.

**Rationale**: Implementing drag-and-drop in a horizontal ScrollView on mobile is complex due to gesture conflicts (horizontal scroll vs. drag). The desktop version uses @dnd-kit which is web-only. React Native alternatives (react-native-draggable-flatlist) work best with vertical lists. Tab reordering is a convenience feature, not a core workflow.

**Trade-off**: Users cannot reorder tabs by dragging. Tabs appear in the order they were opened. This is acceptable for mobile where tab usage patterns differ from desktop.

---

## 16. File Naming and Code Conventions

Carried over from the desktop project with React Native adaptations:

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase, `.tsx` extension | `TabBar.tsx`, `FileTreeItem.tsx` |
| Stores | camelCase with `Store` suffix | `tabStore.ts`, `appStore.ts` |
| Hooks | camelCase with `use` prefix | `useFileOperations.ts`, `useTheme.ts` |
| Services | camelCase with `Service` suffix | `fileSystemService.ts` |
| Types | PascalCase in `.ts` files | `FileNode.ts`, `TabData.ts` |
| Constants | camelCase or SCREAMING_SNAKE_CASE | `fileTypes.ts`, `MARKDOWN_EXTENSIONS` |
| Theme files | camelCase | `colors.ts`, `editorThemes.ts` |
| Route files | lowercase with hyphens (Expo Router) | `index.tsx`, `settings.tsx` |

**Additional conventions**:
- Use functional components with hooks exclusively (no class components)
- Use `StyleSheet.create()` for static styles, inline styles only for dynamic values
- Use TypeScript strict mode
- Use async/await for all asynchronous operations
- Prefer named exports over default exports (except route components, which must use default)
- Co-locate component-specific types with the component file
- Use barrel exports (`index.ts`) for directories with multiple exports

---

## 17. Error Handling Strategy

### 17.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| File read error | Permission revoked, file deleted | Show toast with error message, close tab if file is gone |
| File write error | Storage full, permission revoked | Show alert with retry option, keep dirty state |
| Directory read error | SAF permission expired | Show toast, offer to re-request permission |
| Editor error | WebView crash | Show error boundary fallback, offer to reload editor |
| Navigation error | Invalid route | Redirect to home screen |

### 17.2 Error Boundary

```typescript
// Wrap the editor in an error boundary to catch WebView crashes
<ErrorBoundary
  fallback={
    <View style={styles.errorContainer}>
      <Text>The editor encountered an error.</Text>
      <Button title="Reload" onPress={handleReload} />
    </View>
  }
>
  <TenTapEditor {...props} />
</ErrorBoundary>
```

### 17.3 Toast Notifications

Non-blocking feedback for user actions:

| Action | Toast Message | Duration |
|--------|--------------|----------|
| File saved | "File saved successfully" | 2 seconds |
| Save failed | "Failed to save file: [reason]" | 4 seconds |
| File opened | (no toast, editor updates) | - |
| Permission denied | "Storage permission required" | 3 seconds |
| Large file warning | "File is large and may be slow to edit" | 3 seconds |

---

## 18. Accessibility

| Feature | Implementation |
|---------|---------------|
| Screen reader | All interactive elements have `accessibilityLabel` |
| Touch targets | Minimum 44x44dp for all tappable elements |
| Color contrast | WCAG AA compliance for text/background |
| Focus indicators | Visible focus ring on all interactive elements |
| Content descriptions | File tree items announce "Folder: [name]" or "File: [name]" |
| Toolbar buttons | Announce formatting state: "Bold, active" or "Bold, inactive" |
| Dynamic text | Respects Android system font size preferences |

---

This design document covers the complete architecture, component design, state management, theming, feature roadmap, mobile-specific considerations, security model, build process, and implementation plan for Markdown Viewer Mobile. It serves as the authoritative reference for the entire implementation and should be updated as decisions evolve during development.

---

### Critical Files for Implementation

- `/mnt/d/develop/markdown-viewer/DESIGN.md` - Reference: the desktop app's complete design document, which this mobile design mirrors in structure and ports in functionality
- `/mnt/d/develop/markdown-viewer/src/renderer/stores/appStore.ts` - Pattern to follow: Zustand store with persist middleware, font/theme state management, directly portable to mobile with AsyncStorage swap
- `/mnt/d/develop/markdown-viewer/src/renderer/stores/tabStore.ts` - Pattern to follow: Tab management logic (open, close, reorder, dirty tracking) reusable almost verbatim in the mobile version
- `/mnt/d/develop/markdown-viewer/src/shared/fileTypes.ts` - Interface to adapt: TreeNode type definition, needs modification to use SAF URIs instead of file paths
- `/mnt/d/develop/markdown-viewer/src/renderer/components/SettingsPanel/SettingsPanel.tsx` - Feature reference: font families, font sizes, theme toggle UI that must be adapted to React Native components