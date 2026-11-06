// =====================================================
// ӘКІМШІ ПАНЕЛІ
// Сабақ пен есепті қосу, өзгерту, өшіру.
// =====================================================

// Құпия сөзді осы жерден өзгертуге болады.
// Ескерту: бұл қарапайым қорғаныс, оқушылар кездейсоқ кіріп кетпеуі үшін.
let QUPIYA_SOZ = "matem2026";

let ozgertilipJatqanSabak = null;  // қай сабақ өзгертіліп жатыр (жаңа болса null)
let ozgertilipJatqanEsep = null;   // қай есеп өзгертіліп жатыр (жаңа болса null)


// ----- 1. КІРУ ЖӘНЕ ШЫҒУ -----

function kiru() {
  if (document.getElementById("qupiya").value === QUPIYA_SOZ) {
    sessionStorage.setItem("admin_kirdi", "ia"); // бет жаңарса да кірген күйде қалады
    paneldiAshu();
  } else {
    document.getElementById("kiru-qate").textContent = "Құпия сөз қате.";
  }
}

function paneldiAshu() {
  document.getElementById("kiru").classList.add("jasyryn");
  document.getElementById("panel").classList.remove("jasyryn");
  statistikanyKorset();
  sabakTiziminKorset();
  sabakFormasynTazalau();
  esepTiziminKorset();
  esepFormasynTazalau();
  ozgerisKuiin();
}

document.getElementById("kiru-btn").onclick = kiru;
document.getElementById("qupiya").onkeydown = function (e) {
  if (e.key === "Enter") kiru();
};
document.getElementById("shygu").onclick = function () {
  sessionStorage.removeItem("admin_kirdi");
  location.reload();
};

if (sessionStorage.getItem("admin_kirdi") === "ia") {
  paneldiAshu();
} else {
  document.getElementById("qupiya").focus();
}


// ----- 2. ҚОЙЫНДЫЛАР -----

