# Wortlabor Modernization Plan

## Goal

The goal is to get the project back into a reproducible working state first, then modernize it in controlled increments without mixing environment recovery and framework migration.

## Current Status

- Stage 1 is complete: the legacy runtime was recovered on Node.js `12.22.12` with Yarn Classic `1.22.22`.
- Stage 2 is complete: Firebase configuration uses environment variables and `node-sass` has been replaced by `sass`.
- Stage 3 is complete: `react-scripts` was upgraded to `5.0.1`, TypeScript to `4.9.5`, and the project was re-baselined on Node.js `24.14.1`.
- Stage 4 is complete: React, MobX, React-DnD, matching type packages, and related runtime APIs were upgraded.
- Stage 5 is complete except for the intentionally skipped multiplayer smoke test: Firebase was upgraded to `12.12.0` and the Firestore wrapper now uses the modular SDK API.
- Stage 6 is partially complete: `firebase-tools` was upgraded to `15.14.0`, but a real hosting deploy and production Firestore rules are still pending.
- The next product step is to design the AI-player integration on top of the modernized runtime.

## Stage 1: Reproduce the legacy baseline

1. Pin the legacy runtime.
   Add a checked-in Node version file and document the expected package manager so everyone starts from the same baseline.

2. Restore the original install path.
   Use the pinned Node version, install Yarn Classic, and install dependencies from `yarn.lock`.

3. Verify the legacy workflows.
   Run `yarn start`, `yarn test`, and `yarn build` once and capture any existing failures separately from modernization work.

4. Document the startup prerequisites.
   Record the local start flow, including the required Firebase API key and how it is injected today.

## Stage 2: Stabilize configuration and remove the main Node blocker

5. Move Firebase config to environment variables.
   Replace the current query-string based `apiKey` handling with `REACT_APP_*` variables and add an `.env.example`.

6. Remove `node-sass`.
   Replace `node-sass` with `sass` and confirm the existing SCSS still compiles.

7. Re-run the baseline checks.
   Confirm `start`, `test`, and `build` still pass after the config and Sass changes.

## Stage 3: Upgrade the build toolchain

8. Upgrade `react-scripts` and TypeScript in a controlled step.
   Bring CRA tooling forward before changing application architecture.

9. Fix build, lint, and test regressions introduced by the toolchain upgrade.
   Expect changes around Jest, ESLint, TypeScript strictness, and Webpack assumptions.

10. Re-baseline the project on a current LTS Node version.
    Once the build stack is current enough, update the checked-in Node version and verify the project on that runtime.

## Stage 4: Upgrade runtime libraries

11. Upgrade React and matching type packages.
    Update `react`, `react-dom`, `@types/react`, and `@types/react-dom` together.

12. Upgrade adjacent UI/runtime dependencies.
    Update `mobx`, `mobx-react`, `react-dnd`, `react-dnd-html5-backend`, and any packages blocked by the React upgrade.

13. Address deprecated patterns.
    Replace fragile class/decorator patterns only where the upgraded libraries require it.

## Stage 5: Modernize Firebase integration

14. Upgrade the Firebase SDK.
    Move away from `firebase@7` to a supported version.

15. Refactor Firebase usage to the modular API.
    Rewrite the wrapper in `src/remote/firebase.ts` so the rest of the app depends on a small internal abstraction instead of SDK globals.

16. Re-verify multiplayer flows.
    Smoke-test create game, join game, round transitions, and score updates against the real Firebase project.
    Status: intentionally deferred because AI players will change the multiplayer flow.

## Stage 6: Modernize deployment and clean up

17. Upgrade `firebase-tools` and verify hosting deployment.
    Confirm `build/` still matches the hosting config and that deploys work with the updated CLI.
    Status: CLI upgraded to `15.14.0`; actual deploy is pending.

18. Remove obsolete configuration and dead code.
    Delete transitional notes, outdated compatibility code, and no-longer-used dependencies.
    Status: completed for known migration/debug remnants.

19. Finalize developer documentation.
    Update the README with the supported toolchain, environment variables, local startup commands, and deployment steps.
    Status: partially complete; deployment and production security rules still need final documentation after they are implemented.

## Definition of done

20. The project is considered modernized when:
    - it installs on a current LTS Node version,
    - local development starts without ad hoc manual fixes,
    - tests and production build succeed,
    - Firebase configuration is environment-based,
    - deployment is documented and repeatable.
