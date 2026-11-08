// =====================================================
// КІРУ ЖӘНЕ ТІРКЕЛУ
// Аккаунттар Firebase-те сақталады, сондықтан оқушы
// кез келген құрылғыдан өз логинімен кіре алады.
// =====================================================

// Тіркелу жүріп жатқанда бетті ауыстырмаймыз: алдымен деректер жазылсын
let tirkelipJatyr = false;

// Оқушы бұрыннан кірген болса, бірден басты бетке жібереміз
auth.onAuthStateChanged(function (user) {
  if (user && !tirkelipJatyr) location.replace("index.html");
});


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

// Батырманы күту кезінде өшіріп қоямыз, екі рет басылмасын
function batyrmaKutu(id, kutedi, matin) {
  let batyrma = document.getElementById(id);
  batyrma.disabled = kutedi;
  batyrma.textContent = matin;
}


// ----- 2. Кіру -----

function kiru() {
  let login = document.getElementById("k-login").value.trim().toLowerCase();
  let qupiya = document.getElementById("k-qupiya").value;
  let qate = document.getElementById("k-qate");
  qate.textContent = "";

  if (login === "" || qupiya === "") {
    qate.textContent = "Логин мен құпия сөзді жаз.";
    return;
  }
  if (!loginDurysPa(login)) {
    qate.textContent = "Логин немесе құпия сөз қате.";
    return;
  }

  batyrmaKutu("kiru-btn", true, "Күте тұр…");
  auth.signInWithEmailAndPassword(loginnenPoshta(login), qupiya)
    .then(function () {
      location.href = "index.html";
    })
    .catch(function (q) {
      batyrmaKutu("kiru-btn", false, "Кіру →");
      qate.textContent = qateMatini(q.code);
    });
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
  qate.textContent = "";

  // Тексерулер
  if (aty === "") {
    qate.textContent = "Атыңды жаз.";
    return;
  }
  if (!loginDurysPa(login)) {
    qate.textContent = "Логинге тек латын әріптері, сандар және _ белгісі жарайды (3–20 таңба).";
    return;
  }
  if (login === "admin") {
    qate.textContent = "Бұл логин бос емес. Басқасын ойлап тап.";
    return;
  }
  if (qupiya.length < 6) {
    qate.textContent = "Құпия сөз кемінде 6 таңба болуы керек.";
    return;
  }
  if (qupiya !== qupiya2) {
    qate.textContent = "Құпия сөздер сәйкес келмейді.";
    return;
  }

  batyrmaKutu("tirkelu-btn", true, "Күте тұр…");
  tirkelipJatyr = true;

  // 1) Firebase-те аккаунт ашамыз
  auth.createUserWithEmailAndPassword(loginnenPoshta(login), qupiya)
    .then(function (natije) {
      // 2) Оқушының бастапқы деректерін дерекқорға жазамыз
      let oqushy = bosOqushy();
      oqushy.aty = aty;
      oqushy.login = login;
      return db.collection("oqushylar").doc(natije.user.uid).set(oqushy);
    })
    .then(function () {
      location.href = "index.html";
    })
    .catch(function (q) {
      tirkelipJatyr = false;
      batyrmaKutu("tirkelu-btn", false, "Тіркелу →");
      qate.textContent = qateMatini(q.code);
    });
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

// Firebase қатесін қазақшаға аудару
function qateMatini(kod) {
  if (kod === "auth/email-already-in-use") return "Бұл логин бос емес. Басқасын ойлап тап.";
  if (kod === "auth/weak-password") return "Құпия сөз тым қарапайым. Кемінде 6 таңба жаз.";
  if (kod === "auth/network-request-failed") return "Интернет жоқ сияқты. Қайта көр.";
  if (kod === "auth/too-many-requests") return "Тым көп талпыныс. Біраз күтіп, қайта көр.";
  if (kod === "auth/operation-not-allowed") return "Кіру әлі қосылмаған (Firebase баптауы).";
  return "Логин немесе құпия сөз қате.";
}

document.getElementById("tirkelu-btn").onclick = tirkelu;
document.getElementById("t-qupiya2").onkeydown = function (e) {
  if (e.key === "Enter") tirkelu();
};

document.getElementById("k-login").focus();
