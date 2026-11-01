// shop-hours.js
(function () {
  'use strict';
  const names = {
    ms: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  let hours = null;
  let loading = null;
  const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  function format(time) {
    const [h, m] = time.split(':').map(Number);
    return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'PM' : 'AM'}`;
  }
  function text(lang = document.documentElement.lang, value = hours) {
    if (!value) return '';
    const en = lang === 'en';
    const days = value.days.length === 7 ? (en ? 'Every Day' : 'Setiap Hari')
      : [...value.days].sort((a, b) => (a || 7) - (b || 7)).map(day => names[en ? 'en' : 'ms'][day]).join(', ');
    return `${en ? 'Operating Hours' : 'Waktu Operasi'}: ${format(value.openingTime)} - ${format(value.closingTime)} (${days})`;
  }
  function slots(date, value = hours) {
    if (!value) return [];
    // Interpret the selected calendar date, not the browser's current timezone.
    if (date && !value.days.includes(new Date(`${date}T12:00:00Z`).getUTCDay())) return [];
    const result = [];
    for (let m = minutes(value.openingTime); m < minutes(value.closingTime); m += 30) {
      result.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    return result;
  }
  async function api(path, options = {}) {
    const response = await fetch(`/api/gallery/${path}`, { credentials: 'same-origin', cache: 'no-store', ...options });
    let data;
    try { data = await response.json(); }
    catch { throw new Error('Backend Pages Functions belum tersedia. Semak konfigurasi Cloudflare.'); }
    if (!response.ok) {
      if (response.status === 401) access(false);
      throw new Error(data.error || 'Permintaan gagal.');
    }
    return data;
  }
  function render() {
    document.querySelectorAll('[data-i18n-key="OperatingHours"]').forEach(element => {
      element.textContent = text();
      if (element.parentElement) {
        element.parentElement.hidden = !hours;
        element.parentElement.style.display = hours ? '' : 'none';
      }
    });
  }
  function apply(value) {
    if (value !== null && (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.openingTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.closingTime) || value.openingTime >= value.closingTime || !Array.isArray(value.days) || !value.days.length || value.days.some(day => !Number.isInteger(day) || day < 0 || day > 6))) throw new Error('Tetapan waktu tidak sah.');
    hours = value;
    render();
    document.dispatchEvent(new Event('shop-hours-changed'));
  }
  function refresh() {
    if (!loading) loading = api('hours').then(data => {
      apply(data.hours);
      return hours;
    }).catch(error => {
      apply(null);
      throw error;
    }).finally(() => { loading = null; });
    return loading;
  }
  window.shopHours = {
    text, slots, refresh,
    get configured() { return hours !== null; },
    get value() {
      return hours ? { ...hours, days: [...hours.days] } : null;
    }
  };
  window.shopHours.ready = refresh().catch(error => {
    console.warn('Waktu operasi tidak tersedia:', error.message);
    return null;
  });

  const form = document.getElementById('hours-form');
  const login = document.getElementById('hours-login-form');
  const field = name => document.getElementById(`hours-${name}`);
  let busy = false;
  function status(message, error = false) {
    if (!field('message')) return;
    field('message').textContent = message;
    field('message').style.color = error ? '#dc2626' : '#15803d';
  }
  function access(allowed) {
    login?.classList.toggle('hidden', allowed);
    form?.classList.toggle('hidden', !allowed);
  }
  function draft() {
    return { openingTime: field('opening').value, closingTime: field('closing').value,
      days: [...field('days').querySelectorAll('input:checked')].map(input => Number(input.value)) };
  }
  function preview(value) {
    const valid = value.openingTime && value.closingTime && value.openingTime < value.closingTime && value.days.length;
    field('preview').textContent = valid ? text('ms', value) : 'Pilih hari dan pastikan masa tutup selepas masa buka.';
    const times = valid ? slots(null, value) : [];
    field('slots-preview').textContent = times.length
      ? `Slot booking: ${format(times[0])} hingga ${format(times[times.length - 1])}, setiap 30 minit (${times.length} slot sehari). Teks laman dan slot booking menggunakan tetapan ini bersama.`
      : 'Tiada slot booking untuk tetapan ini.';
  }
  function fill() {
    field('opening').value = hours?.openingTime || '';
    field('closing').value = hours?.closingTime || '';
    field('days').querySelectorAll('input').forEach(input => { input.checked = hours?.days.includes(Number(input.value)) || false; });
    preview(draft());
  }
  if (form && login) {
    [1, 2, 3, 4, 5, 6, 0].forEach(day => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = day; input.className = 'mr-2';
      label.append(input, document.createTextNode(names.ms[day]));
      field('days').append(label);
    });
    window.refreshAdminHours = async () => {
      if (busy) return;
      try {
        const session = await api('session');
        access(session.authenticated);
        if (!session.authenticated) { status('Sila sahkan akses tetapan.'); return; }
        await refresh(); fill();
        status(hours ? 'Tetapan semasa dimuatkan.' : 'Belum ada tetapan. Sila isi masa dan hari operasi kemudian simpan.');
      } catch (error) { status(error.message, true); }
    };
    login.addEventListener('submit', async event => {
      event.preventDefault();
      const button = login.querySelector('button'); button.disabled = true;
      try {
        await api('session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: field('password').value }) });
        await window.refreshAdminHours();
      } catch (error) { status(error.message, true); }
      finally { field('password').value = ''; button.disabled = false; }
    });
    form.addEventListener('input', () => preview(draft()));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      const value = draft();
      if (!value.days.length || value.openingTime >= value.closingTime) { status('Pilih hari operasi dan pastikan masa tutup selepas masa buka.', true); return; }
      busy = true;
      form.querySelectorAll('input, button').forEach(control => { control.disabled = true; });
      status('Menyimpan…');
      try {
        const data = await api('hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
        apply(data.hours); fill();
        status('Waktu operasi disimpan. Paparan pelanggan dan slot baharu dikemas kini dalam kira-kira 1–2 minit.');
      } catch (error) { status(error.message, true); }
      finally { busy = false; form.querySelectorAll('input, button').forEach(control => { control.disabled = false; }); }
    });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      render();
      setInterval(() => { if (!document.hidden) refresh().catch(() => {}); }, 60000);
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh().catch(() => {}); });
  }
})();
