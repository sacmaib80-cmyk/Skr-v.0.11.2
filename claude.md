# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**SakuraQ** — a quest / habit tracker built as a single-file vanilla-JS PWA, wrapped with **Capacitor 6** to ship as an Android APK. There is **no build step, no framework, no TypeScript, no bundler**. The app is plain HTML/CSS/JS served as static files.

> Note: ignore any mention of React/TypeScript/Tailwind/`npm test`/`npm run lint` — none of that exists here. Those were placeholder defaults.

## Source of truth: `www/`

`capacitor.config.json` sets `webDir: "www"`, so **`www/` is the live app that ships**. Edit files under `www/`:
- `www/index.html` — the entire app (~22k lines: markup + all CSS in `<style>` + all JS in `<script>`)
- `www/auth.js` — Firebase Google auth (ES module)
- `www/sw.js` — service worker (offline cache + web notification fallback)

The identical-looking files at repo root (`index.html`, `auth.js`, `sw.js`) are **stale older copies** — do not edit them expecting changes to appear in the app.

`learn-js/` is unrelated — personal JS practice exercises run with `node learn-js/NN-name.js`.

## Build & run

**Dev (browser):** open `http://127.0.0.1:5500/www/index.html` via Live Server. Hard-refresh (Ctrl+Shift+R) after edits because the service worker caches aggressively.

**Build APK:**
```powershell
npx cap sync android                      # copy www/ → android/, sync plugins
cd android; .\gradlew assembleDebug       # output: android/app/build/outputs/apk/debug/app-debug.apk
```
- Gradle needs **Java 17+**. System Java is 1.8, so set `JAVA_HOME` to Android Studio's bundled JBR first:
  `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
- `build-firebase.ps1` automates sync → build → copy APK to `~/Downloads`.
- Bump `versionCode` + `versionName` in `android/app/build.gradle` for each release.

After editing `www/`, you **must** `npx cap sync android` before building or changes won't reach the APK.

### 🔁 ปล่อยเวอร์ชันใหม่ให้คนโหลด (สำคัญ — ทำทุกครั้งที่ออกเวอร์ชัน)

**สถาปัตยกรรมการแจก (2026-06-28):**
- **เว็บ landing** (`welcome.html`) อยู่บน **Firebase Hosting** → `https://sakuraq-b7f96.web.app/welcome.html` (ถาวร)
- **ไฟล์ APK** อยู่บน **GitHub Releases** (ไม่ใช่ Firebase!) เพราะ **Firebase Spark plan ฟรี ห้ามโฮสต์ไฟล์ executable/.apk** (`HTTP 400 Executable files are forbidden`). `firebase.json` จึง `ignore: **/*.apk`
- ปุ่มดาวน์โหลดใน welcome.html ชี้ลิงก์ถาวร: **`https://github.com/sacmaib80-cmyk/Skr-v.0.11.2/releases/latest/download/sakuraq.apk`** (`/latest/download/` ชี้ release ล่าสุดอัตโนมัติ — repo public)
- **ไม่ใช้** Firebase App Distribution / Play tester list (ไม่ต้องเพิ่ม Gmail คนเทส) — ใครมีลิงก์ก็โหลดได้

