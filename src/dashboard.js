import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
  welcomeName: $("welcomeName"),
  welcomeEmail: $("welcomeEmail"),
  accountStatus: $("accountStatus"),
  walletBalance: $("walletBalance"),
  walletBalanceTop: $("walletBalanceTop"),
  accountRole: $("accountRole"),
  userId: $("userId"),
  createdAt: $("createdAt"),
  logoutButton: $("logoutButton"),
  dashboardMessage: $("dashboardMessage"),
  headerName: $("headerName"),
  headerAvatar: $("headerAvatar"),
  dashWelcomeId: $("dashWelcomeId"),
  dropdownUserTitle: $("dropdownUserTitle"),
  liveClockDisplay: $("liveClockDisplay"),
  btnGetStarted: $("btnGetStarted"),
  userMenuBtn: $("userMenuBtn"),
  userDropdownMenu: $("userDropdownMenu"),
  btnOpenTopUpFromMenu: $("btnOpenTopUpFromMenu"),
  topbarBalanceBtn: $("topbarBalanceBtn"),
  btnSidebarTopUp: $("btnSidebarTopUp"),
  btnDashboardTopUp: $("btnDashboardTopUp"),
  campaignNumbersArea: $("campaignNumbersArea"),
  bulkFileInput: $("bulkFileInput"),
  btnTriggerUpload: $("btnTriggerUpload"),
  senderIdInput: $("senderIdInput"),
  mainMessageContent: $("mainMessageContent"),
  wordsAndItemsCounter: $("wordsAndItemsCounter"),
  campaignPreviewTime: $("campaignPreviewTime"),
  campaignPreviewSender: $("campaignPreviewSender"),
  campaignPreviewBubble: $("campaignPreviewBubble"),
  campaignPreviewCharacters: $("campaignPreviewCharacters"),
  campaignPreviewSegments: $("campaignPreviewSegments"),
  campaignPreviewRecipients: $("campaignPreviewRecipients"),
  btnSubmitCampaign: $("btnSubmitCampaign"),
  campaignRouteInput: $("campaignRouteInput"),
  campaignSelectedRoute: $("campaignSelectedRoute"),
  campaignEstimatedCost: $("campaignEstimatedCost"),
  recipientCount: $("recipientCount"),
  recipientCountLarge: $("recipientCountLarge"),
  outboxRecordsTbody: $("outboxRecordsTbody"),
  outboxNoDataNotice: $("outboxNoDataNotice"),
  btnClearOutboxRecords: $("btnClearOutboxRecords"),
  btnFilterSearch: $("btnFilterSearch"),
  messageActivityChart: $("messageActivityChart"),
  activitySevenDayTotal: $("activitySevenDayTotal"),
  outboxFromDate: $("outboxFromDate"),
  outboxToDate: $("outboxToDate"),
  outboxStatusFilter: $("outboxStatusFilter"),
  btnApplyOutboxFilters: $("btnApplyOutboxFilters"),
  btnResetOutboxFilters: $("btnResetOutboxFilters"),
  outboxFilterMessage: $("outboxFilterMessage"),
  outboxTotalCount: $("outboxTotalCount"),
  outboxSubmittedCount: $("outboxSubmittedCount"),
  outboxSentCount: $("outboxSentCount"),
  outboxDeliveredCount: $("outboxDeliveredCount"),
  outboxFailedCount: $("outboxFailedCount"),
  outboxTotalCharges: $("outboxTotalCharges"),
  paymentHistoryList: $("paymentHistoryList"),
  topUpModal: $("topUpModal"),
  closeTopUpModal: $("closeTopUpModal"),
  cancelTopUpBtn: $("cancelTopUpBtn"),
  btnSubmitPaid: $("btnSubmitPaid"),
  copyUsdtAddressBtn: $("copyUsdtAddressBtn"),
  usdtWalletAddress: $("usdtWalletAddress"),
  usdtUserEmail: $("usdtUserEmail"),
  usdtTxHash: $("usdtTxHash"),
  usdtAmountDisplay: $("usdtAmountDisplay"),
  usdtTimer: $("usdtTimer"),
  accountModal: $("accountModal"),
  closeAccountModal: $("closeAccountModal"),
  closeAccountModalBtn: $("closeAccountModalBtn"),
  btnProfilePasswordReset: $("btnProfilePasswordReset"),
  modalUserName: $("modalUserName"),
  modalUserEmail: $("modalUserEmail"),
  campaignSuccessModal: $("campaignSuccessModal"),
  successRecipientCount: $("successRecipientCount"),
  successRouteName: $("successRouteName"),
  successCampaignCost: $("successCampaignCost"),
  btnSuccessGoOutbox: $("btnSuccessGoOutbox"),
  btnSuccessClose: $("btnSuccessClose"),
  toastContainer: $("toastContainer")
};

const menuItems = $$('[data-view]');
const viewPanels = $$(".view-panel");
const profileButtons = $$('[id="btnShowProfile"]');
const routeCards = $$(".route-card");
const routeRadios = $$('input[name="campaignRoute"]');

let currentUser = null;
let currentProfile = null;
let currentWalletBalance = 0;
let selectedTopUpAmount = 99;
let countdownInterval = null;
let parsedCampaignNumbers = [];
let selectedSourceFileName = "";
let routeByDisplayName = new Map();
let routeById = new Map();

