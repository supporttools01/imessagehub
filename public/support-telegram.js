(() => {
  if (window.__imessageTelegramSupportLoaded) return;
  window.__imessageTelegramSupportLoaded = true;

  const TELEGRAM_HANDLE = '@Adenbraun';
  const TELEGRAM_URL = 'https://t.me/Adenbraun';
  const WHATSAPP_NUMBER = '+1 (223) 221-1148';
  const WHATSAPP_URL = 'https://wa.me/12232211148';

  function addStyles() {
    if (document.getElementById('telegramSupportStyles')) return;
    const style = document.createElement('style');
    style.id = 'telegramSupportStyles';
    style.textContent = `
      .telegram-support-float{position:fixed;right:18px;bottom:92px;z-index:130;display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:999px;background:linear-gradient(135deg,#1787f7,#20b8ff);color:#fff!important;text-decoration:none!important;font-size:12px;font-weight:850;box-shadow:0 14px 34px rgba(20,126,245,.30);border:1px solid rgba(255,255,255,.28);transition:.18s ease}
      .telegram-support-float:hover{transform:translateY(-2px);box-shadow:0 18px 38px rgba(20,126,245,.36)}
      .telegram-support-float .tg-icon{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.18);font-size:13px}
      .telegram-support-dropdown{color:#147ef5!important;font-weight:800!important}
      @media(max-width:560px){.telegram-support-float{right:12px;bottom:78px;padding:10px 12px;font-size:11px}.telegram-support-float .tg-icon{width:23px;height:23px}}
    `;
    document.head.appendChild(style);
  }

  function ensureSupportView() {
    if (document.getElementById('viewSupport')) return;
    const area = document.querySelector('.platform-content-area');
    if (!area) return;
    const section = document.createElement('section');
    section.id = 'viewSupport';
    section.className = 'view-panel hidden';
    section.innerHTML = `
      <div class="breadcrumb-bar">Help / Support</div>
      <div class="portal-card">
        <div class="portal-card-header"><div><span class="eyebrow">CUSTOMER SUPPORT</span><h2>Telegram Support</h2><p>Contact our support team for account, campaign or payment assistance.</p></div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px">
          <div style="display:grid;align-content:start;gap:12px;padding:18px;border:1px solid rgba(120,150,190,.22);border-radius:18px;background:rgba(255,255,255,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
            <strong style="font-size:20px">✈ Telegram · ${TELEGRAM_HANDLE}</strong>
            <a href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width:max-content;text-decoration:none">Message on Telegram →</a>
          </div>
          <div style="display:grid;align-content:start;gap:12px;padding:18px;border:1px solid rgba(120,150,190,.22);border-radius:18px;background:rgba(255,255,255,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)">
            <strong style="font-size:20px">☏ WhatsApp · ${WHATSAPP_NUMBER}</strong>
            <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width:max-content;text-decoration:none">Message on WhatsApp →</a>
          </div>
        </div>
      </div>`;
    area.appendChild(section);
  }

  function openSupportView() {
    ensureSupportView();
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
    document.getElementById('viewSupport')?.classList.remove('hidden');
    document.querySelectorAll('.platform-menu .menu-item').forEach(item => item.classList.remove('active'));
    document.querySelector('[data-view="viewSupport"]')?.classList.add('active');
    document.body.classList.remove('mobile-sidebar-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function ensureSidebarSupport() {
    const menu = document.querySelector('.platform-menu');
    if (!menu || menu.querySelector('[data-view="viewSupport"]')) return;
    const title = document.createElement('div');
    title.className = 'nav-section-title';
    title.textContent = 'Help';
    const button = document.createElement('button');
    button.className = 'menu-item';
    button.type = 'button';
    button.dataset.view = 'viewSupport';
    button.innerHTML = '<span class="menu-icon">?</span><span>Support</span>';
    button.addEventListener('click', openSupportView);
    menu.append(title, button);
  }

  function ensureDropdownSupport() {
    const dropdown = document.getElementById('userDropdownMenu');
    if (!dropdown || dropdown.querySelector('.telegram-support-dropdown')) return;
    const link = document.createElement('a');
    link.className = 'dropdown-item telegram-support-dropdown';
    link.href = TELEGRAM_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '✈ Telegram Support';
    const divider = dropdown.querySelector('.dropdown-divider');
    if (divider) divider.insertAdjacentElement('beforebegin', link);
    else dropdown.appendChild(link);
  }

  function ensureFloatingSupport() {
    if (document.getElementById('telegramSupportFloat')) return;
    const link = document.createElement('a');
    link.id = 'telegramSupportFloat';
    link.className = 'telegram-support-float';
    link.href = TELEGRAM_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Telegram Support ${TELEGRAM_HANDLE}`);
    link.innerHTML = '<span class="tg-icon">✈</span><span>Telegram Support</span>';
    document.body.appendChild(link);
  }

  function init() {
    if (!document.querySelector('.platform-layout')) return;
    addStyles();
    ensureSupportView();
    ensureSidebarSupport();
    ensureDropdownSupport();
    ensureFloatingSupport();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