**ขั้นตอนปล่อยเวอร์ชันใหม่:**
1. bump `versionCode`+`versionName` ใน `android/app/build.gradle`
2. `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
3. ย้าย `www/sakuraq.apk` ออกก่อน sync (กัน Capacitor ยัด apk เข้า APK ใหม่ซ้อน) → `npx cap sync android`
4. `cd android; .\gradlew assembleDebug` → ได้ `android/app/build/outputs/apk/debug/app-debug.apk`
5. **อัป APK ขึ้น GitHub Release ใหม่** (repo `sacmaib80-cmyk/Skr-v.0.11.2`): สร้าง release tag ใหม่ + แนบไฟล์ **ตั้งชื่อ asset = `sakuraq.apk` เป๊ะ** (ไม่งั้นลิงก์ `/latest/download/sakuraq.apk` พัง). ทำผ่านเว็บ GitHub (Releases → Draft new release → drag ไฟล์ → Publish) หรือ `gh release create` ถ้าติดตั้ง gh แล้ว
6. **เว็บไม่ต้อง redeploy** ถ้าแก้แค่ APK (ลิงก์ปุ่มชี้ GitHub อยู่แล้ว). redeploy เฉพาะตอนแก้ `welcome.html`/เนื้อหาเว็บ: `npx -y firebase-tools deploy --only hosting`
- **เวอร์ชันล่าสุด:** `versionName 0.18.4` / `versionCode 41` (build 2026-06-29 — รวม first-run tour v2 มาสคอต + fix login/per-account; APK อยู่ที่ `www/sakuraq.apk` รออัปขึ้น GitHub Release) — *อัปเดตบรรทัดนี้ทุกครั้งที่ปล่อยใหม่*
- `www/*.apk` อยู่ใน `.gitignore` (ไฟล์ build อยู่ที่ `www/sakuraq.apk` ไว้ลากขึ้น GitHub Release)

## Architecture (all inside `www/index.html`)

**State & persistence.** A single `state` object (timer/quest status) plus separate stores, all in `localStorage` under versioned keys (`qps_*_v*`, see the `KEY_*` consts ~line 11450). Keys are **scoped per user** via `makeScopedKey()` / `getActiveUserScope()` (uid or `"guest"`) so multiple Google accounts don't collide. `window._sqTimerState` exposes `state` to code outside the main IIFE.

**Cloud sync.** Firebase Auth (Google) + Firestore. `auth.js` fires `sq-user-changed` / `sq-auth-changed` events; `index.html` listens and calls `cloudLoadAll()` / debounced `cloudSaveAll()` to mirror localStorage to `users/{uid}`. `window.sqAuth`, `window.sqDB`, `window.sqCloud` are the bridges.

**Screens are DOM overlays, not routes.** `switchPage()` toggles `.page-active`; full-screen flows (`homeRunScreen`, `homeReportScreen`, `homeQuestFlow`, `authGate`) are fixed overlays toggled by `.show`. The legacy in-card **Timer tab** (`#sec-timer`) still exists and holds the form inputs (`#category`, `#questName`, `#cutMinutes`, `#startBtn`…) that the JS reads — the **Home Run Screen** is the real running-quest UI but delegates to those hidden controls (e.g. `homeRunStopBtn` → `el.stopBtn.click()`). Don't delete `#sec-timer` markup without rewiring everything that reads `el.*`.

**Quest lifecycle.** `startQuest()` → tick loop (`startTick`, 250ms) updates timer + rings → `stopQuest()` / `forceAutoStop()` (hard/soft cut modes) → report flow. Points: `base = minutes × 0.4`, bonuses `+2/+4/+6` only when `minutes ≥ 25`, capped at 60 min per quest-name per day.

**Morning Gate.** A discipline system (`gate*` functions, `GATE_RULES`): must start a qualifying quest within N minutes of a daily trigger time or the app locks for `lockDays` (7).

**Notifications.** On Capacitor → `@capacitor/local-notifications`; the robust path is **`scheduleQuestDoneOS()`** which pre-schedules an OS alarm at `targetEndTs` so it fires even when the app is backgrounded/killed (the JS tick loop pauses in background, so don't rely on it for notifications). `cancelQuestDoneOS()` clears it on stop/extend. On web → `sw.js` `SCHEDULE_NOTIFICATION` via `setTimeout` wrapped in `event.waitUntil` (only reliable under the ~30s SW lifetime cap). Notification small icon `ic_stat_icon_config_sample`, accent `#5b6af0`.

**Design language.** SakuraQ purple `#5b6af0` / `#7c7de8`; category colors Learning=blue, Work/Project=indigo, Physical=purple, Connection=pink. Thai is the primary UI language.

## Editing conventions

- `index.html` is huge; use Grep to locate a function/selector, edit in place. Match the surrounding plain-JS style — no modules, no arrow-only dogma, lots of null-guards (`if(el.x) …`).
- VS Code's CSS linter flags inline `style="display:none;"` inside HTML as errors — these are **false positives**, not real bugs. Real errors show in the browser console (F12).
- **Beware smart/curly quotes (`”` `“` `’`) in pasted markup.** They look like straight quotes but break HTML silently: `class=”x”` makes the class literally `”x”`, so CSS won't match, `getElementById` returns null, and `data-i18n` lookups fail (raw keys render). When a freshly-added block shows *all* of: no styling + JS can't find its element + i18n keys showing raw → it's almost always curly quotes in the markup, **not** a cache/i18n/runtime bug. Check the raw HTML attributes FIRST before theorizing. Scan: `node -e "...test(/[“”‘’]/)..."`.
- **i18n coverage sweeps — อย่าข้ามส่วน markup.** ไฟล์เรียงเป็น `<head><style>` → `<body>` **HTML markup** → `<script>` (i18n engine + `I18N` dict + JS ทั้งหมด). บทเรียน: เคยเขียน sweep หาภาษาไทยที่ยังไม่แปลโดยใช้ `if(i <= dictEndLine) continue` เพื่อข้าม dict — **แต่ markup อยู่ก่อน dict** เลยถูกข้ามทั้งก้อน ทำให้ UI ของฟีเจอร์ใหม่ (เช่น Break Time panel/modal/banner) หลุดการตรวจ. วิธีที่ถูก: sweep **ช่วง markup แยกต่างหาก** (`<body>` → บรรทัดที่ขึ้นต้น main script) แล้วค่อย sweep ช่วง JS code (หลัง dict). และตอนเช็ค "ติด `data-i18n` หรือยัง" ต้องดู**บรรทัด opening tag** ไม่ใช่บรรทัด content — element หลายบรรทัด (เช่น `data-i18n-html` ที่มี `<br>`) จะมี attribute อยู่บน tag เปิด ส่วนข้อความไทยอยู่บรรทัดถัดๆ ไป (false positive ถ้าเช็คแค่บรรทัดเดียว). หลังแก้เสร็จทุกครั้ง verify ด้วย `node -e` 2 อย่าง: (1) syntax check inline `<script>` ผ่าน `new Function()`, (2) key ที่อ้างถึงมีครบทั้ง `th`+`en` (นับ `"key":` = 2).
- Commit/push only when asked.

## Business Operator Mode (เปิดทำงานเฉพาะเมื่อ User ถามเรื่องหาเงิน/ธุรกิจ/การตลาด หรือสั่งเปิดโหมดนี้เท่านั้น)

เมื่อเข้าสู่โหมดนี้ ให้ทำงานตาม framework นี้:

### Role
ruthless solo-business operator, growth strategist, automation engineer, execution agent
Mission: generate real income online as fast as possible with highest leverage possible

### Rules
- Prioritize speed to first dollar over perfection
- Prioritize asymmetric opportunities
- Avoid saturated "guru advice"
- Think like elite startup founder mixed with hacker
- Use AI aggressively
- Every idea must be executable by ONE person using Claude Code, Cursor, v0.dev, or Make.com
- Every plan must have: time to first money, difficulty, scalability, required skills, automation potential, risk level, exact first step TODAY

### User Profile
- Strengths: creativity สูง, เชื่อมโยง idea เก่ง, เรียนเร็วภายใต้ pressure
- สนใจ: psychology, systems, UI/UX, automation, strategy, anime/game aesthetics, AI tools
- เป้าหมาย: leverage ไม่ใช่ขายแรง, skills ที่ compound ระยะยาว
- ทุนเริ่มต้น: จำกัด

### 5-Phase Framework
PHASE 1 — หา money gaps (5-7 top-tier opportunities ranked by success probability, speed, unfair advantage, upside)
PHASE 2 — low-competition strategies สำหรับ top 5
PHASE 3 — execution system สำหรับ best idea (roadmap, daily workflow, AI stack, automation, pricing, MVP, scaling)
PHASE 4 — challenge the plan (failure points, bottlenecks, psychological risks, market risks, higher ROI paths)
PHASE 5 — execute mode (generate actual assets: copy, scripts, names, outreach, architecture, tasks)

## Notion Template Project
- Template: Freelance OS — Client & Project Tracker
- Link: https://www.notion.so/36f694d3eeb18057aaa2d745646c4e31?v=36f694d3eeb1804abf0c000c5dc29dc8&source=copy_link
- Status: สร้างเสร็จแล้ว รอ publish ขายใน Gumroad

---

## Session Handoff Log

> **หมายเหตุสำคัญ:** User ใช้ `/clear` บ่อยเพื่อล้าง context window และใช้ Remote Control เป็นหลัก
> เมื่อเริ่ม session ใหม่หลัง `/clear` ให้อ่าน section นี้ก่อนเสมอ เพื่อรู้ว่าทำอะไรไปถึงไหนแล้ว
> หลังแก้โค้ดทุกครั้ง **ให้อัพเดต section นี้** ก่อนที่ user จะ `/clear`

### การตั้งค่า Claude Code (2026-06-04)
- เปิด `remoteControlAtStartup: true` ใน `~/.claude/settings.json` — Remote Control เริ่มอัตโนมัติทุก session
- Claude Code เวอร์ชัน: **2.1.52** / Model: **claude-sonnet-4-6**

### งานล่าสุด

- **[2026-07-02] ⭐ ทิศทางอนาคต + วิธีทำ APK/Firebase ของ React edition (เตือนความจำ — ทำซ้ำได้)**
  - **🎯 ทิศทางที่ User ตัดสินใจ (สำคัญที่สุด อ่านก่อน):** User วางแผนจะ **rewrite แอปใหม่เป็น Kotlin (native Android)** ในอนาคต เพราะเหมาะกับการเป็น "แอปจริง" มากกว่า React/PWA. **แปลว่า React edition = prototype/ทดลองดีไซน์+ระบบ ไม่ใช่ตัว production สุดท้าย** → **อย่าทุ่มเวลา port ของหนักๆ (auth/cloud sync/notification) ลง React เยอะ** ถ้า User กำลังจะไป Kotlin — ถามก่อนเสมอว่าจะเดินทางไหน (React ต่อ / เริ่ม Kotlin / คง www vanilla). ตอนนี้ตัว **ship จริงยังเป็น `www/` (vanilla PWA + Capacitor APK)**
  - **✅ ทำ APK จาก React ได้แล้ว (side-by-side ไม่ทับแอปจริง) — recipe:**
    1. `mv android/app/google-services.json android/app/google-services.json.bak` (React ไม่ใช้ Firebase; **ถ้าไม่ย้าย + เปลี่ยน applicationId → gradle `com.google.gms.google-services` plugin fail** "no matching client for package")
    2. แก้ 3 ที่: `android/app/build.gradle` `applicationId` → `com.sacmaib80.sakuraq.react` · `android/app/src/main/res/values/strings.xml` `app_name`+`title_activity_main` → `SakuraQ React` · `capacitor.config.json` `webDir` → `sakuraq-react/dist`
    3. `cd sakuraq-react; npm run build` → `npx cap sync android` (จาก repo root) → `$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; cd android; .\gradlew.bat assembleDebug` (~52s, JBR=Java17)
    4. APK ที่ `android/app/build/outputs/apk/debug/app-debug.apk` (~8MB) → copy → `~/Downloads/SakuraQ-React.apk`
    5. **revert ทุกอย่างกลับ:** applicationId/app_name/webDir คืนค่าเดิม + `mv google-services.json.bak → google-services.json` + `npx cap sync android` (move `www/sakuraq.apk` ออกก่อน sync กันยัด apk ซ้อน) เพื่อ restore แอปจริง. **ยืนยัน restore:** `android/app/src/main/assets/public/index.html` ต้องกลับเป็น ~913KB (vanilla) ไม่ใช่ ~1KB (react shell)
    - ผล: `applicationId` ต่างกัน → ลงข้างๆ แอปจริงบนมือถือได้ ไม่แตะ package/ข้อมูลเดิม (แอปจริงเป็น debug-signed จาก keystore เครื่องนี้ — ถ้าใช้ applicationId เดียวกันจะทับกัน)
  - **✅ Deploy React ขึ้น Firebase ได้แล้ว (preview channel, ไม่ทับ production) — recipe:**
    - **แพลน Spark ฟรี = มี hosting site เดียว, multi-site ต้อง Blaze** → ใช้ **preview channel** แทน (Spark ใช้ได้, expire สูงสุด 30 วัน). firebase-tools **login cached เป็น `sacmaib80@gmail.com` แล้ว** (deploy ได้เลยไม่ต้อง login ใหม่ — เช็คด้วย `npx -y firebase-tools login:list`)
    - `cp firebase.json firebase.json.bak` → แก้ `hosting.public` → `sakuraq-react/dist` (ใช้ `node -e` เขียน JSON กัน syntax พัง) → `npx -y firebase-tools hosting:channel:deploy react-edition --expires 30d` → `mv firebase.json.bak firebase.json` (คืน `public: "www"`)
    - **⚠️ อย่า `firebase deploy` (ลง live) ด้วย public=dist เด็ดขาด** — จะทับ production `sakuraq-b7f96.web.app` (แอปจริง + `welcome.html` หน้าดาวน์โหลด GitHub) หายทันที. channel แยกจาก live → production ปลอดภัย (ยืนยันแล้ว: live ยังเป็น vanilla ไม่มี `id="root"`)
    - URL ล่าสุด (ทดลอง): `https://sakuraq-b7f96--react-edition-78sec3fu.web.app` **หมดอายุ 2026-08-01**. ถาวรต้อง Blaze หรือย้าย React เป็นเว็บหลักแทน vanilla (แต่หน้าดาวน์โหลด+แอปจริงจะหาย → ต้องตั้งใจย้ายจริงก่อน)
  - **📋 เหลือทำให้ React "สมบูรณ์" (ถ้ายังไป React ต่อ — แต่ดู note Kotlin ข้างบนก่อน):** Auth Google + cloud sync Firestore + migration จาก key เดิม `qpsData_v4` · Notification/OS alarm (Capacitor local-notifications) · permanent hosting (Blaze) · first-run tour · admin panel · per-category level · AI quest suggestion · streak freeze · commit (ยังไม่ commit ทั้ง sakuraq-react/ และ handoff นี้)

- **[2026-07-01] 🆕 SakuraQ React edition — พอร์ตทุกระบบหลัก + พิสูจน์ไม่บั๊ก** — โปรเจกต์ใหม่แยกที่ `d:\git\sakuraq-react\` (ไม่แตะ `www/` เดิม, ยังไม่ commit)
  - **บริบท/ที่มา:** User สั่งลองสร้าง SakuraQ ใหม่ด้วย **React** "คงมาตรฐานเดิมหรือเหนือกว่า" — คงลุคพาสเทลลาเวนเดอร์เดิม แต่ **อนิเมชั่นดุดันกว่า**. รอบแรกเอาเฉพาะระบบหลัก (ไม่เอา gmail/notification/APK). รอบนี้ User สั่ง **"เอาทุกระบบลงเลย"** + ใส่รูปแบรนด์จริง + พิสูจน์ว่าไม่บั๊ก
  - **Stack:** Vite + React 18 · **Framer Motion** (motion/transition/celebration) · **Zustand + persist** (localStorage key `sakuraq-react-v1`). ไม่มี build step เดิมของ www — อันนี้ต้อง `npm run build`. รัน dev: `cd sakuraq-react; npm run dev` → :5173
  - **โครงไฟล์:** `src/lib/` (constants=หมวด/RULES/GATE_RULES/BREAK_RULES/STORE_ITEMS/QUEST_POOLS, scoring, date, i18n=dict TH/EN + translate(), useT hook) · `src/store/useStore.js` (state+action ทั้งหมด) · `src/components/` (Mascot=วิดีโอ fox จริง, SakuraPetals canvas, ProgressRing, Celebration, BottomNav, Toast, CountUp, Icons) · `src/screens/` (Home, QuestFlow, Run, Report, Today, History, Store, Menu, Schedule) · `App.jsx` คุม overlay/routing
  - **ระบบที่พอร์ตครบ + verify headless ผ่าน 25/25 (`scratchpad/verify.js`):**
    - **Core loop + scoring เป๊ะ:** base=นาที×0.4 (cap 60/ชื่อ/วัน), bonus +2/+4/+6 เฉพาะ ≥25 นาที, goal 100, level=⌊lifetime/100⌋+1 (ยืนยัน 25 นาที+note = 12.0)
    - **Morning Gate:** config เวลา, `gateStatus()` (off/waiting/armed/passed/locked), armed→ผ่านเควส≥3นาที = +6 (เก็บใน `day.gateBonus`), พลาด window→`gateEvaluate()` ล็อก 7 วัน (Home โชว์การ์ดล็อก+ปุ่มปลดล็อก, `startQuest` return locked), unlock ได้
    - **Break Time:** เปิดใน menu (cooldown 2ชม.), หลัง submit→`triggerBreak` (พัก 10+นาที/2), Home banner (พัก/เลยเวลา/หักแต้ม), เริ่มเควสถัดไปตอนพักเกิน→`applyBreakPenaltyIfAny` หัก -2/-4/-6 (tier by นาทีเกิน) เก็บใน `day.penalties`, `dayEffective`=gross−penalties
    - **Schedule:** addPlan/removePlan, start plan→`startQuest({fromPlanId})` ลบ plan+เริ่มเลย, Home plan banner
    - **Random Quest dice:** ปุ่ม 🎲 ใน QuestFlow (โชว์รูปลูกเต๋าที่ equip), สุ่ม cat+name(จาก QUEST_POOLS ตามภาษา)+duration → เด้งไป step 2
    - **Store เต็ม:** slot startBtn (5 สี+ปุ่มไฟมีเอฟเฟกต์เปลว), **dice (4 สกินใช้ PNG จริง** copy จาก www), accent (2 ธีม). ซื้อ=หัก spendable (=lifetime−spent, level/streak ไม่ลด), equip toggle, apply จริง (fire→FireFX, dice→รูปในปุ่มสุ่ม, accent→CSS var)
    - **i18n TH/EN:** dict flat + `{var}` interpolation, toggle ใน Menu, ครอบทุกสกรีน+nav (เหลือแค่ชื่อ user=ข้อมูลจริง)
    - **Menu overlay:** ภาษา, Gate config+เวลา, Break toggle, Schedule, ล้างข้อมูลวันนี้, about
  - **รูปแบรนด์จริง (copy → `sakuraq-react/public/`):** `fox-idle.webm` (มาสคอต Home, พื้นโปร่ง เล่นวิดีโอ + fallback `mascot.png`), `mascot.png` (celebration + empty state), `logo-192.png` (header), `dice-*.png` (4 สกินร้านค้า)
  - **บั๊กที่เจอ+แก้ตอนทำ:** celebration แว้บหาย เพราะ `submitReport` รีเซ็ต session→`<Report>` (ที่หุ้ม celebration) unmount → **ย้าย Celebration ขึ้น App level** ให้อยู่รอด. Gate lock ตอนเทสต์ = ทำงานถูก (เปิด gate เวลา 07:00 ที่เลย window แล้ว→ล็อกจริง) ไม่ใช่บั๊ก
  - **verify:** `scratchpad/verify.js` (25 logic tests ผ่านหมด, 0 console error), `shot*.js` (screenshot ทุกสกรีน). expose `window.sqStore` ใน main.jsx เพื่อเทสต์. build ผ่าน (414 modules)
  - **⏳ ยังไม่ได้ทำ (เหลือทำต่อ session หน้า):**
    1. **Auth (Google) + cloud sync (Firestore)** — ตั้งใจเว้นตามที่ User สั่ง (ยังเป็น localStorage-only, ข้อมูลไม่ sync ข้ามเครื่อง)
    2. **Notification / OS alarm** — เว้นตามสั่ง (ไม่มีเตือนเควสจบ/gate/break)
    3. **Capacitor → APK** — ยังไม่ต่อ (ถ้าจะทำ: `npm run build` → ชี้ `capacitor.config.json` webDir ไป `sakuraq-react/dist` → cap sync). ยังไม่มี migration ข้อมูลจาก key เดิม `qpsData_v4`
    4. admin panel, first-run tour, streak freeze, per-category level, AI quest suggestion — ยังไม่พอร์ต
    5. commit — ยังไม่ commit (repo convention: commit เมื่อ User สั่ง)

- **[2026-06-29] Antigravity × Claude — Nexus Sync bridge + autonomous AI-to-AI chat** — ทำนอกโปรเจกต์ ที่ `C:\Users\Administrator\.gemini\antigravity\scratch\` (ไม่เกี่ยว SakuraQ / ไม่ commit)
  - **บริบท:** เครื่องนี้มี AI อีกตัว **Antigravity** (Gemini, Google DeepMind) รันอยู่ที่ `.gemini\antigravity`. User อยากให้ Claude (เรา) กับ Antigravity คุย/ทำงานร่วมกันได้ — **ไม่เกี่ยวกับการต่อ Claude API / ไม่ต้องใช้ API key** (เคยเข้าใจผิดทำ "claude-bridge" forward ไป Claude API → ลบทิ้งแล้ว)
  - **ช่องทางคุยกัน:** (1) **ไฟล์** — `to_claude.md`/`from_claude.md` (handshake) + `collaboration_chat.md` (เทิร์น `## [TURN N]`). (2) **HTTP API** — Antigravity ทำ frontend `test-automation.html` (glassmorphism dashboard, poll ทุก 5 วิ) แล้วฝากเราทำ backend
  - **Backend ที่เราสร้าง (`server.js` + `package.json`, Express 4 + cors, พอร์ต 3456):** serve dashboard ที่ `/`, 4 routes — `GET /api/status` (sync state สองฝั่ง, message count คำนวณสดต่อ sender), `GET /api/messages`, `POST /api/messages` (`{sender,name,text}`, validate), `GET /api/sync` (health). state **in-memory** (restart แล้วหาย, seed ด้วยบทคุยจริง). เวลาแสดงเป็น `HH:MM` (helper `clockTime`) — **อย่าใช้ ISO** เพราะ dashboard print `msg.time` ดิบๆ. รัน: `cd ...\scratch; npm start`
  - **คุยกันแบบ autonomous (User ไม่ต้องเป็นตัวกลาง):** ทั้งสอง agent **poll `/api/messages` แล้ว POST ตอบ** ฝั่งเราใช้ **`ScheduleWakeup`** ปลุกตัวเองวนลูป (poll → ถ้า latest เป็น `antigravity` ที่ยังไม่ตอบ → POST reply เป็น `sender:"claude"` → reschedule). ฝั่ง Antigravity User ต้องสั่งให้มัน loop เอง (เราสั่ง Gemini ไม่ได้)
  - **ข้อจำกัด/บทเรียน:** (1) `ScheduleWakeup` **ขั้นต่ำ 60 วิ** — เร่งกว่านี้ไม่ได้ แต่เลี่ยงได้ด้วย **"Rapid Mode"**: ในเทิร์นเดียวรัน bash loop `poll ทุก ~4 วิ นาน ~50 วิ` แล้วตอบทันทีที่เจอข้อความใหม่ (in-turn `sleep` ใน loop **ไม่ถูกบล็อก**). (2) agent คุยกันยาวๆ โดยไม่มี**เป้าหมายจริง** → **วนพูดซ้ำ** (ทักทาย/ชมกันไปมา). (3) ใส่ **stop guard เสมอ** กันลูปวิ่งเปลือง token: หยุดเมื่อเจอ `[STOP]` ในข้อความ / messageCount เกินเพดาน / server ดับ / stall (อีกฝั่งเงียบหลายรอบ)
  - **ผลรอบนี้:** คุยจบ 27 ข้อความ พิสูจน์ว่า 2 AI ต่างค่ายคุยกันเอง autonomous ได้จริง → ปิดด้วย `[STOP]` ตอน Antigravity เริ่มซ้ำ. **idea ต่อยอด:** โยนงานจริงให้สองตัวทำร่วม (เช่น ฟีเจอร์ SakuraQ: เรา=logic, Antigravity=UI / ผลัดกันรีวิวโค้ด) จะได้บทสนทนามีสาระแทนทักทายวนๆ

- **[2026-06-28] First-run tour v2 — มาสคอตพูด + พาทำครบ loop (Stop→Report)** — ทำใน `www/index.html` ยังไม่ commit/cap sync (ต่อยอด/ยกเครื่อง v1 ด้านล่าง)
  - **เหตุผล (User รีวิว v1):** กล่อง welcome กลางจอ "ดูกาก เหมือน overlay โง่ๆ" + คำพูดราชการ/บังคับงงๆ + เดิมจบแค่ Start ไม่ครอบคลุม. อยากให้ **หมาหน้า Home พูดกับเรา** (แอพดูมีชีวิต), โทนกันเอง, พาทำจน Stop+เขียน Report จริง
  - **เปลี่ยนเป็น mascot-driven multi-phase (10 สเต็ป):** A1/A2 มาสคอตทักทาย+CTA เรื่องโฟกัส/วินัย (soft dim สว่างที่หมา + บล็อกแถบบน/ล่าง) → B1-B5 พากดเปิดเควส/หมวด/ชื่อ/เวลา/Start → C1 หน้าจับเวลา "กด Stop ได้เลย" → D1 หน้ารีพอต **prefill ตัวอย่างให้แก้ได้** + hint "ปกติต้อง 25 นาทีถึงมีลุ้นโบนัส รอบนี้ยังไม่ได้" → E1 มาสคอตปิดท้าย "พร้อมลุยรึยัง?" → ปล่อย
  - **กลไกใหม่ (reuse spotlight+guard ของ v1):** step modes = `mascot`(anchor `#mascotWrap`, dim อ่อน `.tourCut.soft` opacity .45 + bubble tail ชี้ลง `.tourBubble.fromMascot`, ปุ่มในกล่อง) / `click` (+`advanceWhen` predicate poll สำหรับ async: Start→`tourQuestRunning`, Stop→`tourReportVisible`) / `next` (input+validate) / `report` (prefill textarea + hint line `#tourBubbleHint`). `tourSpotlightEl()` แยก target(คลิกได้) vs anchor(หมา). `tourGoStep` ใส่ retry reposition (+180/+480ms) กัน target ที่ slide-in (run/report screen) วัด rect ก่อน transition จบ
  - **เดโม่ = ทิ้งเสมอ (User เลือก):** `tourDiscardDemo()` = `hideHomeReportScreen()`+`discardReport()`+`switchPage("homeScene")` ตอนออกจาก report (ปุ่ม "เสร็จละ") → ไม่มี entry ใน day log. **บังคับโดยระบบอยู่แล้ว:** submit ล็อกเมื่อ <1 นาที (`updateHomeReportLockUI`) → 15 วิ submit ไม่ได้. **ไม่ยุ่ง `targetEndTs`** (กัน tick auto-stop ขโมย flow ก่อน User กด Stop เอง)
  - **Copy ใหม่ทั้งหมด เสียงหมา กันเอง** (i18n `tour.*` 18 keys th/en): hi/hi2/go/s1-s7/s7hint/s7btn/reportSample/bye/byeBtn/needName/skip/next. ลบ `tour.welcome.*`/`tour.s5`เก่า/`tour.done`. ลบ markup `#tourWelcome` card + el refs (tourWelcome/tourStartBtn) → เพิ่ม `#tourBubbleHint`
  - **verify headless (puppeteer-core + Chrome x86 :5599) ผ่านครบ:** syntax `new Function()` 0 err, curly 0, dict 18 keys th+en; flow 10 สเต็ป spotlight ตรงทุก target (A1 soft+coversMascot+fromMascot, B1-B5, C1 onStop, D1 prefill 93 ตัวอักษร+hint+onNote, E1 coversMascot), click-gating กลืน nav, empty-name ไม่ไปต่อ, **questsAfter=0 (เดโม่ไม่ถูกบันทึก)**, key set, nav ใช้ได้; returning user ไม่เด้ง; reduced-motion cut+bubble visible (anim none); skip กลางทาง ปิด+discard+nav ได้
  - **[fix สำคัญ — login ไม่ได้]** User เจอ: เปิดมาเจอ authGate "Sign in to continue" กดปุ่ม Continue with Google ไม่ได้ เพราะ **tour สตาร์ตทับตอน gate ขึ้น** → `tourClickGuard` (capture-listener กลืนคลิกนอกเป้า) บล็อกปุ่ม login ด้วย (บน **web บังคับ Google login ก่อนใช้แอป** — headless มี gate ขึ้นจริง, ตอนเทสต์ก่อนหน้า in-page `.click()` เลย bypass ไปไม่เจอ). แก้: (1) `maybeStartFirstRunTour` **ไม่เริ่มทัวร์ถ้ายังไม่ login** — เช็ค `window.sqAuth?.uid`; ถ้ายังไม่มี → ฟัง `sq-auth-changed`/`sq-user-changed` รอ login เสร็จค่อยเริ่ม (+ fallback `setTimeout 1.6s` ถ้าไม่มี gate ขึ้นจริง เช่น APK guest → เริ่มเลย) ผ่าน helper `tourGateVisible()`. (2) `tourClickGuard` เพิ่ม allow `e.target.closest("#authGate")` (safety net กันบล็อก login เด็ดขาด). verify headless: force gate ขึ้น → ทัวร์ไม่เริ่ม + ปุ่ม login เป็น topmost คลิกได้; sim login (set `sqAuth.uid` + hide gate + dispatch `sq-auth-changed`) → ทัวร์เริ่ม mascot phase; full flow ผ่านครบหลัง sign-in
  - **[fix สำคัญ — ทัวร์ไม่ขึ้นกับเมลใหม่บนเครื่องเดิม]** User เจอ: สลับ Gmail ใหม่บางทีทัวร์ไม่ขึ้น (โดยเฉพาะเครื่องเดิม). สาเหตุ = flag `qps_tour_done_v1` เก็บ localStorage **ไม่ scope ตาม user** (localStorage แชร์ทุกบัญชีบน origin เดียว) → บัญชีแรกเล่นจบตั้ง flag → บัญชีใหม่เห็น flag = เคยเล่นแล้ว → ไม่ขึ้น. แก้: scope flag ด้วย `makeScopedKey(KEY_TOUR)` (= `qps_tour_done_v1_<uid>`, helper เดิม line 16088) ทั้งตอน set (`tourFinish`) และเช็ค (`tourIsDone()`). restructure `maybeStartFirstRunTour`→`tourDecide()` ให้ตัดสินใจ**หลังรู้ uid** (หลัง login) เพราะ scope ผูกกับ uid ตอนนั้น. `KEY_ONBOARD` ยัง device-wide (กันการ์ด onboarding เก่าเด้ง — ไม่กระทบทัวร์เพราะทัวร์ gate ด้วย scoped key อย่างเดียว). verify headless 3 เคส: บัญชีใหม่เอี่ยม→ขึ้น; **บัญชี B ใหม่บนเครื่องที่ A เคยจบ→ขึ้น (เดิมไม่ขึ้น=บั๊ก)**; บัญชี A กลับมา→ไม่ขึ้น. **หมายเหตุ:** flag เป็น local-per-uid-per-device → บัญชีเดิมเปิดเครื่องใหม่จะเห็นทัวร์อีกครั้ง (ยอมรับได้ ไม่ได้ sync cloud)
  - **ค้าง:** ยังไม่ commit/`cap sync`. User hard-refresh (Ctrl+Shift+R). reset ทดสอบ: ลบ `qps_tour_done_v1_<uid>` (scoped!) หรือ `localStorage.clear()` reload (ต้อง login ด้วย ทัวร์ถึงเริ่ม). **idea ต่อยอดที่ยังไม่ทำ:** menu coachmark (gate/break), มาสคอต Rive `dog.riv` (โค้ดพร้อม), copy pass ทั้งแอป, เพิ่มของใน store

- **[2026-06-28] Forced first-run spotlight tour (onboarding รอบใหม่) — v1 (ถูกแทนด้วย v2 ด้านบน)** — ทำใน `www/index.html` ยังไม่ commit/cap sync
  - **เหตุผล:** feedback ผู้ใช้จริง = คนแค่อยากจับเวลา+เริ่มเควสเลย แต่ "ใช้ไม่เป็น" เพราะ onboarding เดิม (`#onOverlay`/`maybeShowOnboardingFirstTime`) เป็นการ์ดเดียวอ่านจบหายเลย ไม่พาทำ. (gate/break คนไม่ค่อยแตะ + break ยังบัค — User สั่งยังไม่แก้รอบนี้)
  - **สิ่งที่ทำ:** guided tour บังคับรอบแรก หรี่จอมืด spotlight เฉพาะปุ่มที่ต้องกด + ลูกศรชี้ + กล่องคำพูดไทย/อังกฤษ พาไล่กดทีละสเต็ปจน "เริ่มจับเวลาจริง" (จบที่ปุ่ม Start, timer วิ่งต่อเอง — ไม่บังคับรอ/ไม่บังคับ report). มี **ปุ่มข้ามเล็กๆ มุมขวาบน**
  - **กลไก spotlight (ทนต่อ stacking-context):** `#tourMask` เป็น **visual ล้วน `pointer-events:none`** — cutout = div 1 ตัวขนาด=`getBoundingClientRect()` + ทริค `box-shadow:0 0 0 9999px` ให้เงาคลุมทั้งจอเหลือช่องปุ่มโปร่ง. **คลิก-เกตติ้ง = capture listener `tourClickGuard` ที่ document**: คลิกตรง target → ปล่อยผ่าน+advance, คลิกที่อื่น → `preventDefault+stopPropagation` กลืน (ปุ่มจริงทำงานเองไม่ต้องยุ่ง z-index)
  - **6 สเต็ป** (`tourSteps` state machine): welcome card → click `#homeStartQuestBtn` → click `#hqStepCategory` (.hqCatBtn) → input `#hqQuestName` (mode `next` + ปุ่มถัดไป, validate ไม่ว่าง) → input `#hqQuestTime` slider (next) → click `#hqStartBtn` → `startQuest()` วิ่ง → `tourCheckFinish()` เช็ค `state.status` running แล้วปิดทัวร์
  - **จุดแก้ (index.html เดียว):** (1) i18n `addI18N` block `tour.*` 11 keys th/en ก่อน END marker; (2) markup `#tourLayer` (mask/cut/arrow/bubble+#tourNextBtn / welcome card / #tourSkipBtn) หลัง `#onOverlay` + `el.*` refs; (3) CSS block ใกล้ `.onboard` (มี `.tourArrow.up` flip, `@media reduced-motion` ปิดเฉพาะ animation **ไม่ปิด visibility** — บทเรียนเดิม User เปิดลดการเคลื่อนไหว); (4) JS controller `KEY_TOUR="qps_tour_done_v1"` + ฟังก์ชัน start/go/position/advance/guard/finish/skip ใกล้ section ONBOARDING; (5) boot hook: ย้าย trigger ไป **หลัง `finishBootOverlay()`** (rAF) เรียก `maybeStartFirstRunTour()` — fresh user (ทั้ง onboard+tour ยังไม่เคย) → tour, ไม่งั้น → static onboard เดิม. `tourFinish(true)` set ทั้ง KEY_TOUR+KEY_ONBOARD → User เก่าไม่โดน tour เด้ง, การ์ดเดิมยังเข้าจาก Guide เมนูได้
  - **verify headless (puppeteer-core + Chrome x86 ผ่าน static server :5599) — ผ่านครบ 7 ข้อ:** main script `new Function()` 0 error; curly-quote 0; tour.* dict ครบ th+en; first-run flow ครบ 6 สเต็ป spotlight ตรง target ทุกอัน (เทียบ getBoundingClientRect); click-gating กลืนคลิก nav จริง; empty-name ไม่ advance; reaching Start → homeRunScreen.show=true + key set; returning user (set onboard-seen) ทัวร์ไม่เด้ง; reduced-motion → cut/bubble/arrow visible (แค่ animation:none); skip กลางทัวร์ → ปิด layer+flow+key set+ nav ใช้ได้ปกติ. **หมายเหตุ:** `window._sqTimerState.status` เป็น probe ภายนอกที่ไม่ track running (อ่านได้ idle) แต่ `tourCheckFinish` อ่าน `state` ใน closure จริง → ทัวร์จบถูกต้อง (พิสูจน์จาก key ถูก set + homeRunScreen แสดง)
  - **[fix สำคัญ — overlay ค้างหลังกด Start]** User เจอบนเครื่องจริง: กด Start เควสเริ่มจริง (timer วิ่ง) แต่ spotlight+bubble ไม่หาย ค้างทับหน้า run. สาเหตุ = race: `tourCheckFinish` เดิมเช็ค `state.status` running **ครั้งเดียวที่ 230ms** แต่ real browser ตั้ง status ช้ากว่า (animation/async) + closure `state` กับ `window._sqTimerState` ดันแยกกัน (probe เห็น `_sqTimerState.status` ค้าง "idle" แต่ `homeRunScreen.show` เป็น true). แก้: `tourCheckFinish` เปลี่ยนเป็น **poll ทุก 130ms สูงสุด ~3s** + เช็คสัญญาณ `tourQuestRunning()` = status running/paused **หรือ** `#homeRunScreen.classList.contains("show")` (สัญญาณ definitive ว่าเควสรัน) → เจอเมื่อไหร่ปิดทัวร์ + toast `tour.done` ("เริ่มแล้ว โฟกัสได้เลย!"). verify: flow ปิดถูก (tourClosed=true) แม้ `_sqTimerState.status`="idle" (ปิดผ่าน homeRunScreen.show path)
  - **out of scope รอบนี้ (User เลือกแคบ):** menu coachmark (gate/break), copy rewrite ทั้งแอป, store items, มาสคอต Rive (ติดไฟล์ `dog.riv` ไม่ใช่โค้ด)
  - **ค้าง:** ยังไม่ commit / `npx cap sync android`. User ต้อง **hard-refresh (Ctrl+Shift+R)** (SW cache). ธีม inline ไม่มี asset ใหม่ จึงไม่บังคับ bump CACHE_NAME. รีเซ็ตทดสอบเอง: `localStorage.removeItem("qps_tour_done_v1");localStorage.removeItem("qps_onboard_seen_v2")` แล้ว reload

- **[2026-06-27] Landing / Trial-signup web page `www/welcome.html`** — ไฟล์ใหม่ standalone ยังไม่ commit/cap sync
  - **เป้า (User สั่ง):** สร้างเว็บลงชื่อทดลองใช้ SakuraQ คุณภาพ "ขั้นสุด" — พรีเมียม, **ห้ามดูกาก ห้ามดูเหมือน AI gen ห้ามดูเหมือนพนัน/สแกม**, ปลอดภัย, ใช้ง่าย, อนิเมชั่น+layout สวย, คำอธิบายกระชับแต่ไม่งง, โน้มน้าวว่าไม่ใช่แอปสแกม. ทำงานต่อเนื่องเอง แคปจอตรวจเอง หาบั๊กเอง
  - **ที่ตั้ง:** `www/welcome.html` (เดี่ยว ไม่แตะ index.html) — วางใน `www/` เพื่อ (1) แชร์ assets แบรนด์ (mascot.png/mascot-open.png/logo-192.png) (2) **origin เดียวกับ authDomain** → Google sign-in ทำงาน. include `auth.js` (shared) ได้ปลอดภัย เพราะ welcome ไม่มี `#authGate` element → `syncAuthGate()` return early ไม่มี gate โผล่
  - **โครงหน้า:** Hero (phone mockup จำลอง UI แอป + mascot.png + parallax ตามเมาส์ + วงแหวนนับถอยหลัง demo เดินจริงด้วย setInterval + sakura petals ร่วงด้วย WAAPI) → Features 6 การ์ด (line-icon SVG) → How it works 3 steps → **Trust band มืด (anti-scam)** → **FAQ accordion 5 ข้อ** (grid-rows 0fr→1fr transition, ปุ่ม +/− morph) → Signup card → Footer
  - **Signup = ซื่อสัตย์ (สำคัญ):** แอปจริงบนเว็บ **บังคับ Google login** (authGate บล็อก guest) → จึงทำ **Google เป็นปุ่มหลัก** (เข้าได้ทันทีจริง, `#googleLoginBtn` ให้ auth.js จับ) + แถบความปลอดภัย ("เข้ารหัสโดย Google · เห็นแค่ชื่อ+อีเมล · ไม่โพสต์แทนคุณ"). **อีเมล = newsletter รอง** ("ฝากไว้รับข่าว") ไม่ใช่ "รับลิงก์" (เพราะไม่มี backend ส่งเมลจริง — กันคำโm้). Google สำเร็จ → ฟัง `sq-auth-changed` (เฉพาะถ้า user กดปุ่มเอง `googleClicked`) → success + redirect `index.html`
  - **ฟอร์ม safety:** validate email regex, **honeypot 2 ช่อง** (`.hp` + `#suName` ซ่อน) → bot กรอกแล้วแกล้งสำเร็จเงียบๆ, queue ลง `localStorage['sq_trial_signups']` เสมอ (ไม่หาย), best-effort เขียน Firestore `trialSignups` ถ้ามี `window.sqDB/sqCloud` (บน welcome ไม่มี → local อย่างเดียว, graceful)
  - **พรีเมียม/กัน AI-look:** mascot แบรนด์จริง (ตัวแยกความเป็น AI ออกได้มากสุด), grain texture (feTurbulence opacity .04 multiply), gradient orbs drift, scroll-reveal IntersectionObserver + **safety-net setTimeout 2.6s add `.in` ทุกตัว** (กันเนื้อหาหายถ้า observer ไม่ยิง/JS-light/SEO), focus-visible rings (a11y), OG/Twitter meta, `prefers-reduced-motion` ปิด animation
  - **verify headless จริง (puppeteer-core + Chrome x86, ผ่าน static server เพราะ ES module):** 0 console error ทุก viewport (1280/820/390/320). ทดสอบ: hero+ทุก section เรนเดอร์, form invalid email→กรอบแดง+ข้อความ, valid→queue localStorage+success, FAQ open panel 66px ไม่ overflow, narrow 320 ไม่ล้น (phone `width:min(288px,82vw)`, news-row stack ที่ ≤400px). สคริปต์ทดสอบอยู่ใน scratchpad (shot.js/form-test.js/faq-test.js)
  - **[2026-06-27 ต่อ] เก็บอีเมล cloud จริง + ดูในแอป (Admin Panel):** ทำเสร็จแล้ว ทั้ง `welcome.html` + `index.html`
    - **welcome.html → เขียน Firestore จริง:** เพิ่ม `<script type="module">` ต่อจาก auth.js — `getApps().length?getApp():initializeApp(cfg)` (กัน double-init เพราะ auth.js init ไปแล้ว) → `getFirestore` → set `window.sqDB` + `window.sqCloud={collection,addDoc}`. ฟอร์ม `saveSignup()` เดิมเขียน `addDoc(collection(sqDB,'trialSignups'),rec)` ได้ทันที (rec={email,ts,ua,ref}). verify headless: welcome `sqDB=true, sqCloud.addDoc/collection=true`, 0 error
    - **index.html → แท็บ "สมัครทดลอง" ใน `#adminPanel`:** เพิ่ม `.adminTabs` (ปุ่ม `#adminTabUsers`/`#adminTabSignups`+`#adminSignupCount` badge) ระหว่าง `.adminUidLine` กับ `.adminBody`. JS ใหม่ (วางก่อน secret-entry, นอก IIFE เหมือน admin เดิม): `_adminTab`/`_adminSignups`, `adminSetTab(tab)` (toggle active+title+โหลด), `adminLoadSignups()` (getDocs `trialSignups` → sort ts desc → set count), `adminRenderSignups()` (การ์ด `.adminSignupCard`: avatar อักษรย่อ+email+วันเวลา+hostname+timeAgo). `openAdminPanel()` เปลี่ยนเป็นเรียก `adminSetTab("users")`. refresh ปุ่ม → `adminSetTab(_adminTab)`. wire ปุ่มแท็บใน `wireAdminPanel()`. ใช้ helper เดิม `adminEsc`/`adminTimeAgo`. verify headless: ฟังก์ชันครบ, แท็บ render การ์ดถูก, 0 error
  - **ค้าง — User ต้องตั้ง Firestore Rule เอง (สำคัญ ไม่งั้น read ไม่ได้/write ไม่ได้):** ใน Firebase Console → Firestore → Rules เพิ่ม block:
    ```
    match /trialSignups/{docId} {
      allow create: if request.resource.data.email is string && request.resource.data.email.size() < 200;
      allow read, delete: if request.auth != null && request.auth.token.email == "sacmaib80@gmail.com";
      allow update: if false;
    }
    ```
    (gate read ด้วย `token.email` ไม่ต้องใช้ UID). Admin ต้อง **login เป็น sacmaib80@gmail.com ในแอป** แล้วเปิด panel → แท็บสมัครทดลอง ถึงจะ getDocs ผ่าน
  - **[2026-06-27 fix] Admin เปิดไม่ได้ = `window.prompt` ถูกบล็อกบน PWA/APK:** แตะ debug 7 ครั้งทำงานอยู่แล้ว แต่ `promptAdminAccess()` เดิมเรียก `window.prompt("")` ซึ่ง **installed-PWA / Capacitor WebView มัก no-op** → ช่องรหัสไม่เด้ง เหมือนเปิดไม่ได้. แก้: ทำ **modal ในแอป `#adminGate`** (input password + ปุ่ม ยกเลิก/ตกลง + Enter submit, ไม่มี label ใบ้) แทน prompt — `promptAdminAccess` เปิด modal, `submitAdminGate` เช็ค `=== ADMIN_PASSWORD` แล้ว `openAdminPanel()`, ผิด=ปิดเงียบ. คง `window.prompt` เป็น fallback ถ้า markup หาย. wire ปุ่ม+backdrop ใน `wireAdminPanel`. verify headless: dispatch click 7 ครั้ง→gate show, รหัสผิด→ปิด/panel ไม่เปิด, `fann3367`→panel เปิด. **วิธีเข้า:** เปิดเมนู (☰) → บรรทัดเทาเล็ก "Install: … • SW: … • Mode: …" (อยู่ในเมนู ต้องเปิดเมนูก่อน) → แตะ 7 ครั้งรัวๆ → ใส่ `fann3367`
  - **[2026-06-27] Deploy แล้ว + Pivot เว็บเป็น "ดาวน์โหลด APK" (ไม่ใช่เข้าแอปผ่านเว็บ):** User สั่ง deploy + เปลี่ยน flow
    - **Firebase Hosting:** วาง `firebase.json` (public=`www`) + `.firebaserc` (project `sakuraq-b7f96`) ที่ repo root. User รัน `npx -y firebase-tools login` + `deploy --only hosting` เอง (ต้อง browser auth). Live: **https://sakuraq-b7f96.web.app/welcome.html** (เว็บลงชื่อ) / `…/` (ตัวแอป). domain `*.web.app`/`*.firebaseapp.com` authorized สำหรับ Google login อยู่แล้ว
    - **Pivot welcome.html → ดาวน์โหลด:** User ขอ **เอา Google-login-เข้าแอปผ่านเว็บออก** เปลี่ยนเป็น **ปุ่มดาวน์โหลด APK ลงเครื่อง**. ทำ: ลบปุ่ม Google + `secure-note` + JS (`googleClicked`/`sq-auth-changed` redirect) + เลิก include `auth.js` (เหลือแค่ Firestore-bridge module ที่ init เองด้วย getApps/initializeApp). section `#signup`→`#download`. ปุ่มหลัก `<a href="sakuraq.apk" download>` + `.file-meta` (~22MB/Android 6+) + `.install-steps` 3 ขั้น (อธิบายเตือน "แหล่งที่ไม่รู้จัก" = ปกติ, ลดกลัวสแกม). hero CTA/nav/footer → "ดาวน์โหลด" ชี้ `#download`. newsletter (อีเมล→Firestore `trialSignups`) **ยังอยู่** เป็นรอง. success state ปุ่ม → download
    - **APK:** copy `android/app/build/outputs/apk/debug/app-debug.apk` (build 26 มิ.ย. 23MB) → **`www/sakuraq.apk`** (stable URL `…/sakuraq.apk`). เพิ่ม `www/*.apk` ใน `.gitignore` (กัน commit binary ใหญ่ แต่ deploy ได้). **APK นี้เก่า 1 วัน** (ไม่มีแท็บ admin+gate modal ในตัว — ผู้ใช้ทั่วไปไม่กระทบ, owner ดู admin ผ่านเว็บได้). ถ้าอยากให้ APK มีของล่าสุด: `npx cap sync android` + `gradlew assembleDebug` แล้ว copy ทับ `www/sakuraq.apk` + redeploy
    - **verify headless:** ไม่มี `#googleLoginBtn`, ปุ่ม href=`sakuraq.apk` download=`SakuraQ.apk`, APK เสิร์ฟ 200 (MIME `application/vnd.android.package-archive`), `sqDB`+`addDoc` ยังพร้อม (newsletter ทำงาน), 3 install steps, 0 console error. การ์ดเรนเดอร์สวย
    - **APK rebuild ล่าสุด:** build ใหม่แล้ว (2026-06-27 23:34, 22.3MB, versionName 0.18.3/code 40) → `www/sakuraq.apk` มีของล่าสุดครบ (admin tab+gate modal). ดูขั้นตอนปล่อยเวอร์ชันใหม่ที่ section "🔁 ปล่อยเวอร์ชันใหม่" ด้านบน
    - **[2026-06-27] Refine ดีไซน์ welcome.html รอบ 2 (anti-AI) — User สั่งทำให้ไม่เหมือน AI:** ค้นข้อมูลจริง (เงา/ปุ่ม/สี). แก้ AI-tell หลัก: (1) **เงา** จาก glow ม่วงเรือง → **layered desaturated** (key+ambient, สีเข้ม (24,22,55) low-sat) ใน `--shadow-*`; (2) **ปุ่ม primary** จาก gradient+glow → **solid `#5b6af0` + inset top-highlight + เงา neutral** (crafted ไม่เรือง); (3) ลด **ม่วงเฉดมั่ว** — h1 จาก gradient-text → คำสีม่วง + ไฮไลต์ใต้คำ (`.grad::after`), brand "Q" solid, orbs จาง opacity .5→.22; (4) **ไอคอนฟีเจอร์** จากสี่เหลี่ยมไล่เฉดรุ้ง → **chip พื้นจาง + ไอคอนเส้นสีแบรนด์** (สไตล์ Linear/Stripe, คงรหัสสีหมวด); (5) bg `#f6f5ff`→`#f7f7fa`, line/ink เป็นกลางขึ้น. verify 0 error ทุก viewport
    - **[2026-06-27] guest mode = ถูก revert (เข้าใจผิด):** เคยเริ่มทำปุ่ม "ใช้แบบไม่ล็อกอิน" ใน authGate (เข้าใจผิดว่า User อยากให้แอปไม่บังคับ login) — **User ไม่ได้หมายความงั้น** (เขาถามเรื่อง tester list) → **revert หมดแล้ว** authGate กลับเป็นเดิมเป๊ะ (Sign in to continue + Google + footnote ภาษาอังกฤษ). **อย่าทำซ้ำ** เว้นแต่ User สั่งชัด
    - **ค้าง:** User ต้อง **redeploy** (`npx -y firebase-tools deploy --only hosting`) ให้เว็บ live = ดีไซน์ใหม่ + APK ล่าสุด. ยังต้อง Publish Firestore rule `trialSignups`. ลิงก์ "เงื่อนไข/นโยบาย" ยัง `#`. ยังไม่ commit index.html (admin tab+gate). welcome ไม่อยู่ใน sw.js APP_SHELL

- **[2026-06-26] Morning Gate top bar → ไอคอนกุญแจลอย ลากได้ (FAB) + ไฟ** — ทำใน `www/index.html` ยังไม่ commit/cap sync
  - **เป้า (User สั่ง):** รีบิวต์ UI Morning Gate ด้านบน (แถบแดงแนวนอน `#gateTopBar`) ใหม่ทั้งหมด → ให้เป็น **ไอคอนกุญแจลอยลากได้แบบลูกเต๋า** (ดึง badge หกเหลี่ยมแดง+กุญแจขาวออกมา), มี **นับถอยหลังใต้ไอคอน** คล้าย dice, ตอน lock โชว์ "ล็อก" ใต้ไอคอน, **ต่างจากลูกเต๋าคืออยู่ทุกหน้า**, + **อนิเมชั่นไฟตอนนับถอยหลัง 10 นาที**
  - **วิธี (คง state logic เดิมทั้งหมด — เปลี่ยนแค่ presentation):** เก็บ id เดิม `#gateTopBar`/`#gateTopTime` ไว้ → `renderGateUX()` ทุก branch ยัง set ค่าได้เหมือนเดิม ไม่ต้องแก้ flow
    - **markup** (~11377): `#gateTopBar` ครอบ `<button #gateFabBtn>` (มี `.gateFabFire` 10 เปลว + `.gateFabBadge` hexagon+`.sqLock`) + `.gateFabCd #gateTopTime` (ป้ายนับถอยหลัง/สถานะ ใต้ไอคอน) + `#gateTopTitle`/`#gateTopSub` ซ่อน (`.gateFabHidden display:none`) เพื่อไม่ให้ JS ที่ set textContent พัง
    - **CSS** (แทนบล็อก `.gateTopBar` เดิม ~1404): เปลี่ยนจากแถบ full-width เป็น FAB `position:fixed; flex-direction:column` default `top:10px right:14px`, ลากได้ (`.dragging` + wiggle), badge 52px hexagon, ป้าย pill. โทนสีคุมด้วย class เดิม: active=ม่วง `#5b6af0`, `.locked`=แดง, `.done`=เขียว. ไฟ `.gateFabFire` (reuse `.sqFireFlame`+`sqFireRise` ของปุ่มไฟ) opacity 0 → 1 เมื่อ `.firing`
    - **ไฟ:** เพิ่ม class `.firing` ใน branch นับถอยหลังสด (branch สุดท้ายของ `renderGateUX`, `gateTimeLeftSec`), reset ใน `setGateBarTone`/`hideGateTopBar` ทุกครั้ง → ไฟลุกเฉพาะช่วง 10 นาที. **ไม่ใส่ `@media prefers-reduced-motion` กับไฟ** (เครื่อง User เปิดลดการเคลื่อนไหว → ถ้า guard ไฟจะไม่ขึ้น; ไฟ=ตัวตนฟีเจอร์ จึงให้ลุกเสมอ — บทเรียนเดียวกับ vinyl disc)
    - **drag:** เพิ่ม `gateDrag` state + `KEY_GATE_POS` + `loadGatePos/saveGatePos/clampGatePos/applyGatePos/initGateDrag` (mirror ของลูกเต๋า), เรียกใน boot หลัง `initDiceDrag()`. click action ย้ายไป bind `el.gateTopBar` ทั้งก้อน + guard `if(gateDrag.moved)` กันลากจบเป็นคลิก
    - **ทุกหน้า:** FAB เป็น `position:fixed` ไม่ scope home (ต่างจาก dice) → ขึ้นทุกหน้า .app. ยังซ่อนตอน run/report (rule `body.homeRunVisible .gateTopBar` เดิม). ลบ rule push-down เดิม (`body.gateBarOn .app padding-top`, `.topMenu top:84px`) เพราะไม่ใช่แถบแล้ว
    - **i18n:** เพิ่ม `gate.fab.lock` (th "ล็อก" / en "LOCK"), แทน label "LOCKED" 3 จุดใน renderGateUX
  - **verify headless (puppeteer-core + Chrome x86):** FAB render flex/fixed/column, badge 52px hexagon+lock, นับถอยหลังใต้ไอคอน ✓; โทน active ม่วง / locked แดง ✓; ไฟ 10 เปลว `sqFireRise` **running แม้ emulate `prefers-reduced-motion:reduce`** (= setting ของ User) opacity 1 เมื่อ firing ✓; drag ตั้ง left/top + persist `qps_gate_pos_v1` ✓; main script `new Function()` 0 error; curly-quote 0; `gate.fab.lock` ครบ 2x; 0 pageerror
  - **[ตามมา] polish ตาม User:** (1) เอา purple override ออก → FAB **เป็นสีแดงทุกสถานะ** (ยกเว้น done=เขียว) ตามตัวตน Morning Gate เดิม. (2) เส้นกรอบสี่เหลี่ยมจางๆ = focus outline ของ `<button>` → `.gateFabBtn{outline:none;appearance:none}` + `:focus/:focus-visible{outline:none}`. (3) ขยาย btn 56→66px, badge 52→62px, lock scale .92→1.08. verify headless: badge แดง, outline none แม้ focus, 0 error
  - **ค้าง:** ยังไม่ commit / `npx cap sync android`. User ต้อง **hard-refresh (Ctrl+Shift+R)** (SW cache). ธีม inline ไม่มี asset ใหม่ จึงไม่บังคับ bump CACHE_NAME

- **[2026-06-26] Timer theme #2 "ไวนิลราตรี / Midnight Vinyl" (1000 แต้ม) — แผ่นเสียงหมุน (non-circular progress)** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **เป้า (User สั่ง):** ธีมหน้าจับเวลาตัวที่ 2 ที่ **ไม่ใช่วงแหวนวงกลม** (เบื่อแล้ว) — อาร์ตๆ เท่ๆ มีของหมุน, พรีเมียม, ราคา 1000 เท่า Aurora, จัดวางปุ่มสวย ไม่จำเป็นต้องธีมมืด. User เลือกคอนเซ็ปต์ **Vinyl** (จาก 4 ตัวเลือก: Vial/Hanami/Vinyl/Beam)
  - **ผลลัพธ์:** หน้าจับเวลา = เทิร์นเทเบิล โทนเข้มอบอุ่น (warm charcoal/wine + gold). แผ่นไวนิลหมุนต่อเนื่อง (`rtSpin 9s`), **หยุดหมุนตอน pause**, ป้ายกลางแผ่นทอง โชว์เวลาเป็นตัวอักษร espresso เข้ม (engraved, อ่านชัด), session pill เข้ม, **แขนเข็ม (tonearm) กวาดจากขอบนอกเข้ากลางแผ่นตามเวลา = progress แทนวงแหวน**, มีร่องวง + ประกายแสงกวาด (sheen) + needle tip เรือง
  - **เทคนิค (ปลอดภัยแบบ Aurora — CSS-only + inject, ไม่แตะ logic timer):**
    - `syncHomeRunScreen()` เพิ่ม **1 บรรทัด**: `rs.style.setProperty("--rt-progress", (1-fraction).toFixed(4))` (elapsed 0→1) ใน block `if(arc||dot)` — ไม่แตะ `strokeDashoffset`. แขนเข็มขับด้วย var นี้ผ่าน `transform: rotate(calc(16deg + var(--rt-progress)*31deg))`
    - **หยุดหมุนตอน pause** ใช้ของฟรี: `syncHomeRunScreen` toggle `.paused` บน `#hrGlowRotate` อยู่แล้ว → CSS `.runTheme-vinyl #hrGlowRotate.paused ~ .rtVinyl .rtDisc{animation-play-state:paused}` (sibling combinator, ทั้งคู่เป็นลูก `.hrRingWrap`; `#hrGlowRotate` ตั้ง `display:none` ไม่กระทบ `~`)
    - `applyEquippedCosmetics()` timerTheme branch: generalize reset (`classList.remove("runTheme-aurora","runTheme-vinyl")` + ลบ `.rtFx, .rtVinyl`) + เพิ่ม branch `theme==="vinyl"` → add class + `ringWrap.appendChild(.rtVinyl)` (disc/groove/shine/spindle + label + sheen + arm). **inject เข้า `.hrRingWrap` (ไม่ใช่ runScreen)** เพื่อให้ sibling selector ของ pause ทำงาน
    - CSS block ใหม่ `.runTheme-vinyl` ต่อท้าย Aurora (~บรรทัด 7387+): ซ่อน `.hrRingSvg`+`#hrGlowRotate`, disc/label/arm/dock โทนทอง, pause orb ทองเรือง (`rtOrbBreathV`), `@media prefers-reduced-motion` ปิด animation
    - STORE_ITEMS slot timerTheme เพิ่ม `{id:"timer-vinyl",price:1000,theme:"vinyl",swatch:...}` (preview การ์ด = แผ่นไวนิล gradient). i18n `store.item.timerVinyl` th "ไวนิลราตรี" / en "Midnight Vinyl"
  - **verify headless จริง (puppeteer-core + Chrome ที่ `C:/Program Files (x86)/...`):** seed equipped ลง `qpsData_v4_guest` แล้ว reload → boot()→applyEquippedCosmetics inject จริง ✓; ring ซ่อน ✓; arm transform ตาม var ✓; **dock พอดีจอ 422px ไม่ล้น** (left 26 → right 396) ✓; spin+pause ทำงาน (ต้อง emulate `prefers-reduced-motion:no-preference` เพราะ headless default = reduce ปิด animation) ✓; unequip revert สะอาด ✓; 0 console error จริง; syntax `new Function()` 0 error; curly-quote 0 ในโค้ดใหม่; i18n key ครบ 2x; store card "Midnight Vinyl · 1000" ขึ้นถูก
  - **[fix ตามมา] แผ่นไม่หมุนบนเครื่อง User = reduced-motion:** เครื่อง User เปิด "ลดการเคลื่อนไหว" (Windows animations off / browser reduced-motion) → กฎ `@media (prefers-reduced-motion: reduce)` เดิมปิด animation ทั้งหมดรวมการหมุนแผ่น. แก้: ให้กฎ reduced-motion ปิดเฉพาะ `.hrStop` (orb breath) เท่านั้น **แผ่นหมุนเสมอ** (การหมุน = ตัวตนธีม). + เร่ง `rtSpin` 9s→**4s** + เพิ่มแสงสะท้อน 2 gleam ใน `.rtShine` (ร่องแผ่นสมมาตร มองไม่เห็นหมุน ต้องมี gleam เป็นตัวบอก). verify headless emulate `prefers-reduced-motion:reduce` → disc `animationName:rtSpin running` ✓, 2 เฟรมห่าง 0.6s gleam หมุนเห็นชัด ✓
  - **[polish ตามมา] แสงทะลุนอกวง + เลขทับขอบป้าย:** (1) `.rtSheen` เดิมใช้ `transform:translateX(±9%)` ขยับทั้งวงกลม → ขอบโผล่พ้นแผ่น. แก้เป็น sweep ด้วย `background-position` (วงอยู่กับที่, `border-radius:50%` คลิปลำแสงในแผ่นเสมอ) — verify `sheenWithinDisc:true`. (2) `.rtShine` conic เดิมกว้าง 64° ดูเป็นพาย → ทำให้แคบ/นุ่ม (gleam 0–22° & 180–198°) เป็นแสงสะท้อนจริง. (3) เลขเวลาทับขอบป้าย → ลดฟอนต์ `clamp(38,10.5vw,52)`→`clamp(32,8.8vw,44)` + ขยายป้าย 52%→55%
  - **ค้าง:** ยังไม่ commit / `npx cap sync android`. User ต้อง **hard-refresh (Ctrl+Shift+R)** (SW cache). ถ้า ship จริงค่อย bump `CACHE_NAME` ใน sw.js (ธีม inline ไม่มี asset ใหม่ จึงไม่บังคับ). slot homeTheme/effect ยังเป็น TODO

- **[2026-06-21] Store / Wallet feature — แท็บร้านค้า + ใช้คะแนนซื้อ cosmetics (scaffold)** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **เป้า (User สั่ง):** เพิ่มแท็บ "Store" ใน bottom nav + หน้าร้านธีมเดียวกับแอปแต่ลุค shop, native, **ห้ามอิโมจิ ห้ามเรืองแสง**. เพิ่มฟังก์ชันใช้คะแนนซื้อของ → **หักจากคะแนนรวม แต่ไม่แตะคะแนนรายหมวด/เลเวล**. ยังไม่มีภาพ cosmetics → ทำช่อง + logic equip รอไว้
  - **การตัดสินใจที่ User เลือก:** (1) **Wallet แยก, เลเวล/สตรีคไม่ลด** — `spendable = lifetime earned − spent`; level/streak ยังใช้ gross `calcLifetimeQps()`. (2) **Cosmetics = scaffold + logic เท่านั้น** — buy/own/equip ทำงานจริง+persist แต่ `applyEquippedCosmetics()` เป็น **no-op** (ยังไม่เปลี่ยนหน้าตา)
  - **Data:** เก็บใน `appData.prefs.store = { purchases:[{ts,itemId,cost}], owned:{}, equipped:{} }` (prefs persist+cloud-sync อยู่แล้ว). helper `getStoreData(all)` ensure shape (mirror `ensureDay`)
  - **Scoring helpers** (วางก่อน `/* ===== RENDER ===== */` ~20290 ใน script #5): `calcTotalSpent()`, `calcSpendablePoints()` = `max(0, lifetime − spent)`. **ไม่แตะ** `renderHomeHud` level (คง gross), **ไม่แตะ** category minutes
  - **Logic:** `STORE_ITEMS` catalog (4 slots: buttonColor/homeTheme/timerTheme/effect; มี item ซื้อได้จริง + locked "เร็วๆนี้"), `findStoreItem/buyStoreItem/equipStoreItem/applyEquippedCosmetics/renderStorePage`. buy เช็คเงินพอ→toast ผ่าน `showActionLockBar`, push purchase, `saveAll`. equip = toggle. ใช้ `t()` ตรงๆ ใน dynamic HTML (ไม่พึ่ง applyStaticI18n)
  - **UI:** (a) nav tab ที่ 5 (ก่อน Menu) `data-page="storePage"` + `.navIconStore` (Material store mask) + ขยาย `.bottomNav` 340→392px, ลด padding ปุ่ม. (b) `#storePage` section (`.app page`) header+wallet pill+grid+footnote. (c) Home wallet row ใน homeProgressCard (`#homeWalletValue`, คลิกไป store) อัปเดตใน `renderHomeHud`. (d) History `#histSpentLine` ใต้ hero (โชว์เมื่อ spent>0) อัปเดตใน `renderHistoryPageStub` — **ไม่แตะ range total** (productivity เดิมคงไว้)
  - **Hooks:** `switchPage` เพิ่ม branch `storePage`→`renderStorePage()`; `boot()` เรียก `applyEquippedCosmetics()` หลัง renderBreakUI
  - **i18n:** addI18N block `store.*` (22 keys th/en) ก่อน END marker
  - **verify (node v24):** main script #5 compile ผ่าน (error เดียว = Firebase ES module ปกติ), curly-quote 0, store.* dict keys 22 ครบ 2x ทุกตัว, nav buttons = 6, helpers/markup/hooks ครบ
  - **หมายเหตุ deviation จากแผน:** แผนเดิมจะ swap History hero เป็น net แต่ hero จริงเป็น **range-based (7d default)** ไม่ใช่ lifetime → ถ้าหักจะ underflow → เปลี่ยนเป็นเพิ่ม `#histSpentLine` แทน (faithful กว่า). User ต้อง **hard-refresh (Ctrl+Shift+R)**
  - **อนาคต:** ใส่ art แล้ว implement branch ใน `applyEquippedCosmetics()` (มี TODO ต่อ slot ไว้แล้ว)
  - **[ตามมา 21:13] ปรับตาม User:** (1) **ลบ wallet display ออกจาก Home (`homeWalletRow`) + History (`histSpentLine`)** ทั้ง markup/JS/CSS — wallet โชว์เฉพาะในหน้า Store พอ (ยังไม่จำเป็น). logic `calcSpendablePoints` คงไว้ (Store ใช้). (2) **slot สีปุ่มทำงานจริงแล้ว** — `applyEquippedCosmetics()` set inline `background` (`!important`) ให้ `#homeStartQuestBtn` ("ไปต่อกันมั้ย?") ตาม `swatch` ของ item ที่ equip (ม่วงคราม/ไวโอเล็ต/ชมพูโรส), ถอด=`removeProperty` คืนสีเดิม. **ทำเฉพาะปุ่มนี้ปุ่มเดียวก่อน** ตามที่ User สั่ง (ปุ่มอื่น/ธีม/เอฟเฟกต์ ยังเป็น TODO). verify headless: equip→ปุ่มชมพูจริง, ถอด→คืนค่า, คะแนนหัก, lifetime คงเดิม, 0 error
  - **[ตามมา 22:xx] Fire button skin + Dice skins (ทำต่อจาก store):**
    - **ปุ่มไฟ (`btn-fire`, 500, slot buttonColor):** base = gradient ส้ม→แดง flat (ไม่นูน), glow เหลืองบางๆ, ไอคอนไฟ SVG ซ้าย (ไม่ใช่อิโมจิ). เปลวเพลิงลายเส้นการ์ตูน (SVG fill+stroke) **โผล่ตอน hover/จิ้ม** (ขับด้วย JS pointer events `_sqWireFireFx` → class `sqFireLit`, ใช้ได้ทั้งเมาส์+ทัช), ไฟ 11 ลิ้นลอยขึ้น-จาง-เกิดใหม่ (`sqFireRise`) กองซ้าย+ขวา อยู่**เหนือ**ปุ่ม. CSS `.sqBtnFire*` / `.sqFireFx` / `.sqFireFlame`. **บั๊กสำคัญที่เจอ:** `.sqFireFx` โดน rule อื่น force `position:relative` → width 0 → ไฟกองซ้าย แก้ด้วย scope `#homeStartQuestBtn...sqBtnFire .sqFireFx{position:absolute!important;width:auto!important}`
    - **ลูกเต๋า (slot `dice`):** 4 แบบ — `dice-glass`(200), `dice-catblack`(500), `dice-catpink`(500), `dice-marble`(200). ปั้น CSS mini-dice ละเอียด: หน้าเต๋า "4" จุด **concave/บุบเข้า** (inset shadow, ดันไปมุม 14%/86% ไม่กระจุกกลาง) + decoration ต่อ variant: แก้ว=ไฮไลต์เงา+ประกายดาว, แมวดำ=หู outline นีออน+หนวด 3 เส้นเรือง+หัวใจกลาง, แมวชมพู=หู+ซากุระ+อุ้งเท้า, หินอ่อน=ลายเส้นหิน+กรอบทอง. markup กลางจาก `sqDiceInnerHTML()` (ใช้ทั้งร้าน+ปุ่มจริง). CSS `.storeDice*`
    - **เชื่อมลูกเต๋าหลักแล้ว:** `applyEquippedCosmetics()` equip dice → overlay `.sqDiceOverlay.storeDice-<variant>` ทับปุ่ม `#diceBtn` (60px, ปกติวาดจุดด้วย `.diceIcon::before` radial-gradient) + class `sqDiceSkinned` ซ่อนจุดเดิม/พื้น/gloss เดิม. ถอด=ลบ overlay+class. reuse CSS เดิมทั้งหมด
    - **i18n:** `store.item.btnFire` + `store.slot.dice` + `store.item.dice*` (th/en) ครบ
    - verify headless (puppeteer-core + Chrome) ผ่านทุกอย่าง: equip/unequip/สลับ skin, overlay ไม่ซ้อน, จุด concave, decoration ขึ้นถูก variant, syntax 0 error
    - **ค้าง (User จะจูนพรุ่งนี้):** ความเป๊ะของหน้าตาลูกเต๋าเทียบรูปต้นฉบับ (จุด concave ตื้น/ลึก, ตำแหน่ง decoration). slot homeTheme/timerTheme/effect ยังเป็น TODO. ยังไม่ commit/cap sync
  - **[2026-06-22] ลูกเต๋าใช้รูปจริง (PNG) + cache fix:** เปลี่ยนจาก CSS dice เป็น `<img>` รูปจริง 4 ไฟล์ `www/dice-{glass,catblack,catpink,marble}.png` (User เซฟเอง, ผม auto-crop ขอบโปร่งด้วย puppeteer canvas: 1536×1024 → ~340px ชิดตัว). render: `<img class="storeDiceImg" src="...?v=2" onerror="this.remove()">` ทับ CSS dice (fallback), ซ่อน CSS ด้วย `:has()`. overlay บนปุ่มจริงใช้ `.sqDiceOverlayImg`. **ปัญหา cache:** sw.js เป็น cache-first → bump `CACHE_NAME`→`v0-17-3-dice` + ใส่ `?v=2`. แมวดำมีหู/หนวดยื่น เลยขยาย `[src*="catblack"]`→88px(ร้าน)/74px(ปุ่ม). **homeTheme ที่ลองใส่ → User ไม่เอา revert ออกหมดแล้ว** (ตัวละคร/UI ทับฉาก)
  - **[2026-06-22] Timer theme "Aurora ราตรี" (1000 แต้ม) — CSS-only premium skin:** ของจริงอันแรกของ slot timerTheme. ทำเป็น **skin ทับ `#homeRunScreen`** (ไม่แก้ DOM เดิม): `applyEquippedCosmetics()` toggle class `runTheme-aurora` + inject `.rtFx` (3 ริบบิ้นออโรร่า blur+screen drift, 2 ชั้นดาว box-shadow twinkle). วงแหวน `#hrArc` ใช้ `<linearGradient id="rtAuroraGrad">` (teal→violet→pink, เพิ่ม `<defs>` ใน svg.hrRingSvg) — **CSS แตะแค่ `stroke`+`filter` ไม่แตะ dashoffset/dasharray/transition → timer เดินปกติ**. + เลขเวลา gradient+shimmer, hrChip/hrBadge กระจกฝ้า, hrControls เป็น frosted dock, ปุ่ม Pause เป็น orb เรืองหายใจ, มี `prefers-reduced-motion`. STORE_ITEMS แทน locked placeholder ด้วย `{id:"timer-aurora",price:1000,theme:"aurora",swatch:...}`. i18n `store.item.timerAurora` th/en. **verify headless ผ่าน** (equip→class+fx+gradient ring+sky, หัก1000, ถอด revert, dashoffset ไม่โดนแตะ, 0 error). ดูได้ตอนเริ่มเควส (Timer screen). ยังไม่ commit/cap sync
  - **[เหตุการณ์ 21:13] "คะแนนหาย" = false alarm:** User ตกใจคะแนนรีเป็น 2 — สอบสวนแล้ว **ข้อมูลไม่หาย** สาเหตุคือ login สลับหลาย Google account (ข้อมูล scope ตาม uid) เลยเห็นข้อมูลบัญชีเทส. บัญชีหลัก `sacmaib80@gmail.com` (uid `O7Yd3AzxuH...`) = 86 วัน 4816 คะแนน อยู่ครบบน Firestore (เช็คผ่าน Admin Panel + getDocs). store code บริสุทธิ์ (diff ไม่แตะ save/score, headless ซื้อแล้วข้อมูลครบ). **latent bug จริงที่ยังไม่แก้:** `cloudLoadAll` อาจทับ local ด้วย snapshot timestamp ใหม่กว่าแต่ข้อมูลน้อยกว่า (guard เดิมกันแค่ cloud ว่าง 100%) → User อาจให้ใส่ guard กัน cloud ทับ + auto-backup ทีหลัง

