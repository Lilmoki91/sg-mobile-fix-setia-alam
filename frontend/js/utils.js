// utils.js
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function getStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function setStorage(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}
export function removeStorage(key) {
  try { localStorage.removeItem(key); } catch {}
}
export function showToast(message) {
  document.querySelector('.share-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'share-toast fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm transition-all duration-300';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
