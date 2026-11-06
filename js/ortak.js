// =====================================================
// ОРТАҚ ФУНКЦИЯЛАР
// Бұл файл барлық беттерде қолданылады:
// оқушының деректерін сақтау, ұпай қосу, мәзір, есеп картасы.
// =====================================================


// Бұл файлдың алдында firebase-baptau.js қосылуы керек (auth, db).

// Қазір кірген оқушы және оның деректері (бет ашылғанда дерекқордан жүктеледі)
let KIRGEN = null;
let OQUSHY = null;


// ----- 0. БЕТТІ ІСКЕ ҚОСУ -----
// Әр беттің <body> белгісінде data-bet="js/esepter.js" деп жазылған.
// Алдымен оқушы кірген бе, соны тексереміз, оның деректерін және
// сабақтарды дерекқордан жүктейміз. Сосын ғана беттің өз кодын қосамыз.

function betDaiyndau(betKody) {
  document.body.classList.add("juklenude");
  let bastaldy = false;

  auth.onAuthStateChanged(function (user) {
    if (bastaldy) return; // бір-ақ рет іске қосылсын
    bastaldy = true;

    // Кірмеген болса — кіру бетіне
    if (!user) {
      location.replace("kiru.html");
      return;
    }
    KIRGEN = user;

    let oqushyJukteu = db.collection("oqushylar").doc(user.uid).get();
    let mazmunJukteu = db.collection("mazmun").doc("negizgi").get();

    Promise.all([oqushyJukteu, mazmunJukteu]).then(function (natijeler) {
      // Оқушының деректері
      OQUSHY = bosOqushy();
      if (natijeler[0].exists) {
        let saqtalgan = natijeler[0].data();
        for (let kilt in saqtalgan) {
          OQUSHY[kilt] = saqtalgan[kilt];
        }
      }
      // Логин мен аты жоқ болса, поштадан аламыз: ali2010@mathpro.app → ali2010
      if (!OQUSHY.login) OQUSHY.login = user.email.split("@")[0];
      if (!OQUSHY.aty) OQUSHY.aty = OQUSHY.login;

      // Әкімші өзгерткен сабақтар мен есептер (болса)
      if (natijeler[1].exists) {
        let mazmun = natijeler[1].data();
        if (mazmun.SABAKTAR) SABAKTAR = mazmun.SABAKTAR;
        if (mazmun.ESEPTER) ESEPTER = mazmun.ESEPTER;
      }

      // Енді беттің өз кодын қосамыз
      let skript = document.createElement("script");
      skript.src = betKody;
      document.body.appendChild(skript);
      document.body.classList.remove("juklenude");
    }).catch(function (qate) {
      document.body.classList.remove("juklenude");
      document.querySelector("main").innerHTML =
        "<div class='karta'><h2>Деректер жүктелмеді 😕</h2><p class='mut'>Интернетті тексеріп, бетті жаңарт.</p><p class='mut' style='font-size:13px'>" + qate.message + "</p></div>";
    });
  });
}

// Аккаунттан шығу
function shygu() {
  auth.signOut().then(function () {
    location.href = "kiru.html";
  });
}


// ----- 1. ОҚУШЫНЫҢ ДЕРЕКТЕРІ -----

// Жаңа оқушының бастапқы деректері
function bosOqushy() {
  return {
    aty: "",            // оқушының аты
    login: "",          // оқушының логині
    upai: 0,            // жалпы ұпай
    sabaktar: {},       // өтілген сабақтар: { alg1: true }
    esepter: {},        // шешілген есептер: { e1: true }
    talpynys: 0,        // барлық жауап саны
    durysSany: 0,       // дұрыс жауап саны
    testter: {},        // тесттің ең жақсы нәтижесі: { t_alg: 8 }
    oiyndar: { zhyldam: 0, viktorina: 0 }, // ойындардағы рекорд
    songyKun: "",       // соңғы кірген күн
    qatar: 0,           // қатарынан неше күн кірді
    kun: { kuni: "", sheshilgen: [], bonus: false } // күн тапсырмасы
  };
}