const helpAnswers = [
  { keys: ["send", "campaign", "message"], answer: "Open Campaigns, select an available route, upload or paste international numbers with country code, enter your message, review the cost, then submit the campaign." },
  { keys: ["route", "routes", "link", "unavailable", "activate"], answer: "Your first recharge on the panel is compulsory to activate messaging routes. After completing your first recharge, contact the admin for route activation. If routes show unavailable, please recharge first and then contact admin." },
  { keys: ["balance", "wallet", "credit"], answer: "Your current balance appears in the top bar and Dashboard. Open Add Balance to submit a USDT top-up; the balance updates after admin approval." },
  { keys: ["payment", "usdt", "topup", "top-up"], answer: "Use Add Balance, enter the amount and submit the correct transaction hash. You can track pending or approved requests in Payment History." },
  { keys: ["status", "submitted", "delivered", "failed", "outbox"], answer: "Open Outbox or Reports to check campaign progress. Submitted means processing, Delivered confirms delivery, and Failed means the provider could not complete that recipient." },
  { keys: ["number", "file", "upload", "txt"], answer: "Use international numbers with country code. For uploads, use a plain TXT file with one number per line and remove spaces or duplicate entries." },
  { keys: ["account", "login", "password", "blocked"], answer: "For login, blocked-account, email or password issues, contact your account manager/admin. Never share your password or OTP in this chat." }
];

function setupHelpChatbot() {
  if ($("customerHelpChat")) return;
  const root = document.createElement("div");
  root.id = "customerHelpChat";
  root.className = "help-chat";
  root.innerHTML = `<button class="help-chat-launch" type="button" aria-label="Open customer help"><span>✦</span><b>Help</b></button>
    <section class="help-chat-panel" aria-label="Customer help chat" aria-hidden="true">
      <header><div><span>✦</span><p><strong>iMessage Hub Help</strong><small>Instant account & sending guidance</small></p></div><button type="button" data-help-close aria-label="Close">×</button></header>
      <div class="help-chat-messages" aria-live="polite"></div>
      <div class="help-chat-chips"><button type="button">How to send?</button><button type="button">Add balance</button><button type="button">Message status</button><button type="button">Route missing</button></div>
      <form><input type="text" maxlength="180" autocomplete="off" placeholder="Ask about sending or account…" aria-label="Help question"><button type="submit" aria-label="Send">➤</button></form>
    </section>`;
  document.body.appendChild(root);

  const panel = root.querySelector(".help-chat-panel");
  const messages = root.querySelector(".help-chat-messages");
  const input = root.querySelector("input");
  const addMessage = (text, role) => {
    const item = document.createElement("div");
    item.className = `help-chat-message ${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  };
  const reply = (question) => {
    const normalized = question.toLowerCase();
    const match = helpAnswers.find((item) => item.keys.some((key) => normalized.includes(key)));
    setTimeout(() => addMessage(match?.answer || "I can help with sending campaigns, routes, number files, balance, USDT payments, delivery status and account access. Choose a topic below or ask again with a few more details.", "bot"), 220);
  };
  const ask = (question) => {
    const clean = String(question || "").trim();
    if (!clean) return;
    addMessage(clean, "user");
    reply(clean);
    input.value = "";
  };
  const toggle = (open) => {
    root.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    if (open) input.focus();
  };
  root.querySelector(".help-chat-launch").addEventListener("click", () => toggle(!root.classList.contains("is-open")));
  root.querySelector("[data-help-close]").addEventListener("click", () => toggle(false));
  root.querySelector("form").addEventListener("submit", (event) => { event.preventDefault(); ask(input.value); });
  root.querySelectorAll(".help-chat-chips button").forEach((button) => button.addEventListener("click", () => ask(button.textContent)));
  addMessage("Hi! I’m your iMessage Hub help assistant. How can I help with sending or your account?", "bot");
}
let outboxRecordsCache = [];

function money(value, digits = 2) {
  return `$${(Number(value) || 0).toFixed(digits)}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showToast(message, type = "info") {
  if (!els.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast-item show toast-${type}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function openModal(modal) {
  modal?.classList.remove("hidden");
}

function closeModal(modal) {
  modal?.classList.add("hidden");
}

function startLiveClock() {
  const update = () => {
    if (!els.liveClockDisplay) return;
    els.liveClockDisplay.textContent = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  };
  update();
  setInterval(update, 1000);
}

function normalizeRouteName(route) {
  if (route?.code === "US-A") return "iMessage Route";
  if (route?.code === "US-B") return "iMessage with Link";
  return String(route?.name || route?.code || "Route");
}

function showRouteActivationNotice(show) {
  let notice = $("routeActivationNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "routeActivationNotice";
    notice.className = "route-activation-notice hidden";
    notice.innerHTML = `<span aria-hidden="true">!</span><div><strong>Routes unavailable</strong><p>Your first recharge on the panel is compulsory to activate messaging routes. Complete your first recharge, then contact the admin for route activation.</p></div>`;
    document.querySelector(".route-options")?.insertAdjacentElement("afterend", notice);
  }
  notice.classList.toggle("hidden", !show);
}

async function switchView(targetViewId) {
  viewPanels.forEach((panel) => panel.classList.add("hidden"));
  $(targetViewId)?.classList.remove("hidden");

  menuItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-view") === targetViewId);
  });

  els.userDropdownMenu?.classList.add("hidden");

  if (targetViewId === "viewDashboard") await refreshWalletBalance();
  if (targetViewId === "viewOutbox") await loadOutboxRecords();
  if (targetViewId === "viewPaymentHistory") {
    await Promise.all([loadPaymentHistory(), refreshWalletBalance()]);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

menuItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const view = item.getAttribute("data-view");
    if (view) switchView(view);
  });
});

