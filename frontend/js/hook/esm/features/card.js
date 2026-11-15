import { CARD_IMAGE_URL } from '../core/config.js';
import { showToast } from '../core/utils.js';

function getCardTexts() {
  const lang = document.documentElement.lang || 'ms';
  const texts = {
    ms: {
      shareTitle: 'SG Mobile Fix Setia Alam - Kad Perniagaan',
      shareText: 'Kad perniagaan SG Mobile Fix Setia Alam. Servis telefon terbaik di Setia Alam.',
      toastCopied: '✅ Kad perniagaan disalin!',
      toastSaved: '✅ Kad disimpan ke peranti!',
      toastStorageFull: '⚠️ Storage penuh, kad disimpan sebagai muat turun.',
      toastImageNotFound: '❌ Gambar tidak dijumpai',
      toastError: '❌ Ralat, sila cuba lagi.'
    },
    en: {
      shareTitle: 'SG Mobile Fix Setia Alam - Business Card',
      shareText: 'SG Mobile Fix Setia Alam business card. Best phone repair in Setia Alam.',
      toastCopied: '✅ Business card copied!',
      toastSaved: '✅ Card saved to device!',
      toastStorageFull: '⚠️ Storage full, card saved as download.',
      toastImageNotFound: '❌ Image not found',
      toastError: '❌ Error, please try again.'
    }
  };
  return texts[lang] || texts.ms;
}

export async function shareCard() {
  const t = getCardTexts();
  try {
    if (navigator.share) {
      const response = await fetch(CARD_IMAGE_URL);
      const blob = await response.blob();
      const file = new File([blob], 'sg-mobile-fix-business-card.png', { type: 'image/png' });
      await navigator.share({ title: t.shareTitle, text: t.shareText, url: window.location.href, files: [file] });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${t.shareTitle}\n${t.shareText}\n${window.location.href}`);
      showToast(t.toastCopied);
    }
  } catch (error) {
    console.log('Share dibatalkan:', error);
  }
}

export function saveCard() {
  const t = getCardTexts();
  const imgElement = document.getElementById('business-card-img');
  if (!imgElement) { showToast(t.toastImageNotFound); return; }

  const imageUrl = imgElement.src;
  const fileName = 'sg-mobile-fix-business-card.png';

  fetch(imageUrl)
    .then(response => { if (!response.ok) throw new Error('Network response was not ok'); return response.blob(); })
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function() {
        try { localStorage.setItem('savedBusinessCard', reader.result); showToast(t.toastSaved); }
        catch (e) { showToast(t.toastStorageFull); }
      };
      reader.readAsDataURL(blob);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    })
    .catch(() => {
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(t.toastSaved);
      } catch { showToast(t.toastError); }
    });
}
