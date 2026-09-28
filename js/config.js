/* Edit this file to point the page at your live data.
   1. FEED_CSV_URL – the "Publish to web" CSV link of the PUBLIC mirror sheet's Web_Feed tab.
   2. FORM_URL     – the Google Form link for batchmates who have paid.
   Leave a value as "" to disable it. Nothing else on the site needs editing. */
window.REUNION_CONFIG = {
  FEED_CSV_URL: "",                          // paste the published CSV link here
  FALLBACK_CSV: "data/web_feed_sample.csv",  // demo data used until the link above is set
  FORM_URL: "",                              // paste the Google Form link here
  REFRESH_MINUTES: 10,                       // how often the page re-reads the sheet
  HERO_IMAGE: "assets/hero.svg"              // replace with "assets/hero.jpg" after uploading your photo
};
