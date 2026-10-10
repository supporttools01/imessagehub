(() => {
  if (window.__imessageSupportPageV2) return;
  window.__imessageSupportPageV2 = true;

  const TELEGRAM_URL = "https://t.me/Adenbraun";
  const WHATSAPP_URL = "https://wa.me/12232211148";

  function installStyles() {
    if (document.getElementById("supportPageV2Styles")) return;
    const style = document.createElement("style");
    style.id = "supportPageV2Styles";
    style.textContent = `
      #viewSupport.support-page-v2 { width:100%; min-height:50vh; color:#14213d; }
      #viewSupport.support-page-v2 .support-v2-hero {
        position:relative; overflow:hidden; display:flex; align-items:center; gap:18px;
        padding:clamp(22px,4vw,38px); margin:0 0 18px; border-radius:28px;
        color:#fff; background:radial-gradient(circle at 88% 10%,rgba(80,203,255,.42),transparent 30%),linear-gradient(130deg,#092c62,#116bd2 62%,#169cff);
        box-shadow:0 22px 55px rgba(18,91,178,.19);
      }
      #viewSupport.support-page-v2 .support-v2-hero-icon {
        display:grid; place-items:center; flex:0 0 58px; width:58px; height:58px;
        border:1px solid rgba(255,255,255,.3); border-radius:20px; background:rgba(255,255,255,.15);
        font-size:28px; font-weight:800; backdrop-filter:blur(14px);
      }
      #viewSupport.support-page-v2 .support-v2-eyebrow { margin:0 0 8px; color:#a8e7ff; font-size:10px; font-weight:900; letter-spacing:.16em; }
      #viewSupport.support-page-v2 .support-v2-hero h1 { margin:0; color:#fff; font-size:clamp(27px,4vw,39px); line-height:1.08; letter-spacing:-.04em; }
      #viewSupport.support-page-v2 .support-v2-hero p { max-width:650px; margin:10px 0 0; color:rgba(255,255,255,.8); font-size:13px; line-height:1.65; }
      #viewSupport.support-page-v2 .support-v2-section-label { margin:22px 2px 12px; color:#7b8aa2; font-size:10px; font-weight:900; letter-spacing:.13em; text-transform:uppercase; }
      #viewSupport.support-page-v2 .support-v2-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
      #viewSupport.support-page-v2 .support-v2-card {
        min-width:0; padding:clamp(18px,3vw,26px); border:1px solid #e1eaf6; border-radius:24px;
        background:rgba(255,255,255,.96); box-shadow:0 14px 38px rgba(32,67,113,.07);
      }
      #viewSupport.support-page-v2 .support-v2-card-top { display:flex; align-items:center; gap:13px; margin-bottom:19px; }
      #viewSupport.support-page-v2 .support-v2-icon { display:grid; place-items:center; flex:0 0 50px; width:50px; height:50px; border-radius:17px; color:#fff; font-size:23px; font-weight:900; }
      #viewSupport.support-page-v2 .support-v2-icon.telegram { background:linear-gradient(145deg,#55c8ff,#1689f5 65%,#1460d7); box-shadow:0 10px 22px rgba(22,137,245,.22); }
      #viewSupport.support-page-v2 .support-v2-icon.whatsapp { background:linear-gradient(145deg,#5be6a0,#13b86a 65%,#07904c); box-shadow:0 10px 22px rgba(19,184,106,.2); }
      #viewSupport.support-page-v2 .support-v2-kicker { color:#8b98ac; font-size:10px; font-weight:850; letter-spacing:.1em; text-transform:uppercase; }
      #viewSupport.support-page-v2 .support-v2-card h2 { margin:4px 0 0; color:#14213d; font-size:clamp(18px,2vw,23px); letter-spacing:-.025em; overflow-wrap:anywhere; }
      #viewSupport.support-page-v2 .support-v2-card p { margin:0 0 20px; color:#718097; font-size:12px; line-height:1.65; }
      #viewSupport.support-page-v2 .support-v2-button {
        display:flex; align-items:center; justify-content:center; gap:9px; width:100%; min-height:49px; padding:12px 16px;
        border:0; border-radius:15px; color:#fff!important; font-size:12px; font-weight:850; text-decoration:none!important;
        transition:transform .18s ease, box-shadow .18s ease;
      }
      #viewSupport.support-page-v2 .support-v2-button.telegram { background:linear-gradient(100deg,#1688f5,#25b5ff); box-shadow:0 10px 22px rgba(22,136,245,.2); }
      #viewSupport.support-page-v2 .support-v2-button.whatsapp { background:linear-gradient(100deg,#0ca85b,#22cb7b); box-shadow:0 10px 22px rgba(12,168,91,.18); }
      #viewSupport.support-page-v2 .support-v2-button:hover { transform:translateY(-2px); }
      #viewSupport.support-page-v2 .support-v2-note { display:flex; gap:12px; align-items:flex-start; margin-top:17px; padding:17px 19px; border:1px solid #dfeafa; border-radius:18px; background:linear-gradient(120deg,#f7fbff,#fff); color:#65758e; font-size:11px; line-height:1.65; }
      #viewSupport.support-page-v2 .support-v2-note strong { color:#253b5e; white-space:nowrap; }
      @media(max-width:650px) {
        #viewSupport.support-page-v2 .support-v2-grid { grid-template-columns:minmax(0,1fr); gap:12px; }
        #viewSupport.support-page-v2 .support-v2-hero { align-items:flex-start; gap:13px; border-radius:22px; padding:22px 18px; }
        #viewSupport.support-page-v2 .support-v2-hero-icon { flex-basis:46px; width:46px; height:46px; border-radius:15px; font-size:22px; }
        #viewSupport.support-page-v2 .support-v2-card { border-radius:20px; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildSupportContent(panel) {
    if (panel.dataset.supportPageV2Built === "true") return;
    panel.classList.add("support-page-v2");
    panel.innerHTML = `
      <div class="breadcrumb-bar">Help / Support</div>
      <header class="support-v2-hero">
        <div class="support-v2-hero-icon" aria-hidden="true">?</div>
        <div>
          <p class="support-v2-eyebrow">IMESSAGE HUB · CUSTOMER CARE</p>
          <h1>How can we help?</h1>
          <p>Contact our support team for account access, campaign, route activation or payment assistance. Choose the channel that works best for you.</p>
        </div>
      </header>
      <div class="support-v2-section-label">Contact our support team</div>
      <div class="support-v2-grid">
        <article class="support-v2-card">
          <div class="support-v2-card-top">
            <div class="support-v2-icon telegram" aria-hidden="true">➤</div>
            <div><div class="support-v2-kicker">Fastest contact</div><h2>Telegram Support</h2></div>
          </div>
          <p>Chat with our support contact on Telegram. Please include your account ID and a short description of the issue.</p>
          <a class="support-v2-button telegram" href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer">Open Telegram <span aria-hidden="true">↗</span></a>
        </article>
        <article class="support-v2-card">
          <div class="support-v2-card-top">
            <div class="support-v2-icon whatsapp" aria-hidden="true">◉</div>
            <div><div class="support-v2-kicker">Direct messaging</div><h2>WhatsApp Support</h2></div>
          </div>
          <p>Message our support contact on WhatsApp for account, campaign, or payment-related questions.</p>
          <a class="support-v2-button whatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">Open WhatsApp <span aria-hidden="true">↗</span></a>
        </article>
      </div>
      <aside class="support-v2-note"><strong>Helpful tip</strong><span>For faster assistance, include your account ID, the page or feature you were using, and a brief description of what happened. Never share your password or one-time verification code.</span></aside>
    `;
    panel.dataset.supportPageV2Built = "true";
  }

  function showSupport(event) {
    const panel = document.getElementById("viewSupport");
    if (!panel) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    }
    buildSupportContent(panel);
    document.querySelectorAll(".view-panel").forEach((view) => {
      view.classList.add("hidden");
      view.style.removeProperty("display");
    });
    panel.classList.remove("hidden");
    panel.style.setProperty("display", "block", "important");
    panel.style.setProperty("visibility", "visible", "important");
    panel.style.setProperty("opacity", "1", "important");
    document.querySelectorAll(".platform-menu [data-view]").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-view") === "viewSupport");
    });
    document.querySelectorAll(".ios-bottom-nav [data-bottom-view]").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-bottom-view") === "viewSupport");
    });
    document.body.classList.remove("mobile-sidebar-open");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function init() {
    if (!document.querySelector(".platform-layout")) return;
    installStyles();
    const panel = document.getElementById("viewSupport");
    if (panel) buildSupportContent(panel);

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      if (!target) return;
      if (target.closest('[data-view="viewSupport"], [data-bottom-view="viewSupport"]')) showSupport(event);
    }, true);

    // Keep support content intact if another legacy script mutates the panel.
    const observer = new MutationObserver(() => {
      const support = document.getElementById("viewSupport");
      if (!support) return;
      if (!support.querySelector(".support-v2-grid")) {
        support.dataset.supportPageV2Built = "false";
        buildSupportContent(support);
      }
    });
    const area = document.querySelector(".platform-content-area");
    if (area) observer.observe(area, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
