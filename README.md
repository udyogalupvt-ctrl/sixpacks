# GRIND LOG 🔥

185-day lift + fight transformation tracker (Jul 12 2026 → Jan 12 2027).
Mobile-first. Every user gets their own account and their own data.

**Tracked daily:** gym session (every lift + treadmill cardio), fight training (every drill),
meals (dairy-free plan), water (4 L), weight (optional). A day only counts toward your
streak/adherence when meals + gym + fight (on fight days) + water are ALL done.

**Transform tab:** upload one photo per month (Jul '26 → Jan '27) and photos of your three
ideals (Gapryong Kim, Gun Park, James Lee) — compare yourself against them every day.

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
  days:          { "2026-07-12": { meals:{}, gym:{}, fight:{}, water: 0, weight: "" }, ... }
  monthlyPhotos: { "2026-07": "<cloudinary url>", ... }
  ideals:        { gapryong: "<url>", gun: "<url>", james: "<url>" }
```
