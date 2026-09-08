import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const adminLogoutBtn = $("adminLogoutBtn");
const adminTableBody = $("adminTableBody");
const adminEmptyState = $("adminEmptyState");
const pendingCount = $("pendingCount");
const approvedVolume = $("approvedVolume");
const btnRefreshAdmin = $("btnRefreshAdmin");
const btnRefreshRoutes = $("btnRefreshRoutes");
const btnRefreshUsers = $("btnRefreshUsers");
const routesLoading = $("routesLoading");
const routesList = $("routesList");
const toastContainer = $("toastContainer");
const adminUsersBody = $("adminUsersBody");
const adminUsersMobile = $("adminUsersMobile");
const btnUserNotifications = $("btnUserNotifications");
const btnMarkUsersRead = $("btnMarkUsersRead");
const adminUserNotifications = $("adminUserNotifications");
const adminNotificationBadge = $("adminNotificationBadge");
const adminNotificationList = $("adminNotificationList");
const adminUsersEmpty = $("adminUsersEmpty");
const adminCampaignBody = $("adminCampaignBody");
const adminCampaignEmpty = $("adminCampaignEmpty");
const adminTotalUsers = $("adminTotalUsers");
const adminWalletTotal = $("adminWalletTotal");
const adminTopupTotal = $("adminTopupTotal");
const adminCampaignTotal = $("adminCampaignTotal");
const btnRefreshAdminHistory = $("btnRefreshAdminHistory");
const adminHistoryUserFilter = $("adminHistoryUserFilter");
const adminHistorySearch = $("adminHistorySearch");
const adminHistoryCount = $("adminHistoryCount");
const adminHistoryLoading = $("adminHistoryLoading");
const adminHistoryList = $("adminHistoryList");
const adminHistoryEmpty = $("adminHistoryEmpty");
const adminViewButtons = $$('[data-admin-view]');
const adminViewPanels = $$(".admin-view-panel");
let adminHistoryRows = [];
let userRouteAccess = new Map();
let newUserNotifications = [];
const USER_NOTIFICATION_SEEN_KEY = "imessagehub_admin_users_seen_at";

