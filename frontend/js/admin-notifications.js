// Composer bersama untuk notifikasi kad servis dan produk yang sudah disimpan.
(function () {
  'use strict';
  const t = (ms, en) => document.documentElement.lang === 'en' ? en : ms;
  let target = null, busy = false;
  const dialog = document.createElement('dialog');
  dialog.className = 'phone-dialog';
  dialog.innerHTML = `<form class="space-y-4 p-5">
    <h2 class="text-lg font-bold" data-notice="heading"></h2>
    <p class="text-sm" data-notice="help"></p>
    <label class="block"><span data-notice="title"></span><input name="title" maxlength="120" required class="w-full border rounded-xl px-4 py-2"></label>
    <label class="block"><span data-notice="message"></span><textarea name="message" maxlength="1000" rows="4" required class="w-full border rounded-xl px-4 py-2"></textarea></label>
    <label class="block"><span data-notice="titleEn"></span><input name="titleEn" maxlength="120" class="w-full border rounded-xl px-4 py-2"></label>
    <label class="block"><span data-notice="messageEn"></span><textarea name="messageEn" maxlength="1000" rows="4" class="w-full border rounded-xl px-4 py-2"></textarea></label>
    <p class="text-xs" data-notice="languageHelp"></p>
    <p role="status" aria-live="polite" data-notice="status"></p>
    <div class="flex gap-2"><button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-xl" data-notice="send"></button><button type="button" class="px-4 py-2 rounded-xl" data-notice="cancel"></button></div>
  </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const el = name => dialog.querySelector(`[data-notice="${name}"]`);
  let noticeStatus = null, statusDetail = '';
  function setStatus(ms, en, detail = '') {
    noticeStatus = [ms, en]; statusDetail = detail;
    el('status').textContent = t(ms, en) + detail;
  }
  function translate() {
    el('heading').textContent = t('Notifikasi sementara — 7 hari', 'Temporary notification — 7 days');
    el('help').textContent = t('Klik notifikasi akan membuka kad ini. Notifikasi disembunyikan selepas 7 hari; TTL atau panel admin memadam rekod tamat tempoh.', 'Clicking the notification opens this card. It is hidden after 7 days; TTL or the admin panel deletes expired records.');
    el('title').textContent = t('Tajuk (BM)', 'Title (BM)');
    el('message').textContent = t('Mesej (BM)', 'Message (BM)');
    el('titleEn').textContent = t('Tajuk (EN, pilihan)', 'Title (EN, optional)');
    el('messageEn').textContent = t('Mesej (EN, pilihan)', 'Message (EN, optional)');
    el('languageHelp').textContent = t('Isi kedua-dua bahasa untuk paparan dwibahasa. Jika English kosong, teks BM digunakan.', 'Fill in both languages for bilingual display. If English is empty, BM text is used.');
    if (noticeStatus) el('status').textContent = t(...noticeStatus) + statusDetail;
    el('send').textContent = t('Hantar Notifikasi', 'Send Notification');
    el('cancel').textContent = t('Batal', 'Cancel');
  }
  el('cancel').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !target) return;
    const title = form.elements.title.value.trim(), message = form.elements.message.value.trim();
    const titleEn = form.elements.titleEn.value.trim(), messageEn = form.elements.messageEn.value.trim();
    if (!title || !message || title.length > 120 || message.length > 1000 || titleEn.length > 120 || messageEn.length > 1000) return;
    busy = true;
    el('send').disabled = true; el('cancel').disabled = true;
    setStatus('Menghantar…', 'Sending…');
    try {
      if (window.sgmAuth?.current?.role !== 'admin') throw new Error(t('Sila log masuk sebagai admin.', 'Please sign in as an admin.'));
      const { collection, addDoc, serverTimestamp, Timestamp } = await window.ensureFirestoreFns();
      const link = new URL('index.html', document.baseURI);
      link.searchParams.set('notificationType', target.type);
      link.searchParams.set('notificationTarget', target.id);
      link.hash = target.type === 'service' ? 'services-tab' : 'phones-tab';
      await addDoc(collection(window.db, 'store_notifications'), {
        type: target.type, lifetime: 'temporary', title, message,
        titleMs: title, messageMs: message, titleEn, messageEn,
        link: link.pathname + link.search + link.hash,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 86400000)), isActive: true
      });
      setStatus('Notifikasi 7 hari berjaya dihantar.', '7-day notification sent.');
    } catch (error) {
      setStatus('Gagal menghantar: ', 'Unable to send: ', error.message);
    } finally { busy = false; el('send').disabled = false; el('cancel').disabled = false; }
  });
  window.StoreNotificationAdmin = {
    open(type, id, title, message, titleEn = '', messageEn = '') {
      if (busy || !id || !['service', 'stock'].includes(type)) return;
      target = { type, id: String(id) }; noticeStatus = null; statusDetail = ''; translate();
      form.elements.title.value = String(title || '').slice(0, 120);
      form.elements.message.value = String(message || '').slice(0, 1000);
      form.elements.titleEn.value = String(titleEn || '').slice(0, 120);
      form.elements.messageEn.value = String(messageEn || '').slice(0, 1000);
      el('status').textContent = '';
      if (!dialog.open) dialog.showModal();
      form.elements.title.focus();
    },
    label: () => t('Notifikasi 7 hari', '7-day notification')
  };
  document.addEventListener('admin-language', translate);
})();
