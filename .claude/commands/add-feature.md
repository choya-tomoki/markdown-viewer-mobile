---
description: Add a new feature to the Markdown Viewer Mobile application
---

Add the feature specified by: $ARGUMENTS

Steps:
1. Read DESIGN.md to check if this feature is documented
2. Read CLAUDE.md for conventions and architecture guidance
3. Analyze the current codebase to understand where changes are needed
4. Plan the implementation considering mobile UX patterns:
   - Touch-friendly interactions and appropriate tap targets
   - Responsive layout across different screen sizes
   - Navigation flow and screen transitions
   - Performance implications on mobile devices
5. Implement the feature following React Native best practices
6. Ensure all security rules from CLAUDE.md are maintained
7. Test that the application builds with `npx expo start`
8. Verify TypeScript compilation with `npx tsc --noEmit`
9. Update any relevant documentation if needed