- **[2026-06-21] Hidden Admin Panel — ดูกิจกรรม user คนอื่น (owner-only)** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **เป้า:** เครื่องมือลับในแอป ให้เจ้าของดูการเคลื่อนไหวของ user คนอื่น (เปิดบ่อยแค่ไหน/streak/ทำเควสจริงไหม) โดยคนอื่นไม่รู้ว่ามี
  - **หลักการความปลอดภัย:** รหัส `fann3367` กันแค่หน้าจอ (อยู่ใน JS ที่ ship ทุกเครื่อง). boundary จริง = **Firestore Security Rules** ที่ให้อ่าน doc คนอื่นได้เฉพาะ UID เจ้าของ → ถ้าไม่ตั้ง rule `getDocs` จะ permission-denied (panel โชว์ข้อความบอกให้ก๊อป UID ไปตั้ง rule)
  - **B. Firestore imports** [~12293]: เพิ่ม `collection, getDocs` + expose `window.sqCloud = {doc,setDoc,getDoc,collection,getDocs}`
  - **C. เก็บ identity** ใน `cloudSaveAll`: setDoc payload เพิ่ม `email`/`name` จาก `window.sqAuth` (merge) → แยกออกว่า uid ไหนคือใคร (doc เดิมไม่มี ต้องรอ user นั้น save ครั้งถัดไป)
  - **D. Entry ลับ:** แตะ `#pwaDebugLine` (บรรทัด "Install: WEB...") 7 ครั้งภายใน 2 วิ → `window.prompt("")` (ช่องว่างเปล่าไม่ใบ้) → ถ้า === `ADMIN_PASSWORD` เปิด panel, ผิด=เงียบ
  - **E. `#adminPanel`** overlay (style `.dataPanel`, dark): header (back/refresh/close + โชว์ UID เจ้าของ) + list view (การ์ดต่อ user: ชื่อ/email, last active, streak, เควส, วัน, คะแนน, sparkline 7 วัน) + detail view (stat grid + sparkline 14 วัน + เควสล่าสุด 20). render ด้วย JS, แตะ backdrop ปิด
  - **F. helpers** (อยู่**นอก** main IIFE ที่ปิดบรรทัด 18743 → ต้อง self-contained ไม่พึ่ง `localDateKey`/`addDays`/`round1` ข้างใน): `adminDateKey`/`adminAddDays`/`adminRound1`/`adminTimeAgo`/`adminCalcStats(data)` (รับ appData object ตรงๆ ไม่ผ่าน localStorage) — heuristic "เควสจริง" = `minutesSpent >= 5`
  - **G.** ตั้งใจ**ไม่ใส่ i18n** (เห็นแค่เจ้าของ) | **H.** ไม่แตะ `sw.js` (inline, ไม่มี asset ใหม่)
  - **ค้าง — User ต้องทำเอง:** ตั้ง Firestore Security Rule ใน Firebase Console (เพิ่ม `allow read: if request.auth.uid == "<OWNER_UID>"` ใน `match /users/{uid}`) เอา UID จากที่ panel โชว์. ดูแผนเต็ม `~/.claude/plans/auth-radiant-bentley.md`
  - ผ่าน node syntax check (5 scripts, 0 errors) + verify admin block ไม่อ้าง IIFE-only helper

