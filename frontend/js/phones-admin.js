// phones-admin.js
(function () {
  'use strict';
  const U = window.PhoneUI, $ = id => document.getElementById(id), form = $('phone-product-form');
  if (!form) return;
  let products = [], images = [], busy = false, dirty = false, updateTime = '', lastMessage = null;
  const fields = [
    ['name', 'text', true, 120], ['brand', 'text', true, 60], ['model', 'text', true, 80],
    ['ram', 'text', true, 30], ['storage', 'text', true, 30], ['variant', 'select'], ['condition', 'select'],
    ['colorMs', 'text', false, 60], ['colorEn', 'text', false, 60], ['price', 'number', true], ['stock', 'number'],
    ['status', 'select'], ['battery', 'number'], ['set', 'select'],
    ['accessoriesMs', 'textarea', false, 1000], ['accessoriesEn', 'textarea', false, 1000],
    ['warrantyMs', 'text', false, 200], ['warrantyEn', 'text', false, 200],
    ['descriptionMs', 'textarea', false, 3000], ['descriptionEn', 'textarea', false, 3000]
  ];
  fields.forEach(([key, type, required, max]) => {
    const label = U.node('label'), span = U.node('span'); span.dataset.phoneText = key;
    const input = U.node(type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input');
    input.id = 'phone-field-' + key; input.name = key; input.required = !!required;
    if (type !== 'textarea' && type !== 'select') input.type = type;
    if (max) input.maxLength = max;
    if (type === 'number') { input.min = '0'; input.max = key === 'battery' ? '100' : key === 'stock' ? '9999' : '999999'; input.step = key === 'price' ? '0.01' : '1'; }
    if (type === 'textarea') { input.rows = 3; label.className = 'phone-wide'; }
    label.append(span, input); $('phone-fields').append(label);
  });
  const field = key => $('phone-field-' + key);
  function translate() {
    U.translate();
    U.options(field('variant'), [['', U.t('unknown')], ['4G', '4G'], ['5G', '5G']]);
    U.options(field('condition'), [['unknown', U.t('unknown')], ['new', U.t('newCondition')], ['used', U.t('used')], ['refurbished', U.t('refurbished')]]);
    U.options(field('status'), [['unknown', U.t('unknown')], ['available', U.t('available')], ['reserved', U.t('reserved')], ['sold', U.t('sold')]]);
    U.options(field('set'), [['unknown', U.t('unknown')], ['full', U.t('full')], ['phoneOnly', U.t('phoneOnly')]]);
    renderImages(); renderList();
    if (lastMessage) message(...lastMessage);
  }
  function message(key, error = false, detail = '') {
    lastMessage = [key, error, detail];
    $('phone-admin-message').textContent = U.t(key) + (detail ? ' ' + detail : '');
    $('phone-admin-message').style.color = error ? '#dc2626' : '#15803d';
  }
  function access(allowed) {
    $('phone-login-form').classList.toggle('hidden', allowed);
    $('phone-admin-controls').classList.toggle('hidden', !allowed);
    if (!allowed) { products = []; renderList(); window.PhoneVideosAdmin?.clear(); }
  }
  async function api(path, options = {}) {
    const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(240000), ...options });
    let data;
    try { data = await response.json(); } catch { throw new Error('Pages Functions: ' + response.status); }
    if (!response.ok) {
      if (response.status === 401) { access(false); message('sessionExpired', true); }
      throw new Error(data.error || 'HTTP ' + response.status);
    }
    return data;
  }
  async function load() {
    products = (await api('/api/phones/products?admin=1')).products; renderList();
  }
  window.refreshAdminPhones = async () => {
    if (busy) return;
    try {
      const session = await api('/api/gallery/session'); access(session.authenticated);
      if (session.authenticated) await load();
    } catch (e) { message('error', true, e.message); }
  };
  $('phone-login-form').addEventListener('submit', async e => {
    e.preventDefault(); const button = e.currentTarget.querySelector('button'); button.disabled = true;
    try {
      await api('/api/gallery/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('phone-password').value }) });
      access(true); await load(); message('verify');
    } catch (err) { message('error', true, err.message); }
    finally { $('phone-password').value = ''; button.disabled = false; }
  });
  function releaseImages() { images.forEach(i => { if (i.file) URL.revokeObjectURL(i.url); }); images = []; }
  function reset() {
    releaseImages(); form.reset(); $('phone-product-id').value = ''; updateTime = ''; dirty = false;
    field('condition').value = 'unknown'; field('status').value = 'unknown'; field('set').value = 'unknown'; renderImages();
  }
  function discard() { return !dirty || confirm(U.t('unsaved')); }
  function edit(p) {
    if (!discard()) return;
    reset(); $('phone-product-id').value = p.id; updateTime = p.updateTime;
    fields.forEach(([key]) => { field(key).value = p[key] ?? ''; });
    $('phone-published').checked = p.published; images = p.images.map(i => ({ ...i })); renderImages();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderImages() {
    $('phone-image-editor').replaceChildren(...images.map((img, index) => {
      const box = U.node('div', undefined, 'phone-image-item'), image = U.node('img'); image.src = img.url; image.alt = String(index + 1);
      const remove = U.node('button', U.t('remove')); remove.type = 'button'; remove.disabled = busy;
      remove.addEventListener('click', () => { if (img.file) URL.revokeObjectURL(img.url); images.splice(index, 1); dirty = true; renderImages(); });
      const first = U.node('button', U.t('first')); first.type = 'button'; first.disabled = busy || index === 0;
      first.addEventListener('click', () => { images.unshift(images.splice(index, 1)[0]); dirty = true; renderImages(); });
      box.append(image, remove, first); return box;
    }));
  }
  $('phone-files').addEventListener('change', e => {
    const files = [...e.target.files];
    if (images.length + files.length > 6 || files.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || !f.size || f.size > 5 * 1024 * 1024)) {
      message('invalidFiles', true); e.target.value = ''; return;
    }
    images.push(...files.map(file => ({ file, url: URL.createObjectURL(file) }))); e.target.value = ''; dirty = true; renderImages();
  });
  function renderList() {
    $('phone-admin-list').replaceChildren(...products.map(p => {
      const card = U.card(p); card.append(U.node('p', `${p.code} · ${U.t(p.published ? 'published' : 'draft')}`));
      const actions = U.node('div', undefined, 'phone-actions');
      const editButton = U.node('button', U.t('edit')); editButton.type = 'button'; editButton.disabled = busy; editButton.addEventListener('click', () => edit(p));
      const del = U.node('button', U.t('delete')); del.type = 'button'; del.disabled = busy;
      del.addEventListener('click', async () => {
        if (busy || !confirm(`${U.t('confirmDelete')}\n${p.name}`)) return;
        setBusy(true);
        try {
          const result = await api('/api/phones/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, updateTime: p.updateTime }) });
          if ($('phone-product-id').value === p.id) reset(); await load(); message(result.warning ? 'cleanup' : 'deleted', !!result.warning);
        } catch (err) { message('error', true, err.message); }
        finally { setBusy(false); }
      });
      actions.append(editButton, del); card.append(actions); return card;
    }));
  }
  function setBusy(value) {
    busy = value;
    $('phone-admin-controls').querySelectorAll('input,textarea,select,button').forEach(el => {
      if (!el.closest('.phone-video-admin')) el.disabled = value;
    });
    renderImages(); renderList();
  }
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    const data = { id: $('phone-product-id').value, updateTime, published: $('phone-published').checked };
    fields.forEach(([key, type]) => { data[key] = type === 'number' ? field(key).value === '' ? null : Number(field(key).value) : field(key).value.trim(); });
    const body = new FormData(); let fileIndex = 0;
    data.images = images.map(img => {
      if (!img.file) return { publicId: img.publicId };
      const index = fileIndex++; body.append('file' + index, img.file); return { fileIndex: index };
    });
    body.append('metadata', JSON.stringify(data)); setBusy(true); message('saving');
    try {
      const result = await api('/api/phones/products', { method: 'POST', body }); reset(); await load(); message(result.warning ? 'cleanup' : 'saved', !!result.warning);
    } catch (err) { message('error', true, err.message); }
    finally { setBusy(false); }
  });
  $('phone-new').addEventListener('click', () => { if (discard()) reset(); });
  $('phone-cancel').addEventListener('click', () => { if (discard()) reset(); });
  $('phone-redmi').addEventListener('click', () => {
    if (!discard()) return; reset();
    const draft = { name: 'Redmi Note 13', brand: 'Redmi', model: 'Note 13', ram: '8GB', storage: '256GB', price: 830, set: 'full',
      descriptionMs: 'Redmi Note 13 dengan RAM 8GB dan storan 256GB. Ditawarkan bersama full set pada harga RM830.00. Hubungi kedai untuk maklumat lanjut dan semakan ketersediaan.',
      descriptionEn: 'Redmi Note 13 with 8GB RAM and 256GB storage. Offered with a full set at RM830.00. Contact the shop for details and availability.' };
    Object.entries(draft).forEach(([k, v]) => { field(k).value = v; }); dirty = true;
  });
  $('phone-admin-refresh').addEventListener('click', () => window.refreshAdminPhones());
  window.addEventListener('phones-language', translate);
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('DOMContentLoaded', () => { translate(); reset(); });
})();
