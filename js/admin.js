// =====================================================
// ӘКІМШІ ПАНЕЛІ
// Сабақ пен есепті қосу, өзгерту, өшіру.
// =====================================================

let ozgertilipJatqanSabak = null;  // қай сабақ өзгертіліп жатыр (жаңа болса null)
let ozgertilipJatqanEsep = null;   // қай есеп өзгертіліп жатыр (жаңа болса null)


// ----- 1. КІРУ ЖӘНЕ ШЫҒУ -----
// Әкімші Firebase-те ашылған admin@mathpro.app аккаунтымен кіреді.
// Дерекқор ережелері сабақтарды тек осы аккаунтқа өзгертуге рұқсат береді.

auth.onAuthStateChanged(function (user) {
  if (user && user.email === AKIMSHI_POSHTA) {
    mazmundyJukteu();
  } else {
    document.getElementById("kiru").classList.remove("jasyryn");
    document.getElementById("panel").classList.add("jasyryn");
    document.getElementById("qupiya").focus();
  }
});

function kiru() {
  let poshta = document.getElementById("poshta").value.trim().toLowerCase();
  let qupiya = document.getElementById("qupiya").value;
  let qate = document.getElementById("kiru-qate");
  qate.textContent = "";

  if (poshta !== AKIMSHI_POSHTA) {
    qate.textContent = "Бұл әкімші аккаунты емес.";
    return;
  }
  auth.signInWithEmailAndPassword(poshta, qupiya).catch(function () {
    qate.textContent = "Пошта немесе құпия сөз қате.";
  });
  // Сәтті кірсе, жоғарыдағы onAuthStateChanged панельді өзі ашады
}

// Сабақтар мен есептерді дерекқордан жүктеп, панельді ашамыз
function mazmundyJukteu() {
  db.collection("mazmun").doc("negizgi").get().then(function (doc) {
    if (doc.exists) {
      let mazmun = doc.data();
      if (mazmun.SABAKTAR) SABAKTAR = mazmun.SABAKTAR;
      if (mazmun.ESEPTER) ESEPTER = mazmun.ESEPTER;
    }
    paneldiAshu();
  }).catch(function (q) {
    document.getElementById("kiru-qate").textContent = "Дерекқорға қосылмады: " + q.message;
  });
}

function paneldiAshu() {
  document.getElementById("kiru").classList.add("jasyryn");
  document.getElementById("panel").classList.remove("jasyryn");
  statistikanyKorset();
  sabakTiziminKorset();
  sabakFormasynTazalau();
  esepTiziminKorset();
  esepFormasynTazalau();
}

document.getElementById("kiru-btn").onclick = kiru;
document.getElementById("qupiya").onkeydown = function (e) {
  if (e.key === "Enter") kiru();
};
document.getElementById("shygu").onclick = function () {
  auth.signOut().then(function () {
    location.reload();
  });
};


// ----- 2. ҚОЙЫНДЫЛАР -----

let qoiyndyBatyrmalary = document.querySelectorAll("[data-qoiyndy]");
for (let i = 0; i < qoiyndyBatyrmalary.length; i++) {
  qoiyndyBatyrmalary[i].onclick = function () {
    let atauy = this.getAttribute("data-qoiyndy");
    let bolimder = ["stat", "oqushy", "sabak", "esep"];
    for (let j = 0; j < bolimder.length; j++) {
      document.getElementById("q-" + bolimder[j]).classList.add("jasyryn");
    }
    document.getElementById("q-" + atauy).classList.remove("jasyryn");
    for (let j = 0; j < qoiyndyBatyrmalary.length; j++) {
      qoiyndyBatyrmalary[j].classList.remove("belsendi");
    }
    this.classList.add("belsendi");
    if (atauy === "stat") statistikanyKorset();
    if (atauy === "oqushy") oqushylardyKorset();
  };
}


// ----- 3. КӨМЕКШІ ФУНКЦИЯЛАР -----

// Мәтін ішіндегі < > белгілерін қауіпсіз түрге келтіру
function qauipsiz(matin) {
  return String(matin).split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}