- **[2026-06-21] Rive interactive mascot — โครงโค้ด + fallback (รอไฟล์ `dog.riv`)** — ทำใน `www/index.html` + `www/sw.js` ยังไม่ได้ commit/cap sync
  - **เป้า:** หมาหน้า Home มองตามเมาส์ + ตอบสนอง hover/คลิก + idle (User เลือกแนวทาง **Rive rig**)
  - **ของเดิม:** mascot = `<video> fox-idle.webm` (พิกเซลอัดมาแล้ว → CSS กลอกตาตามเมาส์ไม่ได้)
  - **ทำแล้ว (โค้ด, asset-agnostic):**
    - vendor runtime: `www/rive.min.js` (@rive-app/canvas 2.38.1, UMD → `window.rive`) + `www/rive.wasm` → ตั้ง `RuntimeLoader.setWasmUrl('./rive.wasm')`
    - markup: เปลี่ยน `<video class=foxMascot>` เป็น `<div id=mascotWrap class=foxMascot>` ครอบ `<video id=mascotVideo>` (fallback, นิยามความสูง box) + `<canvas id=mascotRive hidden>`
    - CSS: `.foxMascot .mascotVideo{width:100%;height:auto}` (เป็นตัวกำหนดสูง), `.mascotRive{position:absolute;inset:0}`, `.foxMascot.riveOn .mascotVideo{visibility:hidden}` (คง layout) + `.mascotRive{pointer-events:auto}`
    - JS `initMascotRive()` (เรียกใน `boot()` หลัง `finishBootOverlay`): สร้าง `rive.Rive({src:'./dog.riv',stateMachines:'Dog',layout:contain/bottomCenter})`; `onLoad` → map inputs + `canvas.hidden=false` + `wrap.classList.add('riveOn')` + pause video. ถ้าไม่มี runtime/`dog.riv` 404 → **คงวิดีโอเงียบๆ (ไม่ error)**
    - cursor: `pointermove` บน `#homeScene` → normalize 0–100 → loop lerp damping 0.18 → set `lookX/lookY`. hover → `isHover`, pointerdown → `poke.fire()`. เคารพ `prefers-reduced-motion`
    - perf: `mascotSyncPlayState()` (`window._sqMascot.sync`) pause/play ตาม `document.hidden` / `homeRunVisible` — wire ใน show/hideHomeRunScreen + visibilitychange
    - `sw.js`: เพิ่ม `rive.min.js`/`rive.wasm`/`fox-idle.webm` ใน APP_SHELL, bump `CACHE_NAME`→`sakuraq-v0-17-2-rive`. **ไม่ใส่ `dog.riv`** (ยังไม่มี → addAll จะ fail; cache ผ่าน runtime fetch แทน)
  - **verify:** headless Chrome → runtime โหลด, video visible (421×317), canvas hidden, **ไม่มี pageerror** (dog.riv 404 graceful). main script syntax OK
  - **ค้าง — งานออกแบบที่โค้ดทำไม่ได้:** ต้องสร้าง `www/dog.riv` ใน **Rive editor** ตาม contract: State Machine ชื่อ `Dog`, inputs `lookX`/`lookY` (Number 0–100, กลาง 50), `isHover` (Bool), `poke` (Trigger), default state = idle. วางไฟล์แล้วทำงานทันทีไม่ต้องแก้โค้ด

