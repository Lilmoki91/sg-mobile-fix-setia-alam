export function initFacebookOverlay() {
  const overlay = document.getElementById('fb-overlay');
  if (!overlay) return { openOverlay: () => {}, closeOverlay: () => {} };

  const closeBtn = document.getElementById('fb-overlay-close');
  const copyBtn = document.getElementById('fb-copy-btn');
  const copyText = document.getElementById('fb-copy-text');

  function getFacebookText() {
    const lang = document.documentElement.lang || 'ms';
    const texts = {
      ms: 'Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi! https://sg-mobile-fix-setia-alam.pages.dev/',
      en: 'Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more! https://sg-mobile-fix-setia-alam.pages.dev/'
    };
    return texts[lang] || texts.ms;
  }

  function openOverlay() {
    copyText.textContent = getFacebookText();
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeOverlay() {
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  function getCopiedText() {
    return (document.documentElement.lang === 'en' ? 'Copied!' : 'Disalin!');
  }

  async function copyToClipboard() {
    const text = copyText.textContent;
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fas fa-check"></i> ${getCopiedText()}`;
      setTimeout(() => { closeOverlay(); window.open(shareUrl, '_blank', 'noopener,noreferrer'); }, 1000);
      setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fas fa-check"></i> ${getCopiedText()}`;
      setTimeout(() => { closeOverlay(); window.open(shareUrl, '_blank', 'noopener,noreferrer'); }, 1000);
      setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
    }
  }

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function(e) { if (e.target === this) closeOverlay(); });
  copyBtn.addEventListener('click', copyToClipboard);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeOverlay();
  });

  return { openOverlay, closeOverlay };
}
