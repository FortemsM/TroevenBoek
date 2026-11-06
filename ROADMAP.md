# TroevenBoek — Product Roadmap 🗺️

This document outlines the phased vision and progression for **TroevenBoek**. Each phase builds naturally upon the previous one, starting with a rock-solid, single-phone scorekeeper before expanding to cloud sync, social features, synchronized multi-device live play, and rule customization.

---

## 🎯 High-Level Vision
An open-source, companion app for Belgian café card games (*Kleurenwiezen*, *Kingen*, *Chinees Poepen*, and more). Designed for offline use in lively cafés, but scalable to real-time multi-device tables, social groups, and rich friend analytics.

---

## 📅 Roadmap Overview

```
Phase 1: Core Scoring Engine (Single Phone)
   │     • Initial games: Kleurenwiezen, Kingen, Chinees Poepen
   │     • Player setup & game style selection
   │     • Round input flow & live score sheet
   ▼
Phase 2: Local & Server Session Persistence
   │     • Local offline storage (offline-first)
   │     • Cloud backup / Server sync (pause & resume sessions across dates)
   ▼
Phase 3: Accounts, Social & Friend Analytics
   │     • User accounts & player profiles
   │     • Friend connections & group leaderboards
   │     • Head-to-head stats & flexible comparisons (even when not everyone is present)
   ▼
Phase 4: Multi-Device Live Table Experience
   │     • Every player connects with their own phone
   │     • Live dealer & turn indicator ("It's your turn to deal!")
   │     • Real-time bids/calls broadcasted (e.g. Kleurenwiezen bid announcements)
   │     • Live synchronized scoreboard
   ▼
Phase 5: Café House Rules & Variant Engine
   │     • Configurable rulesets (custom contracts, penalty scales, doubling, troef rules)
   │     • Save and share custom house rulesets per group
   ▼
Phase 6: Expansion: More Games & Interactive Rule Guides
         • Add Manillen, Rikken, Toepen, and more
         • "Learn to Play" cheat sheets and interactive onboarding for new games
```

---

## 🔍 Detailed Breakdown of Phases

### 🔹 Phase 1: Core Scorekeeper (Single Phone Flow)
**Objective**: Enable a group around a single café table to track an entire game smoothly from one device.

1. **Initial Game Focus**:
   - **Kleurenwiezen** (4 players, bidding ladder: *Vraag & Mee*, *Alleen*, *Abondance*, *Misère*, *Picolo*, *Solo*, *Solo Slim*, *Troel*, overslagen/vallers, zero-sum scoring).
   - **Kingen** (4 players, fixed rounds: negative games like *Geen Harten*, *Geen Heren/Boeren*, *Geen Slagen*, *Geen Hartenheer*, etc., followed by positive contracts like *Troef*).
   - **Chinees Poepen** (Flexible player count, dealing decreasing/increasing cards per round, bidding exact tricks, penalty/strike counting per misprediction).
2. **Setup User Flow**:
   - Select game type.
   - Choose game style / length.
   - Configure players (names / order around the table).
3. **Round Entry Experience**:
   - Fast, intuitive numeric / contract selectors optimized for one-handed café use.
   - Immediate feedback and error-prevention (e.g., verifying trick counts add up).
4. **Live Scoreboard**:
   - Clean, readable table matrix showing cumulative and per-round points.
   - Clear indicators for leader, dealer, and current round.

---

### 🔹 Phase 2: Session Persistence & Server Continuity
**Objective**: Never lose a game due to a dead battery, closing the app, or continuing a multi-week tournament.

1. **Local-First Offline Storage**:
   - Automatic local persistence after every single round.
   - Full offline resilience without requiring any network or login.
2. **Server Sync & Cloud Save**:
   - Cloud backup of active and past sessions.
   - Pause an ongoing session and resume it days or weeks later from any device.
   - Session history archive (review old games, past winners, round-by-round logs).

---

### 🔹 Phase 3: Accounts, Social & Group Analytics
**Objective**: Build a personal identity and track rivalry and bragging rights across friend groups.

1. **User Accounts & Profiles**:
   - Personal profile linked to game sessions.
   - Claim or link guest player names from past sessions to registered accounts.
2. **Friends & Friend Groups**:
   - Add friends and create recurring card groups (e.g., "Donderdagavond Wiezen").
3. **Rich Analytics & Comparisons**:
   - Win/loss rates, average points, favorite contracts called (e.g., *Misère* success rate).
   - Dynamic comparisons across friend groups, even if not every member plays in every session.
   - Head-to-head match-up statistics and "nemesis" insights.

---

### 🔹 Phase 4: Synchronized Multi-Device Live Experience
**Objective**: Elevate the table experience from one person typing on a screen to a collaborative, interactive card companion.

1. **Room / Table Join**:
   - Host starts the table, gives a 4-letter code or QR code; other players join on their phones.
2. **Personalized Player Displays**:
   - **Dealer Trigger**: Clear alert on the active dealer's phone ("Your turn to deal").
   - **Interactive Bidding Flow**: In *Kleurenwiezen*, players submit bids (*Vraag*, *Alleen*, *Misère*, etc.) on their phone; bids broadcast to everyone's screen in real time.
   - **Real-Time Synchronized View**: Everyone sees the live scoreboard and contract status update instantly.

---

### 🔹 Phase 5: Café House Rules & Customization
**Objective**: Respect Belgian card culture where every café, village, or friend circle has slight rule variations.

1. **Rule Variation Engine**:
   - Toggle specific contracts on/off (e.g., with or without *Picolo*, *Troel* rules, double points on *Harten*).
   - Custom point values for wins, overslagen, and penalties.
   - Custom life counts and penalty systems in *Chinees Poepen*.
2. **Preset Management**:
   - Save custom rule profiles (e.g., "Café De Welkom Regels") and select them when starting a game.

---

### 🔹 Phase 6: Game Expansion & "Learn to Play" Guides
**Objective**: Expand the library and introduce players to new games effortlessly.

1. **Library Expansion**:
   - Add *Manillen* (2v2 team points, 60 points per deal, *Troef/Mullers/Tegen/Meegaan*), *Rikken*, *Poepen / Toepen*, *Hartenjagen*, etc.
2. **Built-in Game Rules & Cheat Sheets**:
   - Clear contract hierarchy reference cards right inside the app.
   - Interactive onboarding explaining card values, trump rules, and bidding strategy for beginners.

---

## 📌 Next Action Items
- [ ] Review and refine **Phase 1** specifications (scoring math and state models for *Kleurenwiezen*, *Kingen*, and *Chinees Poepen*).
- [ ] Design the setup user flow and wireframe the round-entry UI.