- **[2026-06-21] Morning Gate locked top bar — safety-net guard** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **อาการที่ user แจ้ง:** ตอน gate ล็อก แถบบน (`#gateTopBar` LOCKED + ปุ่มปลดล็อก) ไม่ขึ้น
  - **ตรวจสอบจริงด้วย headless Chrome (puppeteer-core):** สร้าง locked state สด (trigger −15 นาที) แล้ววัด → `#gateTopBar` แสดงถูกต้องอยู่แล้ว (`show=true, display=block, z=10040, top=8, text="LOCKED"`) ทั้งหน้า Home และตอนเปิด quest flow. โค้ด bar เหมือนกันทั้ง HEAD และ working tree (ไม่ใช่ regression), SW เป็น network-first จึงไม่ใช่ cache เก่า → สรุปว่าน่าจะมี gate runtime state แปลกๆ ที่พา `renderGateUX()` ไป branch อื่น
  - **แก้ (เผื่อ edge case):** เพิ่ม **early-return guard** ต้น `renderGateUX()` (หลังเช็ค gatePage, ก่อน `if(!gateCfg.enabled...)`): ถ้า `isGateActiveToday() && gate.locked && !gate.unlocked && !gate.passed && !hasQuestAfterTodayTrigger()` → `showGateTopBar()` + `setGateBarTone("locked")` + LOCKED แล้ว return ทันที. เงื่อนไขนี้ = `gateIsHomeLocked()` (เดียวกับที่ล็อกปุ่ม Start) → ปุ่มล็อกเมื่อไหร่ แถบขึ้นเมื่อนั้น deterministic
  - ผ่าน node syntax check (main script `new Function()` OK) + headless verify ว่า bar ยังขึ้นปกติหลังแก้
  - **user ต้อง hard-refresh (Ctrl+Shift+R)** เพื่อโหลดโค้ดใหม่

