(() => {
  if (window.__iosPaymentThemeLoaded) return;
  window.__iosPaymentThemeLoaded = true;

  const WALLET_ADDRESS = 'TC5HoQ5YC6AUzYqfrs26fdRXo6UJ1G8zUM';
  const QR_ASSET = '/assets/usdt-trc20-qr.svg?v=20261016-wallet2';

  const init = () => {
    const modal = document.getElementById('topUpModal');
    if (!modal || modal.dataset.iosPaymentReady === '1') return;
    modal.dataset.iosPaymentReady = '1';

    const card = modal.querySelector('.modal-card');
    if (!card) return;
    card.classList.add('ios-payment-card');

    const walletAddress = document.getElementById('usdtWalletAddress');
    if (walletAddress) walletAddress.value = WALLET_ADDRESS;

    const qrImage = modal.querySelector('.ios-qr-wrap img');
    if (qrImage) {
      qrImage.src = QR_ASSET;
      qrImage.alt = 'USDT TRC20 payment QR code for ' + WALLET_ADDRESS;
    }
    const walletBox = walletAddress?.closest('.form-section') || walletAddress?.parentElement;

    if (walletBox && !card.querySelector('.ios-payment-qr-card')) {
      walletBox.insertAdjacentHTML('beforebegin', `
        <section class="ios-payment-qr-card" aria-label="USDT TRC20 QR payment">
          <div class="ios-qr-wrap">
            <img src="${QR_ASSET}" alt="USDT TRC20 payment QR code" loading="eager" decoding="async" />
            <span class="ios-qr-network">TRON</span>
          </div>
          <div class="ios-qr-copy">
            <span class="ios-network-chip">USDT · TRC20 / TRON Network</span>
            <h3>Scan to Pay</h3>
            <p>Open your crypto wallet, choose USDT on the TRON network and scan this QR code. You can also copy the wallet address below.</p>
            <div class="ios-scan-note"><span>ⓘ</span><span><b>Network must be TRC20 (TRON).</b><br>Do not send assets using ERC20, BEP20 or another network to this address.</span></div>
          </div>
        </section>`);
    }

    // Always set the final QR after the card exists, so no legacy QR can survive.
    const currentQrImage = modal.querySelector('.ios-qr-wrap img');
    if (currentQrImage) {
      currentQrImage.src = QR_ASSET;
      currentQrImage.alt = 'USDT TRC20 payment QR code for ' + WALLET_ADDRESS;
    }

    const timer = card.querySelector('.payment-timer');
    if (timer && !card.querySelector('.ios-payment-warning')) {
      timer.insertAdjacentHTML('afterend', '<div class="ios-payment-warning"><span>⚠︎</span><span>After sending the payment, paste the transaction hash / TxID above and tap <b>PAID</b>. The balance is credited only after payment verification.</span></div>');
    }

    const copyBtn = document.getElementById('copyUsdtAddressBtn');
    if (copyBtn && !copyBtn.dataset.iosCopyEnhanced) {
      copyBtn.dataset.iosCopyEnhanced = '1';
      copyBtn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(WALLET_ADDRESS); } catch {}
        if (walletAddress) walletAddress.value = WALLET_ADDRESS;
        const original = copyBtn.textContent || 'Copy';
        setTimeout(() => {
          copyBtn.textContent = 'Copied ✓';
          setTimeout(() => { copyBtn.textContent = original; }, 1300);
        }, 20);
      });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
