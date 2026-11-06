// =====================================================
// КІРУ ЖӘНЕ ТІРКЕЛУ
// Аккаунттар осы браузердің жадында (localStorage) сақталады.
// =====================================================

// Оқушы бұрыннан кірген болса, бірден басты бетке жібереміз
if (kirgenLogin()) {
  location.replace("index.html");
}


// ----- 1. Қойындылар -----

function kirudiKorset() {
  document.getElementById("kiru-forma").classList.remove("jasyryn");
  document.getElementById("tirkelu-forma").classList.add("jasyryn");
  document.getElementById("q-kiru").classList.add("belsendi");
  document.getElementById("q-tirkelu").classList.remove("belsendi");
  document.getElementById("k-login").focus();
}

function tirkeludiKorset() {
  document.getElementById("kiru-forma").classList.add("jasyryn");
  document.getElementById("tirkelu-forma").classList.remove("jasyryn");
  document.getElementById("q-tirkelu").classList.add("belsendi");
  document.getElementById("q-kiru").classList.remove("belsendi");
  document.getElementById("t-aty").focus();
}

document.getElementById("q-kiru").onclick = kirudiKorset;
document.getElementById("q-tirkelu").onclick = tirkeludiKorset;
document.getElementById("tirkeluge-otu").onclick = function (e) {
  e.preventDefault();
  tirkeludiKorset();
};


// ----- 2. Кіру -----

function kiru() {
  let login = document.getElementById("k-login").value.trim().toLowerCase();
  let qupiya = document.getElementById("k-qupiya").value;
  let qate = document.getElementById("k-qate");

  if (login === "" || qupiya === "") {
    qate.textContent = "Логин мен құпия сөзді жаз.";
    return;
  }

  let paidalanushylar = paidalanushylardyAlu();
  let paidalanushy = paidalanushylar[login];

  // Логин жоқ немесе құпия сөз сәйкес келмесе
  if (!paidalanushy || paidalanushy.qupiya !== qupiyaHash(login, qupiya)) {
    qate.textContent = "Логин немесе құпия сөз қате.";
    return;
  }

  localStorage.setItem(KIRGEN_KILTI, login);
  location.href = "index.html";
}

document.getElementById("kiru-btn").onclick = kiru;
document.getElementById("k-qupiya").onkeydown = function (e) {
  if (e.key === "Enter") kiru();
};


// ----- 3. Тіркелу -----

function tirkelu() {
  let aty = document.getElementById("t-aty").value.trim();
  let login = document.getElementById("t-login").value.trim().toLowerCase();
  let qupiya = document.getElementById("t-qupiya").value;
  let qupiya2 = document.getElementById("t-qupiya2").value;
  let qate = document.getElementById("t-qate");

  // Тексерулер
  if (aty === "") {
    qate.textContent = "Атыңды жаз.";
    return;
  }
  if (!loginDurysPa(login)) {
    qate.textContent = "Логинге тек латын әріптері, сандар және _ белгісі жарайды (3–20 таңба).";
    return;
  }
  if (qupiya.length < 4) {
    qate.textContent = "Құпия сөз кемінде 4 таңба болуы керек.";
    return;
  }
  if (qupiya !== qupiya2) {
    qate.textContent = "Құпия сөздер сәйкес келмейді.";
    return;
  }

  let paidalanushylar = paidalanushylardyAlu();
  if (paidalanushylar[login]) {
    qate.textContent = "Бұл логин бос емес. Басқасын ойлап тап.";
    return;
  }

  // Жаңа аккаунтты сақтаймыз
  paidalanushylar[login] = {
    aty: aty,
    qupiya: qupiyaHash(login, qupiya),
    tirkelgen: bugingiKun()
  };
  localStorage.setItem(PAIDALANUSHY_KILTI, JSON.stringify(paidalanushylar));

  // Бірден кіргіземіз және атын оқушы деректеріне жазамыз
  localStorage.setItem(KIRGEN_KILTI, login);
  let oqushy = oqushyAlu();
  oqushy.aty = aty;
  oqushySaqtau(oqushy);

  location.href = "index.html";
}

// Логин: тек a-z, 0-9 және _ , ұзындығы 3–20
function loginDurysPa(login) {
  if (login.length < 3 || login.length > 20) return false;
  let ruqsat = "abcdefghijklmnopqrstuvwxyz0123456789_";
  for (let i = 0; i < login.length; i++) {
    if (ruqsat.indexOf(login.charAt(i)) === -1) return false;
  }
  return true;
}

document.getElementById("tirkelu-btn").onclick = tirkelu;
document.getElementById("t-qupiya2").onkeydown = function (e) {
  if (e.key === "Enter") tirkelu();
};

document.getElementById("k-login").focus();