- **[2026-06-16] Dice language fix — built-in pools ตาม currentLang เสมอ, ไม่ปนข้ามภาษา** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **ปัญหา:** ลูกเต๋าเอา "ข้อมูลเสริมที่เราใส่ไว้" (pool `rq.*`) ของอีกภาษามาปนในชื่อเดียวได้ แม้สลับภาษาแล้ว เพราะ `rqPickGenLang()` เลือกภาษาต่อรอบแบบ history-weighted (ภาษาอื่นโผล่ได้สูงสุด 50%)
  - **แก้:** ลบ `rqPickGenLang()` + `_rqRollLang` + `rqDetectLang()` ทิ้ง → `rqLoc(key)` อ่าน `I18N[currentLang]` ตรงๆ เสมอ. built-in pools (workflow/bodypart/cardio/connection/learn*/work*/fallback*) จึงตามภาษาปัจจุบันเสมอ
  - **history ไม่ถูกแตะ (ตามที่ user สั่ง):** เอา `.filter(d => rqDetectLang(d) === …)` ออกจาก `rqBuildLearningQuest`/`rqBuildWorkQuest` → domain จาก history ไหลผ่านได้ทุกภาษา (ปนได้ ไม่เป็นไร). `rqMatchIndex()` ยัง match th+en เพื่อ map ชื่อ history กลับเป็น index คงเดิม
  - **แทนที่ Phase 3** (history-weighted language) ด้วย logic นี้ — เจตนาเปลี่ยนตาม user (built-in = ภาษาเดียว, history = ปนได้)
  - ยังไม่ได้ run node syntax check (ไม่มี node ใน environment นี้) — ตรวจ braces/refs ด้วยตา + grep ยืนยันไม่มี ref ของ symbol ที่ลบหลงเหลือ

