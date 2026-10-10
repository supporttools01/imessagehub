(() => {
  if (window.__iosDashboardThemeLoaded) return;
  window.__iosDashboardThemeLoaded = true;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const icons = {
    bubble: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.2 5.8h13.6c1.22 0 2.2.98 2.2 2.2v6.15c0 1.22-.98 2.2-2.2 2.2H10l-4.2 2.55.95-2.55H5.2A2.2 2.2 0 0 1 3 14.15V8c0-1.22.98-2.2 2.2-2.2Z" fill="white"/><circle cx="8.2" cy="11.1" r="1.15" fill="#4BB6FF"/><circle cx="12" cy="11.1" r="1.15" fill="#1986FF"/><circle cx="15.8" cy="11.1" r="1.15" fill="#1859E9"/></svg>`,
    plane: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 4.2 3.9 10.75c-.8.31-.78 1.47.04 1.75l6.18 2.13 2.13 6.18c.28.82 1.44.84 1.75.04L20.55 4.9c.2-.5-.25-.94-.75-.7Z" fill="white"/><path d="m10.15 14.6 5.95-5.95" stroke="#CFF9E3" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none"><path d="m3 10.7 9-7 9 7v9.1a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 19.8v-9.1Z" stroke="currentColor" stroke-width="1.8"/><path d="M9 21v-6.8h6V21" stroke="currentColor" stroke-width="1.8"/></svg>`,
    campaign: `<svg viewBox="0 0 24 24" fill="none"><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m10.1 13.9 4.5-4.5" stroke="currentColor" stroke-width="1.8"/></svg>`,
    outbox: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4V4Z" stroke="currentColor" stroke-width="1.8"/><path d="M4 14h4l1.5 2h5L16 14h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    report: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15.03 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88l-.06-.06L7.03 4.2l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 21c.8-4.2 3.2-6.3 7.2-6.3s6.4 2.1 7.2 6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="m8 12.2 2.6 2.5 5.5-5.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    fail: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="m9 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    wallet: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5h14.8A2.2 2.2 0 0 1 21 8.7v9.1a2.2 2.2 0 0 1-2.2 2.2H4.7A1.7 1.7 0 0 1 3 18.3V6.2A2.2 2.2 0 0 1 5.2 4H17" stroke="currentColor" stroke-width="1.8"/><path d="M16.2 11h4.8v5h-4.8a2.5 2.5 0 1 1 0-5Z" stroke="currentColor" stroke-width="1.8"/></svg>`
  };

  function brandMarkup() {
    return `<div class="ios-brand-lockup" aria-label="iMessage Hub">
      <span class="ios-message-icon">${icons.bubble}</span>
      <span class="ios-brand-copy"><strong>iMessage</strong><span>HUB</span></span>
      <span class="ios-brand-orbit"></span>
      <span class="ios-brand-plane">${icons.plane}</span>
    </div>`;
  }

  function enhanceBrand() {
    const topBrand = $('.topbar-brand-center');
    if (topBrand) topBrand.innerHTML = brandMarkup();

    const sideBox = $('.sidebar-brand-box');
    if (sideBox) {
      sideBox.innerHTML = `<div class="platform-logo-box">iM</div><div class="platform-brand-text"><span class="brand-title-main">iMessage</span><span class="brand-sub-badge">HUB</span></div>`;
    }
  }

  function installSidebar() {
    const toggle = $('.sidebar-toggle-btn');
    const sidebar = $('.platform-sidebar');
    if (!toggle || !sidebar) return;

    let backdrop = $('.ios-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('button');
      backdrop.type = 'button';
      backdrop.className = 'ios-sidebar-backdrop';
      backdrop.setAttribute('aria-label', 'Close menu');
      document.body.appendChild(backdrop);
    }

    const setOpen = (open) => {
      document.body.classList.toggle('ios-sidebar-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.textContent = open ? '×' : '☰';
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!document.body.classList.contains('ios-sidebar-open'));
    });
    backdrop.addEventListener('click', () => setOpen(false));
    sidebar.addEventListener('click', (event) => {
      if (window.innerWidth <= 860 && event.target.closest('.menu-item')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  function createGeneratedViews() {
    const content = $('.platform-content-area');
    if (!content || $('#viewReports')) return;

    content.insertAdjacentHTML('beforeend', `
      <section id="viewContacts" class="view-panel hidden ios-generated-view">
        <div class="breadcrumb-bar">Workspace / Contacts</div>
        <div class="ios-page-hero"><div><h1>Contacts</h1><p>Save frequently used recipients on this device and send to them faster.</p></div></div>
        <div class="ios-page-card">
          <div class="ios-form-grid">
            <div class="ios-field"><label for="iosContactName">Name</label><input id="iosContactName" type="text" placeholder="Client name"></div>
            <div class="ios-field"><label for="iosContactNumber">Phone number</label><input id="iosContactNumber" type="tel" placeholder="+1 555 000 0000"></div>
            <button id="iosAddContact" class="ios-primary-btn" type="button">Add Contact</button>
          </div>
        </div>
        <div class="ios-page-card"><div class="ios-section-heading"><h3>Saved Contacts</h3><span id="iosContactCount" class="status-pill">0</span></div><div id="iosContactList" class="ios-contact-list"></div></div>
      </section>

      <section id="viewReports" class="view-panel hidden ios-generated-view">
        <div class="breadcrumb-bar">Workspace / Reports</div>
        <div class="ios-page-hero"><div><h1>Reports</h1><p>Delivery performance based on the campaign activity currently loaded in your workspace.</p></div><button id="iosOpenOutboxFromReports" class="ios-secondary-btn" type="button">Open Outbox</button></div>
        <div class="ios-page-card"><div class="ios-report-grid">
          <div class="ios-report-block"><span>Total</span><strong id="iosReportTotal">0</strong></div>
          <div class="ios-report-block"><span>Delivered</span><strong id="iosReportDelivered">0</strong></div>
          <div class="ios-report-block"><span>Pending</span><strong id="iosReportPending">0</strong></div>
          <div class="ios-report-block"><span>Failed</span><strong id="iosReportFailed">0</strong></div>
        </div></div>
        <div class="ios-page-card"><div class="ios-section-heading"><h3>Delivery Health</h3></div>
          <div class="ios-progress-row"><span>Delivered</span><div class="ios-progress-track"><div id="iosDeliveredBar" class="ios-progress-fill"></div></div><b id="iosDeliveredPercent" class="ios-progress-value">0%</b></div>
          <div class="ios-progress-row"><span>Sent</span><div class="ios-progress-track"><div id="iosSentBar" class="ios-progress-fill"></div></div><b id="iosSentPercent" class="ios-progress-value">0%</b></div>
          <div class="ios-progress-row"><span>Failed</span><div class="ios-progress-track"><div id="iosFailedBar" class="ios-progress-fill"></div></div><b id="iosFailedPercent" class="ios-progress-value">0%</b></div>
        </div>
      </section>

      <section id="viewSettings" class="view-panel hidden ios-generated-view">
        <div class="breadcrumb-bar">Account / Settings</div>
        <div class="ios-page-hero"><div><h1>Settings</h1><p>Account shortcuts and interface preferences.</p></div></div>
        <div class="ios-page-card"><div class="ios-report-grid">
          <div class="ios-report-block"><span>Name</span><strong id="iosSettingsName" style="font-size:17px">—</strong></div>
          <div class="ios-report-block"><span>Account ID</span><strong id="iosSettingsId" style="font-size:17px">—</strong></div>
          <div class="ios-report-block"><span>Email</span><strong id="iosSettingsEmail" style="font-size:13px;overflow-wrap:anywhere">—</strong></div>
          <div class="ios-report-block"><span>Balance</span><strong id="iosSettingsBalance" style="font-size:17px">$0.00</strong></div>
        </div></div>
        <div class="ios-page-card"><div class="ios-settings-list">
          <div class="ios-setting-tile"><div><strong>Reduce animations</strong><span>Use a quieter interface on this device.</span></div><button id="iosReduceMotionToggle" class="ios-toggle" type="button" aria-label="Toggle reduced motion"></button></div>
          <div class="ios-setting-tile"><div><strong>Account Profile</strong><span>View your authenticated profile.</span></div><button id="iosOpenProfile" class="ios-secondary-btn" type="button">Open</button></div>
          <div class="ios-setting-tile"><div><strong>Payment History</strong><span>Review submitted top-up payments.</span></div><button id="iosOpenPayments" class="ios-secondary-btn" type="button">Open</button></div>
          <div class="ios-setting-tile"><div><strong>Support</strong><span>Get account or campaign assistance.</span></div><button id="iosOpenSupport" class="ios-secondary-btn" type="button">Open</button></div>
        </div></div>
      </section>`);
  }

  function addSidebarExtras() {
    const menu = $('.platform-menu');
    if (!menu || $('.ios-extra-menu', menu)) return;
    const helpTitle = $$('.nav-section-title', menu).find((el) => el.textContent.trim().toLowerCase() === 'help');
    const wrapper = document.createElement('div');
    wrapper.className = 'ios-extra-menu';
    wrapper.innerHTML = `
      <div class="nav-section-title">Tools</div>
      <button class="menu-item" type="button" data-ios-view="viewContacts"><span class="menu-icon">◎</span><span>Contacts</span></button>
      <button class="menu-item" type="button" data-ios-view="viewReports"><span class="menu-icon">▥</span><span>Reports</span></button>
      <button class="menu-item" type="button" data-ios-view="viewSettings"><span class="menu-icon">⚙</span><span>Settings</span></button>`;
    if (helpTitle) menu.insertBefore(wrapper, helpTitle);
    else menu.appendChild(wrapper);
  }

  function dashboardSectionsMarkup() {
    return `<section id="iosDashboardEnhancements">
      <div class="ios-dashboard-section">
        <div class="ios-section-heading"><h3>Overview</h3><button class="ios-link-button" type="button" data-ios-action="reports">View Reports →</button></div>
        <div class="ios-overview-grid">
          <article class="ios-metric-card"><span class="ios-metric-icon blue">${icons.plane}</span><div class="ios-metric-copy"><span>Total Sent</span><strong id="iosMetricTotal">0</strong><small id="iosMetricTotalNote" class="good">Campaign activity</small></div></article>
          <article class="ios-metric-card"><span class="ios-metric-icon green">${icons.check}</span><div class="ios-metric-copy"><span>Delivered</span><strong id="iosMetricDelivered">0</strong><small id="iosMetricDeliveredNote" class="good">0% delivery rate</small></div></article>
          <article class="ios-metric-card"><span class="ios-metric-icon purple">${icons.clock}</span><div class="ios-metric-copy"><span>Pending</span><strong id="iosMetricPending">0</strong><small>In progress</small></div></article>
          <article class="ios-metric-card"><span class="ios-metric-icon red">${icons.fail}</span><div class="ios-metric-copy"><span>Failed</span><strong id="iosMetricFailed">0</strong><small id="iosMetricFailedNote" class="bad">0% failure rate</small></div></article>
        </div>
      </div>
      <div class="ios-dashboard-section">
        <div class="ios-section-heading"><h3>Quick Actions</h3></div>
        <div class="ios-quick-grid">
          <button class="ios-quick-action" type="button" data-ios-action="campaign"><span class="ios-quick-icon blue">${icons.campaign}</span><strong>New Campaign</strong></button>
          <button class="ios-quick-action" type="button" data-ios-action="contacts"><span class="ios-quick-icon green">${icons.user}</span><strong>Contacts</strong></button>
          <button class="ios-quick-action" type="button" data-ios-action="reports"><span class="ios-quick-icon purple">${icons.report}</span><strong>Reports</strong></button>
          <button class="ios-quick-action" type="button" data-ios-action="balance"><span class="ios-quick-icon orange">${icons.wallet}</span><strong>Add Balance</strong></button>
        </div>
      </div>
      <div class="ios-dashboard-section">
        <div class="ios-section-heading"><h3>Recent Campaign</h3><button class="ios-link-button" type="button" data-ios-action="outbox">View All →</button></div>
        <div id="iosRecentCampaign" class="ios-recent-card"><span class="ios-recent-icon">${icons.plane}</span><div class="ios-recent-main"><strong>No campaign loaded yet</strong><span>Open Outbox to load your latest campaign activity.</span></div><div class="ios-recent-status"><b>Ready</b><span>Workspace</span></div></div>
      </div>
    </section>`;
  }

  function addDashboardSections() {
    const hero = $('#viewDashboard .welcome-saas-banner');
    if (!hero || $('#iosDashboardEnhancements')) return;
    hero.insertAdjacentHTML('afterend', dashboardSectionsMarkup());
  }

  function bottomNavMarkup() {
    return `<nav class="ios-bottom-nav" aria-label="Mobile navigation">
      <button class="ios-bottom-item active" type="button" data-ios-nav="viewDashboard">${icons.home}<span>Dashboard</span></button>
      <button class="ios-bottom-item" type="button" data-ios-nav="viewNewCampaign">${icons.campaign}<span>Campaigns</span></button>
      <button class="ios-bottom-item" type="button" data-ios-nav="viewOutbox">${icons.outbox}<span>Outbox</span></button>
      <button class="ios-bottom-item" type="button" data-ios-nav="viewReports">${icons.report}<span>Reports</span></button>
      <button class="ios-bottom-item" type="button" data-ios-nav="viewSupport">${icons.bubble}<span>Support</span></button>
      <button class="ios-bottom-item" type="button" data-ios-nav="viewSettings">${icons.settings}<span>Settings</span></button>
    </nav>`;
  }

  function addBottomNav() {
    if ($('.ios-bottom-nav')) return;
    document.body.insertAdjacentHTML('beforeend', bottomNavMarkup());
  }

  function setBottomActive(viewId) {
    $$('.ios-bottom-item').forEach((button) => button.classList.toggle('active', button.dataset.iosNav === viewId));
  }

  function showGeneratedView(viewId) {
    $$('.view-panel').forEach((panel) => panel.classList.add('hidden'));
    const target = document.getElementById(viewId);
    target?.classList.remove('hidden');
    $$('.menu-item').forEach((item) => item.classList.remove('active'));
    $(`[data-ios-view="${viewId}"]`)?.classList.add('active');
    setBottomActive(viewId);
    if (viewId === 'viewReports') syncMetrics();
    if (viewId === 'viewSettings') syncSettings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateExisting(viewId) {
    const trigger = $(`[data-view="${viewId}"]`);
    if (trigger) {
      trigger.click();
      setBottomActive(viewId);
      return;
    }
    const target = document.getElementById(viewId);
    if (target) {
      $$('.view-panel').forEach((panel) => panel.classList.add('hidden'));
      target.classList.remove('hidden');
      setBottomActive(viewId);
    }
  }

  const cleanNumber = (value) => {
    const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  function metricSource() {
    const total = cleanNumber($('#outboxTotalCount')?.textContent);
    const submitted = cleanNumber($('#outboxSubmittedCount')?.textContent);
    const sent = cleanNumber($('#outboxSentCount')?.textContent);
    const delivered = cleanNumber($('#outboxDeliveredCount')?.textContent);
    const failed = cleanNumber($('#outboxFailedCount')?.textContent);
    const pending = Math.max(0, total - delivered - failed);
    return { total, submitted, sent, delivered, failed, pending };
  }

  function syncMetrics() {
    const m = metricSource();
    const deliveredPct = m.total ? Math.min(100, (m.delivered / m.total) * 100) : 0;
    const sentPct = m.total ? Math.min(100, (m.sent / m.total) * 100) : 0;
    const failedPct = m.total ? Math.min(100, (m.failed / m.total) * 100) : 0;

    const mapping = {
      iosMetricTotal: m.total,
      iosMetricDelivered: m.delivered,
      iosMetricPending: m.pending,
      iosMetricFailed: m.failed,
      iosReportTotal: m.total,
      iosReportDelivered: m.delivered,
      iosReportPending: m.pending,
      iosReportFailed: m.failed
    };
    Object.entries(mapping).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value.toLocaleString();
    });

    const deliveryNote = $('#iosMetricDeliveredNote');
    if (deliveryNote) deliveryNote.textContent = `${deliveredPct.toFixed(1)}% delivery rate`;
    const failureNote = $('#iosMetricFailedNote');
    if (failureNote) failureNote.textContent = `${failedPct.toFixed(1)}% failure rate`;

    const progress = [
      ['iosDeliveredBar', 'iosDeliveredPercent', deliveredPct],
      ['iosSentBar', 'iosSentPercent', sentPct],
      ['iosFailedBar', 'iosFailedPercent', failedPct]
    ];
    progress.forEach(([barId, labelId, value]) => {
      const bar = document.getElementById(barId);
      const label = document.getElementById(labelId);
      if (bar) bar.style.width = `${value}%`;
      if (label) label.textContent = `${value.toFixed(1)}%`;
    });

    syncRecentCampaign();
  }

  function syncRecentCampaign() {
    const card = $('#iosRecentCampaign');
    const row = $('#outboxRecordsTbody tr');
    if (!card || !row) return;
    const cells = $$('td', row).map((td) => td.textContent.trim());
    if (!cells.length) return;
    const date = cells[0] || 'Recent';
    const route = cells[1] || 'Campaign';
    const recipients = cells[2] || '—';
    const status = cells[3] || 'Submitted';
    card.innerHTML = `<span class="ios-recent-icon">${icons.plane}</span><div class="ios-recent-main"><strong>${route} campaign</strong><span>${recipients} recipients · ${date}</span></div><div class="ios-recent-status"><b>${status}</b><span>Latest</span></div>`;
  }

  function syncSettings() {
    const name = $('#welcomeName')?.textContent?.trim() || $('#headerName')?.textContent?.trim() || 'Account';
    const email = $('#welcomeEmail')?.textContent?.trim() || '—';
    const id = $('#dashWelcomeId')?.textContent?.trim() || $('#userId')?.textContent?.trim() || '—';
    const balance = $('#walletBalanceTop')?.textContent?.trim() || $('#walletBalance')?.textContent?.trim() || '$0.00';
    const pairs = [['iosSettingsName', name], ['iosSettingsEmail', email], ['iosSettingsId', id], ['iosSettingsBalance', balance]];
    pairs.forEach(([key, value]) => { const el = document.getElementById(key); if (el) el.textContent = value; });
  }

  const CONTACT_KEY = 'imessagehub.contacts.v1';
  function readContacts() {
    try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || '[]'); } catch { return []; }
  }
  function writeContacts(contacts) {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(contacts));
    renderContacts();
  }
  function renderContacts() {
    const list = $('#iosContactList');
    const count = $('#iosContactCount');
    if (!list) return;
    const contacts = readContacts();
    if (count) count.textContent = String(contacts.length);
    if (!contacts.length) {
      list.innerHTML = `<div class="ios-contact-empty">No saved contacts yet. Add a name and number above.</div>`;
      return;
    }
    list.innerHTML = contacts.map((contact, index) => {
      const initial = (contact.name || 'C').trim().slice(0,1).toUpperCase();
      return `<div class="ios-contact-row" data-contact-index="${index}"><span class="ios-contact-avatar">${initial}</span><div class="ios-contact-main"><strong>${escapeHtml(contact.name)}</strong><span>${escapeHtml(contact.number)}</span></div><div class="ios-contact-actions"><button class="ios-mini-btn" type="button" data-contact-use="${index}">Use</button><button class="ios-mini-btn danger" type="button" data-contact-delete="${index}">Delete</button></div></div>`;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
  }

  function wireContacts() {
    $('#iosAddContact')?.addEventListener('click', () => {
      const nameInput = $('#iosContactName');
      const numberInput = $('#iosContactNumber');
      const name = nameInput?.value.trim();
      const number = numberInput?.value.trim();
      if (!name || !number || number.replace(/\D/g, '').length < 7) {
        numberInput?.focus();
        return;
      }
      const contacts = readContacts();
      contacts.unshift({ name, number });
      writeContacts(contacts.slice(0, 250));
      nameInput.value = '';
      numberInput.value = '';
      nameInput.focus();
    });

    $('#iosContactList')?.addEventListener('click', (event) => {
      const use = event.target.closest('[data-contact-use]');
      const del = event.target.closest('[data-contact-delete]');
      if (use) {
        const contact = readContacts()[Number(use.dataset.contactUse)];
        if (!contact) return;
        const area = $('#campaignNumbersArea');
        if (area) {
          const existing = area.value.trim();
          if (!existing.includes(contact.number)) area.value = existing ? `${existing}\n${contact.number}` : contact.number;
          area.dispatchEvent(new Event('input', { bubbles: true }));
        }
        navigateExisting('viewNewCampaign');
        setTimeout(() => area?.focus(), 80);
      }
      if (del) {
        const contacts = readContacts();
        contacts.splice(Number(del.dataset.contactDelete), 1);
        writeContacts(contacts);
      }
    });
  }

  function wireActions() {
    document.addEventListener('click', (event) => {
      const action = event.target.closest('[data-ios-action]')?.dataset.iosAction;
      if (action === 'campaign') navigateExisting('viewNewCampaign');
      if (action === 'contacts') showGeneratedView('viewContacts');
      if (action === 'reports') showGeneratedView('viewReports');
      if (action === 'outbox') navigateExisting('viewOutbox');
      if (action === 'balance') ($('#btnDashboardTopUp') || $('#topbarBalanceBtn'))?.click();

      const nav = event.target.closest('[data-ios-nav]')?.dataset.iosNav;
      if (nav) {
        if (['viewReports','viewSettings','viewContacts'].includes(nav)) showGeneratedView(nav);
        else if (nav === 'viewSupport') navigateExisting('viewSupport');
        else navigateExisting(nav);
      }

      const side = event.target.closest('[data-ios-view]')?.dataset.iosView;
      if (side) showGeneratedView(side);
    });

    document.addEventListener('click', (event) => {
      const existing = event.target.closest('[data-view]');
      if (!existing) return;
      const viewId = existing.getAttribute('data-view');
      if (!viewId) return;
      $$('.ios-generated-view').forEach((panel) => panel.classList.add('hidden'));
      setBottomActive(viewId);
    }, true);

    $('#iosOpenOutboxFromReports')?.addEventListener('click', () => navigateExisting('viewOutbox'));
    $('#iosOpenPayments')?.addEventListener('click', () => navigateExisting('viewPaymentHistory'));
    $('#iosOpenSupport')?.addEventListener('click', () => navigateExisting('viewSupport'));
    $('#iosOpenProfile')?.addEventListener('click', () => $$('[id="btnShowProfile"]').find((btn) => !btn.closest('#viewSettings'))?.click());

    const reduce = $('#iosReduceMotionToggle');
    const saved = localStorage.getItem('imessagehub.reduceMotion') === '1';
    document.body.classList.toggle('ios-reduce-motion', saved);
    reduce?.classList.toggle('on', saved);
    reduce?.addEventListener('click', () => {
      const next = !document.body.classList.contains('ios-reduce-motion');
      document.body.classList.toggle('ios-reduce-motion', next);
      reduce.classList.toggle('on', next);
      localStorage.setItem('imessagehub.reduceMotion', next ? '1' : '0');
    });
  }

  function observeLiveValues() {
    const watched = ['outboxTotalCount','outboxSubmittedCount','outboxSentCount','outboxDeliveredCount','outboxFailedCount','walletBalanceTop','walletBalance','welcomeName','welcomeEmail','dashWelcomeId'];
    const observer = new MutationObserver(() => { syncMetrics(); syncSettings(); });
    watched.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el, { childList: true, subtree: true, characterData: true });
    });
    const outboxBody = $('#outboxRecordsTbody');
    if (outboxBody) observer.observe(outboxBody, { childList: true, subtree: true });
  }

  function init() {
    document.body.classList.add('ios-ui-ready');
    createGeneratedViews();
    enhanceBrand();
    addSidebarExtras();
    addDashboardSections();
    addBottomNav();
    installSidebar();
    wireContacts();
    wireActions();
    renderContacts();
    syncMetrics();
    syncSettings();
    observeLiveValues();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
