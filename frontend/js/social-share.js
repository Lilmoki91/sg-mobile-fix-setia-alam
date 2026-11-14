// social-share.js
import { showToast } from './utils.js';

function shareTexts() {
  const en = document.documentElement.lang === 'en';
  return {
    title: 'SG Mobile Fix Setia Alam',
    text: en ? 'Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!' : 'Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!'
  };
}
export function initShareButton() {
  const button = document.getElementById('share-btn');
  button?.addEventListener('click', async () => {
    const data = { ...shareTexts(), url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`);
        const original = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        showToast(document.documentElement.lang === 'en' ? '✅ Link and details copied!' : '✅ Link & maklumat disalin!');
        setTimeout(() => { button.innerHTML = original; }, 2000);
      }
    } catch (error) { if (error.name !== 'AbortError') console.warn('Share:', error); }
  });
}
export function initFacebookOverlay() {
  const overlay = document.getElementById('fb-overlay');
  if (!overlay) return { openOverlay() {}, closeOverlay() {} };
  const copyText = document.getElementById('fb-copy-text');
  const button = document.getElementById('fb-copy-btn');
  function openOverlay() {
    copyText.textContent = `${shareTexts().text} https://sg-mobile-fix-setia-alam.pages.dev/`;
    overlay.classList.remove('hidden'); document.body.classList.add('overflow-hidden');
  }
  function closeOverlay() {
    overlay.classList.add('hidden'); document.body.classList.remove('overflow-hidden');
  }
  document.getElementById('fb-overlay-close')?.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', event => { if (event.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeOverlay(); });
  button?.addEventListener('click', async () => {
    try {
      try { await navigator.clipboard.writeText(copyText.textContent); }
      catch {
        const field = document.createElement('textarea'); field.value = copyText.textContent;
        overlay.appendChild(field); field.select();
        const copied = document.execCommand('copy'); field.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      const original = button.innerHTML;
      button.innerHTML = `<i class="fas fa-check"></i> ${document.documentElement.lang === 'en' ? 'Copied!' : 'Disalin!'}`;
      setTimeout(() => {
        closeOverlay();
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer');
      }, 1000);
      setTimeout(() => { button.innerHTML = original; }, 2000);
    } catch (error) { showToast(document.documentElement.lang === 'en' ? 'Unable to copy text.' : 'Gagal menyalin teks.'); }
  });
  return { openOverlay, closeOverlay };
}
export function initShareSocial() {
  const facebook = initFacebookOverlay();
  window.facebookOverlay = facebook;
  document.querySelectorAll('.share-social').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    const text = encodeURIComponent(shareTexts().text), url = encodeURIComponent(window.location.href);
    if (button.dataset.platform === 'facebook') { facebook.openOverlay(); return; }
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    };
    const link = links[button.dataset.platform];
    if (link) window.open(link, '_blank', 'noopener,width=600,height=500');
  }));
}
export function initShareLocation() {
  const button = document.querySelector('[data-i18n-key="ShareLocation"]')?.closest('a');
  button?.addEventListener('click', async event => {
    event.preventDefault();
    const en = document.documentElement.lang === 'en';
    const maps = 'https://maps.app.goo.gl/ACMa62PiTNtAA1QH7?g_st=atm';
    const waze = 'https://ul.waze.com/ul?place=ChIJt-tIohRRzDERaLetgu7BbiM&ll=3.12530770%2C101.46937320&navigate=yes';
    const text = `📍 *SG Mobile Fix Setia Alam*\n\n${en ? 'Address' : 'Alamat'}: 55-G Jalan Setia Perdana BA U13/BA, Bandar Setia Alam, 40170, Selangor\n\nGoogle Maps: ${maps}\nWaze: ${waze}`;
    try {
      if (navigator.share) await navigator.share({ title: `SG Mobile Fix Setia Alam - ${en ? 'Shop Location' : 'Lokasi Kedai'}`, text, url: maps });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); showToast(en ? '✅ Location copied!' : '✅ Lokasi disalin!'); }
      else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    } catch (error) { if (error.name !== 'AbortError') showToast(en ? '❌ Failed to copy location.' : '❌ Gagal menyalin lokasi.'); }
  });
}