// Көп жолды мәтінді тізімге айналдыру (бос жолдарды алып тастаймыз)
function joldargaBolu(matin) {
  let joldar = matin.split("\n");
  let tizim = [];
  for (let i = 0; i < joldar.length; i++) {
    if (joldar[i].trim() !== "") tizim.push(joldar[i].trim());
  }
  return tizim;
}

// Теория: қарапайым мәтінді абзацтарға бөлеміз.
// Кесте (<table>) болса, мәтінді өзгертпейміз.
function teoriyaHtml(matin) {
  if (matin.indexOf("<table") >= 0) return matin;
  let abzactar = matin.split("\n\n");
  let html = "";
  for (let i = 0; i < abzactar.length; i++) {
    if (abzactar[i].trim() !== "") {
      html += "<p>" + abzactar[i].trim().split("\n").join("<br>") + "</p>";
    }
  }
  return html;
}

// Керісінше: сақталған теорияны өзгертуге ыңғайлы мәтінге айналдыру.
// <p> белгілері бос жолға, <br> жаңа жолға айналады.
function teoriyaMatini(html) {
  if (html.indexOf("<table") >= 0) return html;
  return html
    .split("</p><p>").join("\n\n")
    .split("<p>").join("")
    .split("</p>").join("")
    .split("<br>").join("\n");
}

// Өзгерістерді дерекқорға сақтау. Барлық оқушы бірден жаңасын көреді.
function mazmundySaqtau() {
  let mazmun = { SABAKTAR: SABAKTAR, ESEPTER: ESEPTER };
  db.collection("mazmun").doc("negizgi").set(mazmun).catch(function (q) {
    alert("Сақталмады! Интернетті тексер.\n" + q.message);
  });
}

// Тарау таңдайтын тізімді толтыру
function tarauTiziminTolturu(select) {
  select.innerHTML = "";
  for (let i = 0; i < TARAULAR.length; i++) {
    let nuska = document.createElement("option");
    nuska.value = TARAULAR[i].id;
    nuska.textContent = TARAULAR[i].belgi + " " + TARAULAR[i].aty;
    select.appendChild(nuska);
  }
}

// Сабақ таңдайтын тізімді толтыру
function sabakTiziminTolturu(select, barlygyBolsyn) {
  select.innerHTML = "";
  if (barlygyBolsyn) {
    let nuska = document.createElement("option");
    nuska.value = "barlygy";
    nuska.textContent = "Барлық сабақтар";
    select.appendChild(nuska);
  }
  for (let i = 0; i < SABAKTAR.length; i++) {
    let tarau = taraudyTabu(SABAKTAR[i].tarau);
    let nuska = document.createElement("option");
    nuska.value = SABAKTAR[i].id;
    nuska.textContent = tarau.aty + " · " + SABAKTAR[i].aty;
    select.appendChild(nuska);
  }
}


// ----- 4. СТАТИСТИКА ЖӘНЕ ОҚУШЫЛАР -----

let OQUSHYLAR = []; // дерекқордан алынған барлық оқушы: [{ uid, ...деректері }]

// Барлық оқушыны дерекқордан жүктеу, сосын keyin() функциясын шақыру
function oqushylardyJukteu(keyin) {
  db.collection("oqushylar").get().then(function (jauap) {
    OQUSHYLAR = [];
    jauap.forEach(function (doc) {
      // Жетпейтін мәндер болса, бастапқы мәндермен толтырамыз
      let oqushy = bosOqushy();
      let saqtalgan = doc.data();
      for (let kilt in saqtalgan) oqushy[kilt] = saqtalgan[kilt];
      oqushy.uid = doc.id;
      if (!oqushy.aty) oqushy.aty = oqushy.login || "—";
      OQUSHYLAR.push(oqushy);
    });
    keyin();
  }).catch(function (q) {
    document.getElementById("stat-oqushy").innerHTML = "<p class='qyzyl'>Оқушылар жүктелмеді: " + q.message + "</p>";
  });
}

// Оқушының дәлдігі, пайызбен
function dalDik(oqushy) {
  if (oqushy.talpynys === 0) return 0;
  return Math.round(oqushy.durysSany * 100 / oqushy.talpynys);
}

