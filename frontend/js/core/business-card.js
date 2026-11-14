// business-card.js
import { showToast } from './utils.js';
function texts() {
  return document.documentElement.lang === 'en' ? {
    title: 'SG Mobile Fix Setia Alam - Business Card', text: 'SG Mobile Fix Setia Alam business card. Best phone repair in Setia Alam.',
    copied: '✅ Business card copied!', saved: '✅ Card saved to device!', full: '⚠️ Storage full, card saved as download.', missing: '❌ Image not found', error: '❌ Error, please try again.'
  } : {
    title: 'SG Mobile Fix Setia Alam - Kad Perniagaan', text: 'Kad perniagaan SG Mobile Fix Setia Alam. Servis telefon terbaik di Setia Alam.',
    copied: '✅ Kad perniagaan disalin!', saved: '✅ Kad disimpan ke peranti!', full: '⚠️ Storage penuh, kad disimpan sebagai muat turun.', missing: '❌ Gambar tidak dijumpai', error: '❌ Ralat, sila cuba lagi.'
  };
}
export async function shareCard() {
  const t = texts();
  const image = document.getElementById('business-card-img');
  if (!image) { showToast(t.missing); return; }
  try {
    const data = { title: t.title, text: t.text, url: window.location.href };
    if (navigator.share) {
      const response = await fetch(image.src);
      if (!response.ok) throw new Error('Image unavailable');
      const file = new File([await response.blob()], 'sg-mobile-fix-business-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) data.files = [file];
      await navigator.share(data);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${t.title}\n${t.text}\n${window.location.href}`); showToast(t.copied);
    }
  } catch (error) { if (error.name !== 'AbortError') showToast(t.error); }
}
export async function saveCard() {
  const t = texts();
  const image = document.getElementById('business-card-img');
  if (!image) { showToast(t.missing); return; }
  try {
    const response = await fetch(image.src);
    if (!response.ok) throw new Error('Image unavailable');
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = () => {
      try { localStorage.setItem('savedBusinessCard', reader.result); showToast(t.saved); }
      catch { showToast(t.full); }
    };
    reader.readAsDataURL(blob);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'sg-mobile-fix-business-card.png';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { showToast(t.error); }
}
export function initBusinessCard() {
  document.getElementById('share-card-btn')?.addEventListener('click', shareCard);
  document.getElementById('save-card-btn')?.addEventListener('click', saveCard);
}
