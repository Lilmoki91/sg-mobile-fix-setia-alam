// Bacaan disimpan per notifikasi pada pelayar ini, bukan ketika loceng dibuka.
const READ_KEY = 'sgm_read_notifications';
let initialized = false;
const timestampMs = value => value?.toMillis?.() || 0;
const permanent = item => item.lifetime === 'permanent' && item.expiresAt == null;

function safeLink(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const path = value === '/phones' ? 'index.html#phones-tab'
    : value === '/servis' ? 'index.html#services-tab' : value;
  try {
    const url = new URL(path, document.baseURI);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === location.origin ? url.href : null;
  } catch (_) { return null; }
}

function timeAgo(ms) {
  const en = document.documentElement.lang === 'en';
  const minutes = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (!minutes) return en ? 'Just now' : 'Sebentar tadi';
  if (minutes < 60) return en ? `${minutes} minutes ago` : `${minutes} minit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return en ? `${hours} hours ago` : `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return en ? `${days} days ago` : `${days} hari lalu`;
}

export async function initNotifications() {
  const wrapper = document.getElementById('store-notifications');
  const bell = document.getElementById('notifications-bell');
  const dot = document.getElementById('notifications-dot');
  const dropdown = document.getElementById('notifications-dropdown');
  const list = document.getElementById('notifications-list');
  const status = document.getElementById('notifications-status');
  const close = document.getElementById('notifications-close');
  if (initialized || !wrapper || !bell || !dot || !dropdown || !list || !status || !close) return;
  initialized = true;
  let read = new Set();
  function loadRead() {
    try {
      const value = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      if (Array.isArray(value)) read = new Set(value.filter(x => typeof x === 'string'));
    } catch (_) {}
  }
  loadRead();
  let notifications = [], loading = true, failed = false, expiryTimer, unsubscribe;
  const en = () => document.documentElement.lang === 'en';
  const readId = item => `${item.id}:${timestampMs(item.createdAt)}`;
  const visibleItems = () => notifications.filter(item => item.isActive === true
    && timestampMs(item.createdAt) > 0
    && (permanent(item) || timestampMs(item.expiresAt) > Date.now()))
    .sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
  function markRead(items) {
    loadRead();
    items.forEach(item => read.add(readId(item)));
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...read]));
      localStorage.setItem('sgm_last_notif_seen', String(Date.now()));
    } catch (_) {}
    render();
  }
  const markAll = document.createElement('button');
  markAll.type = 'button';
  markAll.className = 'mx-4 my-2 text-sm font-semibold text-blue-600 hover:underline';
  list.before(markAll);
  markAll.addEventListener('click', () => markRead(visibleItems()));

  function render() {
    const visible = visibleItems();
    const unread = visible.some(item => !read.has(readId(item)));
    dot.hidden = !unread;
    bell.setAttribute('aria-label', en() ? (unread ? 'Notifications: unread updates' : 'Notifications')
      : (unread ? 'Notifikasi: belum dibaca' : 'Notifikasi'));
    document.getElementById('notifications-title').textContent = en() ? 'Store notifications' : 'Notifikasi Kedai';
    close.setAttribute('aria-label', en() ? 'Close notifications' : 'Tutup notifikasi');
    markAll.textContent = en() ? 'Mark all as read' : 'Tandakan semua telah dibaca';
    markAll.hidden = !unread;
    status.textContent = failed ? (en() ? 'Unable to load. Reload to retry.' : 'Gagal memuatkan. Muat semula untuk cuba lagi.')
      : loading ? (en() ? 'Loading…' : 'Memuatkan…')
        : !visible.length ? (en() ? 'No current notifications.' : 'Tiada notifikasi terkini.') : '';
    status.hidden = !status.textContent;
    list.replaceChildren();
    for (const item of visible) {
      const row = document.createElement('li');
      const link = safeLink(item.link || (item.type === 'stock' ? '/phones' : item.type === 'service' ? '/servis' : null));
      const content = document.createElement(link ? 'a' : 'button');
      const isRead = read.has(readId(item));
      content.className = `block w-full text-left p-4 border-b border-gray-100 whitespace-normal break-words hover:bg-gray-50 ${isRead ? 'text-gray-600' : 'bg-blue-50 text-gray-800'}`;
      if (link) content.href = link;
      else content.type = 'button';
      const title = document.createElement('h3');
      title.className = 'font-semibold text-sm';
      const text = key => {
        const values = en() ? [item[key + 'En'], item[key + 'Ms'], item[key]]
          : [item[key + 'Ms'], item[key], item[key + 'En']];
        return values.find(value => typeof value === 'string' && value.trim()) || '';
      };
      title.textContent = text('title');
      const message = document.createElement('p');
      message.className = 'mt-1 text-sm whitespace-pre-wrap';
      message.textContent = text('message');
      const time = document.createElement('time');
      time.className = 'block mt-2 text-xs text-gray-500';
      time.dateTime = new Date(timestampMs(item.createdAt)).toISOString();
      time.textContent = `${timeAgo(timestampMs(item.createdAt))} · ${permanent(item) ? (en() ? 'Permanent' : 'Kekal') : (en() ? '7 days' : '7 hari')} · ${isRead ? (en() ? 'Read' : 'Telah dibaca') : (en() ? 'Unread — click to read' : 'Belum dibaca — klik untuk baca')}`;
      content.append(title, message, time);
      content.addEventListener('click', event => {
        markRead([item]);
        if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          const url = new URL(link);
          const tab = url.hash.slice(1);
          if (url.pathname === location.pathname && ['phones-tab', 'services-tab'].includes(tab) && window.showTab) {
            setOpen(false, true);
            window.history.pushState(null, '', url.href);
            window.showTab(tab);
            document.querySelectorAll('.mobile-bottom-nav a[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === tab));
            window.dispatchEvent(new Event('store-notification-target'));
          } else window.location.href = link;
        }
      });
      row.append(content);
      list.append(row);
    }
    clearTimeout(expiryTimer);
    const expiries = visible.filter(item => !permanent(item)).map(item => timestampMs(item.expiresAt));
    if (expiries.length) expiryTimer = setTimeout(render, Math.min(2147483647, Math.max(1, Math.min(...expiries) - Date.now() + 1)));
  }
  function setOpen(open, returnFocus = false) {
    dropdown.hidden = !open;
    bell.setAttribute('aria-expanded', String(open));
    if (open) { render(); close.focus(); }
    else if (returnFocus) bell.focus();
  }
  bell.addEventListener('click', () => setOpen(dropdown.hidden));
  close.addEventListener('click', () => setOpen(false, true));
  document.addEventListener('click', event => { if (!wrapper.contains(event.target)) setOpen(false); });
  document.addEventListener('focusin', event => { if (!wrapper.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dropdown.hidden) { event.preventDefault(); setOpen(false, true); }
  });
  window.addEventListener('storage', event => {
    if (event.key === READ_KEY || event.key === null) { read = new Set(); loadRead(); render(); }
  });
  const observer = new MutationObserver(render);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
  const timer = setInterval(render, 60000);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    unsubscribe?.(); clearTimeout(expiryTimer); clearInterval(timer); observer.disconnect();
  });
  try {
    const { collection, query, where, onSnapshot } = await window.ensureFirestoreFns();
    unsubscribe = onSnapshot(query(collection(window.db, 'store_notifications'), where('isActive', '==', true)), snapshot => {
      notifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      loading = false; failed = false; render();
    }, error => {
      console.error('Gagal membaca notifikasi:', error);
      loading = false; failed = true; notifications = []; render();
    });
  } catch (error) { loading = false; failed = true; render(); throw error; }
}
