# Handing over this website to the common reunion account

Today the repository sits under a personal GitHub account/organization. When the
batch has a common email (e.g. `gce2002reunion@gmail.com`), move ownership to it
so the site outlives any one person. Nothing about the site breaks during the
transfer, and the URL only changes if the organization name changes.

## 1. Create the common GitHub account

1. Create the common mailbox first and turn on 2-step verification.
2. Sign up at <https://github.com/signup> with that email; pick a clear username,
   e.g. `gce2002-reunion-admin`.
3. Store the password and the 2FA recovery codes with **two** committee members.

## 2. Invite it as an Owner of the organization

1. Go to `https://github.com/orgs/<org-name>/people`.
2. **Invite member** → the common account's username → role **Owner** → send.
3. Sign in as the common account and accept the invitation from the email or
   from <https://github.com/notifications>.
4. Confirm both accounts show **Owner** on the People page.

## 3. Step yourself down

Only after the common account has accepted and you can see it as Owner:

1. On the People page, open your own row → **Change role** → *Member*, or
   **Remove from organization** if you want a clean break.
2. An organization must always keep at least one Owner — never remove yourself
   before step 2 is confirmed.

## 4. If the repo is under a personal account instead of an organization

Use a repository transfer: repo → **Settings** → **General** → *Danger Zone* →
**Transfer ownership** → type the repo name → enter the common account or org as
the new owner. GitHub redirects the old URL automatically, but re-check
**Settings → Pages** afterwards and re-enable Pages if it was reset.

## 5. Re-check GitHub Pages after any transfer

1. Repo → **Settings** → **Pages**.
2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. Wait for the green "Your site is live at …" and open the URL.
4. The published URL follows the owner name:
   `https://<owner>.github.io/reunion-fund/`. If the owner name changes, re-share
   the new link on WhatsApp (the old one keeps redirecting, but shared previews
   look better with the real URL).

## 6. Optional: a custom domain later

1. Buy a domain (e.g. `gce2002.in`) from any registrar.
2. In the repo: **Settings → Pages → Custom domain** → enter
   `fund.gce2002.in` → Save. This writes a `CNAME` file into the repo.
3. At the registrar's DNS panel add a **CNAME** record:
   `fund` → `<owner>.github.io`.
   For an apex domain (`gce2002.in`) add four **A** records instead:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
4. Back on the Pages settings, wait for the DNS check to pass and tick
   **Enforce HTTPS**.
5. Renew the domain from the common account's payment method so it cannot lapse
   with an individual.

## 7. Also move the Google side

The spreadsheet, the Google Form and the public mirror transfer separately — see
Part 7 of `README_Finance_Setup.md`. The published CSV link keeps working after a
Google ownership transfer, so `js/config.js` does not need to change.

## Checklist

- [ ] Common account created, 2FA on, credentials with two people
- [ ] Common account is an organization Owner and has accepted
- [ ] Personal account downgraded or removed
- [ ] Pages still serving; link re-shared if the URL changed
- [ ] Google sheet, form and mirror transferred
- [ ] `Finance Team Contact` in the sheet updated to the common email