// Бір оқушының бір тараудағы пайызы (сабақтар мен есептер бойынша)
function oqushyTarauPayzy(oqushy, tarauId) {
  let barlygy = 0;
  let oryndalgan = 0;
  let sabaktar = tarauSabaktary(tarauId);
  for (let i = 0; i < sabaktar.length; i++) {
    barlygy = barlygy + 1;
    if (oqushy.sabaktar[sabaktar[i].id]) oryndalgan = oryndalgan + 1;
    let esepter = sabakEsepteri(sabaktar[i].id);
    for (let j = 0; j < esepter.length; j++) {
      barlygy = barlygy + 1;
      if (oqushy.esepter[esepter[j].id]) oryndalgan = oryndalgan + 1;
    }
  }
  if (barlygy === 0) return 0;
  return Math.round(oryndalgan * 100 / barlygy);
}


// --- 4.1 Статистика қойындысы: жалпы сандар және үздік 5 оқушы ---

function statistikanyKorset() {
  oqushylardyJukteu(function () {
    let bugin = bugingiKun();
    let bugingiler = 0;
    let jalpyUpai = 0;
    for (let i = 0; i < OQUSHYLAR.length; i++) {
      if (OQUSHYLAR[i].songyKun === bugin) bugingiler = bugingiler + 1;
      jalpyUpai = jalpyUpai + OQUSHYLAR[i].upai;
    }
    let ortaUpai = 0;
    if (OQUSHYLAR.length > 0) ortaUpai = Math.round(jalpyUpai / OQUSHYLAR.length);

    let kartalar = [
      ["👥", OQUSHYLAR.length, "оқушы"],
      ["🟢", bugingiler, "бүгін кірді"],
      ["⭐", ortaUpai, "орташа ұпай"],
      ["📘", SABAKTAR.length, "сабақ"],
      ["✏️", ESEPTER.length, "есеп"]
    ];
    let html = "";
    for (let i = 0; i < kartalar.length; i++) {
      html += "<div class='karta'><span class='mut'>" + kartalar[i][0] + " " + kartalar[i][2] + "</span><b>" + kartalar[i][1] + "</b></div>";
    }
    document.getElementById("stat-kartalar").innerHTML = html;

    // Үздік 5 оқушы (ұпайы бойынша)
    let tizim = OQUSHYLAR.slice();
    tizim.sort(function (a, b) { return b.upai - a.upai; });
    let uzdik = "";
    let medal = ["🥇", "🥈", "🥉", "4.", "5."];
    for (let i = 0; i < tizim.length && i < 5; i++) {
      uzdik += "<div class='tarau-qatar'><span>" + medal[i] + " " + qauipsiz(tizim[i].aty) + " <span class='mut'>(" + qauipsiz(tizim[i].login) + ")</span></span><b>⭐ " + tizim[i].upai + "</b></div>";
    }
    if (uzdik === "") uzdik = "<p class='mut'>Әзірге ешкім тіркелмеген.</p>";
    document.getElementById("stat-uzdik").innerHTML = uzdik;
  });
}


// --- 4.2 Оқушылар қойындысы: тізім ---

function oqushylardyKorset() {
  document.getElementById("oqushy-tizim-bolimi").classList.remove("jasyryn");
  document.getElementById("oqushy-detal-bolimi").classList.add("jasyryn");
  document.getElementById("stat-oqushy").innerHTML = "<p class='mut'>Жүктелуде…</p>";
  oqushylardyJukteu(oqushyKestesin);
}