els.btnGetStarted?.addEventListener("click", () => switchView("viewNewCampaign"));

async function loadRoutes() {
  if (!supabase) return;

  try {
    const { data, error } = await supabase.rpc("available_routes_for_user");

    if (error) throw error;

    routeByDisplayName = new Map();
    routeById = new Map();

    (data || []).forEach((route) => {
      const normalized = {
        ...route,
        displayName: normalizeRouteName(route),
        price: Number(route.price_per_message) || 0
      };
      routeByDisplayName.set(normalized.displayName, normalized);
      routeById.set(normalized.id, normalized);
    });

    routeCards.forEach((card) => {
      const radio = card.querySelector('input[name="campaignRoute"]');
      if (!radio) return;

      const route = routeByDisplayName.get(radio.value);
      const priceLabel = card.querySelector("b");

      if (!route) {
        radio.disabled = true;
        radio.checked = false;
        card.classList.remove("active");
        card.style.opacity = "0.45";
        card.style.pointerEvents = "none";
        return;
      }

      radio.disabled = false;
      radio.dataset.routeId = route.id;
      radio.dataset.price = String(route.price);
      card.style.opacity = "1";
      card.style.pointerEvents = "";
      if (priceLabel) priceLabel.textContent = money(route.price, 3);
    });

    let selected = document.querySelector('input[name="campaignRoute"]:checked:not(:disabled)');
    if (!selected) {
      selected = document.querySelector('input[name="campaignRoute"]:not(:disabled)');
      if (selected) selected.checked = true;
    }

    updateRouteUI();

    showRouteActivationNotice(!data?.length);
    if (!data?.length) showToast("First recharge is compulsory to activate routes. Please recharge, then contact admin.", "error");
  } catch (error) {
    console.error("Route lookup error:", error);
    routeByDisplayName = new Map();
    routeById = new Map();
    updateRouteUI();
    showRouteActivationNotice(true);
    showToast("Routes unavailable. First recharge is compulsory; please recharge, then contact admin.", "error");
  }
}

function getSelectedRoute() {
  const selected = document.querySelector('input[name="campaignRoute"]:checked:not(:disabled)');
  if (!selected) return null;

  const route = routeByDisplayName.get(selected.value);
  if (route) return route;

  const routeId = selected.dataset.routeId || "";
  const price = Number(selected.dataset.price) || 0;
  if (!routeId || price <= 0) return null;

  return { id: routeId, displayName: selected.value, price };
}

function updateRouteUI() {
  const route = getSelectedRoute();

  routeCards.forEach((card) => {
    const radio = card.querySelector('input[name="campaignRoute"]');
    card.classList.toggle("active", Boolean(radio?.checked && !radio.disabled));
  });

  if (route) {
    if (els.campaignRouteInput) els.campaignRouteInput.value = route.displayName;
    if (els.campaignSelectedRoute) els.campaignSelectedRoute.textContent = route.displayName;
  } else if (els.campaignSelectedRoute) {
    els.campaignSelectedRoute.textContent = "Unavailable";
  }

  updateCampaignCost();
}

routeRadios.forEach((radio) => radio.addEventListener("change", updateRouteUI));
routeCards.forEach((card) => {
  card.addEventListener("click", () => {
    const radio = card.querySelector('input[name="campaignRoute"]');
    if (!radio || radio.disabled) return;
    radio.checked = true;
    updateRouteUI();
  });
});

els.campaignRouteInput?.addEventListener("change", () => {
  const radio = document.querySelector(
    `input[name="campaignRoute"][value="${els.campaignRouteInput.value}"]`
  );
  if (radio && !radio.disabled) {
    radio.checked = true;
    updateRouteUI();
  }
});

function parseInputNumbers(text) {
  if (!text) return [];
  const unique = new Set();

  String(text)
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (value.replace(/\D/g, "").length >= 7) unique.add(value);
    });

  return [...unique];
}

function updateRecipientCount() {
  parsedCampaignNumbers = parseInputNumbers(els.campaignNumbersArea?.value || "");
  const count = parsedCampaignNumbers.length;
  if (els.recipientCount) {
    els.recipientCount.textContent = `${count} recipient${count === 1 ? "" : "s"}`;
  }
  if (els.recipientCountLarge) els.recipientCountLarge.textContent = String(count);
  if (els.campaignPreviewRecipients) {
    els.campaignPreviewRecipients.textContent = String(count);
  }
  updateCampaignCost();
}

function calculateCampaignCost() {
  const route = getSelectedRoute();
  return route ? parsedCampaignNumbers.length * route.price : 0;
}

function updateCampaignCost() {
  if (els.campaignEstimatedCost) {
    els.campaignEstimatedCost.textContent = money(calculateCampaignCost());
  }
}