// Оқушының деректерінің көшірмесін алу.
// Көшірмені өзгертіп, oqushySaqtau() арқылы сақтаймыз.
function oqushyAlu() {
  return JSON.parse(JSON.stringify(OQUSHY));
}

// Деректерді сақтау: жадта бірден жаңарады, дерекқорға фонда жазылады
function oqushySaqtau(oqushy) {
  if (!KIRGEN) return;
  OQUSHY = JSON.parse(JSON.stringify(oqushy));
  db.collection("oqushylar").doc(KIRGEN.uid).set(OQUSHY).catch(function () {
    habarKorset("⚠️ Сақталмады. Интернетті тексер.");
  });
}


// ----- 2. КҮНДЕР -----

// Бүгінгі күн "2026-11-06" түрінде
function kunMatini(kun) {
  let ai = kun.getMonth() + 1;
  let kuni = kun.getDate();
  if (ai < 10) ai = "0" + ai;
  if (kuni < 10) kuni = "0" + kuni;
  return kun.getFullYear() + "-" + ai + "-" + kuni;
}

function bugingiKun() {
  return kunMatini(new Date());
}

function keshegiKun() {
  let kun = new Date();
  kun.setDate(kun.getDate() - 1);
  return kunMatini(kun);
}

// Оқушы бүгін кірсе, "қатарынан неше күн" санағын жаңартамыз
function kunderdiTirkeu() {
  let oqushy = oqushyAlu();
  let bugin = bugingiKun();
  if (oqushy.songyKun !== bugin) {
    if (oqushy.songyKun === keshegiKun()) {
      oqushy.qatar = oqushy.qatar + 1;
    } else {
      oqushy.qatar = 1;
    }
    oqushy.songyKun = bugin;
    oqushySaqtau(oqushy);
  }
}


// ----- 3. ҰПАЙ ЖӘНЕ ХАБАРЛАМА -----

// Ұпай қосып, экранға хабар шығарамыз
function upaiQosu(san) {
  let oqushy = oqushyAlu();
  oqushy.upai = oqushy.upai + san;
  oqushySaqtau(oqushy);
  habarKorset("⭐ +" + san + " ұпай");
  upaidiJanartu();
}

// Мәзірдегі ұпай санын жаңарту
function upaidiJanartu() {
  let oryn = document.getElementById("menu-upai");
  if (oryn) {
    oryn.textContent = oqushyAlu().upai;
  }
}

// Экранның төменгі жағына қысқа хабар шығару
function habarKorset(matin) {
  let habar = document.getElementById("habar");
  if (!habar) {
    habar = document.createElement("div");
    habar.id = "habar";
    document.body.appendChild(habar);
  }
  habar.textContent = matin;
  habar.className = "korinedi";
  clearTimeout(habar.timer);
  habar.timer = setTimeout(function () {
    habar.className = "";
  }, 1800);
}


// ----- 4. МӘЗІР (барлық беттің жоғарғы жағы) -----

