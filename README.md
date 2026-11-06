# TroevenBoek 🃏

**TroevenBoek** is an open-source mobile scorekeeper app for popular Belgian card games (such as *Wiezen*, *Kleurenwiezen*, *Manillen*, *Rikken*, *Poepen*, *Kingen*, and more), complete with multi-game session score tracking.

## ✨ Planned Features

- **Popular Belgian Card Games**: Dedicated rulesets and scoring logic for classic Belgian games.
- **Multi-Game Score Counting**: Combine multiple card games or rounds into a single evening/session scoreboard.
- **Cross-Platform**: Built with **React Native (Expo)** for **iOS** (primary), **Android**, and **Web (PWA)**.

## 🛠️ Tech Stack

- **Framework**: React Native + Expo (TypeScript)
- **Targets**: iOS, Android, Web (PWA)

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** — see the [LICENSE](./LICENSE) file for details.

## Working scorekeeper

The first single-phone flow includes Kleurenwiezen, Kingen and Chinees Poepen,
player order, round entry/correction, cumulative scores, and locally saved tables.
Finish a table to archive it, or reopen it to continue another evening.
Kleurenwiezen and Kingen use **manual café points** until the house scoring tables
are confirmed. Kleurenwiezen entries must sum to zero. Chinees Poepen deals down
to one card and back up; each incorrect prediction gives one penalty point.
Every table currently contains one game. Mixed-game totals and cloud sync remain
roadmap features.

Run `npm install`, then `npm start` and scan the QR code with Expo Go on your
phone (on the same network). React Native components render the same scorekeeping
flow on iOS, Android and web; no custom native build is required. For a browser,
use `npm run web`. Local storage saves tables on this device/browser only; clearing
app or browser data removes them. Web export is available, while installable PWA
offline caching remains future work.

Checks: `npm run typecheck`, `npm test`, and `npm run build` (exports to `dist/`).
In Expo Go, create a table, reject an invalid point total, save and correct a round,
then close and reopen the app to verify the table resumes. For Chinees Poepen,
check that achieved tricks sum to the dealt cards and that incorrect bids add one
penalty. Native device testing still needs a physical phone.