- **[2026-06-09] Break Time Feature** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **ฟีเจอร์ใหม่**: ระบบบังคับพักหลังเควส + หักคะแนนถ้าพักนานเกิน
  - **Menu**: ปุ่ม "Break Time" ลำดับ 2 ใน `#topMenu` (หลัง Morning Gate)
  - **Break Panel**: `#breakPanel` (`.dataPanel` pattern) มี info tooltip, mascord.png warning, enable/disable button, 2hr cooldown hint
  - **Confirm Modal**: `#break-enable-confirm-modal` (mascord.png + คำเตือน) ก่อนเปิด
  - **Home Banner**: `#homeBreakBanner` แสดง countdown (green→amber→red) ในหน้า home
  - **Logic**: `triggerBreak(mins)` หลัง `stopQuest()`/`forceAutoStop()` → breakEndTs = now + (10 + floor(mins/2)) นาที, graceEndTs = breakEndTs + 1 นาที
  - **Penalty**: `applyBreakPenalty()` เขียนใน `day.breakPenalties[]` ใน appData (sync cloud); -2/-4/-6 pts ตาม tier; detect ผ่าน tick loop (250ms) + `checkBreakPenaltyOnStart()` ใน `startQuest()`
  - **Score**: `calcEffectiveDayTotal()` = totalQps - sum(penalties) ใช้ใน renderToday/renderTodayPage/renderHomeProgress/renderHomeHud/updateHomeGreeting/getHistorySummary/getHistoryExtraStats/getHistoryTrendData
  - **Today cards**: penalty card (orange/lightRed/darkRed) ใน `#todayList` + tpQuestList
  - **Storage**: `KEY_BREAK_CFG`/`KEY_BREAK_STATE` ใน localStorage scoped (ไม่อยู่ใน appData เหมือน gate bug fix)
  - **Cooldown**: toggle ได้ทุก 2 ชั่วโมง (`BREAK_TOGGLE_COOLDOWN_MS`)
  - **OS Noti**: `scheduleBreakEndOS()`/`cancelBreakEndOS()` schedule notification ตอนพักหมด
  - **i18n**: `break.*`, `noti.break.*` ทั้ง th/en
  - **bug fix #1**: breakTickHandle แยก interval (1s) → banner countdown ไม่แช่แข็ง
  - **bug fix #2**: History page ใช้ `calcEffectiveDayTotal()` ทุกจุด (summary/extra/chart/selectedTotal)
  - **bug fix #3**: `updateHomeGreeting()` ใช้ `calcEffectiveDayTotal()` แทน `calcDayTotal()`
  - **bug fix #4**: `discardReport()` เรียก `clearBreakState(); renderBreakUI()` — break reset ตอน discard
  - **bug fix #6**: `applyBreakPenalty()` ใช้ `localDateKey()` แทน `triggeredAtDateKey` — penalty ไปวันที่หักเงิน ไม่ใช่วันเควส
  - **bug fix #7**: `triggerBreak()` guard `if(questMinutes < 1) return` — เควส 0 นาทีไม่ trigger break
  - **bug ที่ยังไม่แก้ (ค่อยทำทีหลัง)**:
    - **#5**: Banner แสดงแค่หน้า Home ไม่แสดงหน้า Today/History/Schedule
    - **#8**: mascot warning ใน panel แสดงตลอด แม้แค่ดู info ไม่ได้กด enable
    - **#9**: `calcLifetimeQps()` ไม่หัก break penalties — ตัวเลข lifetime สูงเกิน
    - **#10**: streak calculation อาจได้รับผลกระทบจาก penalty ที่ทำให้คะแนนวันนั้นเป็น 0
  - ผ่าน node syntax check (0 errors)

