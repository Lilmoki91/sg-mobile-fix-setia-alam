import { rest, fields, commit, docName, str } from './auth-server.js';

// Provision profiles on the server, after Google + CAPTCHA verification.
// UUID avoids collisions inherent in a five-digit customer ID.
export async function ensureProfile(env, uid, identity = null) {
  const path = 'users/' + encodeURIComponent(uid);
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await rest(env, path);
    const data = fields(existing);
    if (data.deleting) return data;
    const updates = {};
    const transforms = [];
    if (!existing) {
      updates.uid = str(uid);
      updates.email = str(identity?.email || '');
      updates.nama = str(identity?.nama || '');
      updates.no_telefon = str('');
      updates.peranan = str('pelanggan');
      transforms.push({ fieldPath: 'tarikh_daftar', setToServerValue: 'REQUEST_TIME' });
    }
    if (!data.sgmfId) updates.sgmfId = str('SGMF-' + crypto.randomUUID().toUpperCase());
    if (data.phoneNumber === undefined) updates.phoneNumber = str(data.no_telefon || '');
    if (!data.createdAt) {
      if (data.tarikh_daftar) updates.createdAt = { timestampValue: data.tarikh_daftar };
      else transforms.push({ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' });
    }
    if (identity) {
      updates.email = str(identity.email || '');
      updates.nama = str(identity.nama || '');
      updates.photoURL = str(identity.photoURL || '');
    }
    if (!Object.keys(updates).length && !transforms.length) return data;
    try {
      await commit(env, [{
        update: { name: docName(env, path), fields: updates },
        ...(existing ? { updateMask: { fieldPaths: Object.keys(updates) } } : {}),
        ...(transforms.length ? { updateTransforms: transforms } : {}),
        currentDocument: existing ? { updateTime: existing.updateTime } : { exists: false }
      }]);
      return fields(await rest(env, path));
    } catch (error) {
      if (error.status !== 409 || attempt === 2) throw error;
    }
  }
}