function updateMessageCounter() {
  const length = els.mainMessageContent?.value.length || 0;
  if (els.wordsAndItemsCounter) {
    els.wordsAndItemsCounter.textContent = `${length} / 160 characters`;
  }

  if (els.campaignPreviewCharacters) {
    els.campaignPreviewCharacters.textContent = `${length} / 160`;
  }
  if (els.campaignPreviewSegments) {
    els.campaignPreviewSegments.textContent = length ? "1" : "0";
  }

  if (els.campaignPreviewBubble) {
    const message = els.mainMessageContent?.value || "";
    els.campaignPreviewBubble.textContent = message || "Your message preview will appear here.";
    els.campaignPreviewBubble.classList.toggle("is-placeholder", !message);
    els.campaignPreviewBubble.classList.remove("preview-bubble-updated");
    requestAnimationFrame(() => {
      els.campaignPreviewBubble?.classList.add("preview-bubble-updated");
    });
  }
}

function updateCampaignPreviewSender() {
  if (!els.campaignPreviewSender) return;
  els.campaignPreviewSender.textContent =
    els.senderIdInput?.value.trim() || "iMessage-Direct";
}

function updateCampaignPreviewTime() {
  if (!els.campaignPreviewTime) return;
  els.campaignPreviewTime.textContent = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}

els.campaignNumbersArea?.addEventListener("input", () => {
  selectedSourceFileName = "";
  updateRecipientCount();
});
els.mainMessageContent?.addEventListener("input", updateMessageCounter);
els.senderIdInput?.addEventListener("input", updateCampaignPreviewSender);
updateMessageCounter();
updateCampaignPreviewSender();
updateCampaignPreviewTime();

if (els.btnTriggerUpload && els.bulkFileInput) {
  els.btnTriggerUpload.addEventListener("click", () => els.bulkFileInput.click());
  els.bulkFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    selectedSourceFileName = file.name;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (els.campaignNumbersArea) {
        els.campaignNumbersArea.value = String(loadEvent.target?.result || "");
      }
      updateRecipientCount();
      showToast(`${parsedCampaignNumbers.length} recipients loaded from ${file.name}.`, "success");
    };
    reader.onerror = () => {
      selectedSourceFileName = "";
      showToast("Unable to read the selected file.", "error");
    };
    reader.readAsText(file);
    els.bulkFileInput.value = "";
  });
}

async function refreshWalletBalance() {
  if (!supabase || !currentUser) return;

  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Wallet lookup error:", error);
    return;
  }

  currentWalletBalance = Number(data?.balance) || 0;
  const formatted = money(currentWalletBalance);
  if (els.walletBalance) els.walletBalance.textContent = formatted;
  if (els.walletBalanceTop) els.walletBalanceTop.textContent = formatted;
}

function startPaymentTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  let totalSeconds = 20 * 60;

  const update = () => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (els.usdtTimer) {
      els.usdtTimer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      if (els.usdtTimer) els.usdtTimer.textContent = "Expired";
      return;
    }
    totalSeconds -= 1;
  };

  update();
  countdownInterval = setInterval(update, 1000);
}

function ensureCustomAmountUI() {
  if ($("customTopUpAmount")) return;
  const tierPills = document.querySelector(".tier-pills");
  if (!tierPills) return;

  const wrapper = document.createElement("div");
  wrapper.className = "form-section";
  wrapper.style.marginTop = "12px";
  wrapper.innerHTML = `
    <label for="customTopUpAmount" class="portal-label">Custom Amount</label>
    <div style="position:relative;display:flex;align-items:center;">
      <span style="position:absolute;left:13px;color:#7b8798;font-weight:800;">$</span>
      <input id="customTopUpAmount" class="portal-input" type="number" min="1" step="0.01" placeholder="Enter custom amount" style="padding-left:28px;" />
    </div>
    <div class="form-help">Enter any amount of $1.00 or more.</div>`;

  tierPills.insertAdjacentElement("afterend", wrapper);

  $("customTopUpAmount")?.addEventListener("input", (event) => {
    const amount = Number.parseFloat(event.target.value);
    if (!Number.isFinite(amount) || amount < 1) return;
    selectedTopUpAmount = amount;
    $$(".tier-pill").forEach((pill) => pill.classList.remove("active"));
    if (els.usdtAmountDisplay) els.usdtAmountDisplay.textContent = money(amount);
  });
}

