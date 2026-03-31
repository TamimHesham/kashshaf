# Kashshaf — Deployment Guide

Egyptian grassroots football scouting platform.

---

## What you need (all free)

1. **Node.js** — download from nodejs.org
2. **GitHub account** — github.com
3. **Supabase account** — supabase.com
4. **Vercel account** — vercel.com
5. **Anthropic API key** — console.anthropic.com (optional, app works without it using smart templates)

---

## Step 1 — Set up Supabase database

1. Go to supabase.com and create a new project
2. Wait for it to finish setting up (~2 minutes)
3. Go to **SQL Editor** in the left sidebar
4. Copy the entire contents of `supabase_schema.sql`
5. Paste it into the SQL editor and click **Run**
6. This creates all your tables, security rules, and seed data

Get your keys:
- Go to **Project Settings → API**
- Copy **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Get your Anthropic API key (optional)

1. Go to console.anthropic.com
2. Sign up and go to **API Keys**
3. Create a new key
4. Copy it → this is your `ANTHROPIC_API_KEY`

If you skip this, the report generator will use smart templates instead. Works well for testing.

---

## Step 3 — Set up the project locally

Open your terminal and run:

```bash
# Clone or download the project folder, then:
cd kashshaf

# Copy the environment variables template
cp .env.local.example .env.local

# Open .env.local and fill in your keys from Steps 1 and 2
# Then install dependencies:
npm install

# Run locally to test:
npm run dev
```

Open http://localhost:3000 — your app is running locally.

---

## Step 4 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Kashshaf build"
```

Create a new repository on github.com (call it "kashshaf"), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kashshaf.git
git branch -M main
git push -u origin main
```

---

## Step 5 — Deploy to Vercel

1. Go to vercel.com and sign up with your GitHub account
2. Click **New Project**
3. Import your `kashshaf` repository
4. Before clicking Deploy, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → your Supabase service role key
   - `ANTHROPIC_API_KEY` → your Anthropic key (if you have one)
5. Click **Deploy**

Done. Your app is live at `your-project-name.vercel.app`.

---

## Step 6 — Get a custom domain (optional)

1. Buy a domain (kashshaf.gg or similar) from Namecheap or Google Domains
2. In Vercel, go to your project → **Domains**
3. Add your domain and follow the DNS instructions
4. Takes ~10 minutes to go live

---

## Project structure

```
kashshaf/
├── app/
│   ├── page.js              # Home page
│   ├── wall/page.js         # Talent Wall with paywall
│   ├── coach/page.js        # Coach Portal + report generator
│   ├── submit/page.js       # Spot a Player form
│   ├── matches/page.js      # Match calendar
│   ├── pricing/page.js      # Pricing page
│   ├── contact/page.js      # Club access request
│   ├── (auth)/
│   │   ├── login/page.js    # Sign in
│   │   └── signup/page.js   # Create account
│   └── api/
│       ├── report/route.js      # AI report generation
│       ├── players/route.js     # Player CRUD
│       ├── sightings/route.js   # Add sightings
│       ├── endorsements/route.js # Add endorsements
│       ├── votes/route.js       # Upvoting
│       ├── matches/route.js     # Match calendar
│       ├── access-request/route.js # Club access requests
│       └── verification/route.js   # Coach verification
├── components/
│   ├── Navbar.js            # Navigation + side drawer
│   └── Toast.js             # Notification toasts
├── lib/
│   ├── supabase.js          # Client-side Supabase
│   ├── supabase-server.js   # Server-side Supabase
│   └── report.js            # Report generation (Claude API + template)
├── supabase_schema.sql      # Full database schema — run this first
└── .env.local.example       # Environment variables template
```

---

## What's live after deployment

- Home page with live player/sighting counts from database
- Talent Wall with free/paid tier paywall
- Full player profiles with sightings, endorsements, video, contact
- Coach Portal with real report generation (Claude API or template)
- Submit a Player form saving to real database
- Match Calendar with coach posting ability
- Pricing page at 799 EGP/month
- Club access request form saving to database
- Full auth — sign up, sign in, sign out
- Navbar with side drawer, auth-aware

---

## After launch — things to do manually

1. **Review verification requests** — go to your Supabase dashboard → Table Editor → `verification_requests` to see pending coach verifications
2. **Review access requests** — same for `access_requests` table — these are clubs that want paid access
3. **Approve paid users** — in `profiles` table, set `is_paid = true` for clubs that have paid
4. **Monitor** — Supabase gives you real-time logs and analytics for free

---

## Next features to build (Round 2)

- Academies tab
- Player claiming with phone verification
- Advanced search for paid clubs
- Arabic language toggle
- Email notifications
- Egyptian League tab

Good luck Tameem. Build it, show it, get users.
