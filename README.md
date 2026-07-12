# GRIND LOG 🔥

185-day lift + fight transformation tracker (Jul 12 2026 → Jan 12 2027).
Mobile-first. Every user gets their own account and their own data.

**Tracked daily:** gym session (every lift + treadmill cardio, with the kg you lifted —
the input shows the last weight you used so progressive overload is obvious), fight
training (every drill), meals (dairy-free plan), water (4 L), weight (optional).
A day only counts toward your streak/adherence when meals + gym + fight (on fight days)
+ water are ALL done.

**Fight training — 27-week curriculum.** The plan advances every 3 weeks through 9 blocks
(Foundation → Jab & Cross → Hooks/Uppercuts → Defense → Kicks & Distance → Power →
Speed & Reaction → Fight Conditioning → Peak/Sparring), and each fight day trains a
different quality: **Mon = technique, Wed = drills & bag, Fri = conditioning.** Every
session is WARM-UP → main work → COOL-DOWN, run in the morning window (05:30–07:30).

**Calendar (📅 in the top bar).** Month grid across the whole grind — every day shows its
workout (PUSH/PULL/LEGS/REST) and a 🥊 on fight days, green when fully logged. Tap any
day, past or future, to open its complete plan.

**Transform tab:** upload one photo per month (Jul '26 → Jan '27) and photos of your three
ideals (Gapryong Kim, Gun Park, James Lee) — compare yourself against them every day.
Each Gym / Fight / Meals card also has a tiny 🖼 icon to attach an AI-generated
visualization image. **Sharing model:** uploading into an *empty* slot saves to the
**shared pool** so every grinder sees it (upload once, you both benefit). **Replacing**
an existing image saves a **personal override** that changes it only for you — the
lightbox tags each image `SHARED` or `YOURS ONLY`, and "Reset to shared" undoes an
override.

**Reminders (🔔 in the top bar):** built around the founder schedule — fight training
05:30–07:30 incl. warm-up (Mon/Wed/Fri), meals through the day, work 10–6,
gym 18:00–21:00 (Mon–Sat), day-check 22:30. The fight alert names that day's block and
session type (e.g. "DEFENSE — SLIP, ROLL, COUNTER — DRILLS & BAG day"). You get a notification when a task starts, and a call-out when its
window ends without being marked done in the app. Every entry can also be added to
Google Calendar (single tap) or imported all at once via the .ics download.

## Stack

- React + Vite
- Firebase Authentication (email/password + Google) — who you are
- Cloud Firestore — all progress, synced live, works offline in the gym
- Cloudinary — photo hosting (unsigned upload preset)
- Vercel — hosting

## Run locally

```bash
npm install
cp .env.example .env   # then fill in your values (already done on this machine)
npm run dev
```

## One-time Firebase console setup (required!)

1. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
2. **Firestore Database** → Create database (production mode) →
   **Rules** tab → paste the contents of [`firestore.rules`](firestore.rules) → Publish.
3. **Authentication → Settings → Authorized domains** → after deploying, add your
   Vercel domain (e.g. `your-app.vercel.app`) or Google sign-in will fail there.
   `localhost` is already authorized by default.

## Cloudinary setup (already configured)

Cloud name and an **unsigned upload preset** are read from `.env`. If you create a new
preset, set *Signing mode: Unsigned* in Cloudinary → Settings → Upload → Upload presets.

## Push notifications (one-time setup)

Reminders work out of the box **while the app is open**. To also get pushes when the
app/phone screen is closed:

1. **VAPID key (client)** — Firebase console → Project settings → **Cloud Messaging** →
   Web Push certificates → Generate/copy the **Key pair** →
   put it in `.env` as `VITE_FIREBASE_VAPID_KEY` (and in Vercel env vars).
2. **Service account (server)** — Firebase console → Project settings →
   **Service accounts** → Generate new private key. Open the downloaded JSON, put the
   whole thing **on one line** into the Vercel env var `FIREBASE_SERVICE_ACCOUNT`.
3. **Cron secret** — set `CRON_SECRET` in Vercel env vars to any long random string.
4. **Cron trigger** — in your GitHub repo: Settings → Secrets and variables → Actions →
   add `REMINDER_URL` (`https://<your-app>.vercel.app/api/send-reminders`) and
   `CRON_SECRET` (same value as step 3). The included workflow
   `.github/workflows/reminders.yml` then pings the endpoint every 15 minutes —
   it checks who has an unfinished task and pushes to their devices via FCM.
5. In the app: 🔔 → **Enable notifications** on each device you want pushed.

> iPhone note: iOS only delivers web push to sites added to the Home Screen
> (Share → Add to Home Screen). Android Chrome works directly.

## Deploy to Vercel

1. Push this folder to a GitHub repo (`.env` is git-ignored — it will NOT be uploaded).
2. In Vercel: **New Project** → import the repo. Vite is auto-detected
   (build `npm run build`, output `dist`).
3. In **Project Settings → Environment Variables**, add every variable from
   [`.env.example`](.env.example) with the real values from your local `.env`.
4. Deploy, then add the Vercel domain to Firebase authorized domains (step 3 above).

> Note: `VITE_*` variables are compiled into the client bundle — that is normal and safe
> for Firebase web config and unsigned Cloudinary presets. Real security comes from the
> Firestore rules, which lock every user to their own data.

## Data model

```
users/{uid}
  name, email, createdAt
  fcmTokens:     [ "<device push token>", ... ]
  days:          { "2026-07-12": { meals:{}, gym:{}, fight:{}, water: 0, weight: "",
                                   gymWeights: { barbell_bench_press: "40" } }, ... }
  monthlyPhotos: { "2026-07": "<cloudinary url>", ... }
  ideals:        { gapryong: "<url>", gun: "<url>", james: "<url>" }
  sectionImages: { "gym-push": "<url>", ... }   <- PERSONAL overrides only
  meta/notifLog  (subcollection doc written by the server so pushes never duplicate)

shared/sectionImages                             <- SHARED pool, all users
  { "gym-push": "<url>", "fight-kicks_distance": "<url>", "meals-1": "<url>", ... }
```

> Re-publish [`firestore.rules`](firestore.rules) after this update — it now also grants
> signed-in users read/write on the `shared/` doc.
