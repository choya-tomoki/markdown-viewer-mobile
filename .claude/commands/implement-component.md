---
description: Implement a specific component for the Markdown Viewer Mobile app
---

Implement the component specified by the user argument: $ARGUMENTS

Steps:
1. Read DESIGN.md to understand the component's requirements and specifications
2. Read CLAUDE.md for coding conventions
3. Check existing code to understand current project state
4. Implement the component following the design specifications:
   - Define a TypeScript props interface
   - Use functional component with hooks
   - Create styles using StyleSheet.create()
5. Handle mobile-specific concerns:
   - Touch interactions and gesture handling
   - Safe area insets where applicable
   - Keyboard avoidance if the component contains text inputs
   - Accessibility labels and roles
6. Connect to Zustand store if the component needs shared state management
7. Wire up navigation if the component triggers screen transitions
8. Integrate the component into the parent screen or component
9. Test that the application still builds and runs with `npx expo start`

Follow all conventions in CLAUDE.md. Use TypeScript strict mode. Ensure security rules are followed.