let qoiyndyBatyrmalary = document.querySelectorAll("[data-qoiyndy]");
for (let i = 0; i < qoiyndyBatyrmalary.length; i++) {
  qoiyndyBatyrmalary[i].onclick = function () {
    let atauy = this.getAttribute("data-qoiyndy");
    let bolimder = ["stat", "sabak", "esep", "fail"];
    for (let j = 0; j < bolimder.length; j++) {
      document.getElementById("q-" + bolimder[j]).classList.add("jasyryn");
    }
    document.getElementById("q-" + atauy).classList.remove("jasyryn");
    for (let j = 0; j < qoiyndyBatyrmalary.length; j++) {
      qoiyndyBatyrmalary[j].classList.remove("belsendi");
    }
    this.classList.add("belsendi");
    if (atauy === "stat") statistikanyKorset();
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

// Өзгерістерді жадқа сақтау. Сайттың барлық беті осыны оқиды.
function mazmundySaqtau() {
  let mazmun = { SABAKTAR: SABAKTAR, ESEPTER: ESEPTER };
  localStorage.setItem(MAZMUN_KILTI, JSON.stringify(mazmun));
  ozgerisKuiin();
}

function ozgerisKuiin() {
  let kuii = document.getElementById("ozgeris-kuii");
  if (localStorage.getItem(MAZMUN_KILTI)) {
    kuii.textContent = "⚠️ Бұл браузерде сақталған өзгерістер бар. Олар барлық оқушыға көрінуі үшін derekter.js файлын жүктеп алып, сайтқа салу керек.";
  } else {
    kuii.textContent = "✅ Сайт derekter.js файлындағы мазмұнмен жұмыс істеп тұр.";
  }
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


// ----- 4. СТАТИСТИКА -----

function statistikanyKorset() {
  let kartalar = [
    ["📘", SABAKTAR.length, "сабақ"],
    ["✏️", ESEPTER.length, "есеп"],
    ["📝", TESTTER.length, "тест"],
    ["📐", FORMULALAR.length, "формула"]
  ];
  let html = "";
  for (let i = 0; i < kartalar.length; i++) {
    html += "<div class='karta'><span class='mut'>" + kartalar[i][0] + " " + kartalar[i][2] + "</span><b>" + kartalar[i][1] + "</b></div>";
  }
  document.getElementById("stat-kartalar").innerHTML = html;

  // Тіркелген оқушылар кестесі
  let paidalanushylar = paidalanushylardyAlu();
  let kesteHtml = "";
  let san = 0;
  for (let login in paidalanushylar) {
    san = san + 1;
    let oqushy = oqushyAlu(login);
    let payz = 0;
    if (oqushy.talpynys > 0) payz = Math.round(oqushy.durysSany * 100 / oqushy.talpynys);
    kesteHtml +=
      "<tr>" +
        "<td><b>" + qauipsiz(paidalanushylar[login].aty) + "</b><br><span class='mut'>" + qauipsiz(login) + "</span></td>" +
        "<td>⭐ " + oqushy.upai + "</td>" +
        "<td>" + sanau(oqushy.sabaktar) + " / " + SABAKTAR.length + "</td>" +
        "<td>" + sanau(oqushy.esepter) + " / " + ESEPTER.length + "</td>" +
        "<td>" + sanau(oqushy.testter) + " / " + TESTTER.length + "</td>" +
        "<td>" + payz + "%</td>" +
        "<td>" + (oqushy.songyKun || "—") + "</td>" +
        "<td><button class='btn btn-kishi btn-qyzyl' data-oshiru='" + login + "' title='Өшіру'>🗑</button></td>" +
      "</tr>";
  }

  let oryn = document.getElementById("stat-oqushy");
  if (san === 0) {
    oryn.innerHTML = "<p class='mut'>Әзірге ешкім тіркелмеген.</p>";
  } else {
    oryn.innerHTML =
      "<div style='overflow-x:auto'><table class='oqushy-keste'>" +
        "<tr><th>Оқушы</th><th>Ұпай</th><th>Сабақ</th><th>Есеп</th><th>Тест</th><th>Дәлдік</th><th>Соңғы кірген</th><th></th></tr>" +
        kesteHtml +
      "</table></div>";
  }
  document.getElementById("oqushy-sany").textContent = san;

  // Өшіру батырмалары
  let batyrmalar = oryn.querySelectorAll("[data-oshiru]");
  for (let i = 0; i < batyrmalar.length; i++) {
    batyrmalar[i].onclick = function () {
      oqushynyOshiru(this.getAttribute("data-oshiru"));
    };
  }
}

// Аккаунтты және оның барлық нәтижесін өшіру
function oqushynyOshiru(login) {
  let paidalanushylar = paidalanushylardyAlu();
  if (!confirm("«" + paidalanushylar[login].aty + "» (" + login + ") аккаунты мен нәтижесі өшеді. Жалғастырайық па?")) return;
  delete paidalanushylar[login];
  localStorage.setItem(PAIDALANUSHY_KILTI, JSON.stringify(paidalanushylar));
  localStorage.removeItem(oqushyKilti(login));
  statistikanyKorset();
  habarKorset("🗑 Аккаунт өшірілді");
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


// ----- 7. ФАЙЛ -----

// Барлық мазмұнды derekter.js файлының мәтініне айналдыру
function failMatini() {
  return "// =====================================================\n" +
    "// ДЕРЕКТЕР: сайттың барлық мазмұны осы файлда\n" +
    "// Бұл файлды әкімші панелі жасады: " + bugingiKun() + "\n" +
    "// =====================================================\n\n" +
    "let TARAULAR = " + JSON.stringify(TARAULAR, null, 2) + ";\n\n" +
    "let SABAKTAR = " + JSON.stringify(SABAKTAR, null, 2) + ";\n\n" +
    "let ESEPTER = " + JSON.stringify(ESEPTER, null, 2) + ";\n\n" +
    "let TESTTER = " + JSON.stringify(TESTTER, null, 2) + ";\n\n" +
    "let FORMULALAR = " + JSON.stringify(FORMULALAR, null, 2) + ";\n\n" +
    "let VIKTORINA = " + JSON.stringify(VIKTORINA, null, 2) + ";\n";
}

document.getElementById("fail-jukteu").onclick = function () {
  let fail = new Blob([failMatini()], { type: "text/javascript" });
  let silteme = document.createElement("a");
  silteme.href = URL.createObjectURL(fail);
  silteme.download = "derekter.js";
  silteme.click();
  habarKorset("⬇️ derekter.js жүктелді");
};

document.getElementById("qalpyna").onclick = function () {
  if (confirm("Осы браузердегі барлық өзгеріс өшеді. Жалғастырайық па?")) {
    localStorage.removeItem(MAZMUN_KILTI);
    location.reload();
  }
};
