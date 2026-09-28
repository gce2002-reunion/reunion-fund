# GCE 2002 Silver Jubilee Reunion – Fund Dashboard

A single, read-only web page that shows the reunion fund's finances. It reads its
numbers from a published Google Sheets CSV, so the Finance Team only ever updates
the spreadsheet — the website never needs a code change.

Live site: `https://<org-or-user>.github.io/reunion-fund/`

## How the updates flow

```
LIVE finance sheet (private)  ->  PUBLIC mirror sheet (Web_Feed only)
        ->  "Publish to web" CSV link  ->  this website
```

Google refreshes a published CSV roughly **every 5 minutes**, so a change in the
sheet can take that long to appear. The page also re-reads the feed every 10
minutes on its own, and on every reload.

## The two links you have to paste (one-time, 2 minutes)

1. Open the repo on GitHub, click `js` → `config.js` → the pencil (**Edit**) icon.
2. Fill in the two empty quotes:

   ```js
   FEED_CSV_URL: "https://docs.google.com/spreadsheets/d/e/..../pub?gid=0&single=true&output=csv",
   FORM_URL: "https://forms.gle/xxxxxxxx",
   ```

   - `FEED_CSV_URL` — from the **public mirror** sheet: File → Share → Publish to
     web → sheet `Web_Feed` → format **Comma-separated values (.csv)** → Publish.
     Never publish the LIVE master sheet.
   - `FORM_URL` — the Google Form short link for batchmates who have paid. If you
     leave it empty, the "Paid? Submit your details" button simply disappears.
3. Click **Commit changes**. The site updates in about a minute.

Until `FEED_CSV_URL` is set (or if the fetch ever fails), the page shows the demo
file `data/web_feed_sample.csv` with an amber **"Showing demo data"** banner. It
never shows a blank page.

## Replacing the hero photo

1. Upload your campus photo to the `assets/` folder (GitHub: **Add file → Upload
   files**). Name it `hero.jpg`, landscape, ideally about 1600×700 px.
2. Edit `js/config.js` and set `HERO_IMAGE: "assets/hero.jpg"`.

The same applies to `assets/og-preview.png` (1200×630) — that is the picture
people see when the link is shared on WhatsApp.

## Changing text

All fixed text lives in `index.html`; edit it in the GitHub web editor and commit.
Everything that changes with the money (amounts, dates, contributors, bookings,
UPI ID, contact address, tagline) comes from the sheet — edit the sheet, not the code.

## Other settings in `js/config.js`

| Setting | Meaning |
|---|---|
| `FEED_CSV_URL` | Published CSV of the mirror sheet's `Web_Feed` tab |
| `FALLBACK_CSV` | Demo data used when the live feed is missing or unreachable |
| `FORM_URL` | Google Form for payment details; empty hides the button |
| `REFRESH_MINUTES` | How often an open page re-reads the feed (default 10) |
| `HERO_IMAGE` | Path to the banner photo |

## What the feed must contain

`data/web_feed_sample.csv` is the reference format: rows of `key,value,meaning`,
then a blank row, then a `recent_date,recent_description,recent_type,recent_amount`
header and up to 5 transactions (most recent first). Values are read **by key
name**, so extra rows or reordering will not break the page. Amounts are stored
unformatted (`742000`) and percentages as fractions (`0.9275`); the page formats
them as `₹ 7,42,000` and `92.8%`.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole page structure |
| `css/style.css` | Styling |
| `js/config.js` | **The only file the Finance Team needs to edit** |
| `js/app.js` | Fetches and renders the feed |
| `data/web_feed_sample.csv` | Demo data |
| `assets/` | Hero image, favicon, WhatsApp preview image |
| `HANDOVER.md` | How to move ownership to the common reunion account |

No build step and no server: plain HTML, CSS and JavaScript. Chart.js, PapaParse
and qrcode-generator are loaded from a CDN at pinned versions.

## Running it locally (optional)

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Amber "Showing demo data" banner | `FEED_CSV_URL` is empty/wrong, or the mirror isn't published as CSV |
| Numbers look old | Published CSVs lag ~5 minutes; then hard-refresh (Ctrl/Cmd+Shift+R) |
| A value shows `—` | That key is missing or misspelled in the `Web_Feed` tab |
| QR code missing | `upi_id` is empty in the feed |