- **[2026-06-06] Morning Gate UI — Color & Glow Redesign** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **สีการ์ด**: `#a52020→#520a0a` → **`#B51D1D→#8E1313`** (สว่าง/สะอาดขึ้น ตาม mockup)
  - **Glow**: ขยาย box-shadow 3 ชั้น (35→50px, 85→110px, 170→220px spread) + opacity เพิ่ม
  - **Ring**: gradient orange→pink (`#FF9CB5→#FF6B7A`), dot gold→pink `#FF9CB5`
  - **MORNING GATE badge**: glass style `rgba(255,255,255,.10)` + border `rgba(255,107,122,.35)`
  - **ตัวเลขวงนาฬิกา**: `36px → 30px`
  - **bug fix**: เพิ่ม `z-index:1` ให้ `.gateCard` ป้องกัน mascot หายเมื่อมี backdrop-filter child; ลบ `backdrop-filter` ออกจาก `.gateTitlePill` (ทำให้ compositing layer พัง)
  - **ยังเหลือ**: user รู้สึก UI น่าจะดีได้มากกว่านี้ → ค่อย polish ครั้งหน้า

- **[2026-06-06] Bilingual i18n — Phase 3 (Random Quest: history-weighted language + coherent per-quest)** — ทำใน `www/index.html` (RQ engine) ยังไม่ได้ commit/cap sync
  - **ปัญหาที่แก้:** เควสสุ่มเคยผสมภาษาในชื่อเดียว (domain ไทยจาก history + action อังกฤษ) เพราะ domain ดึงจาก history ทุกภาษา
  - **`rqPickGenLang()`** (ข้าง `rqLoc`): เลือกภาษา **1 ภาษาต่อ 1 การสุ่ม** นับ history `lookbackDays` วัน → ภาษาปัจจุบันได้ขั้นต่ำ ~50%, ภาษาเก่าโผล่ได้สูงสุด 50% ตามสัดส่วน (`pOther = otherN/total * 0.5`), ไม่มี history → ปัจจุบัน 100%. `rqDetectLang(name)` = มีอักขระไทย→th
  - **`_rqRollLang`** state + แก้ `rqLoc(key)` ให้อ่านภาษานี้ (อ่านจาก `I18N[lang][key]` ตรงๆ ไม่ใช่ `tList`); ตั้งค่าครั้งเดียวต้น `rqPick()` ก่อน loop → ทุก templated part กลมกลืนภาษาเดียว
  - **กัน mixing:** `rqBuildLearningQuest`/`rqBuildWorkQuest` กรอง `rqGetDomainsFromHistory(cat)` ให้เหลือเฉพาะ domain ที่ `rqDetectLang === _rqRollLang` ก่อน pick; ถ้าไม่มี → fallback `rqLoc(...)` (ภาษาที่เลือก)
  - **คงเดิม:** repeat method (~40%) ยังคืนชื่อที่ผู้ใช้พิมพ์เอง verbatim (ไม่ผ่าน rqLoc); rqMatchIndex ยัง match 2 ภาษา. rqLoc ถูกเรียกเฉพาะใน builders (ผ่าน rqPick) → stale `_rqRollLang` ระหว่างรอบไม่มีผล
  - ผ่าน node syntax check (0 errors) + sim distribution ถูกต้อง

- **[2026-06-06] Bilingual i18n — Phase 2 (Random Quest generator + คำที่ตกหล่น)** — ทำใน `www/index.html` ยังไม่ได้ commit/cap sync
  - **คำที่ตกหล่น**: `hpHeroLabel` "คะแนนรวม"→`hist.totalScore`, `hqCatDesc` 4 หมวด→`cat.desc.*`, `hqQuestName` placeholder→`hq.namePh`
  - **Random Quest generator เป็น 2 ภาษาจริง**: ย้ายเนื้อหา pool ทั้งหมดเข้า dict `rq.*` (workflow/bodypart/cardio/connection/learn.language|math|generic/learnDomains/workDomains/fallback.low|mid|high) เป็น array th/en เรียง index เดียวกัน. `SQ_DICE_GEN` เหลือแค่ `durations`/`kw`/`fallbackCat` (language-neutral); ลบ `SQ_WORK_FLOW` ทิ้ง
  - **helper ใหม่** (ข้าง generator): `rqLoc(key)`=`tList(key)` (ภาษาปัจจุบัน), `rqMatchIndex(name,key)`=คืน index ที่ name มี substring ตรงกับ th **หรือ** en → stored history ภาษาไหนก็ map กลับเป็น id เดิมได้
  - **logic ทำงานบน index แทนข้อความไทย**: `rqGetLastWorkActionForDomain`คืน index, `rqPickProgressedWorkAction`ไล่สเต็ปบน index+คืน label ภาษาปัจจุบัน, bodypart dedup ใช้ index (`rqGetPhysicalBodyPartFromName`/`rqQuestIsPhysicalCardioName`→`rqMatchIndex`), `bodyPart` เก็บเป็น index (ระวัง index 0 = chest → ใช้ `>= 0`/`Number.isInteger` ไม่ใช่ truthy)
  - **AI prompt 2 ภาษา**: `getAICoachComment`/`getQuestSuggestions` → ย้าย prompt+timeLabel เข้า dict `ai.*`, ฝั่ง EN สั่งโมเดลตอบอังกฤษ
  - **คงไว้ตั้งใจ**: `SQ_DICE_GEN.kw.language/.math` (keyword matcher, มีทั้งไทย+อังกฤษ, ไม่ display) + code comments
  - ผ่าน node syntax check (0 errors), rq.* keys ครบ, ไม่มี SQ_WORK_FLOW/fallbackPool/learningActivities หลงเหลือ

- **[2026-06-06] Bilingual i18n (ไทย/อังกฤษ)** — ทำใน `www/index.html` + `www/auth.js` ยังไม่ได้ commit/cap sync
  - **i18n engine** วางต้น `<script>` หลัก (~บรรทัด 11652): `currentLang`, `I18N={th,en}`, `t(key,vars)`, `tList(key,vars)` (สำหรับ `pick()` arrays), `applyStaticI18n(root)` (กวาด `data-i18n` / `data-i18n-html` / `data-i18n-ph` / `data-i18n-aria`), `applyLanguage(lang,{persist})`, `detectInitialLang()`. expose `window.t/tList/applyLanguage/getLang`
  - **Dictionary** เพิ่มแบบ `addI18N({th,en})` หลาย section (มี marker `/* === END I18N SECTIONS === */` ให้ append ก่อนเสมอ) — ครอบ menu/timer/report/home/gate/history/schedule/rq/onboarding/toasts(warn.*/lock.*)/alert/prompt/notifications(noti.*)/tips/install/boot/greet.* + auth.*
  - **แถบ Language** ใน `#topMenu` (สไตล์เดียวกับ Data Management) + modal `#langPanel` (copy `.dataPanel`) เลือก ไทย/English, badge `#topMenuLangState` (TH/EN) อัปเดตใน `renderTopMenuUI()`
  - **เก็บค่า** ใน `all.prefs.language` (เพิ่ม `prefs:{}` ใน `createEmptyAppData`+`normalizeAppData`) → sync cloud อัตโนมัติ. boot อ่าน pref/auto-detect แล้ว `applyLanguage()` (hook หลัง `loadState()`); re-apply ตอน `sq-user-changed`
  - **greeting กวนๆ** (`getHomeGreetingTexts`) เขียนใหม่เป็น data-driven → `tList("greet.<period>.<bucket>.prefix/.sub")` (5 ช่วงเวลา × 6 บัคเก็ตคะแนน), แปลอังกฤษให้ได้อารมณ์เดิม
  - **ยังเหลือเป็นไทย (ตั้งใจเว้นไว้)**: เนื้อหา Random Quest generator (SQ_WORK_FLOW / suggestion pools / AI domain lists / AI prompt ~บรรทัด 15560-16115) เพราะผูกกับ normalizer/dedup ที่ match Thai substring + keyword matcher arrays (ไม่ได้ display) + โค้ดคอมเมนต์. ถ้าจะทำต่อต้องแก้ normalizer ให้รองรับ 2 ภาษา
  - ผ่าน node syntax check (0 errors), 30 greet keys ครบ

- **[2026-06-05] Cross-device compatibility fixes** — ทำใน `www/index.html` ทั้งหมด ยังไม่ได้ commit/cap sync
  - **`--vh` polyfill** (ใน `<head>`): JS set `--vh` จาก `window.innerHeight` แก้ `dvh`/`svh` ที่ไม่รองรับ WebView เก่า
  - **แทนที่ `dvh`/`svh` ทั้งหมด** → `calc(var(--vh,1vh)*100)` ทุก 9 จุด
  - **foxMascot** `clamp(440px→220px, 98vw, 620px)` + `bottom: clamp(80px,18vw,180px)`
  - **`viewport-fit=cover`** ใน viewport meta → safe-area-inset ทำงานจริงบน iPhone X+
  - **`.app` padding-bottom** → `calc(90px + env(safe-area-inset-bottom,0px))`
  - **iOS global CSS**: `-webkit-text-size-adjust:100%`, `-webkit-touch-callout:none`, `:root{color-scheme:light}`
  - **button CSS**: เพิ่ม `appearance:none`, `-webkit-appearance:none`, `font-family:inherit`
  - **`-webkit-backdrop-filter`** เพิ่มให้ครบทุก element (ก่อนขาด 2 จุด)
  - **Font**: เปลี่ยนจาก `Plus Jakarta Sans + Sarabun (แยกหน้า)` → `Plus Jakarta Sans + Noto Sans Thai` ทั้งแอป, ลบ `@import Sarabun` ออกจาก CSS

- **[2026-06-05] History page redesign** — ทำใน `www/index.html`
  - banner mascot บนสุด (`mascordtop2.png`) ด้วย `.hpTopBannerWrap` + crop margin
  - กราฟ: smooth bezier curve + gradient fill + spike detection dots + `--vh` aware
  - Log tab: date carousel (arrows + pagination dots fade)
  - diceFab drag bug fix: `getBoundingClientRect()` แทน `offsetLeft/offsetTop` + guard `moved`

- **[2026-06-06] Release v0.16.0 (versionCode 30)** — APK build + copy ไป Downloads
  - รวม Bilingual i18n Phase 1+2 (ไทย/อังกฤษ), Random Quest generator 2 ภาษา

- **[2026-06-05] Release v0.15.1 (versionCode 29)** — APK build + copy ไป Downloads
  - รวม cross-device fixes + history redesign ทั้งหมดข้างบน

- **[2026-06-04] Release v0.15.0 (versionCode 28)** — APK build + copy ไป Downloads
  - Gate Top Bar, AI Quest Picker, OS Notifications, History view, Delete quest modal
