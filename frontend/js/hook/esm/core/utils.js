export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

export function showToast(message) {
  const oldToast = document.querySelector('.share-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'share-toast fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm transition-all duration-300';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