function ensurePaymentRequestModal() {
  if ($("paymentRequestSubmittedModal")) return;

  const modal = document.createElement("div");
  modal.id = "paymentRequestSubmittedModal";
  modal.className = "modal-overlay hidden";
  modal.innerHTML = `
    <div class="modal-card campaign-success-modal" style="max-width:470px;">
      <div class="success-animation"><div class="success-check">✓</div></div>
      <div class="modal-header success-modal-header">
        <span class="eyebrow">PAYMENT REQUEST SUBMITTED</span>
        <h2>Request received</h2>
        <p>Your payment request has been submitted for review. Please check Payment History for status updates.</p>
      </div>
      <div class="submission-summary-card" style="grid-template-columns:1fr 1fr;">
        <div><span>Amount</span><strong id="submittedPaymentAmount">$0.00</strong></div>
        <div><span>Status</span><strong style="font-size:13px;">PENDING</strong></div>
      </div>
      <div class="modal-actions success-modal-actions">
        <button id="btnPaymentHistoryFromConfirmation" class="btn-primary" type="button">View Payment History →</button>
        <button id="btnClosePaymentConfirmation" class="btn-secondary" type="button">Close</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  $("btnClosePaymentConfirmation")?.addEventListener("click", () => closeModal(modal));
  $("btnPaymentHistoryFromConfirmation")?.addEventListener("click", async () => {
    closeModal(modal);
    await switchView("viewPaymentHistory");
  });
}

function openTopUpModal() {
  ensureCustomAmountUI();
  ensurePaymentRequestModal();
  if (els.usdtUserEmail) els.usdtUserEmail.value = currentUser?.email || "";
  openModal(els.topUpModal);
  startPaymentTimer();
}

[els.topbarBalanceBtn, els.btnSidebarTopUp, els.btnDashboardTopUp].forEach((button) => {
  button?.addEventListener("click", openTopUpModal);
});

els.btnOpenTopUpFromMenu?.addEventListener("click", openTopUpModal);
els.closeTopUpModal?.addEventListener("click", () => closeModal(els.topUpModal));
els.cancelTopUpBtn?.addEventListener("click", () => closeModal(els.topUpModal));

$$(".tier-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    $$(".tier-pill").forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    selectedTopUpAmount = Number(pill.dataset.amount) || 99;
    const custom = $("customTopUpAmount");
    if (custom) custom.value = "";
    if (els.usdtAmountDisplay) els.usdtAmountDisplay.textContent = money(selectedTopUpAmount);
  });
});

els.copyUsdtAddressBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.usdtWalletAddress?.value || "");
    showToast("TRC20 wallet address copied.", "success");
  } catch {
    showToast("Could not copy wallet address.", "error");
  }
});

els.btnSubmitPaid?.addEventListener("click", async () => {
  if (!supabase || !currentUser) {
    showToast("Your account session has expired.", "error");
    return;
  }

  const customValue = Number.parseFloat($("customTopUpAmount")?.value || "");
  if (Number.isFinite(customValue) && customValue >= 1) selectedTopUpAmount = customValue;
  const txHash = els.usdtTxHash?.value.trim() || "";

  if (!Number.isFinite(selectedTopUpAmount) || selectedTopUpAmount < 1) {
    showToast("Enter a valid top-up amount.", "error");
    return;
  }

  if (!txHash) {
    showToast("Please enter the TRC20 transaction hash.", "error");
    els.usdtTxHash?.focus();
    return;
  }

  const originalText = els.btnSubmitPaid.textContent;
  els.btnSubmitPaid.disabled = true;
  els.btnSubmitPaid.textContent = "Submitting...";

  try {
    const { data, error } = await supabase
      .from("topup_requests")
      .insert({
        user_id: currentUser.id,
        user_email: currentUser.email || "",
        amount: Number(selectedTopUpAmount.toFixed(2)),
        note: "USDT TRC20 payment submitted from portal",
        network: "TRC20",
        wallet_address: els.usdtWalletAddress?.value || "",
        tx_hash: txHash,
        status: "pending"
      })
      .select("id,amount,status,created_at")
      .single();

    if (error) throw error;

    closeModal(els.topUpModal);
    if (els.usdtTxHash) els.usdtTxHash.value = "";
    const custom = $("customTopUpAmount");
    if (custom) custom.value = "";

    ensurePaymentRequestModal();
    if ($("submittedPaymentAmount")) {
      $("submittedPaymentAmount").textContent = money(data.amount);
    }
    openModal($("paymentRequestSubmittedModal"));
    await loadPaymentHistory();
  } catch (error) {
    console.error("Top-up submission error:", error);
    showToast(`Payment request could not be submitted: ${error.message}`, "error");
  } finally {
    els.btnSubmitPaid.disabled = false;
    els.btnSubmitPaid.textContent = originalText || "PAID";
  }
});

function renderPaymentHistory(records) {
  if (!els.paymentHistoryList) return;
  els.paymentHistoryList.innerHTML = "";

  if (!records?.length) {
    els.paymentHistoryList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">$</div>
        <h3>No payments yet</h3>
        <p>Your submitted top-up requests will appear here.</p>
      </div>`;
    return;
  }

  records.forEach((record) => {
    const status = String(record.status || "pending").toLowerCase();
    const approved = status === "paid";
    const item = document.createElement("div");
    item.className = "payment-history-item";
    item.innerHTML = `
      <div class="payment-history-main">
        <strong>${money(record.amount)}</strong>
        <span>USDT ${record.network || "TRC20"}</span>
      </div>
      <div class="payment-history-tx">
        <span>TxID</span>
        <code>${record.tx_hash || "—"}</code>
      </div>
      <div class="payment-history-date">${formatDateTime(record.created_at)}</div>
      <span class="status-pill ${approved ? "status-success" : ""}">${status.toUpperCase()}</span>`;
    els.paymentHistoryList.appendChild(item);
  });
}

async function loadPaymentHistory() {
  if (!supabase || !currentUser) return renderPaymentHistory([]);

  const { data, error } = await supabase
    .from("topup_requests")
    .select("id,amount,network,tx_hash,status,created_at,approved_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Payment history error:", error);
    showToast("Unable to load payment history.", "error");
    return;
  }

  renderPaymentHistory(data || []);
}

function outboxStatusLabel(status) {
  const value = String(status || "pending").toLowerCase();
  if (value === "sent") return "Sent Successfully";
  if (value === "delivered") return "Delivered";
  if (value === "failed") return "Failed";
  return "Submitted";
}