function oqushyKestesin() {
  let izdeu = document.getElementById("oqushy-izdeu").value.trim().toLowerCase();
  let suryptau = document.getElementById("oqushy-suryptau").value;

  // Іздеу: аты немесе логині бойынша
  let tizim = [];
  for (let i = 0; i < OQUSHYLAR.length; i++) {
    let matin = (OQUSHYLAR[i].aty + " " + OQUSHYLAR[i].login).toLowerCase();
    if (izdeu === "" || matin.indexOf(izdeu) >= 0) tizim.push(OQUSHYLAR[i]);
  }

  // Сұрыптау
  tizim.sort(function (a, b) {
    if (suryptau === "aty") return a.aty.localeCompare(b.aty, "kk");
    if (suryptau === "songyKun") return (b.songyKun || "").localeCompare(a.songyKun || "");
    return b.upai - a.upai;
  });

  document.getElementById("oqushy-sany").textContent = OQUSHYLAR.length;
  let oryn = document.getElementById("stat-oqushy");

  if (tizim.length === 0) {
    oryn.innerHTML = "<p class='mut'>Оқушы табылмады.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < tizim.length; i++) {
    let oqushy = tizim[i];
    let songyKun = oqushy.songyKun;
    if (!songyKun) songyKun = "—";
    html +=
      "<tr class='oqushy-qatar' data-uid='" + oqushy.uid + "'>" +
        "<td><b>" + qauipsiz(oqushy.aty) + "</b><br><span class='mut'>" + qauipsiz(oqushy.login) + "</span></td>" +
        "<td>⭐ " + oqushy.upai + "</td>" +
        "<td>" + sanau(oqushy.sabaktar) + " / " + SABAKTAR.length + "</td>" +
        "<td>" + sanau(oqushy.esepter) + " / " + ESEPTER.length + "</td>" +
        "<td>" + dalDik(oqushy) + "%</td>" +
        "<td>" + songyKun + "</td>" +
      "</tr>";
  }
  oryn.innerHTML =
    "<div style='overflow-x:auto'><table class='oqushy-keste'>" +
      "<tr><th>Оқушы</th><th>Ұпай</th><th>Сабақ</th><th>Есеп</th><th>Дәлдік</th><th>Соңғы кірген</th></tr>" +
      html +
    "</table></div>";

  // Қатарды басса, оқушының толық статистикасы ашылады
  let qatarlar = oryn.querySelectorAll(".oqushy-qatar");
  for (let i = 0; i < qatarlar.length; i++) {
    qatarlar[i].onclick = function () {
      oqushyDetalin(this.getAttribute("data-uid"));
    };
  }
}

document.getElementById("oqushy-izdeu").oninput = oqushyKestesin;
document.getElementById("oqushy-suryptau").onchange = oqushyKestesin;
document.getElementById("oqushy-janartu").onclick = oqushylardyKorset;
document.getElementById("oqushy-artqa").onclick = function () {
  document.getElementById("oqushy-detal-bolimi").classList.add("jasyryn");
  document.getElementById("oqushy-tizim-bolimi").classList.remove("jasyryn");
};


// --- 4.3 Бір оқушының толық статистикасы ---

function oqushyDetalin(uid) {
  let oqushy = null;
  for (let i = 0; i < OQUSHYLAR.length; i++) {
    if (OQUSHYLAR[i].uid === uid) oqushy = OQUSHYLAR[i];
  }
  if (oqushy === null) return;

  let dengei = Math.floor(oqushy.upai / 200) + 1;

  // 1) Негізгі сандар
  let html =
    "<div class='karta bolim'><div class='profil'>" +
      "<span class='avatar'>" + qauipsiz(oqushy.aty.charAt(0).toUpperCase()) + "</span>" +
      "<div><h2 style='margin:0'>" + qauipsiz(oqushy.aty) + "</h2>" +
      "<p class='mut'>Логин: " + qauipsiz(oqushy.login) + " · 🎓 " + dengei + "-деңгей</p></div>" +
    "</div></div>";

  let sandar = [
    ["⭐ Ұпай", oqushy.upai],
    ["🔥 Қатарынан", oqushy.qatar + " күн"],
    ["🎯 Дәлдік", dalDik(oqushy) + "%"],
    ["✅ Дұрыс жауап", oqushy.durysSany + " / " + oqushy.talpynys],
    ["📅 Соңғы кірген", oqushy.songyKun || "—"]
  ];
  html += "<div class='statistika'>";
  for (let i = 0; i < sandar.length; i++) {
    html += "<div class='karta'><span class='mut'>" + sandar[i][0] + "</span><b style='font-size:22px'>" + sandar[i][1] + "</b></div>";
  }
  html += "</div>";

  // 2) Тараулар және сабақтар
  html += "<div class='admin-tor'><div class='karta'><h3 style='margin-bottom:8px'>Тараулар мен сабақтар</h3>";
  for (let t = 0; t < TARAULAR.length; t++) {
    let tarau = TARAULAR[t];
    let payz = oqushyTarauPayzy(oqushy, tarau.id);
    html +=
      "<div class='tarau-qatar'><span>" + tarau.belgi + " <b>" + tarau.aty + "</b></span><b>" + payz + "%</b></div>" +
      "<div class='jolaq'><i style='width:" + payz + "%;background:" + tarau.tus + "'></i></div>";
    let sabaktar = tarauSabaktary(tarau.id);
    for (let i = 0; i < sabaktar.length; i++) {
      let esepter = sabakEsepteri(sabaktar[i].id);
      let sheshilgen = 0;
      for (let j = 0; j < esepter.length; j++) {
        if (oqushy.esepter[esepter[j].id]) sheshilgen = sheshilgen + 1;
      }
      let belgi = "⬜";
      if (oqushy.sabaktar[sabaktar[i].id]) belgi = "✅";
      html += "<div style='font-size:14px;margin:4px 0 4px 6px'>" + belgi + " " + qauipsiz(sabaktar[i].aty) +
              " <span class='mut'>· есеп " + sheshilgen + "/" + esepter.length + "</span></div>";
    }
  }
  html += "</div>";

  html += "<div class='karta'><h3 style='margin-bottom:8px'>Әрекеттер</h3>";
  html += "<button class='btn btn-qyzyl btn-kishi' id='oqushy-oshiru' style='margin-top:20px'>🗑 Нәтижесін өшіру</button>";
  html += "</div></div>";

  document.getElementById("oqushy-detal").innerHTML = html;
  document.getElementById("oqushy-oshiru").onclick = function () {
    oqushynyOshiru(oqushy.uid, oqushy.aty);
  };
  document.getElementById("oqushy-tizim-bolimi").classList.add("jasyryn");
  document.getElementById("oqushy-detal-bolimi").classList.remove("jasyryn");
  scrollTo(0, 0);
}

