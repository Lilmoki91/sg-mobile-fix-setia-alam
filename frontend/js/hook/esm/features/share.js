import { LOCATION } from '../core/config.js';
import { showToast } from '../core/utils.js';

function getShareText() {
  const lang = document.documentElement.lang || 'ms';
  const shareTexts = {
    ms: { title: 'SG Mobile Fix Setia Alam', text: 'Kedai servis telefon terbaik di Setia Alam. Servis iPhone, Android, Tablet & banyak lagi!' },
    en: { title: 'SG Mobile Fix Setia Alam', text: 'Best phone repair shop in Setia Alam. iPhone, Android, Tablet & more!' }
  };
  return shareTexts[lang] || shareTexts.ms;
}

export function initShareButton() {
  const shareButton = document.getElementById('share-btn');
  if (!shareButton) return;

  shareButton.addEventListener('click', async () => {
    const text = getShareText();
    const shareData = { title: text.title, text: text.text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text.title}\n${text.text}\n${window.location.href}`);
        const originalContent = shareButton.innerHTML;
        shareButton.innerHTML = '<i class="fas fa-check"></i>';
        shareButton.classList.remove('bg-blue-500');
        shareButton.classList.add('bg-green-500');
        showToast('✅ Link & maklumat disalin!');
        setTimeout(() => {
          shareButton.innerHTML = originalContent;
          shareButton.classList.remove('bg-green-500');
          shareButton.classList.add('bg-blue-500');
        }, 2000);
      }
    } catch (error) {
      console.log('Share dibatalkan:', error);
    }
  });
}

export function initShareSocial() {
  const shareButtons = document.querySelectorAll('.share-social');
  if (!shareButtons.length) return;
  if (!document.getElementById('fb-overlay')) return;

  shareButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const platform = this.dataset.platform;
      const shareData = getShareText();
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(shareData.text);
      let shareUrl = '';

      switch (platform) {
        case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
        case 'telegram': shareUrl = `https://t.me/share/url?url=${url}&text=${text}`; break;
        case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
        case 'facebook':
          if (window.facebookOverlay) { window.facebookOverlay.openOverlay(); return; }
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        default: return;
      }
      window.open(shareUrl, '_blank', 'noopener,width=600,height=500');
    });
  });
}

export function initShareLocation() {
  const shareBtn = document.querySelector('[data-i18n-key="ShareLocation"]')?.closest('a');
  if (!shareBtn) return;

  const locationData = LOCATION;

  function getLocationText() {
    const lang = document.documentElement.lang || 'ms';
    const texts = {
      ms: { title: 'SG Mobile Fix Setia Alam - Lokasi Kedai', labelAddress: 'Alamat', labelGoogle: 'Google Maps', labelWaze: 'Waze', toastCopied: '✅ Lokasi disalin!', toastError: '❌ Gagal menyalin lokasi.' },
      en: { title: 'SG Mobile Fix Setia Alam - Shop Location', labelAddress: 'Address', labelGoogle: 'Google Maps', labelWaze: 'Waze', toastCopied: '✅ Location copied!', toastError: '❌ Failed to copy location.' }
    };
    return texts[lang] || texts.ms;
  }

  shareBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    const t = getLocationText();
    const formattedText = `📍 *${locationData.name}*\n\n` +
      `${t.labelAddress}: ${locationData.address}\n\n` +
      `${t.labelGoogle}: ${locationData.googleMaps}\n` +
      `${t.labelWaze}: ${locationData.waze}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: t.title, text: formattedText, url: locationData.googleMaps });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(formattedText);
        showToast(t.toastCopied);
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(formattedText)}`, '_blank', 'noopener');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Ralat ketika berkongsi:', error);
        showToast(t.toastError);
      }
    }
  });
}