function outboxRecordCost(record) {
  const campaign = record.campaigns || {};
  const totalRecipients = Number(campaign.total_recipients || campaign.recipient_count || 0);
  return totalRecipients > 0 ? Number(campaign.total_cost || 0) / totalRecipients : 0;
}

function renderOutboxSummary(records) {
  const summary = records.reduce((totals, record) => {
    const label = outboxStatusLabel(record.status);
    totals.total += 1;
    if (["Sent Successfully", "Delivered"].includes(label)) totals.charges += outboxRecordCost(record);
    if (label === "Sent Successfully") totals.sent += 1;
    else if (label === "Delivered") totals.delivered += 1;
    else if (label === "Failed") totals.failed += 1;
    else totals.submitted += 1;
    return totals;
  }, { total: 0, submitted: 0, sent: 0, delivered: 0, failed: 0, charges: 0 });

  if (els.outboxTotalCount) els.outboxTotalCount.textContent = summary.total.toLocaleString();
  if (els.outboxSubmittedCount) els.outboxSubmittedCount.textContent = summary.submitted.toLocaleString();
  if (els.outboxSentCount) els.outboxSentCount.textContent = summary.sent.toLocaleString();
  if (els.outboxDeliveredCount) els.outboxDeliveredCount.textContent = summary.delivered.toLocaleString();
  if (els.outboxFailedCount) els.outboxFailedCount.textContent = summary.failed.toLocaleString();
  if (els.outboxTotalCharges) els.outboxTotalCharges.textContent = money(summary.charges);
}