// Оқушының нәтижесін өшіру.
// Ескерту: аккаунттың өзі (логин мен құпия сөз) Firebase Authentication-та қалады,
// оны толық өшіру үшін Firebase консолінде Authentication → Users бөлімінен өшіру керек.
function oqushynyOshiru(uid, aty) {
  if (!confirm("«" + aty + "» оқушысының барлық нәтижесі өшеді. Жалғастырайық па?")) return;
  db.collection("oqushylar").doc(uid).delete().then(function () {
    habarKorset("🗑 Нәтиже өшірілді");
    oqushylardyKorset();
  }).catch(function (q) {
    alert("Өшірілмеді: " + q.message);
  });
}


// ----- 5. САБАҚТАР -----

function sabakTiziminKorset() {
  let oryn = document.getElementById("sabak-tizimi");
  oryn.innerHTML = "";

  for (let t = 0; t < TARAULAR.length; t++) {
    let tarau = TARAULAR[t];
    let taqyryp = document.createElement("p");
    taqyryp.className = "mut";
    taqyryp.style.margin = "14px 0 6px";
    taqyryp.textContent = tarau.belgi + " " + tarau.aty;
    oryn.appendChild(taqyryp);

    let sabaktar = tarauSabaktary(tarau.id);
    if (sabaktar.length === 0) {
      let bos = document.createElement("p");
      bos.className = "mut";
      bos.style.fontSize = "14px";
      bos.textContent = "Сабақ жоқ";
      oryn.appendChild(bos);
    }

    for (let i = 0; i < sabaktar.length; i++) {
      let sabak = sabaktar[i];
      let qatar = document.createElement("div");
      qatar.className = "admin-qatar";
      qatar.innerHTML =
        "<span class='aty'>" + qauipsiz(sabak.aty) + " <span class='mut'>· " + sabakEsepteri(sabak.id).length + " есеп</span></span>" +
        "<button class='btn btn-kishi'>✏️</button>" +
        "<button class='btn btn-kishi btn-qyzyl'>🗑</button>";
      let batyrmalar = qatar.querySelectorAll("button");
      batyrmalar[0].title = "Өзгерту";
      batyrmalar[1].title = "Өшіру";
      batyrmalar[0].onclick = function () { sabaktyOzgertu(sabak); };
      batyrmalar[1].onclick = function () { sabaktyOshiru(sabak); };
      oryn.appendChild(qatar);
    }
  }
}