function showToast(message, type = "info") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast-item show toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value, digits = 2) {
  return `$${(Number(value) || 0).toFixed(digits)}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function displayRouteName(route) {
  if (route?.code === "US-A") return "iMessage Route";
  if (route?.code === "US-B") return "iMessage with Link";
  return route?.name || route?.code || "Route";
}

function displayCampaignStatus(status) {
  const value = String(status || "processing").toLowerCase();
  if (["failed", "cancelled"].includes(value)) return "FAILED";
  if (value === "approved") return "APPROVED";
  if (["sent", "completed"].includes(value)) return "SENT";
  if (value === "delivered") return "DELIVERED";
  return "SUBMITTED";
}

function historyStatusClass(status) {
  const value = String(status || "submitted").toLowerCase();
  if (["sent", "completed"].includes(value)) return "status-sent";
  if (value === "approved") return "status-approved";
  if (["failed", "cancelled"].includes(value)) return "status-failed";
  return "status-submitted";
}

function showAccessProblem(email = "") {
  const main = document.querySelector(".platform-content-area");
  if (!main) return;

  main.innerHTML = `
    <div class="portal-card" style="max-width:720px;margin:40px auto;">
      <div class="portal-card-header">
        <div>
          <span class="eyebrow">ADMIN ACCESS</span>
          <h2>Admin account required</h2>
          <p>The signed-in account does not have admin access.</p>
        </div>
      </div>
      <div class="account-info-grid">
        <div class="account-info-item">
          <span>Signed-in email</span>
          <strong>${escapeHtml(email || "No active session")}</strong>
        </div>
        <div class="account-info-item">
          <span>Required role</span>
          <strong>admin / active</strong>
        </div>
      </div>
      <div class="modal-actions" style="margin-top:18px;">
        <button id="adminAccessSignOut" class="btn-primary" type="button">Sign out</button>
      </div>
    </div>`;

  $("adminAccessSignOut")?.addEventListener("click", async () => {
    await supabase?.auth.signOut();
    window.location.href = "index.html";
  });
}

async function verifyAdminAccess() {
  if (!supabase) {
    showToast("Supabase configuration is missing.", "error");
    return false;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      window.location.replace("index.html");
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const role = String(profile?.role || "").toLowerCase();
    const status = String(profile?.status || "").toLowerCase();
    if (["admin", "owner"].includes(role) && status === "active") return true;

    showAccessProblem(user.email || "");
    return false;
  } catch (error) {
    console.error("Admin authorization error:", error);
    showToast("Unable to verify admin access.", "error");
    return false;
  }
}

async function switchAdminView(viewId) {
  adminViewPanels.forEach((panel) => panel.classList.add("hidden"));
  $(viewId)?.classList.remove("hidden");
  adminViewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.adminView === viewId);
  });

  if (viewId === "adminUsersView") {
    await loadUsersAndActivity();
  } else if (viewId === "adminHistoryView") {
    await loadAdminSendingHistory();
  } else {
    await Promise.all([fetchRequests(), loadRoutes()]);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

adminViewButtons.forEach((button) => {
  button.addEventListener("click", () => switchAdminView(button.dataset.adminView));
});

async function loadRoutes() {
  if (!routesList || !supabase) return;
  routesLoading?.classList.remove("hidden");
  routesList.innerHTML = "";

  try {
    const { data, error } = await supabase
      .from("routes")
      .select("id,name,code,enabled,price_per_message,updated_at,created_at")
      .order("enabled", { ascending: false })
      .order("price_per_message", { ascending: true });

    if (error) throw error;

    if (!data?.length) {
      routesList.innerHTML = `<div style="padding:1rem;border:1px dashed #d9e2ec;border-radius:12px;color:#7b8798;">No routes configured.</div>`;
      return;
    }

    data.forEach((route) => routesList.appendChild(createRouteRow(route)));
  } catch (error) {
    console.error("Route loading error:", error);
    routesList.innerHTML = `<div style="padding:1rem;border:1px dashed #d9e2ec;border-radius:12px;color:#7b8798;">Route controls are currently unavailable.</div>`;
    showToast(`Could not load routes: ${error.message}`, "error");
  } finally {
    routesLoading?.classList.add("hidden");
  }
}

function createRouteRow(route) {
  const row = document.createElement("div");
  row.className = "admin-route-row";

  const info = document.createElement("div");
  info.className = "admin-route-info";
  info.innerHTML = `<strong>${escapeHtml(displayRouteName(route))}</strong><span>${escapeHtml(route.code)}</span>`;

  const status = document.createElement("span");
  status.className = `status-pill ${route.enabled ? "status-success" : ""}`;
  status.textContent = route.enabled ? "ACTIVE" : "DISABLED";

  const price = document.createElement("input");
  price.type = "number";
  price.min = "0";
  price.step = "0.001";
  price.value = Number(route.price_per_message || 0).toFixed(3);
  price.className = "portal-input";
  price.setAttribute("aria-label", `${displayRouteName(route)} price per message`);

  const priceWrap = document.createElement("label");
  priceWrap.className = "admin-route-price";
  priceWrap.innerHTML = "<span>PRICE / MESSAGE</span>";
  priceWrap.appendChild(price);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = route.enabled ? "btn-secondary" : "btn-primary";
  toggle.classList.add("admin-route-toggle");
  toggle.textContent = route.enabled ? "Turn OFF" : "Turn ON";

  price.addEventListener("change", async () => {
    const value = Number.parseFloat(price.value);
    if (!Number.isFinite(value) || value < 0) {
      showToast("Enter a valid route price.", "error");
      price.value = Number(route.price_per_message || 0).toFixed(3);
      return;
    }
    await updateRoute(route.id, { price_per_message: value }, price);
  });

  toggle.addEventListener("click", async () => {
    await updateRoute(route.id, { enabled: !route.enabled }, toggle);
  });

  row.append(info, status, priceWrap, toggle);
  return row;
}

async function updateRoute(id, changes, control) {
  if (!supabase) return;
  if (control) control.disabled = true;

  try {
    const { error } = await supabase
      .from("routes")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    showToast("Route updated successfully.", "success");
    await loadRoutes();
  } catch (error) {
    console.error("Route update error:", error);
    showToast(`Route update failed: ${error.message}`, "error");
  } finally {
    if (control) control.disabled = false;
  }
}

async function fetchRequests() {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from("topup_requests")
      .select("id,user_id,user_email,amount,network,tx_hash,status,created_at,approved_at,approved_by")
      .order("created_at", { ascending: false });

    if (error) throw error;
    renderRequests(data || []);
  } catch (error) {
    console.error("Top-up request error:", error);
    showToast(`Could not load payment requests: ${error.message}`, "error");
  }
}

function renderRequests(requests) {
  if (!adminTableBody) return;
  adminTableBody.innerHTML = "";
  let pending = 0;
  let totalApproved = 0;

  if (!requests.length) {
    adminEmptyState?.classList.remove("hidden");
    if (pendingCount) pendingCount.textContent = "0";
    if (approvedVolume) approvedVolume.textContent = "$0.00";
    return;
  }

  adminEmptyState?.classList.add("hidden");

  requests.forEach((request) => {
    const statusText = String(request.status || "pending").toLowerCase();
    const amount = Number(request.amount) || 0;
    const isPending = statusText === "pending";
    const isPaid = statusText === "paid";

    if (isPending) pending += 1;
    if (isPaid) totalApproved += amount;

    const row = document.createElement("tr");
    const userCell = document.createElement("td");
    userCell.innerHTML = `<strong>${escapeHtml(request.user_email || request.user_id || "N/A")}</strong>`;

    const amountCell = document.createElement("td");
    amountCell.textContent = money(amount);

    const networkCell = document.createElement("td");
    networkCell.innerHTML = `<span class="status-pill">${escapeHtml(request.network || "TRC20")}</span>`;

    const txCell = document.createElement("td");
    const txWrap = document.createElement("div");
    txWrap.style.cssText = "display:flex;align-items:center;gap:8px;";
    const txCode = document.createElement("code");
    txCode.className = "code-pill";
    txCode.style.cssText = "max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    txCode.textContent = request.tx_hash || "No Hash";
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "btn-secondary";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      try {
        if (!request.tx_hash) throw new Error("No transaction hash");
        await navigator.clipboard.writeText(request.tx_hash);
        showToast("Transaction hash copied.", "success");
      } catch {
        showToast("Could not copy transaction hash.", "error");
      }
    });
    txWrap.append(txCode, copyButton);
    txCell.appendChild(txWrap);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(request.created_at);

    const statusCell = document.createElement("td");
    statusCell.innerHTML = `<span class="status-pill ${isPaid ? "status-success" : ""}">${escapeHtml(statusText.toUpperCase())}</span>`;

    const actionCell = document.createElement("td");
    if (isPending) {
      const approveButton = document.createElement("button");
      approveButton.type = "button";
      approveButton.className = "btn-primary";
      approveButton.textContent = "Approve & Credit";
      approveButton.addEventListener("click", () => handleApprove(request, approveButton));
      actionCell.appendChild(approveButton);
    } else if (isPaid) {
      actionCell.innerHTML = `<span style="color:#087548;font-weight:800;">✓ Credited</span>`;
    } else {
      actionCell.textContent = "—";
    }

    row.append(userCell, amountCell, networkCell, txCell, dateCell, statusCell, actionCell);
    adminTableBody.appendChild(row);
  });

  if (pendingCount) pendingCount.textContent = String(pending);
  if (approvedVolume) approvedVolume.textContent = money(totalApproved);
}

async function handleApprove(request, button) {
  if (!supabase || !request?.id) return;
  button.disabled = true;
  button.textContent = "Approving...";

  try {
    const { error } = await supabase.rpc("approve_topup", { p_topup_id: request.id });
    if (error) throw error;

    showToast(`Payment of ${money(request.amount)} approved and credited.`, "success");
    await Promise.all([fetchRequests(), loadUsersAndActivity()]);
  } catch (error) {
    console.error("Payment approval error:", error);
    showToast(`Approval failed: ${error.message}`, "error");
    button.disabled = false;
    button.textContent = "Approve & Credit";
  }
}

async function loadUsersAndActivity() {
  if (!supabase) return;

  try {
    const [usersResult, campaignsResult, accessResult, notificationsResult] = await Promise.all([
      supabase.rpc("admin_users_overview"),
      supabase.rpc("admin_campaign_activity"),
      supabase.rpc("admin_user_route_access"),
      supabase.rpc("admin_new_user_notifications", { p_limit: 20 })
    ]);

    if (usersResult.error) throw usersResult.error;
    if (campaignsResult.error) throw campaignsResult.error;
    if (accessResult.error) throw accessResult.error;
    if (notificationsResult.error) throw notificationsResult.error;

    userRouteAccess = new Map();
    (accessResult.data || []).forEach((item) => {
      if (!userRouteAccess.has(item.user_id)) userRouteAccess.set(item.user_id, []);
      userRouteAccess.get(item.user_id).push(item);
    });

    renderUsers(usersResult.data || []);
    renderCampaignActivity(campaignsResult.data || []);
    newUserNotifications = notificationsResult.data || [];
    renderUserNotifications();
  } catch (error) {
    console.error("Admin users/activity error:", error);
    showToast(`Could not load users: ${error.message}`, "error");
  }
}

function renderUserNotifications() {
  if (!adminNotificationList || !adminNotificationBadge) return;
  const seenAt = localStorage.getItem(USER_NOTIFICATION_SEEN_KEY) || "1970-01-01T00:00:00.000Z";
  const unread = newUserNotifications.filter((item) => new Date(item.created_at) > new Date(seenAt));
  adminNotificationBadge.textContent = unread.length > 9 ? "9+" : String(unread.length);
  adminNotificationBadge.classList.toggle("hidden", unread.length === 0);
  adminNotificationList.innerHTML = newUserNotifications.length
    ? newUserNotifications.map((item) => {
        const isNew = new Date(item.created_at) > new Date(seenAt);
        const initial = String(item.full_name || item.email || "U").trim().charAt(0).toUpperCase();
        return `<article class="admin-notification-item ${isNew ? "is-unread" : ""}">
          <span class="admin-notification-avatar">${escapeHtml(initial)}</span>
          <div><strong>${escapeHtml(item.full_name || "New user")}</strong><span>${escapeHtml(item.email || item.user_id)}</span><small>Joined ${formatDate(item.created_at)}</small></div>
          ${isNew ? '<i aria-label="Unread"></i>' : ""}
        </article>`;
      }).join("")
    : '<div class="admin-notification-empty">No user updates yet.</div>';
}

function markUserNotificationsRead() {
  localStorage.setItem(USER_NOTIFICATION_SEEN_KEY, new Date().toISOString());
  renderUserNotifications();
  showToast("New user notifications marked as read.", "success");
}

btnUserNotifications?.addEventListener("click", () => {
  const opening = adminUserNotifications?.classList.contains("hidden");
  adminUserNotifications?.classList.toggle("hidden");
  btnUserNotifications.setAttribute("aria-expanded", String(Boolean(opening)));
});
btnMarkUsersRead?.addEventListener("click", markUserNotificationsRead);

function renderUsers(users) {
  if (!adminUsersBody) return;
  adminUsersBody.innerHTML = "";
  if (adminUsersMobile) adminUsersMobile.innerHTML = "";

  const walletTotal = users.reduce((sum, user) => sum + (Number(user.wallet_balance) || 0), 0);
  const topupTotal = users.reduce((sum, user) => sum + (Number(user.approved_topups) || 0), 0);
  const campaignTotal = users.reduce((sum, user) => sum + (Number(user.campaign_count) || 0), 0);

  if (adminTotalUsers) adminTotalUsers.textContent = String(users.length);
  if (adminWalletTotal) adminWalletTotal.textContent = money(walletTotal);
  if (adminTopupTotal) adminTopupTotal.textContent = money(topupTotal);
  if (adminCampaignTotal) adminCampaignTotal.textContent = String(campaignTotal);

  if (!users.length) {
    adminUsersEmpty?.classList.remove("hidden");
    return;
  }
  adminUsersEmpty?.classList.add("hidden");

  users.forEach((user) => {
    const routes = userRouteAccess.get(user.user_id) || [];
    const row = document.createElement("tr");
    const role = String(user.role || "agent").toUpperCase();
    const status = String(user.status || "active").toUpperCase();
    row.innerHTML = `
      <td>
        <strong style="display:block;">${escapeHtml(user.full_name || "User")}</strong>
        <span style="display:block;margin-top:3px;color:#7b8798;">${escapeHtml(user.email || user.user_id || "—")}</span>
      </td>
      <td><span class="status-pill ${status === "ACTIVE" ? "status-success" : ""}">${escapeHtml(role)} · ${escapeHtml(status)}</span></td>
      <td><div class="admin-user-route-switches">${renderUserRouteSwitches(user, routes)}</div></td>
      <td><strong>${money(user.wallet_balance)}</strong></td>
      <td><strong style="color:#087548;">${money(user.approved_topups)}</strong></td>
      <td>${money(user.pending_topups)}</td>
      <td>${Number(user.campaign_count) || 0}</td>
      <td>${money(user.total_campaign_spend)}</td>
      <td><code class="code-pill">${escapeHtml(user.latest_source_file || "Manual / none")}</code></td>
      <td>${formatDate(user.last_activity)}</td>
      <td>${renderUserActions(user)}</td>`;
    adminUsersBody.appendChild(row);

    if (adminUsersMobile) {
      const card = document.createElement("article");
      card.className = `admin-user-card ${status === "ACTIVE" ? "" : "is-blocked"}`;
      card.innerHTML = `
        <div class="admin-user-card-head">
          <div><strong>${escapeHtml(user.full_name || "User")}</strong><span>${escapeHtml(user.email || user.user_id || "—")}</span></div>
          <span class="status-pill ${status === "ACTIVE" ? "status-success" : "status-blocked"}">${escapeHtml(status)}</span>
        </div>
        <div class="admin-user-mobile-routes">
          <span class="admin-control-label">ROUTE ACCESS</span>
          ${renderUserRouteSwitches(user, routes)}
        </div>
        <div class="admin-user-card-stats">
          <div><span>Wallet</span><strong>${money(user.wallet_balance)}</strong></div>
          <div><span>Campaigns</span><strong>${Number(user.campaign_count) || 0}</strong></div>
          <div><span>Spend</span><strong>${money(user.total_campaign_spend)}</strong></div>
        </div>
        <div class="admin-user-card-actions">${renderUserActions(user)}</div>`;
      adminUsersMobile.appendChild(card);
    }
  });
}

function renderUserRouteSwitches(user, routes) {
  if (!routes.length) return '<span class="admin-route-unavailable">No routes</span>';
  const protectedAccount = ["admin", "owner"].includes(String(user.role || "").toLowerCase());
  return routes.map((route) => {
    const checked = route.allowed;
    const disabled = protectedAccount;
    const label = displayRouteName({ name: route.route_name, code: route.route_code });
    return `<label class="admin-user-route-control ${checked ? "is-on" : "is-off"}">
      <span>${escapeHtml(label)}${route.route_enabled ? "" : " · Global OFF"}</span>
      <input type="checkbox" data-user-route data-user-id="${escapeHtml(user.user_id)}" data-route-id="${escapeHtml(route.route_id)}" data-route-name="${escapeHtml(label)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
      <i aria-hidden="true"></i>
    </label>`;
  }).join("");
}

function renderUserActions(user) {
  const role = String(user.role || "").toLowerCase();
  if (["admin", "owner"].includes(role)) return '<span class="admin-protected-account">Protected admin</span>';
  const blocked = String(user.status || "active").toLowerCase() !== "active";
  return `<div class="admin-user-actions">
    <button type="button" class="admin-user-action ${blocked ? "unblock" : "block"}" data-user-status data-user-id="${escapeHtml(user.user_id)}" data-user-email="${escapeHtml(user.email || "this user")}" data-action="${blocked ? "unblock" : "block"}">${blocked ? "Unblock" : "Block"}</button>
    <button type="button" class="admin-user-action delete" data-user-delete data-user-id="${escapeHtml(user.user_id)}" data-user-email="${escapeHtml(user.email || "this user")}">Delete</button>
  </div>`;
}

async function setUserRouteAccess(input) {
  const label = input.closest("label");
  const enabled = input.checked;
  input.disabled = true;
  label?.classList.add("is-saving");
  try {
    const { error } = await supabase.rpc("admin_set_user_route_access", {
      p_user_id: input.dataset.userId,
      p_route_id: input.dataset.routeId,
      p_enabled: enabled
    });
    if (error) throw error;
    document.querySelectorAll(`[data-user-route][data-user-id="${CSS.escape(input.dataset.userId)}"][data-route-id="${CSS.escape(input.dataset.routeId)}"]`).forEach((peer) => {
      peer.checked = enabled;
      peer.closest("label")?.classList.toggle("is-on", enabled);
      peer.closest("label")?.classList.toggle("is-off", !enabled);
    });
    showToast(`${input.dataset.routeName} ${enabled ? "enabled" : "disabled"} for user.`, "success");
  } catch (error) {
    input.checked = !enabled;
    showToast(`Route update failed: ${error.message}`, "error");
  } finally {
    input.disabled = false;
    label?.classList.remove("is-saving");
  }
}

async function manageUser(action, userId, email, button) {
  if (action === "delete") {
    const first = window.confirm(`Permanently delete ${email}? Their wallet, campaigns and history will also be removed.`);
    if (!first) return;
    const typed = window.prompt(`Type DELETE to permanently remove ${email}.`);
    if (typed !== "DELETE") {
      showToast("Delete cancelled.", "info");
      return;
    }
  } else if (!window.confirm(`${action === "block" ? "Block" : "Unblock"} ${email}?`)) {
    return;
  }

  button.disabled = true;
  const original = button.textContent;
  button.textContent = action === "delete" ? "Deleting…" : "Saving…";
  try {
    const { data, error } = await supabase.functions.invoke("admin-user-management", {
      body: { action, userId }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    showToast(action === "delete" ? "User permanently deleted." : `User ${action}ed successfully.`, "success");
    await loadUsersAndActivity();
  } catch (error) {
    showToast(`User action failed: ${error.message}`, "error");
    button.disabled = false;
    button.textContent = original;
  }
}

document.addEventListener("change", (event) => {
  const input = event.target.closest?.("[data-user-route]");
  if (input) setUserRouteAccess(input);
});

document.addEventListener("click", (event) => {
  const statusButton = event.target.closest?.("[data-user-status]");
  if (statusButton) manageUser(statusButton.dataset.action, statusButton.dataset.userId, statusButton.dataset.userEmail, statusButton);
  const deleteButton = event.target.closest?.("[data-user-delete]");
  if (deleteButton) manageUser("delete", deleteButton.dataset.userId, deleteButton.dataset.userEmail, deleteButton);
});

function renderCampaignActivity(campaigns) {
  if (!adminCampaignBody) return;
  adminCampaignBody.innerHTML = "";

  if (!campaigns.length) {
    adminCampaignEmpty?.classList.remove("hidden");
    return;
  }
  adminCampaignEmpty?.classList.add("hidden");

  campaigns.forEach((campaign) => {
    const status = displayCampaignStatus(campaign.campaign_status);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${escapeHtml(campaign.user_email || campaign.user_id || "—")}</strong></td>
      <td>${escapeHtml(campaign.campaign_name || "Campaign")}</td>
      <td><code class="code-pill">${escapeHtml(campaign.source_file_name || "Manual entry")}</code></td>
      <td>${escapeHtml(campaign.route_name || "Route")}</td>
      <td>${Number(campaign.total_recipients) || 0}</td>
      <td>${money(campaign.total_cost)}</td>
      <td><span class="status-pill ${status === "DELIVERED" ? "status-success" : ""}">${status}</span></td>
      <td>${formatDate(campaign.created_at)}</td>`;
    adminCampaignBody.appendChild(row);
  });
}