function renderOutboxRecords(records) {
  if (!els.outboxRecordsTbody) return;
  els.outboxRecordsTbody.innerHTML = "";
  renderOutboxSummary(records || []);

  if (!records?.length) {
    els.outboxNoDataNotice?.classList.remove("hidden");
    return;
  }

  els.outboxNoDataNotice?.classList.add("hidden");

  records.forEach((record) => {
    const campaign = record.campaigns || {};
    const route = routeById.get(campaign.route_id);
    const routeName = route?.displayName || "Route";
    const perMessageCost = outboxRecordCost(record);
    const label = outboxStatusLabel(record.status);
    const successful = label === "Sent Successfully" || label === "Delivered";
    const statusClass = successful ? "status-success" : label === "Failed" ? "status-failed" : "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="outbox-id">${String(record.id || "—").slice(0, 12)}</span></td>
      <td>Messaging</td>
      <td><strong>${routeName}</strong></td>
      <td>${money(perMessageCost, 3)}</td>
      <td><span class="status-pill ${statusClass}">${label}</span></td>
      <td><strong>${record.phone || "—"}</strong></td>
      <td>${campaign.sender_id || "iMessage-Direct"}</td>
      <td>${formatDateTime(record.created_at)}</td>
      <td><span class="outbox-state">${label.toUpperCase()}</span></td>`;
    els.outboxRecordsTbody.appendChild(row);
  });
}

function applyOutboxFilters() {
  const fromValue = els.outboxFromDate?.value;
  const toValue = els.outboxToDate?.value;
  const fromTime = fromValue ? new Date(fromValue).getTime() : null;
  const toTime = toValue ? new Date(toValue).getTime() : null;
  const selectedStatus = els.outboxStatusFilter?.value || "all";

  if (fromTime && toTime && fromTime > toTime) {
    if (els.outboxFilterMessage) els.outboxFilterMessage.textContent = "The From date must be earlier than the To date.";
    showToast("Please select a valid date range.", "error");
    return;
  }

  const filtered = outboxRecordsCache.filter((record) => {
    const createdTime = new Date(record.created_at).getTime();
    const rawStatus = String(record.status || "pending").toLowerCase();
    const statusKey = ["pending", "sending", "processing", "approved"].includes(rawStatus) ? "submitted" : rawStatus;
    const matchesDate = (!fromTime || createdTime >= fromTime) && (!toTime || createdTime <= toTime);
    const matchesStatus = selectedStatus === "all" || statusKey === selectedStatus;
    return matchesDate && matchesStatus;
  });

  renderOutboxRecords(filtered);
  if (els.outboxFilterMessage) {
    els.outboxFilterMessage.textContent = `Showing ${filtered.length.toLocaleString()} of ${outboxRecordsCache.length.toLocaleString()} loaded messages.`;
  }
}

function renderMessageActivityChart(records) {
  if (!els.messageActivityChart) return;

  const days = [];
  const totals = new Map();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    days.push({ key, label: date.toLocaleDateString("en-US", { weekday: "short" }) });
    totals.set(key, 0);
  }

  (records || []).forEach((record) => {
    const date = new Date(record.created_at);
    if (Number.isNaN(date.getTime())) return;
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const key = local.toISOString().slice(0, 10);
    if (totals.has(key)) totals.set(key, totals.get(key) + 1);
  });

  const values = days.map((day) => totals.get(day.key) || 0);
  const maxValue = Math.max(1, ...values);
  const sevenDayTotal = values.reduce((sum, value) => sum + value, 0);
  if (els.activitySevenDayTotal) {
    els.activitySevenDayTotal.textContent = `${sevenDayTotal.toLocaleString()} messages`;
  }

  els.messageActivityChart.innerHTML = days.map((day, index) => {
    const value = values[index];
    const height = Math.max(6, Math.round((value / maxValue) * 100));
    return `
      <div class="activity-bar-column" title="${day.label}: ${value} messages">
        <span class="activity-bar-value">${value}</span>
        <div class="activity-bar-track">
          <div class="activity-bar-fill" style="height:${height}%"></div>
        </div>
        <span class="activity-bar-label">${day.label}</span>
      </div>`;
  }).join("");
}

async function loadOutboxRecords() {
  if (!supabase || !currentUser) {
    outboxRecordsCache = [];
    return applyOutboxFilters();
  }

  const { data, error } = await supabase
    .from("campaign_messages")
    .select(`
      id,
      campaign_id,
      phone,
      status,
      created_at,
      campaigns!inner (
        id,
        route_id,
        sender_id,
        total_cost,
        total_recipients,
        recipient_count,
        status,
        created_at
      )
    `)
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Outbox lookup error:", error);
    showToast("Unable to load Outbox records.", "error");
    return;
  }

  outboxRecordsCache = data || [];
  renderMessageActivityChart(outboxRecordsCache);
  applyOutboxFilters();
}

async function submitCampaign() {
  if (!supabase || !currentUser) {
    showToast("Your account session has expired.", "error");
    return;
  }

  parsedCampaignNumbers = parseInputNumbers(els.campaignNumbersArea?.value || "");
  const message = els.mainMessageContent?.value.trim() || "";
  const sender = els.senderIdInput?.value.trim() || "iMessage-Direct";
  const route = getSelectedRoute();

  if (!route?.id) {
    showToast("Route unavailable. First recharge is compulsory; please recharge, then contact admin.", "error");
    return;
  }

  if (!parsedCampaignNumbers.length) {
    showToast("Please enter or upload at least one recipient number.", "error");
    els.campaignNumbersArea?.focus();
    return;
  }

  if (!message) {
    showToast("Message content is required.", "error");
    els.mainMessageContent?.focus();
    return;
  }

  const estimatedCost = calculateCampaignCost();
  await refreshWalletBalance();

  if (currentWalletBalance < estimatedCost) {
    showToast(
      `Insufficient balance. Required ${money(estimatedCost)}, available ${money(currentWalletBalance)}.`,
      "error"
    );
    return;
  }

  const originalHtml = els.btnSubmitCampaign?.innerHTML || "Submit Campaign";
  if (els.btnSubmitCampaign) {
    els.btnSubmitCampaign.disabled = true;
    els.btnSubmitCampaign.innerHTML = `<span class="button-loading-spinner"></span> Submitting...`;
  }

  try {
    const campaignName = selectedSourceFileName
      ? selectedSourceFileName.replace(/\.[^.]+$/, "")
      : `Campaign ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;

    const { data, error } = await supabase.rpc("submit_campaign", {
      p_route_id: route.id,
      p_name: campaignName,
      p_sender_id: sender,
      p_message: message,
      p_recipients: parsedCampaignNumbers,
      p_source_file_name: selectedSourceFileName || ""
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    currentWalletBalance = Number(result?.new_balance ?? currentWalletBalance);
    const formattedBalance = money(currentWalletBalance);
    if (els.walletBalance) els.walletBalance.textContent = formattedBalance;
    if (els.walletBalanceTop) els.walletBalanceTop.textContent = formattedBalance;

    if (els.successRecipientCount) {
      els.successRecipientCount.textContent = String(result?.recipient_count || parsedCampaignNumbers.length);
    }
    if (els.successRouteName) els.successRouteName.textContent = route.displayName;
    if (els.successCampaignCost) {
      els.successCampaignCost.textContent = money(result?.total_cost ?? estimatedCost);
    }

    openModal(els.campaignSuccessModal);
    showToast("Campaign submitted for admin approval. Balance will be charged after it is marked sent.", "success");
    await loadOutboxRecords();
  } catch (error) {
    console.error("Campaign submission error:", error);
    showToast(error.message || "Unable to submit campaign.", "error");
  } finally {
    if (els.btnSubmitCampaign) {
      els.btnSubmitCampaign.disabled = false;
      els.btnSubmitCampaign.innerHTML = originalHtml;
    }
  }
}

els.btnSubmitCampaign?.addEventListener("click", submitCampaign);
els.btnSuccessClose?.addEventListener("click", () => closeModal(els.campaignSuccessModal));
els.btnSuccessGoOutbox?.addEventListener("click", async () => {
  closeModal(els.campaignSuccessModal);
  await switchView("viewOutbox");
});

els.btnFilterSearch?.addEventListener("click", async () => {
  await loadOutboxRecords();
  showToast("Outbox refreshed.", "success");
});

els.btnApplyOutboxFilters?.addEventListener("click", applyOutboxFilters);
els.btnResetOutboxFilters?.addEventListener("click", () => {
  if (els.outboxFromDate) els.outboxFromDate.value = "";
  if (els.outboxToDate) els.outboxToDate.value = "";
  if (els.outboxStatusFilter) els.outboxStatusFilter.value = "all";
  applyOutboxFilters();
  showToast("Outbox filters reset.", "success");
});

els.btnClearOutboxRecords?.addEventListener("click", async () => {
  if (!supabase || !currentUser) return;
  if (!window.confirm("Clear all Outbox records for this account?")) return;

  try {
    const { error: messagesError } = await supabase
      .from("campaign_messages")
      .delete()
      .eq("user_id", currentUser.id);
    if (messagesError) throw messagesError;

    const { error: campaignsError } = await supabase
      .from("campaigns")
      .delete()
      .eq("user_id", currentUser.id);
    if (campaignsError) throw campaignsError;

    await loadOutboxRecords();
    showToast("Outbox records cleared.", "success");
  } catch (error) {
    console.error("Outbox clear error:", error);
    showToast("Unable to clear Outbox records.", "error");
  }
});

profileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openModal(els.accountModal);
    els.userDropdownMenu?.classList.add("hidden");
  });
});