function sabakFormasynTazalau() {
  ozgertilipJatqanSabak = null;
  tarauTiziminTolturu(document.getElementById("s-tarau"));
  document.getElementById("sabak-forma-taqyryp").textContent = "Жаңа сабақ";
  let orister = ["s-aty", "s-video", "s-teoriya", "s-formula", "s-erezheler", "s-mysal", "s-mysal-qadam", "s-tekseru", "s-nuskalar"];
  for (let i = 0; i < orister.length; i++) {
    document.getElementById(orister[i]).value = "";
  }
  document.getElementById("s-uaqyt").value = 10;
  document.getElementById("s-durys").value = 1;
  document.getElementById("sabak-qate").textContent = "";
}

// Бар сабақты формаға толтыру
function sabaktyOzgertu(sabak) {
  sabakFormasynTazalau();
  ozgertilipJatqanSabak = sabak;
  document.getElementById("sabak-forma-taqyryp").textContent = "Өзгерту: " + sabak.aty;
  document.getElementById("s-tarau").value = sabak.tarau;
  document.getElementById("s-uaqyt").value = sabak.uaqyt;
  document.getElementById("s-aty").value = sabak.aty;
  document.getElementById("s-video").value = sabak.video || "";
  document.getElementById("s-teoriya").value = teoriyaMatini(sabak.teoriya);
  document.getElementById("s-formula").value = sabak.formula || "";
  document.getElementById("s-erezheler").value = (sabak.erezheler || []).join("\n");
  document.getElementById("s-mysal").value = sabak.mysal.suraq;
  document.getElementById("s-mysal-qadam").value = sabak.mysal.qadamdar.join("\n");
  document.getElementById("s-tekseru").value = sabak.tekseru.suraq;
  document.getElementById("s-nuskalar").value = sabak.tekseru.nuskalar.join("\n");
  document.getElementById("s-durys").value = sabak.tekseru.durys + 1; // адамға 1-ден санаймыз
  document.getElementById("s-aty").scrollIntoView({ behavior: "smooth", block: "center" });
}

function sabaktySaqtau() {
  let qate = document.getElementById("sabak-qate");

  // Формадағы мәндерді аламыз
  let aty = document.getElementById("s-aty").value.trim();
  let teoriya = document.getElementById("s-teoriya").value.trim();
  let mysal = document.getElementById("s-mysal").value.trim();
  let mysalQadam = joldargaBolu(document.getElementById("s-mysal-qadam").value);
  let tekseru = document.getElementById("s-tekseru").value.trim();
  let nuskalar = joldargaBolu(document.getElementById("s-nuskalar").value);
  let durys = Number(document.getElementById("s-durys").value);

  // Тексеру: міндетті өрістер толтырылды ма?
  if (aty === "" || teoriya === "" || mysal === "" || tekseru === "") {
    qate.textContent = "Жұлдызшасы (*) бар өрістердің бәрін толтыр.";
    return;
  }
  if (mysalQadam.length === 0) {
    qate.textContent = "Мысалдың кемінде бір қадамын жаз.";
    return;
  }
  if (nuskalar.length < 2 || nuskalar.length > 4) {
    qate.textContent = "Жауап нұсқалары 2-ден 4-ке дейін болуы керек.";
    return;
  }
  if (!(durys >= 1 && durys <= nuskalar.length)) {
    qate.textContent = "Дұрыс нұсқаның нөмірі 1-ден " + nuskalar.length + "-ге дейін болуы керек.";
    return;
  }

  let tarau = document.getElementById("s-tarau").value;
  let uaqyt = Number(document.getElementById("s-uaqyt").value);
  if (!(uaqyt > 0)) uaqyt = 10;

  let jana = {
    id: "",
    tarau: tarau,
    aty: aty,
    uaqyt: uaqyt,
    video: document.getElementById("s-video").value.trim(),
    teoriya: teoriyaHtml(teoriya),
    formula: document.getElementById("s-formula").value.trim(),
    erezheler: joldargaBolu(document.getElementById("s-erezheler").value),
    mysal: { suraq: mysal, qadamdar: mysalQadam },
    tekseru: { suraq: tekseru, nuskalar: nuskalar, durys: durys - 1 }
  };

  if (ozgertilipJatqanSabak) {
    // Бар сабақты ауыстырамыз (id сол күйі қалады)
    jana.id = ozgertilipJatqanSabak.id;
    let nomir = SABAKTAR.indexOf(ozgertilipJatqanSabak);
    SABAKTAR[nomir] = jana;
  } else {
    // Жаңа сабаққа бос id ойлап табамыз: alg4, alg5...
    let san = 1;
    while (sabaktyTabu(tarau + san)) san = san + 1;
    jana.id = tarau + san;

    // Жаңа сабақты өз тарауының соңына қоямыз
    let orny = SABAKTAR.length;
    for (let i = 0; i < SABAKTAR.length; i++) {
      if (SABAKTAR[i].tarau === tarau) orny = i + 1;
    }
    SABAKTAR.splice(orny, 0, jana);
  }

  mazmundySaqtau();
  sabakTiziminKorset();
  sabakFormasynTazalau();
  esepterdiJanartu();
  habarKorset("✅ Сабақ сақталды");
}