function menuSalu(belsendiBet) {
  kunderdiTirkeu();
  let oqushy = oqushyAlu();

  // [бет, атауы, дайын ба]
  // Бет дайын болғанда үшінші мәнді true қыл.
  let siltemeler = [
    ["index.html", "Басты бет", true],
    ["sabaktar.html", "Сабақтар", true],
    ["esepter.html", "Есептер", true],
    ["testter.html", "Тесттер", true],
    ["oiyndar.html", "Ойындар", true],
    ["formulalar.html", "Формулалар", true],
    ["natizhe.html", "Нәтижем", true]
  ];

  let menuHtml = "";
  for (let i = 0; i < siltemeler.length; i++) {
    if (siltemeler[i][2] === false) {
      // Дайын емес бет: басылмайды
      menuHtml += "<span class='jaqynda' title='Жақында'>" + siltemeler[i][1] + "</span>";
      continue;
    }
    let synyp = "";
    if (siltemeler[i][0] === belsendiBet) synyp = "belsendi";
    menuHtml += "<a class='" + synyp + "' href='" + siltemeler[i][0] + "'>" + siltemeler[i][1] + "</a>";
  }

  let aty = oqushy.aty || "Оқушы";

  document.getElementById("menu").innerHTML =
    "<div class='ishki menu-ishi'>" +
      "<a class='logo' href='index.html'><i>∑</i><span>MathPro</span></a>" +
      "<nav>" + menuHtml + "</nav>" +
      "<a class='paidalanushy' href='natizhe.html'>" +
        "<span class='avatar'>" + aty.charAt(0).toUpperCase() + "</span>" +
        "<span>" + aty + "<br><b>⭐ <span id='menu-upai'>" + oqushy.upai + "</span></b></span>" +
      "</a>" +
      "<button class='btn btn-kishi shygu-btn' onclick='shygu()' title='Аккаунттан шығу'>Шығу</button>" +
    "</div>";
}


// ----- 5. ЖАУАПТЫ ТЕКСЕРУ -----

// Оқушы жазған мәтінді санға айналдыру.
// "x = 5", "0,5", "1/2", " 3 " — бәрін түсінеді.
function sanGaAinaldyru(matin) {
  matin = matin.trim().toLowerCase();
  matin = matin.split(" ").join("");      // бос орындарды алып тастау
  matin = matin.split("−").join("-");     // ұзын минусты қарапайым минусқа
  matin = matin.split(",").join(".");     // үтірді нүктеге

  // "x=5" болса, тек "5" бөлігін аламыз
  let tendik = matin.lastIndexOf("=");
  if (tendik >= 0) {
    matin = matin.substring(tendik + 1);
  }

  if (matin === "") return NaN;

  // Бөлшек: "1/2"
  if (matin.indexOf("/") >= 0) {
    let bolikter = matin.split("/");
    return Number(bolikter[0]) / Number(bolikter[1]);
  }

  return Number(matin);
}

// Жауап дұрыс па? (0,01 дәлдікпен салыстырамыз)
function jauapDurysPa(engizilgen, durysJauap) {
  let san = sanGaAinaldyru(engizilgen);
  if (isNaN(san)) return false;
  return Math.abs(san - durysJauap) < 0.01;
}

// Санды қазақша жазу: 0.5 → "0,5"
function sandyJazu(san) {
  return String(san).replace(".", ",").replace("-", "−");
}


// ----- 6. ЕСЕП КАРТАСЫ -----
// Бір есепті экранға шығарады: сұрақ, жауап жолы, тексеру,
// кеңес және шешу жолы. Есептер, Күн тапсырмасы беттерінде қолданылады.

