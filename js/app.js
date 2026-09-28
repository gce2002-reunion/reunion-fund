/* GCE 2002 Reunion fund dashboard.
   Reads a published Google Sheets CSV (key/value rows + a block of recent
   transactions) and renders it. No build step, no framework. */
(function () {
  "use strict";

  var CFG = window.REUNION_CONFIG || {};
  var MONEY_KEYS = ["target", "received", "expenses_paid", "committed", "available_bank", "free_balance", "avg_contribution"];
  var TX_HEADER = "recent_date";

  var inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  var chart = null;

  function money(value) {
    var n = Number(String(value == null ? "" : value).replace(/[^0-9.-]/g, ""));
    if (!isFinite(n)) return "\u20B9 0";
    return "\u20B9 " + inr.format(Math.round(n));
  }

  function pct(value) {
    var n = Number(value);
    if (!isFinite(n)) return "0.0%";
    if (n <= 1) n = n * 100;
    return n.toFixed(1) + "%";
  }

  function lakh(value) {
    var n = Number(value) / 100000;
    if (!isFinite(n)) return "";
    return "\u20B9" + (Math.round(n * 10) / 10) + " lakh";
  }

  function setText(field, text) {
    var nodes = document.querySelectorAll('[data-field="' + field + '"]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  function parseFeed(csvText) {
    var rows = window.Papa.parse(csvText.trim(), { skipEmptyLines: "greedy" }).data;
    var values = {};
    var transactions = [];
    var inTx = false;

    rows.forEach(function (row) {
      var first = (row[0] || "").trim();
      if (!first) return;
      if (first === TX_HEADER) { inTx = true; return; }
      if (inTx) {
        transactions.push({
          date: first,
          description: (row[1] || "").trim(),
          type: (row[2] || "").trim(),
          amount: (row[3] || "").trim()
        });
        return;
      }
      if (first === "key") return; // header row
      values[first] = (row[1] || "").trim();
    });

    return { values: values, transactions: transactions.slice(0, 5) };
  }

  function renderValues(v) {
    MONEY_KEYS.forEach(function (key) {
      if (key in v) setText(key, money(v[key]));
    });

    setText("as_of", v.as_of || "\u2014");
    setText("tagline", v.tagline || "");
    setText("bookings_done", v.bookings_done || "\u2014");
    setText("next_payment", v.next_payment || "\u2014");
    setText("account_name", v.account_name || "\u2014");
    setText("bank", v.bank || "\u2014");
    setText("upi_id", v.upi_id || "\u2014");
    setText("contact", v.contact || "\u2014");
    setText("donut_center", money(v.received));
    setText("kpi_received_sub", "(" + pct(v.pct_of_target) + " of target)");
    setText("kpi_expenses_sub", "(" + pct(v.pct_spent_of_received) + " of received)");
    setText("contributors_text", (v.contributors || "0") + " classmates");

    var onTrack = document.getElementById("on-track");
    var yes = String(v.on_track || "").trim().toLowerCase() === "yes";
    onTrack.className = "ontrack " + (yes ? "ontrack--yes" : "ontrack--warn");
    onTrack.textContent = yes
      ? "\u2714 Yes! Collections are on track for our " + lakh(v.target) + " target."
      : "\u26A0 Needs a push \u2013 please contribute!";

    var contact = document.getElementById("contact-link");
    if (v.contact) contact.href = "mailto:" + v.contact;

    renderUpi(v);
    renderDonut(v);
  }

  function renderUpi(v) {
    if (!v.upi_id) return;
    var link = "upi://pay?pa=" + encodeURIComponent(v.upi_id) +
      "&pn=" + encodeURIComponent(v.account_name || "Reunion Fund") + "&cu=INR";
    document.getElementById("upi-link").href = link;

    var holder = document.getElementById("qr");
    holder.innerHTML = "";
    if (typeof window.qrcode !== "function") return;
    var qr = window.qrcode(0, "M");
    qr.addData(link);
    qr.make();
    holder.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });

    var copy = document.getElementById("copy-upi");
    copy.onclick = function () {
      var status = document.getElementById("copy-status");
      var done = function () { status.textContent = "UPI ID copied"; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v.upi_id).then(done, function () {
          status.textContent = v.upi_id;
        });
      } else {
        status.textContent = v.upi_id;
      }
    };
  }

  function renderDonut(v) {
    var slices = [Number(v.donut_free), Number(v.donut_paid), Number(v.donut_committed)];
    var total = slices.reduce(function (a, b) { return a + (isFinite(b) ? b : 0); }, 0);
    if (!total) return;

    var canvas = document.getElementById("donut");
    if (typeof window.Chart !== "function") {
      canvas.hidden = true;
      var fb = document.getElementById("donut-fallback");
      fb.hidden = false;
      fb.textContent = "Available " + pct(slices[0] / total) + " \u00B7 Expenses paid " +
        pct(slices[1] / total) + " \u00B7 Committed " + pct(slices[2] / total);
      return;
    }

    var data = {
      labels: ["Available (free)", "Expenses Paid", "Committed / Booked"],
      datasets: [{
        data: slices,
        backgroundColor: ["#6DB33F", "#3A8FD9", "#F28C28"],
        borderColor: "#ffffff",
        borderWidth: 2
      }]
    };
    var labelPlugin = {
      id: "sliceLabels",
      afterDatasetsDraw: function (c) {
        var ctx = c.ctx;
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 13px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        c.getDatasetMeta(0).data.forEach(function (arc, i) {
          var share = slices[i] / total;
          if (share < 0.04) return;
          var p = arc.tooltipPosition();
          ctx.fillText(pct(share), p.x, p.y);
        });
        ctx.restore();
      }
    };

    if (chart) { chart.destroy(); }
    chart = new window.Chart(canvas, {
      type: "doughnut",
      data: data,
      options: {
        cutout: "66%",
        responsive: false,
        animation: { duration: 400 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) { return item.label + " " + pct(item.parsed / total); }
            }
          }
        }
      },
      plugins: [labelPlugin]
    });
  }

  function renderTransactions(list) {
    var body = document.getElementById("tx-body");
    body.innerHTML = "";
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="4">No transactions yet.</td></tr>';
      return;
    }
    list.forEach(function (tx) {
      var credit = tx.type.toLowerCase() === "credit";
      var tr = document.createElement("tr");

      var date = document.createElement("td");
      date.textContent = tx.date;
      var desc = document.createElement("td");
      desc.textContent = tx.description;
      var type = document.createElement("td");
      type.textContent = tx.type;
      type.className = credit ? "tx--credit" : "tx--debit";
      var amount = document.createElement("td");
      amount.className = "num";
      amount.textContent = money(tx.amount);

      tr.appendChild(date); tr.appendChild(desc); tr.appendChild(type); tr.appendChild(amount);
      body.appendChild(tr);
    });
  }

  function showDemoBanner(show) {
    document.getElementById("demo-banner").hidden = !show;
  }

  function fetchCsv(url) {
    var bust = (url.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now();
    return fetch(url + bust, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    });
  }

  function render(csvText, isDemo) {
    var feed = parseFeed(csvText);
    renderValues(feed.values);
    renderTransactions(feed.transactions);
    showDemoBanner(isDemo);
  }

  function load() {
    var live = (CFG.FEED_CSV_URL || "").trim();
    var fallback = CFG.FALLBACK_CSV || "data/web_feed_sample.csv";
    var attempt = live
      ? fetchCsv(live).then(function (t) { render(t, false); })
      : Promise.reject(new Error("no live feed configured"));

    attempt.catch(function () {
      return fetchCsv(fallback).then(function (t) { render(t, true); });
    }).catch(function () {
      showDemoBanner(true);
      document.getElementById("demo-banner").textContent = "Data is temporarily unavailable";
    });
  }

  function setupStatic() {
    if (CFG.HERO_IMAGE) document.getElementById("hero-img").src = CFG.HERO_IMAGE;
    var form = (CFG.FORM_URL || "").trim();
    if (form) {
      ["cta-link", "sticky-cta"].forEach(function (id) {
        document.getElementById(id).href = form;
      });
      document.getElementById("cta").hidden = false;
      document.getElementById("sticky-cta").hidden = false;
    }
  }

  setupStatic();
  load();
  var minutes = Number(CFG.REFRESH_MINUTES) || 10;
  setInterval(load, minutes * 60 * 1000);
})();