function safeFileName(value) {
  return String(value || "campaign-data")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "campaign-data";
}

function populateHistoryUsers(rows) {
  if (!adminHistoryUserFilter) return;
  const current = adminHistoryUserFilter.value || "all";
  const users = new Map();
  rows.forEach((row) => users.set(row.user_id, row.user_email || row.user_id));
  adminHistoryUserFilter.innerHTML = '<option value="all">All users</option>';
  [...users.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([id, email]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = email;
    adminHistoryUserFilter.appendChild(option);
  });
  adminHistoryUserFilter.value = [...users.keys()].includes(current) ? current : "all";
}

function renderAdminSendingHistory() {
  if (!adminHistoryList) return;
  const selectedUser = adminHistoryUserFilter?.value || "all";
  const search = String(adminHistorySearch?.value || "").trim().toLowerCase();
  const rows = adminHistoryRows.filter((row) => {
    if (selectedUser !== "all" && row.user_id !== selectedUser) return false;
    if (!search) return true;
    return [row.user_email, row.campaign_name, row.source_file_name, row.message, row.sender_id]
      .some((value) => String(value || "").toLowerCase().includes(search));
  });

  adminHistoryList.innerHTML = "";
  adminHistoryCount.textContent = String(rows.length);
  adminHistoryEmpty?.classList.toggle("hidden", rows.length > 0);

  rows.forEach((campaign, index) => {
    const phones = Array.isArray(campaign.phones) ? campaign.phones.filter(Boolean) : [];
    const workflowStatus = String(campaign.campaign_status || "submitted").toLowerCase();
    const canApprove = ["processing", "submitted"].includes(workflowStatus);
    const canMarkSent = workflowStatus === "approved";
    const isSent = ["sent", "completed"].includes(workflowStatus);
    const card = document.createElement("article");
    card.className = "admin-history-card";
    card.innerHTML = `
      <div class="admin-history-top">
        <div>
          <span class="admin-history-user">${escapeHtml(campaign.user_email || campaign.user_id || "Unknown user")}</span>
          <h3>${escapeHtml(campaign.source_file_name || campaign.campaign_name || "Campaign")}</h3>
          <p>${formatDate(campaign.created_at)} · ${escapeHtml(campaign.sender_id || "iMessage-Direct")}</p>
        </div>
        <span class="admin-history-status ${historyStatusClass(workflowStatus)}">${displayCampaignStatus(workflowStatus)}</span>
      </div>
      <div class="admin-history-message">${escapeHtml(campaign.message || "No message text saved.")}</div>
      <div class="admin-history-stats">
        <div><span>RECIPIENTS</span><strong>${Number(campaign.total_recipients) || phones.length}</strong></div>
        <div><span>DELIVERED</span><strong>${Number(campaign.delivered_count) || 0}</strong></div>
        <div><span>FAILED</span><strong>${Number(campaign.failed_count) || 0}</strong></div>
      </div>
      <div class="admin-history-actions">
        <button class="btn-primary" type="button" data-history-toggle>View numbers</button>
        <button class="btn-secondary" type="button" data-history-download ${phones.length ? "" : "disabled"}>Download data</button>
        ${canApprove ? '<button class="admin-history-workflow approve" type="button" data-history-approve>Approve</button>' : ""}
        ${canMarkSent ? '<button class="admin-history-workflow sent" type="button" data-history-sent>Mark as Sent</button>' : ""}
        ${isSent ? `<span class="admin-history-complete">✓ Sent successfully · ${campaign.wallet_charged ? "Balance charged" : "Already charged"}</span>` : ""}
      </div>
      <pre class="admin-history-numbers">${escapeHtml(phones.length ? phones.join("\n") : "Numbers are not available for this record.")}</pre>`;

    const numberBox = card.querySelector(".admin-history-numbers");
    const toggle = card.querySelector("[data-history-toggle]");
    toggle?.addEventListener("click", () => {
      const open = numberBox.classList.toggle("open");
      toggle.textContent = open ? "Hide numbers" : "View numbers";
    });
    card.querySelector("[data-history-download]")?.addEventListener("click", () => {
      const blob = new Blob([`${phones.join("\n")}\n`], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = safeFileName(campaign.source_file_name || campaign.campaign_name || `campaign-${index + 1}`).replace(/\.txt$/i, "") + ".txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    });
    card.querySelector("[data-history-approve]")?.addEventListener("click", (event) => {
      updateCampaignWorkflow("approve", campaign, event.currentTarget);
    });
    card.querySelector("[data-history-sent]")?.addEventListener("click", (event) => {
      updateCampaignWorkflow("sent", campaign, event.currentTarget);
    });
    adminHistoryList.appendChild(card);
  });
}

async function updateCampaignWorkflow(action, campaign, button) {
  if (!supabase || !campaign?.campaign_id || !button) return;

  if (action === "sent") {
    const confirmed = window.confirm(
      `Mark this campaign as sent? The customer's balance will be charged ${money(campaign.total_cost)} exactly once.`
    );
    if (!confirmed) return;
  }

  const original = button.textContent;
  button.disabled = true;
  button.textContent = action === "approve" ? "Approving…" : "Marking…";

  try {
    const rpcName = action === "approve" ? "admin_approve_campaign" : "admin_mark_campaign_sent";
    const { data, error } = await supabase.rpc(rpcName, { p_campaign_id: campaign.campaign_id });
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    if (action === "approve") {
      showToast("Campaign approved. Send it externally, then mark it as sent.", "success");
    } else {
      showToast(
        result?.charged === false
          ? "Campaign marked sent. This legacy campaign was already charged."
          : `Campaign marked sent and ${money(result?.total_cost || campaign.total_cost)} charged successfully.`,
        "success"
      );
    }
    await Promise.all([loadAdminSendingHistory(), loadUsersAndActivity()]);
  } catch (error) {
    console.error(`Campaign ${action} error:`, error);
    showToast(error.message || "Unable to update campaign.", "error");
    button.disabled = false;
    button.textContent = original;
  }
}

async function loadAdminSendingHistory() {
  if (!supabase || !adminHistoryList) return;
  adminHistoryLoading?.classList.remove("hidden");
  adminHistoryEmpty?.classList.add("hidden");
  try {
    const { data, error } = await supabase.rpc("admin_sending_history");
    if (error) throw error;
    adminHistoryRows = Array.isArray(data) ? data : [];
    populateHistoryUsers(adminHistoryRows);
    renderAdminSendingHistory();
  } catch (error) {
    console.error("Admin sending history error:", error);
    adminHistoryRows = [];
    renderAdminSendingHistory();
    showToast(`Could not load sending history: ${error.message}`, "error");
  } finally {
    adminHistoryLoading?.classList.add("hidden");
  }
}

adminHistoryUserFilter?.addEventListener("change", renderAdminSendingHistory);
adminHistorySearch?.addEventListener("input", renderAdminSendingHistory);
btnRefreshAdminHistory?.addEventListener("click", async () => {
  btnRefreshAdminHistory.disabled = true;
  const original = btnRefreshAdminHistory.textContent;
  btnRefreshAdminHistory.textContent = "Refreshing…";
  await loadAdminSendingHistory();
  btnRefreshAdminHistory.disabled = false;
  btnRefreshAdminHistory.textContent = original || "Refresh History";
});

btnRefreshRoutes?.addEventListener("click", async () => {
  btnRefreshRoutes.disabled = true;
  const original = btnRefreshRoutes.textContent;
  btnRefreshRoutes.textContent = "Refreshing...";
  try {
    await loadRoutes();
    showToast("Routes refreshed.", "success");
  } finally {
    btnRefreshRoutes.disabled = false;
    btnRefreshRoutes.textContent = original || "Refresh Routes";
  }
});

btnRefreshAdmin?.addEventListener("click", async () => {
  btnRefreshAdmin.disabled = true;
  const original = btnRefreshAdmin.textContent;
  btnRefreshAdmin.textContent = "Refreshing...";
  try {
    await Promise.all([fetchRequests(), loadRoutes()]);
    showToast("Admin data refreshed.", "success");
  } finally {
    btnRefreshAdmin.disabled = false;
    btnRefreshAdmin.textContent = original || "Refresh Queue";
  }
});

btnRefreshUsers?.addEventListener("click", async () => {
  btnRefreshUsers.disabled = true;
  const original = btnRefreshUsers.textContent;
  btnRefreshUsers.textContent = "Refreshing...";
  try {
    await loadUsersAndActivity();
    showToast("User activity refreshed.", "success");
  } finally {
    btnRefreshUsers.disabled = false;
    btnRefreshUsers.textContent = original || "Refresh Users";
  }
});

adminLogoutBtn?.addEventListener("click", async () => {
  try {
    await supabase?.auth.signOut();
  } finally {
    window.location.href = "index.html";
  }
});

async function initializeAdmin() {
  const authorized = await verifyAdminAccess();
  if (!authorized) return;

  await Promise.all([fetchRequests(), loadRoutes()]);

  supabase?.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) window.location.href = "index.html";
  });
}

initializeAdmin();