function esepKartasy(esep, konteiner, durysBolganda) {
  let oqushy = oqushyAlu();
  let buryn = oqushy.esepter[esep.id] === true;

  let karta = document.createElement("div");
  karta.className = "karta esep";
  if (buryn) karta.className += " sheshilgen";

  // Шешу жолының қадамдары
  let qadamHtml = "";
  for (let i = 0; i < esep.qadamdar.length; i++) {
    qadamHtml += "<div class='qadam'><b>" + (i + 1) + "</b><span>" + esep.qadamdar[i] + "</span></div>";
  }

  let belgi = "";
  if (buryn) belgi = "<span class='belgi-jasyl'>✓ Шешілген</span>";

  karta.innerHTML =
    "<div class='esep-bas'><span class='mut'>Есеп</span>" + belgi + "</div>" +
    "<div class='esep-suraq'>" + esep.suraq + "</div>" +
    "<div class='esep-jol'>" +
      "<input type='text' inputmode='decimal' placeholder='Жауабыңды жаз'>" +
      "<button class='btn btn-sary'>Тексеру</button>" +
    "</div>" +
    "<div class='esep-natije'></div>" +
    "<div class='esep-kenes jasyryn'>💡 <b>Кеңес:</b> " + esep.kenes + "</div>" +
    "<button class='btn btn-bos sheshu-btn jasyryn'>Шешу жолын көру</button>" +
    "<div class='qadamdar jasyryn'>" + qadamHtml + "</div>";

  konteiner.appendChild(karta);

  let engizu = karta.querySelector("input");
  let batyrma = karta.querySelector(".esep-jol button");
  let natije = karta.querySelector(".esep-natije");
  let kenes = karta.querySelector(".esep-kenes");
  let sheshuBtn = karta.querySelector(".sheshu-btn");
  let qadamdar = karta.querySelector(".qadamdar");
  let qateSany = 0;

  // "Тексеру" батырмасы басылғанда
  function tekseru() {
    if (engizu.value.trim() === "") {
      natije.innerHTML = "<span class='mut'>Алдымен жауабыңды жаз.</span>";
      return;
    }

    let oqushy = oqushyAlu();
    oqushy.talpynys = oqushy.talpynys + 1;

    if (jauapDurysPa(engizu.value, esep.jauap)) {
      oqushy.durysSany = oqushy.durysSany + 1;
      let jana = oqushy.esepter[esep.id] !== true;
      oqushy.esepter[esep.id] = true;
      oqushySaqtau(oqushy);

      engizu.className = "durys";
      karta.className = "karta esep sheshilgen";
      natije.innerHTML = "<span class='jasyl'>✅ Дұрыс! Жарайсың!</span>";
      qadamdar.classList.remove("jasyryn");
      sheshuBtn.classList.add("jasyryn");

      if (jana) {
        // Бірінші талпыныста шешсе 10 ұпай, әйтпесе 5 ұпай
        if (qateSany === 0) upaiQosu(10);
        else upaiQosu(5);
      }
      if (durysBolganda) durysBolganda(esep);
    } else {
      oqushySaqtau(oqushy);
      qateSany = qateSany + 1;
      engizu.className = "qate";
      natije.innerHTML = "<span class='qyzyl'>❌ Қате. Тағы көр!</span>";
      kenes.classList.remove("jasyryn");          // 1-қатеден кейін кеңес
      if (qateSany >= 2) sheshuBtn.classList.remove("jasyryn"); // 2-қатеден кейін шешу жолы
    }
  }

  batyrma.onclick = tekseru;
  engizu.onkeydown = function (e) {
    if (e.key === "Enter") tekseru();
  };
  sheshuBtn.onclick = function () {
    qadamdar.classList.remove("jasyryn");
    sheshuBtn.classList.add("jasyryn");
  };
}


// ----- 7. ІЗДЕУ ЖӘНЕ ЕСЕПТЕУ КӨМЕКШІЛЕРІ -----

function taraudyTabu(id) {
  for (let i = 0; i < TARAULAR.length; i++) {
    if (TARAULAR[i].id === id) return TARAULAR[i];
  }
  return null;
}

function sabaktyTabu(id) {
  for (let i = 0; i < SABAKTAR.length; i++) {
    if (SABAKTAR[i].id === id) return SABAKTAR[i];
  }
  return null;
}

// Бір тараудың сабақтары
function tarauSabaktary(tarauId) {
  let tizim = [];
  for (let i = 0; i < SABAKTAR.length; i++) {
    if (SABAKTAR[i].tarau === tarauId) tizim.push(SABAKTAR[i]);
  }
  return tizim;
}

// Бір сабақтың есептері
function sabakEsepteri(sabakId) {
  let tizim = [];
  for (let i = 0; i < ESEPTER.length; i++) {
    if (ESEPTER[i].sabak === sabakId) tizim.push(ESEPTER[i]);
  }
  return tizim;
}

