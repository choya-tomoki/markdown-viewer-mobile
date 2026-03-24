---
description: Run tests and fix any failures for the mobile app
---

1. Run `npx tsc --noEmit` to verify TypeScript compilation
2. If there are type errors, analyze and fix them
3. Run `npm test` to execute the Jest test suite
4. If tests fail, analyze the failures
5. Fix the failing tests or the underlying code
6. Re-run tests to verify fixes
7. Run `npm run lint` to check for linting issues
8. Fix any linting issues found
9. Run `npx expo start` to verify the app builds and launches without errors
10. If an Android emulator is available, verify the app renders correctly on device