function sabaktyOshiru(sabak) {
  let esepSany = sabakEsepteri(sabak.id).length;
  let suraq = "«" + sabak.aty + "» сабағы өшеді.";
  if (esepSany > 0) suraq += " Оның " + esepSany + " есебі де өшеді.";
  if (!confirm(suraq + " Жалғастырайық па?")) return;

  SABAKTAR.splice(SABAKTAR.indexOf(sabak), 1);

  // Осы сабақтың есептерін де өшіреміз
  let qalgandar = [];
  for (let i = 0; i < ESEPTER.length; i++) {
    if (ESEPTER[i].sabak !== sabak.id) qalgandar.push(ESEPTER[i]);
  }
  ESEPTER = qalgandar;

  mazmundySaqtau();
  sabakTiziminKorset();
  sabakFormasynTazalau();
  esepterdiJanartu();
  habarKorset("🗑 Сабақ өшірілді");
}

document.getElementById("jana-sabak").onclick = function () {
  sabakFormasynTazalau();
  document.getElementById("s-aty").focus();
};
document.getElementById("sabak-saqtau").onclick = sabaktySaqtau;
document.getElementById("sabak-boldyrmau").onclick = sabakFormasynTazalau;


// ----- 6. ЕСЕПТЕР -----

function esepterdiJanartu() {
  let suzgi = document.getElementById("esep-suzgi");
  let buryngy = suzgi.value;
  sabakTiziminTolturu(suzgi, true);
  if (buryngy && (buryngy === "barlygy" || sabaktyTabu(buryngy))) suzgi.value = buryngy;
  esepTiziminKorset();
  esepFormasynTazalau();
}

function esepTiziminKorset() {
  let suzgi = document.getElementById("esep-suzgi");
  if (suzgi.options.length === 0) sabakTiziminTolturu(suzgi, true);

  let oryn = document.getElementById("esep-tizimi");
  oryn.innerHTML = "";
  let san = 0;

  for (let i = 0; i < ESEPTER.length; i++) {
    let esep = ESEPTER[i];
    if (suzgi.value !== "barlygy" && esep.sabak !== suzgi.value) continue;
    san = san + 1;

    let qatar = document.createElement("div");
    qatar.className = "admin-qatar";
    qatar.innerHTML =
      "<span class='aty'>" + qauipsiz(esep.suraq) + " <span class='mut'>→ " + sandyJazu(esep.jauap) + "</span></span>" +
      "<button class='btn btn-kishi'>✏️</button>" +
      "<button class='btn btn-kishi btn-qyzyl'>🗑</button>";
    let batyrmalar = qatar.querySelectorAll("button");
    batyrmalar[0].title = "Өзгерту";
    batyrmalar[1].title = "Өшіру";
    batyrmalar[0].onclick = function () { esepteOzgertu(esep); };
    batyrmalar[1].onclick = function () { esepteOshiru(esep); };
    oryn.appendChild(qatar);
  }

  if (san === 0) oryn.innerHTML = "<p class='mut'>Бұл жерде есеп жоқ.</p>";
}

