# TroevenBoek — Agent & Project Context (`AGENTS.md`)

## 1. Project Overview
- **Project Name**: TroevenBoek
- **Repository**: `https://github.com/FortemsM/TroevenBoek`
- **Owner**: `FortemsM`
- **License**: GNU General Public License v3.0 (`GPL-3.0`)
- **Goal**: An open-source mobile scorekeeper application for popular Belgian card games (*Wiezen*, *Kleurenwiezen*, *Manillen*, *Rikken*, *Poepen*, *Kingen*, etc.) with support for **multi-game session score tracking** (combining different games/rounds into an overall score sheet) plus additional companion features.

## 2. Target Platforms & Environment Constraints
- **Primary Target**: **iOS** (iPhone), followed by **Android**, plus **Web (PWA)**.
- **Development OS**: **Fedora Linux** (no local macOS / Xcode machine available).
- **Apple Developer Account**: **None** (no paid $99/yr Apple Developer account).
- **How the App is Tested & Installed on iOS**:
  1. **Expo Go**: Primary live development & native testing method on a physical iPhone from Linux.
  2. **Web / PWA ("Add to Home Screen")**: Exported via Expo Web (`npx expo export --platform web`) so iOS Safari users can install it to their Home Screen as an offline-capable full-screen app without an Apple Developer account.
  3. **GitHub Actions macOS Runners (Optional Future Path)**: Since the repo is public/open-source, GitHub Actions provides free macOS runners that can build unsigned/sideloadable `.ipa` files (for use with AltStore / SideStore).

## 3. Tech Stack & Architecture Guidelines
- **Framework**: **React Native** with **Expo** (managed workflow) and **TypeScript**.
- **Compatibility Rule**: Every dependency added **must** work inside **Expo Go** (avoid custom native modules that require `expo prebuild` / local Xcode compilation unless strictly optional) and should ideally support **React Native Web** so PWA export stays functional.
- **Persistence**: Local-first offline storage (e.g., `@react-native-async-storage/async-storage` or `expo-sqlite`) so game scores are never lost offline in a café.
- **Developer Background & Coding Style**:
  - The developer has experience in Python, C++, and basic HTML/CSS, and is primarily **vibe-coding** this project.
  - Keep code modular, readable, well-typed (TypeScript), and well-commented.
  - When introducing new React Native / Expo concepts, briefly explain how they work and how to test them in Expo Go.

## 4. Git & GitHub Workflow
- Always verify that commits and GitHub operations use the personal account **`FortemsM`** (`manu.fortems@outlook.be`), **not** the school account (`UA-ManuFortems`).
- Can check/switch GitHub CLI account via `gh auth status` / `gh auth switch -u FortemsM`.

## 5. Current Project Status & Next Steps
- [x] GitHub repository created (`FortemsM/TroevenBoek`) with `GPL-3.0` license, `README.md`, and `.gitignore`.
- [ ] Scaffold the Expo (TypeScript) project in the repository root.
- [ ] Define core data models for players, sessions, multi-game scoreboards, and game-specific rulesets (starting with Belgian classics like *Wiezen* / *Manillen*).
- [ ] Build the core UI (session creation, player selection, round score entry, live scoreboard).
