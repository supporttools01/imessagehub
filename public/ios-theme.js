(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  function clickView(viewId) {
    const trigger = $(`[data-view="${viewId}"]`);
    if (trigger) trigger.click();
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 20);
  }

  function installBrand() {
    const center = $('.topbar-brand-center');
    if (!center || $('.ios-brand-shell', center)) return;

    if (!$('#iosSafeBrandStyle')) {
      const style = document.createElement('style');
      style.id = 'iosSafeBrandStyle';
      style.textContent = `
        .ios-brand-shell{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;min-width:0!important;height:52px!important;position:relative!important}
        .ios-brand-logo{display:none!important}
        .ios-plane-orbit{display:none!important}
        .ios-safe-orb{width:38px;height:38px;flex:0 0 38px;border-radius:50%;position:relative;overflow:hidden;background:radial-gradient(circle at 28% 24%,#63e8ff 0 12%,transparent 31%),radial-gradient(circle at 72% 28%,#ff5fae 0 11%,transparent 34%),radial-gradient(circle at 30% 76%,#6d55ff 0 13%,transparent 35%),radial-gradient(circle at 75% 72%,#ff9a45 0 12%,transparent 34%),conic-gradient(from 40deg,#42ddff,#6c52ff,#ff5cab,#ff9a45,#37e7c8,#42ddff);box-shadow:0 0 0 1px rgba(255,255,255,.85),0 7px 20px rgba(45,112,255,.24);animation:iosSafeOrbPulse 2.8s ease-in-out infinite;will-change:transform}
        .ios-safe-orb:before{content:"";position:absolute;inset:7px;border-radius:48% 52% 55% 45%;background:linear-gradient(135deg,rgba(255,255,255,.58),rgba(255,255,255,.06) 48%,rgba(0,0,0,.08));filter:blur(1.5px);animation:iosSafeOrbFlow 4.6s linear infinite}
        .ios-safe-brand-copy{display:flex;flex-direction:column;line-height:1;min-width:0}.ios-safe-brand-title{font-size:16px;font-weight:800;letter-spacing:-.035em;color:#13213d;white-space:nowrap}.ios-safe-brand-sub{font-size:8px;font-weight:700;letter-spacing:.11em;color:#7f8da4;margin-top:4px;white-space:nowrap}
        @keyframes iosSafeOrbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
        @keyframes iosSafeOrbFlow{to{transform:rotate(360deg)}}
        @media(max-width:560px){.ios-brand-shell{gap:7px!important;height:44px!important}.ios-safe-orb{width:32px;height:32px;flex-basis:32px}.ios-safe-brand-title{font-size:13px}.ios-safe-brand-sub{font-size:6.5px;letter-spacing:.08em}}
        @media(prefers-reduced-motion:reduce){.ios-safe-orb,.ios-safe-orb:before{animation:none!important}}
      `;
      document.head.appendChild(style);
    }

    center.innerHTML = `
      <div class="ios-brand-shell" aria-label="iMessage Hub">
        <span class="ios-safe-orb" aria-hidden="true"></span>
        <span class="ios-safe-brand-copy"><strong class="ios-safe-brand-title">iMessage HUB</strong><small class="ios-safe-brand-sub">MESSAGING PLATFORM</small></span>
      </div>`;
  }

  function metricCard(icon, tone, label, valueId, fallback, sub, subClass = '') {
    return `<article class="ios-metric-card">
      <div class="ios-metric-icon ${tone}">${icon}</div>
      <div class="ios-metric-copy">
        <span class="ios-metric-label">${label}</span>
        <strong class="ios-metric-value" id="${valueId}">${fallback}</strong>
        <span class="ios-metric-sub ${subClass}">${sub}</span>
      </div>
    </article>`;
  }

  function installDashboardExtras() {
    const dashboard = $('#viewDashboard');
    const hero = $('.welcome-saas-banner', dashboard);
    if (!dashboard || !hero || $('.ios-dashboard-extras', dashboard)) return;

    const extras = document.createElement('section');
    extras.className = 'ios-dashboard-extras';
    extras.innerHTML = `
      <div class="ios-section-head"><h3>Overview</h3><button type="button" data-ios-action="reports">View reports →</button></div>
      <div class="ios-overview-grid">
        ${metricCard('➤', 'blue', 'Total Sent', 'iosTotalSent', '0', 'Last 7 days', 'good')}
        ${metricCard('✓', 'green', 'Delivered', 'iosDelivered', '0', 'Delivery status', 'good')}
        ${metricCard('◷', 'purple', 'Pending', 'iosPending', '0', 'In progress')}
        ${metricCard('×', 'orange', 'Failed', 'iosFailed', '0', 'Needs review', 'bad')}
      </div>
      <div class="ios-section-head"><h3>Quick Actions</h3></div>
      <div class="ios-quick-grid">
        <button class="ios-quick-card" type="button" data-action="campaign"><span class="ios-quick-icon">➤</span><span>New Campaign</span></button>
        <button class="ios-quick-card" type="button" data-action="contacts"><span class="ios-quick-icon">●</span><span>Contacts</span></button>
        <button class="ios-quick-card" type="button" data-action="reports"><span class="ios-quick-icon">▥</span><span>Reports</span></button>
        <button class="ios-quick-card" type="button" data-action="balance"><span class="ios-quick-icon">▣</span><span>Add Balance</span></button>
      </div>
      <div class="ios-section-head"><h3>Recent Campaigns</h3><button type="button" data-ios-action="outbox">View all →</button></div>
      <div class="ios-recent-list" id="iosRecentList"><div class="ios-recent-item"><div class="ios-recent-icon">➤</div><div class="ios-recent-main"><div class="ios-recent-title">No campaign activity yet</div><div class="ios-recent-meta">Your latest campaigns will appear here</div></div><span class="ios-recent-status">Ready</span></div></div>`;
    hero.insertAdjacentElement('afterend', extras);
  }

  function installBottomNav() {
    if ($('.ios-bottom-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'ios-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML = `
      <button type="button" class="active" data-bottom-view="viewDashboard"><span class="nav-ico">⌂</span><span>Dashboard</span></button>
      <button type="button" data-bottom-view="viewNewCampaign"><span class="nav-ico">➤</span><span>Campaigns</span></button>
      <button type="button" data-bottom-view="viewOutbox"><span class="nav-ico">▱</span><span>Outbox</span></button>
      <button type="button" data-bottom-action="reports"><span class="nav-ico">▥</span><span>Reports</span></button>
      <button type="button" data-bottom-view="viewSupport"><span class="nav-ico">✉</span><span>Support</span></button>
      <button type="button" data-bottom-action="settings"><span class="nav-ico">⚙</span><span>Settings</span></button>`;
    document.body.appendChild(nav);
  }

  function installMiniModal() {
    if ($('#iosMiniModal')) return;
    const modal = document.createElement('div');
    modal.id = 'iosMiniModal';
    modal.className = 'ios-mini-modal';
    modal.innerHTML = `<div class="ios-mini-sheet"><h3 id="iosMiniTitle">Contacts</h3><p id="iosMiniText"></p><button type="button" class="btn-primary" id="iosMiniClose">Done</button></div>`;
    document.body.appendChild(modal);
    $('#iosMiniClose')?.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
  }

  function showMini(title, text) {
    const modal = $('#iosMiniModal');
    if (!modal) return;
    $('#iosMiniTitle').textContent = title;
    $('#iosMiniText').textContent = text;
    modal.classList.add('open');
  }

  function setActiveBottom(viewId) {
    $$('.ios-bottom-nav button').forEach((b) => b.classList.toggle('active', b.dataset.bottomView === viewId));
  }

  function bindActions() {
    document.addEventListener('click', (e) => {
      const quick = e.target.closest('.ios-quick-card');
      const headAction = e.target.closest('[data-ios-action]');
      const bottom = e.target.closest('.ios-bottom-nav button');

      if (quick) {
        const action = quick.dataset.action;
        if (action === 'campaign') clickView('viewNewCampaign');
        if (action === 'reports') { clickView('viewOutbox'); setTimeout(() => $('.outbox-summary-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180); }
        if (action === 'balance') $('#btnDashboardTopUp')?.click() || $('#topbarBalanceBtn')?.click();
        if (action === 'contacts') showMini('Contacts', 'Contacts has been added to the new interface. Campaign recipient lists can be managed here once contact storage is connected to the backend.');
      }

      if (headAction) {
        if (headAction.dataset.iosAction === 'reports') { clickView('viewOutbox'); setTimeout(() => $('.outbox-summary-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180); }
        if (headAction.dataset.iosAction === 'outbox') clickView('viewOutbox');
      }

      if (bottom) {
        const view = bottom.dataset.bottomView;
        const action = bottom.dataset.bottomAction;
        if (view) { clickView(view); setActiveBottom(view); }
        if (action === 'reports') { clickView('viewOutbox'); setActiveBottom(''); setTimeout(() => $('.outbox-summary-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180); }
        if (action === 'settings') { setActiveBottom(''); $('[id="btnShowProfile"]')?.click(); }
      }

      const regularMenu = e.target.closest('[data-view]');
      if (regularMenu?.dataset.view) setActiveBottom(regularMenu.dataset.view);
    });
  }

  function cleanNumber(text) {
    const value = String(text || '').trim();
    return value || '0';
  }

  function syncMetrics() {
    const total = $('#outboxTotalCount');
    const sent = $('#outboxSentCount');
    const delivered = $('#outboxDeliveredCount');
    const failed = $('#outboxFailedCount');
    const submitted = $('#outboxSubmittedCount');
    const activity = $('#activitySevenDayTotal');

    const totalValue = cleanNumber(sent?.textContent || total?.textContent || activity?.textContent?.match(/\d+/)?.[0] || '0');
    const deliveredValue = cleanNumber(delivered?.textContent || '0');
    const failedValue = cleanNumber(failed?.textContent || '0');
    let pendingValue = cleanNumber(submitted?.textContent || '0');
    const t = parseInt(total?.textContent || '0', 10) || 0;
    const d = parseInt(delivered?.textContent || '0', 10) || 0;
    const f = parseInt(failed?.textContent || '0', 10) || 0;
    const s = parseInt(sent?.textContent || '0', 10) || 0;
    if (t > 0) pendingValue = String(Math.max(0, t - d - f - s));

    if ($('#iosTotalSent')) $('#iosTotalSent').textContent = totalValue;
    if ($('#iosDelivered')) $('#iosDelivered').textContent = deliveredValue;
    if ($('#iosFailed')) $('#iosFailed').textContent = failedValue;
    if ($('#iosPending')) $('#iosPending').textContent = pendingValue;
  }

  function syncRecent() {
    const tbody = $('#outboxRecordsTbody');
    const list = $('#iosRecentList');
    if (!tbody || !list) return;
    const rows = $$('tr', tbody).slice(0, 3);
    if (!rows.length) return;
    list.innerHTML = rows.map((row, index) => {
      const cells = $$('td', row).map((c) => c.textContent.trim());
      const date = cells[0] || 'Recent';
      const route = cells[1] || `Campaign ${index + 1}`;
      const recipients = cells[2] || '';
      const status = cells[3] || 'Submitted';
      return `<div class="ios-recent-item"><div class="ios-recent-icon">➤</div><div class="ios-recent-main"><div class="ios-recent-title">${route}</div><div class="ios-recent-meta">${recipients}${recipients ? ' recipients • ' : ''}${date}</div></div><span class="ios-recent-status">${status}</span></div>`;
    }).join('');
  }

  function observeData() {
    const watched = ['#outboxTotalCount','#outboxSubmittedCount','#outboxSentCount','#outboxDeliveredCount','#outboxFailedCount','#activitySevenDayTotal','#outboxRecordsTbody'];
    const observer = new MutationObserver(() => { syncMetrics(); syncRecent(); });
    watched.forEach((selector) => { const el = $(selector); if (el) observer.observe(el, { childList: true, subtree: true, characterData: true }); });
    syncMetrics(); syncRecent();
  }

  function installOutboxPagination() {
    const tbody = $('#outboxRecordsTbody');
    const tableWrapper = tbody?.closest('.table-wrapper');
    if (!tbody || !tableWrapper || $('#iosOutboxPager')) return;

    if (!$('#iosOutboxPagerStyle')) {
      const style = document.createElement('style');
      style.id = 'iosOutboxPagerStyle';
      style.textContent = `
        .ios-outbox-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 2px 2px}
        .ios-outbox-page-size{display:flex;align-items:center;gap:8px;color:#74839a;font-size:12px;font-weight:700}
        .ios-outbox-page-size select{height:36px;border:1px solid #dbe5f2;border-radius:11px;background:#fff;color:#15223e;padding:0 28px 0 10px;font:inherit;outline:none}
        .ios-outbox-page-nav{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .ios-outbox-page-nav button{min-width:36px;height:36px;border:1px solid #dbe5f2;border-radius:11px;background:#fff;color:#34425d;font-size:12px;font-weight:800;padding:0 10px;cursor:pointer}
        .ios-outbox-page-nav button:hover:not(:disabled){border-color:#9fc9ff;background:#f2f8ff;color:#147ef5}
        .ios-outbox-page-nav button.active{background:#147ef5;border-color:#147ef5;color:#fff;box-shadow:0 7px 16px rgba(20,126,245,.22)}
        .ios-outbox-page-nav button:disabled{opacity:.42;cursor:default}
        .ios-outbox-page-info{color:#8794a8;font-size:11px;font-weight:650}
        @media(max-width:560px){.ios-outbox-pager{align-items:stretch;padding-top:12px}.ios-outbox-page-size{width:100%;justify-content:space-between}.ios-outbox-page-nav{width:100%;justify-content:center}.ios-outbox-page-nav button{min-width:34px;height:34px;padding:0 8px}.ios-outbox-page-info{width:100%;text-align:center}}
      `;
      document.head.appendChild(style);
    }

    const pager = document.createElement('div');
    pager.id = 'iosOutboxPager';
    pager.className = 'ios-outbox-pager';
    pager.innerHTML = `
      <label class="ios-outbox-page-size">Show
        <select id="iosOutboxPageSize" aria-label="Outbox rows per page">
          <option value="10" selected>10</option>
          <option value="30">30</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        records
      </label>
      <div class="ios-outbox-page-nav" id="iosOutboxPageNav" aria-label="Outbox pagination"></div>
      <div class="ios-outbox-page-info" id="iosOutboxPageInfo"></div>`;
    tableWrapper.insertAdjacentElement('afterend', pager);

    let page = 1;
    let pageSize = 10;
    let renderQueued = false;

    const render = () => {
      renderQueued = false;
      const rows = $$(':scope > tr', tbody);
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.min(Math.max(1, page), pages);
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, total);

      rows.forEach((row, index) => {
        row.hidden = index < start || index >= end;
      });

      const nav = $('#iosOutboxPageNav');
      const info = $('#iosOutboxPageInfo');
      if (info) info.textContent = total ? `Showing ${start + 1}–${end} of ${total}` : 'No records';
      if (!nav) return;

      const pageButtons = [];
      if (pages <= 7) {
        for (let i = 1; i <= pages; i += 1) pageButtons.push(i);
      } else {
        const candidates = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
        [...candidates].sort((a, b) => a - b).forEach((n, index, arr) => {
          if (index && n - arr[index - 1] > 1) pageButtons.push('…');
          pageButtons.push(n);
        });
      }

      nav.innerHTML = `<button type="button" data-page="prev" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>${pageButtons.map((n) => n === '…' ? '<button type="button" disabled>…</button>' : `<button type="button" data-page="${n}" class="${n === page ? 'active' : ''}" aria-current="${n === page ? 'page' : 'false'}">${n}</button>`).join('')}<button type="button" data-page="next" ${page === pages ? 'disabled' : ''}>Next ›</button>`;
    };

    const queueRender = (reset = false) => {
      if (reset) page = 1;
      if (renderQueued) return;
      renderQueued = true;
      requestAnimationFrame(render);
    };

    $('#iosOutboxPageSize')?.addEventListener('change', (e) => {
      pageSize = Number(e.target.value) || 10;
      page = 1;
      queueRender();
    });

    $('#iosOutboxPageNav')?.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      const value = button.dataset.page;
      const pages = Math.max(1, Math.ceil($$(':scope > tr', tbody).length / pageSize));
      if (value === 'prev') page = Math.max(1, page - 1);
      else if (value === 'next') page = Math.min(pages, page + 1);
      else page = Math.min(pages, Math.max(1, Number(value) || 1));
      queueRender();
    });

    new MutationObserver(() => queueRender(true)).observe(tbody, { childList: true });
    render();
  }

  function polishAvatar() {
    const name = $('#welcomeName')?.textContent?.trim() || $('#headerName')?.textContent?.trim() || 'V';
    const initial = (name.match(/[A-Za-z]/)?.[0] || 'V').toUpperCase();
    if ($('#headerAvatar')) $('#headerAvatar').textContent = initial;
  }

  function init() {
    installBrand();
    installDashboardExtras();
    installBottomNav();
    installMiniModal();
    bindActions();
    observeData();
    installOutboxPagination();
    polishAvatar();
    setTimeout(polishAvatar, 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
