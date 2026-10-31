(function () {
  'use strict';
  const form = document.getElementById('gallery-form');
  const loginForm = document.getElementById('gallery-login-form');
  const list = document.getElementById('admin-gallery-list');
  const message = document.getElementById('gallery-message');
  const fileInput = document.getElementById('gallery-file');
  const preview = document.getElementById('gallery-preview');
  if (!form || !loginForm) return;
  let images = [], busy = false, previewUrl = null;
  const field = name => document.getElementById(`gallery-${name}`);

  function status(text, error = false) {
    message.textContent = text;
    message.style.color = error ? '#dc2626' : '#15803d';
  }
  function access(allowed) {
    loginForm.classList.toggle('hidden', allowed);
    form.classList.toggle('hidden', !allowed);
    if (!allowed) list.replaceChildren();
  }
  async function api(path, options = {}) {
    const response = await fetch(`/api/gallery/${path}`, { credentials: 'same-origin', cache: 'no-store', ...options });
    let data;
    try { data = await response.json(); } catch { throw new Error('Pages Functions belum tersedia. Semak konfigurasi Cloudflare.'); }
    if (!response.ok) {
      if (response.status === 401) access(false);
      throw new Error(data.error || 'Permintaan gagal.');
    }
    return data;
  }
  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    preview.removeAttribute('src');
    preview.classList.add('hidden');
  }
  function reset() {
    form.reset();
    field('id').value = '';
    field('save').textContent = 'Simpan gambar';
    clearPreview();
  }
  function render() {
    list.replaceChildren();
    if (!images.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Tiada gambar Cloudinary. Tambah gambar pertama untuk mengaktifkan galeri baharu.';
      list.append(empty);
    }
    images.forEach(image => {
      const card = document.createElement('article');
      card.className = 'admin-card p-4';
      const img = document.createElement('img');
      img.src = image.url; img.alt = image.title; img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:180px;object-fit:contain;border-radius:12px;';
      const title = document.createElement('p');
      title.className = 'font-bold mt-3'; title.textContent = image.title;
      const detail = document.createElement('p');
      detail.className = 'text-sm text-gray-500 mb-3';
      detail.textContent = `Susunan: ${image.order} · ${image.active ? 'Dipaparkan' : 'Disembunyikan'}`;
      card.append(img, title, detail);
      [['edit', 'Edit'], ['toggle', image.active ? 'Sembunyi' : 'Papar'], ['delete', 'Padam']].forEach(([action, label]) => {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.className = 'bg-gray-200 text-gray-700 px-3 py-2 rounded-xl mr-2 mb-2';
        button.dataset.action = action; button.dataset.id = image.id;
        card.append(button);
      });
      list.append(card);
    });
  }
  async function load() {
    const data = await api('images?admin=1');
    images = data.images;
    render();
  }
  window.refreshAdminGallery = async function () {
    if (busy) return;
    try {
      const session = await api('session');
      access(session.authenticated);
      if (session.authenticated) await load();
    } catch (error) { status(error.message, true); }
  };
  window.startGallerySession = async function (password) {
    try {
      await api('session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      access(true);
      status('Akses galeri disahkan.');
      await load();
    } catch (error) { status(error.message, true); throw error; }
  };
  window.endGallerySession = () => api('session', { method: 'DELETE' });
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = loginForm.querySelector('button');
    button.disabled = true;
    try { await window.startGallerySession(field('password').value); }
    catch { /* Mesej dipaparkan oleh startGallerySession. */ }
    finally { field('password').value = ''; button.disabled = false; }
  });
  fileInput.addEventListener('change', () => {
    clearPreview();
    const file = fileInput.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      fileInput.value = ''; status('Pilih JPEG, PNG atau WebP maksimum 5 MB.', true); return;
    }
    previewUrl = URL.createObjectURL(file); preview.src = previewUrl;
    preview.classList.remove('hidden');
  });
  function setBusy(value) {
    busy = value;
    form.querySelectorAll('input, button').forEach(control => { control.disabled = value; });
    list.querySelectorAll('button').forEach(control => { control.disabled = value; });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const id = field('id').value;
    const file = fileInput.files[0];
    if (!id && !file) { status('Sila pilih gambar.', true); return; }
    const metadata = { id, title: field('title').value.trim(), order: Number(field('order').value), active: field('active').checked };
    setBusy(true); status('Menyimpan gambar…');
    try {
      let result;
      if (file) {
        const body = new FormData();
        body.append('file', file);
        Object.entries(metadata).forEach(([key, value]) => body.append(key, String(value)));
        result = await api('images', { method: 'POST', body });
      } else {
        result = await api('images', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metadata) });
      }
      reset(); await load();
      status(result.warning || 'Gambar berjaya disimpan. Galeri pelanggan dikemas kini dalam kira-kira 1–2 minit.', Boolean(result.warning));
    } catch (error) { status(error.message, true); }
    finally { setBusy(false); }
  });
  field('cancel').addEventListener('click', reset);
  field('refresh').addEventListener('click', () => load().catch(error => status(error.message, true)));
  list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button || busy) return;
    const image = images.find(item => item.id === button.dataset.id);
    if (!image) return;
    if (button.dataset.action === 'edit') {
      reset(); field('id').value = image.id; field('title').value = image.title;
      field('order').value = image.order; field('active').checked = image.active;
      preview.src = image.url; preview.classList.remove('hidden');
      field('save').textContent = 'Simpan perubahan';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const deleting = button.dataset.action === 'delete';
    if (deleting && !confirm(`Padam gambar “${image.title}” dari galeri dan Cloudinary?`)) return;
    setBusy(true);
    try {
      const result = await api('images', { method: deleting ? 'DELETE' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleting ? { id: image.id } : { ...image, active: !image.active }) });
      if (field('id').value === image.id) reset();
      await load(); status(result.warning || 'Galeri dikemas kini.', Boolean(result.warning));
    } catch (error) { status(error.message, true); }
    finally { setBusy(false); }
  });
})();
