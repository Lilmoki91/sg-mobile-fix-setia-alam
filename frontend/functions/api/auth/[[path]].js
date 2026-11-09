// functions/api/auth/[[path]].js
import { 
  DAY, fail, json, origin, body, hash, equal, str, stamp, docName, 
  rest, fields, commit, session, cookie, cookieNames, captcha, 
  googleIdentity, customToken, issue, revoke, queryOwned 
} from '../../../lib/auth-server.js';
import { token as serviceToken } from '../../../lib/phones-store.js';
import { ensureProfile } from '../../../lib/profile-store.js';

// ============================================================================
// HELPERS
// ============================================================================

async function responseSession(env, s, profile = null) {
  return { 
    authenticated: true, 
    uid: s.uid, 
    role: s.role, 
    profile, 
    expiresAt: s.expiresAt, 
    serverNow: new Date().toISOString(), 
    customToken: await customToken(env, s) 
  };
}

async function adminAttempts(request, env) {
  // KV is best-effort; configure an edge rate-limit rule for this endpoint too.
  if (!env.GALLERY_KV) fail('GALLERY_KV diperlukan untuk had percubaan admin.', 503);
  
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = 'auth-admin:' + await hash(ip);
  const value = await env.GALLERY_KV.get(key, 'json');
  const recent = value && Date.now() - value.since < 900000; // 15 mins
  
  if (recent && value.count >= 8) {
    fail('Terlalu banyak percubaan. Tunggu 15 minit.', 429);
  }
  
  await env.GALLERY_KV.put(key, JSON.stringify({ 
    since: recent ? value.since : Date.now(), 
    count: recent ? value.count + 1 : 1 
  }), { expirationTtl: 900 });
  
  return key;
}

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

