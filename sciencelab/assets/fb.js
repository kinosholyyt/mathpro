// =====================================================
// ScienceLab · Firebase (MathPro жобасымен ортақ)
// Аккаунттар MathPro-мен ортақ: бір логинмен екі сайтқа да кіруге болады.
// ScienceLab деректері бөлек "sciencelab" жинағында сақталады,
// MathPro-ның "oqushylar" жинағына тиіспейді.
// Әкімші: admin@mathpro.app (логин: admin)
// =====================================================
(function () {
  const cfg = {
    apiKey: "AIzaSyBHQapTqM8BpGGhkP4YhSvieN5tT2dhwYg",
    authDomain: "mathpro-9c840.firebaseapp.com",
    projectId: "mathpro-9c840",
    storageBucket: "mathpro-9c840.firebasestorage.app",
    messagingSenderId: "733561148384",
    appId: "1:733561148384:web:81553c73e10f207172d185"
  };
  const S = window.SLsync = { user: null, data: null, ready: false, settings: null, err: null, cbs: [] };
  S.ADMIN = "admin@mathpro.app";
  S.poshta = (login) => login + "@mathpro.app";
  S.onReady = (f) => { if (S.ready) f(); else S.cbs.push(f); };
  if (!window.firebase) { S.ready = true; return; }   // интернет жоқ: қонақ режимі
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  const auth = S.auth = firebase.auth(), db = S.db = firebase.firestore();
  const TS = () => firebase.firestore.FieldValue.serverTimestamp();
  const ref = () => db.collection("sciencelab").doc(S.user.uid);
  const exp = document.body.dataset.exp || "";

  S.bos = (aty, login) => ({ aty, login, upai: 0, jetistik: {}, suraq: {}, tajiribe: {}, kirgen: {}, tirkelgen: TS(), songy: TS() });

  auth.onAuthStateChanged(async (u) => {
    S.user = u; S.data = null;
    if (u && u.email !== S.ADMIN && !S.noProfile) {
      try {
        const d = await ref().get();
        if (d.exists) S.data = Object.assign({ upai: 0, jetistik: {}, suraq: {}, tajiribe: {}, kirgen: {} }, d.data());
        else {
          // MathPro-дан келген оқушы: атын сол жақтан аламыз
          const login = u.email.split("@")[0]; let aty = S.pendingName || login;
          if (!S.pendingName) { try { const m = await db.collection("oqushylar").doc(u.uid).get(); if (m.exists && m.data().aty) aty = m.data().aty; } catch (e) { } }
          S.data = S.bos(aty, login); await ref().set(S.data);
        }
        if (exp) { S.data.kirgen[exp] = Date.now(); ref().set({ kirgen: { [exp]: Date.now() }, songy: TS() }, { merge: true }).catch(fail); }
      } catch (e) { fail(e); }
    }
    S.ready = true; header(); showPts();
    S.cbs.splice(0).forEach(f => f());
  });
  function fail(e) { S.err = e; console.warn("ScienceLab Firebase:", e && e.code); }

  // тақырыптағы «Кіру / Тіркелу» батырмалары
  function header() {
    const a = document.getElementById("hdrIn"), b = document.getElementById("hdrReg");
    if (!a || !b) return;
    if (S.user) {
      const nm = (S.data && S.data.aty) || S.user.email.split("@")[0];
      a.textContent = S.user.email === S.ADMIN ? "Әкімші панелі" : nm; a.href = S.user.email === S.ADMIN ? "admin.html" : "#";
      b.textContent = "Шығу"; b.href = "#";
      b.onclick = (e) => { e.preventDefault(); auth.signOut().then(() => location.reload()); };
    }
  }
  function showPts() { const el = document.querySelector(".pts b"); if (el && S.data) el.textContent = S.data.upai; }
  S.showPts = showPts;

  // Ұпай: бір жетістік үшін бір рет қана
  S.award = (key, n, title) => {
    if (!S.data) return false;
    if (S.data.jetistik[key]) return "dup";
    const j = { upai: n, aty: title, t: Date.now() };
    S.data.jetistik[key] = j; S.data.upai += n; showPts();
    ref().set({ upai: firebase.firestore.FieldValue.increment(n), jetistik: { [key]: j }, songy: TS() }, { merge: true }).catch(fail);
    return true;
  };
  // «Неге?» сұрағы: талпыныс саны және дұрыс па
  S.quiz = (e, ok) => {
    if (!S.data) return;
    const q = S.data.suraq[e] || { talpynys: 0, durys: false };
    if (q.durys) return;
    q.talpynys++; if (ok) q.durys = true; S.data.suraq[e] = q;
    ref().set({ suraq: { [e]: q }, songy: TS() }, { merge: true }).catch(fail);
  };
  // Тәжірибенің барысы
  S.progress = (e, obj) => {
    if (!S.data) return;
    S.data.tajiribe[e] = Object.assign(S.data.tajiribe[e] || {}, obj);
    ref().set({ tajiribe: { [e]: S.data.tajiribe[e] }, songy: TS() }, { merge: true }).catch(fail);
  };

  // Әкімші жапқан тәжірибе
  db.collection("sciencelab_baptau").doc("negizgi").get().then(d => {
    S.settings = d.exists ? d.data() : {};
    if (exp && S.settings[exp] === false) {
      const o = document.createElement("div");
      o.style.cssText = "position:fixed;inset:76px 0 0;z-index:60;background:rgba(18,20,22,.94);display:grid;place-items:center;text-align:center;padding:24px";
      o.innerHTML = `<div><div class="kick" style="justify-content:center">Уақытша жабық</div><h1 class="serif" style="font:400 40px var(--serif);margin:18px 0 10px">Бұл тәжірибе әзірге жабық</h1><p class="mut">Мұғалім оны кейінірек ашады.</p><p style="margin-top:22px"><a class="b1" href="index.html">Басты бетке</a></p></div>`;
      document.body.appendChild(o);
    }
  }).catch(() => { S.settings = {}; });
})();
