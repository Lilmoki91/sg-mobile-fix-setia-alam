export function getStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function setStorage(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

export function removeStorage(key) {
  try { localStorage.removeItem(key); } catch {}
}