export async function onRequest({ request, env, waitUntil }) {
  // 1. Handle CORS Preflight (Sangat penting untuk PWA dan Web Apps)
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: { 
        'Access-Control-Allow-Origin': origin(request), 
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      } 
    });
  }

  // 2. Parse Route
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/auth\/?/, '').replace(/\/$/, '');
  const role = route.startsWith('admin') ? 'admin' : 'pelanggan';

  try {
    // 3. Verify Origin for state-changing requests (Non-GET)
    if (request.method !== 'GET') {
      origin(request); // Pastikan fungsi origin() melempar error jika tidak sah
    }

    // ========================================================================
    // ROUTE: CONFIG
    // ========================================================================
    if (route === 'config' && request.method === 'GET') {
      if (!env.TURNSTILE_SITE_KEY) fail('TURNSTILE_SITE_KEY belum ditetapkan pada Cloudflare.', 503);
      return json({ siteKey: env.TURNSTILE_SITE_KEY });
    }

    // ========================================================================
    // ROUTE: SESSION (GET)
    // ========================================================================
    if (['session', 'admin-session'].includes(route) && request.method === 'GET') {
      const s = await session(request, env, role, role === 'pelanggan');
      if (!s) return json({ authenticated: false }, 401, { 'Set-Cookie': cookie(role) });
      
      if (role === 'pelanggan') {
        const deletion = await rest(env, 'authDeletions/' + encodeURIComponent(s.uid));
        if (fields(deletion).completedAt) {
          return json({ authenticated: false, deletionCompleted: true }, 401, { 'Set-Cookie': cookie(role) });
        }
        if (deletion && s.revoked === false) {
          return json({ error: 'Sambung atau semak status pemadaman akaun.', deletionPending: true }, 409);
        }
      }

      if (s.revoked !== false) {
        return json({ authenticated: false }, 401, { 'Set-Cookie': cookie(role) });
      }

      let profile = role === 'pelanggan' ? fields(await rest(env, 'users/' + encodeURIComponent(s.uid))) : null;
      if (role === 'pelanggan' && (!profile.uid || profile.deleting)) {
        fail('Akaun tidak tersedia.', 403);
      }
      if (role === 'pelanggan') {
        profile = await ensureProfile(env, s.uid);
      }
      
      return json(await responseSession(env, s, profile));
    }

    // ========================================================================
    // ROUTE: LOGOUT (GET & POST)
    // ========================================================================
    if (['logout-status', 'admin-logout-status'].includes(route) && request.method === 'GET') {
      const cookieHeader = request.headers.get('Cookie') || '';
      const present = cookieHeader.split(';').some(part => part.trim().startsWith(cookieNames[role] + '='));
      return json({ cookieCleared: !present, role });
    }

    if (['logout', 'admin-logout'].includes(route) && request.method === 'POST') {
      const work = (async () => {
        const s = await session(request, env, role);
        if (s) await revoke(env, s.uid, role);
      })().catch(e => console.error('Logout revoke gagal:', e.message));
      
      if (waitUntil) waitUntil(work);
      else await work;
      
      return json({ success: true }, 200, { 'Set-Cookie': cookie(role) });
    }

    // ========================================================================
    // ROUTE: LOGIN (POST)
    // ========================================================================
    if (route === 'login' && request.method === 'POST') {
      const input = await body(request);
      
      // 1. Verify Google Token
      const identity = await googleIdentity(env, input.idToken, true);
      
      // 2. Verify Captcha
      await captcha(request, env, input.captchaToken, 'login');
      
      // 3. Check Tombstone
      if (await rest(env, 'authDeletions/' + encodeURIComponent(identity.uid))) {
        fail('UID ini telah dipadam atau sedang dipadam.', 403);
      }

      // 4. Ensure Profile
      const profile = await ensureProfile(env, identity.uid, identity);
      if (profile.deleting) {
        fail('Akaun sedang dipadam. Hubungi admin jika proses terganggu.', 403);
      }

      // 5. Revoke old session if exists
      const old = await session(request, env);
      if (old) await revoke(env, old.uid, 'pelanggan');

      // 6. Issue new session
      const s = await issue(env, identity.uid, 'pelanggan');
      return json(await responseSession(env, s, profile), 200, { 'Set-Cookie': cookie('pelanggan', s.raw, DAY / 1000) });
    }

    // ========================================================================
    // ROUTE: ADMIN LOGIN (POST)
    // ========================================================================
    if (route === 'admin-login' && request.method === 'POST') {
      const input = await body(request);
      const key = await adminAttempts(request, env);
      
      if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 16) {
        fail('Tetapkan ADMIN_PASSWORD sekurang-kurangnya 16 aksara.', 503);
      }
      
      if (typeof input.password !== 'string' || input.password.length > 256 || !equal(await hash(input.password), await hash(env.ADMIN_PASSWORD))) {
        fail('Kata laluan salah.', 401);
      }
      
      await env.GALLERY_KV.delete(key);

      // Recover admin config
      const validAdminUid = value => typeof value === 'string' && /^admin-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
      let adminConfig = await rest(env, 'authConfig/admin');
      
      for (let attempt = 0; attempt < 3 && !validAdminUid(fields(adminConfig).uid); attempt++) {
        if (adminConfig && !adminConfig.updateTime) fail('Konfigurasi admin tidak dapat dipulihkan.', 503);
        try {
          await commit(env, [{
            update: { name: docName(env, 'authConfig/admin'), fields: { uid: str('admin-' + crypto.randomUUID()) } },
            updateMask: { fieldPaths: ['uid'] },
            currentDocument: adminConfig ? { updateTime: adminConfig.updateTime } : { exists: false }
          }]);
        } catch (e) { if (e.status !== 409) throw e; }
        adminConfig = await rest(env, 'authConfig/admin');
      }
      
      const adminUid = fields(adminConfig).uid;
      if (!validAdminUid(adminUid)) fail('Konfigurasi admin sedang berubah. Cuba login semula.', 503);
      
      const s = await issue(env, adminUid, 'admin');
      return json(await responseSession(env, s), 200, { 'Set-Cookie': cookie('admin', s.raw, DAY / 1000) });
    }

    // ========================================================================
    // ROUTE: DELETE ACCOUNT (POST & GET)
    // ========================================================================
    if (route === 'delete-account' && request.method === 'POST') {
      const s = await session(request, env); 
      if (!s) fail('Sila login semula.', 401);
      
      const input = await body(request);
      const identity = await googleIdentity(env, input.idToken, true);
      
      if (identity.uid !== s.uid) fail('Akaun Google tidak sepadan.', 403);
      await captcha(request, env, input.captchaToken, 'delete_account');
      
      try {
        await commit(env, [
          { update: { name: docName(env, 'authDeletions/' + encodeURIComponent(s.uid)), fields: { startedAt: stamp(Date.now()) } }, currentDocument: { exists: false } },
          { update: { name: docName(env, 'users/' + encodeURIComponent(s.uid)), fields: { deleting: { booleanValue: true } } }, updateMask: { fieldPaths: ['deleting'] } }
        ]);
      } catch (e) {
        if (e.status !== 409) throw e; // Already started by another request
      }
      
      return json({ pending: true }, 202);
    }

    if (route === 'delete-account-status' && request.method === 'GET') {
      const s = await session(request, env, 'pelanggan', true);
      if (!s) return json({ error: 'Sesi pemadaman tamat. Status belum dapat disahkan.' }, 401, { 'Set-Cookie': cookie('pelanggan') });
      
      const deletion = fields(await rest(env, 'authDeletions/' + encodeURIComponent(s.uid)));
      if (deletion.completedAt) return json({ success: true }, 200, { 'Set-Cookie': cookie('pelanggan') });
      if (s.revoked !== false) fail('Sesi pemadaman telah dibatalkan.', 401);
      
      return json({ pending: !!deletion.startedAt });
    }

    if (route === 'delete-account-continue' && request.method === 'POST') {
      const s = await session(request, env, 'pelanggan', true);
      if (!s) return json({ error: 'Sesi tamat. Status tidak dapat disahkan; hubungi admin.' }, 401, { 'Set-Cookie': cookie('pelanggan') });
      
      const path = 'authDeletions/' + encodeURIComponent(s.uid);
      const deletion = fields(await rest(env, path));
      
      if (!deletion.startedAt) fail('Sahkan Google dan CAPTCHA sebelum memadam akaun.', 409);
      
      const completed = () => json({ success: true }, 200, { 'Set-Cookie': cookie('pelanggan') });
      if (deletion.completedAt) return completed();
      if (s.revoked !== false) fail('Sesi pemadaman telah dibatalkan. Hubungi admin.', 401);

      const advance = async phase => {
        await commit(env, [{ update: { name: docName(env, path), fields: { phase: str(phase) } }, updateMask: { fieldPaths: ['phase'] } }]);
        return json({ pending: true }, 202);
      };

      if (!deletion.phase || deletion.phase === 'bookings') {
        const bookings = await queryOwned(env, 'bookings', 'ownerUid', s.uid, 400);
        if (!bookings.length) return await advance('sessions');
        await commit(env, bookings.map(d => ({ delete: d.name })));
        return json({ pending: true }, 202);
      }

      if (deletion.phase === 'sessions') {
        const sessions = (await queryOwned(env, 'authSessions', 'uid', s.uid, 400))
          .filter(d => d.name !== docName(env, 'authSessions/' + s.sid));
        if (!sessions.length) return await advance('identity');
        await commit(env, sessions.map(d => ({ delete: d.name })));
        return json({ pending: true }, 202);
      }

      if (!deletion.identityDeletedAt) {
        const r = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:delete`, { 
          method: 'POST', 
          headers: { 
            Authorization: 'Bearer ' + await serviceToken(env, 'https://www.googleapis.com/auth/cloud-platform'), 
            'Content-Type': 'application/json' 
          }, 
          body: JSON.stringify({ localId: s.uid }), 
          signal: AbortSignal.timeout(15000) 
        });
        
        const result = await r.json();
        if (!r.ok && !String(result.error?.message).includes('USER_NOT_FOUND')) {
          fail('Pemadaman Firebase Auth gagal. Cuba sambung pemadaman atau hubungi admin.', 502);
        }
        
        await commit(env, [{ update: { name: docName(env, path), fields: { identityDeletedAt: stamp(Date.now()) } }, updateMask: { fieldPaths: ['identityDeletedAt'] } }]);
        return json({ pending: true }, 202);
      }

      await commit(env, [
        { delete: docName(env, 'users/' + encodeURIComponent(s.uid)) },
        { update: { name: docName(env, path), fields: { completedAt: stamp(Date.now()) } }, updateMask: { fieldPaths: ['completedAt'] } },
        { update: { name: docName(env, 'authSessions/' + s.sid), fields: { revoked: { booleanValue: true } } }, updateMask: { fieldPaths: ['revoked'] } }
      ]);
      
      return completed();
    }

    // ========================================================================
    // FALLBACK (404)
    // ========================================================================
    return json({ error: 'Endpoint atau kaedah tidak dibenarkan.' }, 404);

  } catch (e) {
    // ========================================================================
    // GLOBAL ERROR HANDLER (Mengelak Abort/Crash)
    // ========================================================================
    if (!e.status) {
      console.error('Authentication backend error:', route, e.message);
    }
    
    // Tangani isu Timeout atau Abort
    if (['AbortError', 'TimeoutError'].includes(e.name)) {
      return json({ 
        error: route.startsWith('delete-account') 
          ? 'Perkhidmatan Google/Firestore mengambil masa terlalu lama. Sambung pemadaman untuk menyemak status.' 
          : 'Perkhidmatan pengesahan mengambil masa terlalu lama. Sila cuba lagi.' 
      }, 504);
    }
    
    // Pulangkan ralat standard (JSON) supaya frontend tak crash
    return json({ 
      error: e.status ? e.message : 'Ralat dalaman backend. Sila hubungi admin atau semak log Cloudflare.' 
    }, e.status || 500);
  }
}