// Сабақ ашық па? Тараудың бірінші сабағы әрқашан ашық,
// қалғандары алдыңғы сабақ өтілгенде ашылады.
function sabakAshykPa(sabak) {
  let tizim = tarauSabaktary(sabak.tarau);
  let oqushy = oqushyAlu();
  for (let i = 0; i < tizim.length; i++) {
    if (tizim[i].id === sabak.id) {
      if (i === 0) return true;
      return oqushy.sabaktar[tizim[i - 1].id] === true;
    }
  }
  return false;
}

// Тараудың пайызы: өтілген сабақ пен шешілген есеп саны бойынша
function tarauPayzy(tarauId) {
  let oqushy = oqushyAlu();
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

// Келесі өтілмеген сабақ ("Жалғастыру" батырмасы үшін)
function kelesiSabak() {
  let oqushy = oqushyAlu();
  for (let i = 0; i < SABAKTAR.length; i++) {
    if (!oqushy.sabaktar[SABAKTAR[i].id] && sabakAshykPa(SABAKTAR[i])) {
      return SABAKTAR[i];
    }
  }
  return null;
}

// Санау: неше сабақ өтілді, неше есеп шешілді
function sanau(obekt) {
  let san = 0;
  for (let kilt in obekt) {
    if (obekt[kilt]) san = san + 1;
  }
  return san;
}


// ----- 8. КҮН ТАПСЫРМАСЫ -----
// Күн сайын 5 есеп таңдалады. Бір күні бәріне бірдей есептер шығады.

function kunTapsyrmasyEsepteri() {
  let kun = bugingiKun();
  // Күннен сан жасаймыз: "2026-11-06" → 20261106
  let san = Number(kun.split("-").join(""));
  let tandalgan = [];
  let i = 0;
  while (tandalgan.length < 5) {
    // Қарапайым "кездейсоқ" формула: күнге байланысты сан
    san = (san * 31 + 17 + i) % 100003;
    let esep = ESEPTER[san % ESEPTER.length];
    if (tandalgan.indexOf(esep) === -1) tandalgan.push(esep);
    i = i + 1;
  }
  return tandalgan;
}

// Бүгінгі күн тапсырмасының деректері
function kunDeregi() {
  let oqushy = oqushyAlu();
  if (oqushy.kun.kuni !== bugingiKun()) {
    oqushy.kun = { kuni: bugingiKun(), sheshilgen: [], bonus: false };
    oqushySaqtau(oqushy);
  }
  return oqushy.kun;
}


// ----- 9. YOUTUBE СІЛТЕМЕСІНЕН ВИДЕО КОДЫН АЛУ -----
// "https://www.youtube.com/watch?v=ABC123" → "ABC123"
// "https://youtu.be/ABC123" → "ABC123"

function youtubeKodyn(silteme) {
  if (!silteme) return "";
  silteme = silteme.trim();
  if (silteme.indexOf("v=") >= 0) {
    return silteme.split("v=")[1].split("&")[0];
  }
  if (silteme.indexOf("youtu.be/") >= 0) {
    return silteme.split("youtu.be/")[1].split("?")[0];
  }
  if (silteme.indexOf("/embed/") >= 0) {
    return silteme.split("/embed/")[1].split("?")[0];
  }
  return silteme; // тек код жазылған
}


// ----- 10. АРАЛАСТЫРУ (ойындар мен викторина үшін) -----

function aralastyru(tizim) {
  let koshirme = tizim.slice();
  for (let i = koshirme.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let uaqytsha = koshirme[i];
    koshirme[i] = koshirme[j];
    koshirme[j] = uaqytsha;
  }
  return koshirme;
}


// ----- 11. ЕҢ СОҢЫНДА: БЕТТІ ІСКЕ ҚОСУ -----
// <body data-bet="..."> бар беттерде деректерді жүктеп, беттің кодын қосамыз.
// Кіру беті мен әкімші панелінде data-bet жоқ, олар өздері басқарады.

let betKody = document.body.getAttribute("data-bet");
if (betKody) {
  betDaiyndau(betKody);
}