function esepFormasynTazalau() {
  ozgertilipJatqanEsep = null;
  let sabakSelect = document.getElementById("e-sabak");
  sabakTiziminTolturu(sabakSelect, false);

  // Сүзгіде бір сабақ таңдалса, жаңа есеп сол сабаққа қосылады
  let suzgi = document.getElementById("esep-suzgi").value;
  if (suzgi && suzgi !== "barlygy") sabakSelect.value = suzgi;

  document.getElementById("esep-forma-taqyryp").textContent = "Жаңа есеп";
  document.getElementById("e-suraq").value = "";
  document.getElementById("e-jauap").value = "";
  document.getElementById("e-kenes").value = "";
  document.getElementById("e-qadamdar").value = "";
  document.getElementById("esep-qate").textContent = "";
}

function esepteOzgertu(esep) {
  esepFormasynTazalau();
  ozgertilipJatqanEsep = esep;
  document.getElementById("esep-forma-taqyryp").textContent = "Есепті өзгерту";
  document.getElementById("e-sabak").value = esep.sabak;
  document.getElementById("e-suraq").value = esep.suraq;
  document.getElementById("e-jauap").value = sandyJazu(esep.jauap);
  document.getElementById("e-kenes").value = esep.kenes || "";
  document.getElementById("e-qadamdar").value = esep.qadamdar.join("\n");
  document.getElementById("e-suraq").scrollIntoView({ behavior: "smooth", block: "center" });
}

function esepteSaqtau() {
  let qate = document.getElementById("esep-qate");
  let suraq = document.getElementById("e-suraq").value.trim();
  let jauap = sanGaAinaldyru(document.getElementById("e-jauap").value);
  let qadamdar = joldargaBolu(document.getElementById("e-qadamdar").value);
  let sabak = document.getElementById("e-sabak").value;

  if (!sabak) {
    qate.textContent = "Алдымен кемінде бір сабақ қос.";
    return;
  }
  if (suraq === "") {
    qate.textContent = "Есептің шартын жаз.";
    return;
  }
  if (isNaN(jauap)) {
    qate.textContent = "Дұрыс жауапқа тек сан жаз. Мысалы: 4, −2, 0,5 немесе 1/2.";
    return;
  }
  if (qadamdar.length === 0) {
    qate.textContent = "Шешудің кемінде бір қадамын жаз.";
    return;
  }

  // Жауапты 0,01 дәлдікке дейін дөңгелектейміз (1/3 → 0,33)
  jauap = Math.round(jauap * 100) / 100;

  let jana = {
    id: "",
    sabak: sabak,
    suraq: suraq,
    jauap: jauap,
    kenes: document.getElementById("e-kenes").value.trim() || "Сабақтағы формуланы қайта қара.",
    qadamdar: qadamdar
  };

  if (ozgertilipJatqanEsep) {
    jana.id = ozgertilipJatqanEsep.id;
    ESEPTER[ESEPTER.indexOf(ozgertilipJatqanEsep)] = jana;
  } else {
    // Жаңа id: e49, e50...
    let san = ESEPTER.length + 1;
    while (esepTabu("e" + san)) san = san + 1;
    jana.id = "e" + san;
    ESEPTER.push(jana);
  }

  mazmundySaqtau();
  esepTiziminKorset();
  esepFormasynTazalau();
  sabakTiziminKorset(); // сабақтардағы есеп саны жаңарсын
  habarKorset("✅ Есеп сақталды");
}

function esepTabu(id) {
  for (let i = 0; i < ESEPTER.length; i++) {
    if (ESEPTER[i].id === id) return ESEPTER[i];
  }
  return null;
}

function esepteOshiru(esep) {
  if (!confirm("«" + esep.suraq + "» есебі өшеді. Жалғастырайық па?")) return;
  ESEPTER.splice(ESEPTER.indexOf(esep), 1);
  mazmundySaqtau();
  esepTiziminKorset();
  esepFormasynTazalau();
  sabakTiziminKorset();
  habarKorset("🗑 Есеп өшірілді");
}

document.getElementById("esep-suzgi").onchange = function () {
  esepTiziminKorset();
  esepFormasynTazalau();
};
document.getElementById("jana-esep").onclick = function () {
  esepFormasynTazalau();
  document.getElementById("e-suraq").focus();
};
document.getElementById("esep-saqtau").onclick = esepteSaqtau;
document.getElementById("esep-boldyrmau").onclick = esepFormasynTazalau;
