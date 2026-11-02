// phones-clients.js
(function () {
  'use strict';
  const U = window.PhoneUI, $ = id => document.getElementById(id);
  if (!$('phones-grid')) return;
  let products = [], loaded = false, failed = false, loading = false, selectedId = null;
  const dialog = $('phone-detail');
  function filters() {
    U.options($('phones-brand'), [['', U.t('all')], ...[...new Set(products.map(p => p.brand))].sort().map(b => [b, b])]);
    U.options($('phones-condition'), [['', U.t('all')], ['new', U.t('newCondition')], ['used', U.t('used')], ['refurbished', U.t('refurbished')]]);
    U.options($('phones-sort'), [['latest', U.t('latest')], ['low', U.t('low')], ['high', U.t('high')]]);
    $('phones-search').placeholder = U.t('search');
  }
  function render() {
    const query = $('phones-search').value.trim().toLocaleLowerCase();
    const matches = products.filter(p => (!query || [p.name, p.brand, p.model, p.ram, p.storage, p.code].join(' ').toLocaleLowerCase().includes(query)) &&
      (!$('phones-brand').value || p.brand === $('phones-brand').value) && (!$('phones-condition').value || p.condition === $('phones-condition').value));
    const sort = $('phones-sort').value;
    matches.sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : String(b.createdAt).localeCompare(String(a.createdAt)));
    $('phones-state').textContent = failed ? U.t('failed') : !loaded ? U.t('loading') : !products.length ? U.t('empty') : !matches.length ? U.t('noMatch') : `${matches.length} ${U.t('catalog')}`;
    $('phones-grid').replaceChildren(...matches.map(p => {
      const card = U.card(p), actions = U.node('div', undefined, 'phone-actions'), button = U.node('button', U.t('details'));
      button.type = 'button'; button.addEventListener('click', () => { selectedId = p.id; detail(p); dialog.showModal(); });
      actions.append(button);
      if (p.status === 'available' && p.stock > 0) actions.append(U.whatsapp(p));
      card.append(actions); return card;
    }));
    if (dialog.open) {
      const selected = products.find(p => p.id === selectedId);
      if (selected) detail(selected); else dialog.close();
    }
  }
  function detail(p) {
    const content = $('phone-detail-content'), gallery = U.node('div', undefined, 'phone-detail-gallery');
    if (p.images.length) gallery.append(...p.images.map(i => U.image(p, i.url))); else gallery.append(U.image(p));
    const title = U.node('h2', p.name); title.id = 'phone-detail-title';
    const dl = U.node('dl', undefined, 'phone-specs');
    const rows = [['code', p.code], ['brand', p.brand], ['model', p.model], ['ram', p.ram], ['storage', p.storage],
      ['variant', p.variant || U.t('unknown')], ['condition', U.condition(p)], ['color', U.localized(p, 'color')],
      ['set', U.t(p.set)], ['accessories', U.localized(p, 'accessories')], ['warranty', U.localized(p, 'warranty')],
      ['battery', p.battery === null ? U.t('unknown') : p.battery + '%'], ['stock', p.stock === null ? U.t('unknown') : p.stock], ['status', U.status(p)]];
    rows.forEach(([key, value]) => dl.append(U.node('dt', U.t(key)), U.node('dd', String(value))));
    content.replaceChildren(gallery, title, U.node('strong', U.price(p), 'phone-price'), dl, U.node('p', U.localized(p, 'description'), 'phone-description'));
    if (p.status === 'available' && p.stock > 0) content.append(U.whatsapp(p));
    content.append(U.node('p', U.t('purchaseNote'), 'phone-note'));
  }
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true; $('phones-retry').disabled = true;
    try {
      const response = await fetch('/api/phones/products', { cache: 'no-store', signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error('catalog');
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('catalog');
      products = data.products; loaded = true; failed = false; filters();
    } catch { failed = true; }
    finally { loading = false; $('phones-retry').disabled = false; render(); }
  }
  $('phones-menu-action').addEventListener('click', event => {
    event.preventDefault(); showTab('phones-tab'); window.closeMenu?.();
    document.querySelectorAll('.mobile-bottom-nav a').forEach(a => a.classList.remove('active'));
    if (!loaded || failed) refresh();
  });
  $('phone-detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  ['phones-search', 'phones-brand', 'phones-condition', 'phones-sort'].forEach(id => $(id).addEventListener(id === 'phones-search' ? 'input' : 'change', render));
  $('phones-retry').addEventListener('click', refresh);
  window.addEventListener('phones-language', () => { filters(); render(); });
  document.addEventListener('DOMContentLoaded', () => { filters(); render(); });
  setInterval(() => { if ($('phones-tab').classList.contains('active')) refresh(); }, 60000);
  document.addEventListener('visibilitychange', () => { if ($('phones-tab').classList.contains('active')) refresh(); });
})();