els.closeAccountModal?.addEventListener("click", () => closeModal(els.accountModal));
els.closeAccountModalBtn?.addEventListener("click", () => closeModal(els.accountModal));
els.btnProfilePasswordReset?.addEventListener("click", async () => {
  const email = currentUser?.email;
  if (!supabase || !email) {
    showToast("No account email is available.", "error");
    return;
  }

  els.btnProfilePasswordReset.disabled = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/index.html?recovery=1`
    });
    if (error) throw error;
    showToast("A secure password reset link was sent to your email.", "success");
  } catch (error) {
    console.error("Profile password reset error:", error);
    showToast(error.message || "Unable to send password reset email.", "error");
  } finally {
    els.btnProfilePasswordReset.disabled = false;
  }
});

if (els.userMenuBtn && els.userDropdownMenu) {
  els.userMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    els.userDropdownMenu.classList.toggle("hidden");
  });
  document.addEventListener("click", () => els.userDropdownMenu.classList.add("hidden"));
  els.userDropdownMenu.addEventListener("click", (event) => event.stopPropagation());
}

els.logoutButton?.addEventListener("click", async () => {
  try {
    await supabase?.auth.signOut();
  } finally {
    window.location.href = "index.html";
  }
});

async function loadProfile() {
  if (!supabase || !currentUser) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,status,created_at")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.warn("Profile lookup error:", error);
    return null;
  }

  return data;
}

function renderAccount() {
  const metadata = currentUser?.user_metadata || {};
  const fullName = currentProfile?.full_name || metadata.full_name || currentUser?.email?.split("@")[0] || "User";
  const email = currentProfile?.email || currentUser?.email || "N/A";
  const role = currentProfile?.role || "agent";
  const status = currentProfile?.status || "active";
  const uid = currentUser?.id || "N/A";
  const accountCode = "0016C" + (uid.replace(/\D/g, "").slice(0, 3) || "136");

  if (els.welcomeName) els.welcomeName.textContent = fullName;
  if (els.welcomeEmail) els.welcomeEmail.textContent = email;
  if (els.accountRole) {
    els.accountRole.textContent = role === "admin" ? "Administrator" : "User";
  }
  if (els.accountStatus) els.accountStatus.textContent = status.toUpperCase();
  if (els.headerName) els.headerName.textContent = accountCode;
  if (els.dashWelcomeId) els.dashWelcomeId.textContent = accountCode;
  if (els.dropdownUserTitle) els.dropdownUserTitle.textContent = accountCode;
  if (els.modalUserName) els.modalUserName.textContent = `${fullName} (${accountCode})`;
  if (els.modalUserEmail) els.modalUserEmail.textContent = email;
  if (els.usdtUserEmail) els.usdtUserEmail.value = email;
  if (els.headerAvatar) els.headerAvatar.textContent = fullName.charAt(0).toUpperCase();
  if (els.userId) els.userId.textContent = uid;
  if (els.createdAt) els.createdAt.textContent = formatDateTime(currentUser?.created_at);
}

function correctDecorativeStatusCopy() {
  const deliveryCheck = document.querySelector(".delivery-check");
  if (deliveryCheck) deliveryCheck.textContent = "✓ Submitted";
  const rightIncoming = document.querySelector(".phone-right .message-bubble.incoming");
  if (rightIncoming) rightIncoming.textContent = "Campaign queued";
}

async function initDashboard() {
  setupHelpChatbot();
  startLiveClock();
  ensureCustomAmountUI();
  ensurePaymentRequestModal();
  correctDecorativeStatusCopy();

  if (!supabase) {
    if (els.dashboardMessage) {
      els.dashboardMessage.textContent = "Supabase configuration is missing.";
      els.dashboardMessage.classList.remove("hidden");
    }
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      window.location.href = "index.html";
      return;
    }

    currentUser = user;
    currentProfile = await loadProfile();
    if (String(currentProfile?.status || "active").toLowerCase() !== "active") {
      await supabase.auth.signOut();
      window.location.replace("index.html?account=blocked");
      return;
    }
    renderAccount();

    await loadRoutes();
    updateRecipientCount();
    updateMessageCounter();

    await Promise.all([
      refreshWalletBalance(),
      loadPaymentHistory(),
      loadOutboxRecords()
    ]);

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) window.location.href = "index.html";
    });
  } catch (error) {
    console.error("Dashboard initialization error:", error);
    if (els.dashboardMessage) {
      els.dashboardMessage.textContent = "Unable to load your account.";
      els.dashboardMessage.classList.remove("hidden");
    }
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentUser) {
    refreshWalletBalance();
    loadPaymentHistory();
    loadRoutes();
  }
});

initDashboard();
