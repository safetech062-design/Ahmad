#!/usr/bin/env bash
# One-time setup. Run in a terminal with internet (GitHub Codespaces, or a PC).
# `expo install` picks the package versions that match this project's Expo SDK,
# so we never guess version numbers. It also writes them into package.json.
set -euo pipefail

npm install
npx expo install expo-contacts expo-notifications expo-intent-launcher expo-clipboard \
  expo-file-system expo-device expo-battery expo-network
npx expo install jest-expo jest @types/jest -- --save-dev
npx expo install --fix

echo "--- type check ---"
npm run typecheck
echo "--- unit tests ---"
npm test
echo
echo "Setup OK. Now commit package.json and package-lock.json, then run the 'Build Android APK' workflow."
