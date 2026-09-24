# YKS 2027 Android Companion App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the YKS study program into a production-grade, offline-first Android mobile application with Capacitor 7, featuring a Material 3 mobile UI, 4 daily blocks + 20-min break timer with haptic vibration, stress-free automatic schedule shifting, 766-video curriculum roadmap, and ready-to-build Android Studio project.

**Architecture:** Modern mobile web client (`www/`) with Material Design 3 structure packaged into a native Android project via `@capacitor/core` and `@capacitor/android`. Uses `calendar_engine.js` and `playlists_data_tr.json` for verified curriculum data, with native haptics (`@capacitor/haptics`), local notifications, and offline storage.

**Tech Stack:** Node.js, Capacitor 7, Material 3, HTML5/CSS3/Vanilla JS (ESM), Android Studio / Gradle project structure (`android/`).

**Spec:** [docs/ideas/yks-android-app.md](file:///home/znekm/Masaüstü/hermes/docs/ideas/yks-android-app.md)

## Global Constraints

- Strict adherence to Material 3 / Android guidelines (`android.md`): Top App Bar, standard 3-tab Bottom Navigation Bar, 48x48 dp minimum touch targets, sp font scaling, edge-to-edge system safe area insets.
- No AI slop: No gradient text, no neobrutalist block shadows, no side-tab accent stripes, no nested cards.
- 4 blocks per study day; 1 block = 1 video.
- 20 minutes fixed break with countdown timer, Web Audio chime, and native haptic vibration.
- Sunday strictly "ÇALIŞMAK KESİNLİKLE YASAK!".
- Stress-Free Shift Engine: Missed days shift forward gracefully without shame or broken video chronology.
- Target deadline: 19 June 2027.

---

### Task 1: Setup Capacitor & Mobile Scaffolding

**Files:**
- Modify: `package.json`
- Create: `capacitor.config.json`
- Create: `tests/test_capacitor_setup.test.js`

**Interfaces:**
- Produces: Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/haptics`.
- Valid `capacitor.config.json` with appId `com.yks.planner` and appName `YKS 2027 Koçu`.

- [ ] **Step 1: Install Capacitor dependencies**
- [ ] **Step 2: Create capacitor.config.json**
- [ ] **Step 3: Write setup verification test**
- [ ] **Step 4: Run test to verify passes**
- [ ] **Step 5: Commit**

---

### Task 2: Build Mobile UI and Stress-Free Shift Engine (`www/`)

**Files:**
- Create: `src/generate_mobile_app.js`
- Create: `www/index.html` (generated bundle)
- Create: `tests/mobile_app.test.js`

**Interfaces:**
- Produces: Complete mobile application in `www/index.html` (and modular assets) featuring:
  - Material 3 layout: Top App Bar, Bottom Navigation Bar (Bugün / Gelecek & Geçmiş / Müfredat).
  - Screen 1 (Bugün): 4 daily video blocks + 20-min break cards with countdown timer and Haptics, Sunday rest screen.
  - Screen 2 (Gelecek & Geçmiş): 42-week schedule with Stress-Free Shift Engine and 19 June 2027 target countdown.
  - Screen 3 (Müfredat & Arama): 9 courses progress bars, Turkish-aware search, progress export/import.
  - Native Capacitor bridge integration.

- [ ] **Step 1: Write test for mobile app generation and logic**
- [ ] **Step 2: Implement src/generate_mobile_app.js**
- [ ] **Step 3: Generate www/ and verify tests pass**
- [ ] **Step 4: Commit**

---

### Task 3: Initialize & Configure Native Android Project (`android/`)

**Files:**
- Create: `android/` directory via `npx cap add android`
- Modify: `android/app/src/main/AndroidManifest.xml` (permissions: VIBRATE, INTERNET)
- Create: `tests/android_project.test.js`

**Interfaces:**
- Produces: Ready-to-build Android Studio project in `android/` with Gradle wrapper, AndroidManifest permissions, and Capacitor bridge.

- [ ] **Step 1: Run npx cap add android**
- [ ] **Step 2: Configure AndroidManifest.xml and Gradle settings**
- [ ] **Step 3: Run npx cap sync android**
- [ ] **Step 4: Write test verifying Android project integrity**
- [ ] **Step 5: Commit**

---

### Task 4: Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Verify all tests pass

- [ ] **Step 1: Add Android build & usage guide to README.md**
- [ ] **Step 2: Run npm test across all test suites**
- [ ] **Step 3: Final commit**
