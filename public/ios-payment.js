(() => {
  if (window.__iosPaymentThemeLoaded) return;
  window.__iosPaymentThemeLoaded = true;

  const WALLET_ADDRESS = 'TWhUtsbWiR3gQE6yi9CirRQsR1zKAR9FJd';

  const init = () => {
    const modal = document.getElementById('topUpModal');
    if (!modal || modal.dataset.iosPaymentReady === '1') return;
    modal.dataset.iosPaymentReady = '1';

    const card = modal.querySelector('.modal-card');
    if (!card) return;
    card.classList.add('ios-payment-card');

    const walletAddress = document.getElementById('usdtWalletAddress');
    if (walletAddress) walletAddress.value = WALLET_ADDRESS;
    // Generate the QR from the same current address displayed in the copy field.
    // This avoids shipping a stale, separately-maintained QR image.
    const qrImage = modal.querySelector('.ios-qr-wrap img');
    if (qrImage) {
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=' + encodeURIComponent(WALLET_ADDRESS);
      qrImage.alt = 'USDT TRC20 payment QR code for ' + WALLET_ADDRESS;
    }
    const walletBox = walletAddress?.closest('.form-section') || walletAddress?.parentElement;

    if (walletBox && !card.querySelector('.ios-payment-qr-card')) {
      walletBox.insertAdjacentHTML('beforebegin', `
        <section class="ios-payment-qr-card" aria-label="USDT TRC20 QR payment">
          <div class="ios-qr-wrap">
            <img src="/assets/usdt-trc20-qr.svg?v=20260818" alt="USDT TRC20 payment QR code" loading="eager" decoding="async" />
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

    // The QR card can be created above, so query and replace its image only now.
    // Previously the image lookup ran before insertion and left the legacy static QR visible.
    const currentQrImage = modal.querySelector('.ios-qr-wrap img');
    if (currentQrImage) {
      currentQrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=' + encodeURIComponent(WALLET_ADDRESS);
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
