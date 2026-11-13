//phone-videos-admin.js
// ID TikTok disimpan sebagai string supaya ketepatan 19 digit dikekalkan.
(function () {
  'use strict';
  function initVideoAdmin(prefix, endpoint, globalName) {
  const U = window.PhoneUI, $ = id => document.getElementById(prefix + id);
  const form = $('form');
  if (!form) return;
  let videos = [], updateTime = '', busy = false, loaded = false, dirty = false, lastMessage = '', sessionRevision = 0;
  function message(key) { lastMessage = key; $('message').textContent = U.t(key); }
  function setBusy(value) {
    busy = value;
    form.querySelectorAll('input,button').forEach(el => { el.disabled = value; });
    $('admin-list').querySelectorAll('button').forEach(el => { el.disabled = value; });
  }
  async function api(options = {}) {
    const revision = sessionRevision;
    const response = await fetch(endpoint + '?admin=1', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(45000), ...options });
    let data; try { data = await response.json(); } catch { throw new Error('videoFailed'); }
    if (revision !== sessionRevision) throw new Error('sessionExpired');
    if (!response.ok) {
      if (response.status === 401) window[globalName].clear();
      throw new Error(response.status === 401 ? 'sessionExpired' : response.status === 409 ? 'videoConflict' : 'videoFailed');
    }
    if (!options.method && (!data || !Array.isArray(data.videos) || data.videos.length > 30 || typeof data.updateTime !== 'string' || data.videos.some(v => !v || typeof v.id !== 'string' || !/^\d{19}$/.test(v.id) || typeof v.titleMs !== 'string' || typeof v.titleEn !== 'string' || typeof v.active !== 'boolean'))) throw new Error('videoFailed');
    return data;
  }
  function reset() {
    form.reset(); $('edit-id').value = ''; $('order').value = Math.min(videos.length + 1, 30); dirty = false;
  }
  function render() {
    $('admin-list').replaceChildren(...videos.map((v, index) => {
      const card = U.node('article', undefined, 'phone-card');
      card.append(U.node('h4', U.lang() === 'en' ? v.titleEn : v.titleMs), U.node('p', `${index + 1} · ${v.id} · ${U.t(v.active ? 'published' : 'draft')}`));
      const link = U.node('a', U.t('openTikTok'), 'phone-video-fallback');
      link.href = `https://www.tiktok.com/@sgmobilesetiaalam/video/${v.id}`; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const actions = U.node('div', undefined, 'phone-actions');
      const edit = U.node('button', U.t('edit')); edit.type = 'button'; edit.disabled = busy;
      edit.addEventListener('click', () => {
        if (dirty && !confirm(U.t('unsaved'))) return;
        $('edit-id').value = v.id; $('id').value = v.id; $('title-ms').value = v.titleMs; $('title-en').value = v.titleEn;
        $('order').value = index + 1; $('active').checked = v.active; dirty = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      const remove = U.node('button', U.t('delete')); remove.type = 'button'; remove.disabled = busy;
      remove.addEventListener('click', () => {
        if (!busy && (!dirty || confirm(U.t('unsaved'))) && confirm(U.t('videoConfirmDelete'))) save(videos.filter(item => item.id !== v.id), 'videoDeleted');
      });
      actions.append(edit, remove); card.append(link, actions); return card;
    }));
    if (!videos.length) $('admin-list').append(U.node('p', U.t('videoEmpty'), 'phone-note'));
  }
  async function refresh() {
    if (busy || dirty) return;
    setBusy(true);
    try {
      const data = await api(); videos = data.videos; updateTime = data.updateTime; loaded = true; render(); reset(); message('');
    } catch (error) { message(error.message); }
    finally { setBusy(false); }
  }
  async function save(next, key) {
    if (busy || !loaded) { message('videoFailed'); return; }
    setBusy(true); message('saving');
    try {
      await api({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videos: next, updateTime }) });
      loaded = false; dirty = false; reset();
      const data = await api(); videos = data.videos; updateTime = data.updateTime; loaded = true;
      render(); reset(); message(key);
    } catch (error) { message(error.message); }
    finally { setBusy(false); }
  }
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const oldId = $('edit-id').value;
    const video = { id: $('id').value.trim(), titleMs: $('title-ms').value.trim(), titleEn: $('title-en').value.trim(), active: $('active').checked };
    const next = videos.filter(v => v.id !== oldId), order = Number($('order').value);
    if (!/^\d{19}$/.test(video.id) || !video.titleMs || !video.titleEn || next.some(v => v.id === video.id) || next.length >= 30 || !Number.isInteger(order) || order < 1 || order > 30) { message('videoInvalid'); return; }
    next.splice(Math.min(order - 1, next.length), 0, video); save(next, 'videoSaved');
  });
  $('cancel').addEventListener('click', () => { if (!dirty || confirm(U.t('unsaved'))) reset(); });
  $('refresh').addEventListener('click', () => { if (!dirty || confirm(U.t('unsaved'))) { dirty = false; refresh(); } });
  window[globalName] = { refresh, clear() { sessionRevision++; videos = []; loaded = false; updateTime = ''; reset(); $('admin-list').replaceChildren(); message(''); } };
  window.addEventListener('phones-language', () => { render(); message(lastMessage); });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('sgm-auth-changed', event => { if (!event.detail || event.detail.role !== 'admin') window[globalName].clear(); });
  reset();
  }
  initVideoAdmin('phone-video-', '/api/phones/videos', 'PhoneVideosAdmin');
  initVideoAdmin('testimonial-video-', '/api/phones/testimonials', 'TestimonialVideosAdmin');
})();
