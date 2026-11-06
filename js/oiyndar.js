// =====================================================
// ОЙЫНДАР: «Жылдам есеп» және «Рас па, өтірік пе?»
// =====================================================

menuSalu("oiyndar.html");


// ----- 1. Ойын мәзірі -----

function rekordtardyKorset() {
  let oqushy = oqushyAlu();
  document.getElementById("rekord-zhyldam").textContent = oqushy.oiyndar.zhyldam;
  document.getElementById("rekord-viktorina").textContent = oqushy.oiyndar.viktorina;
}

function menyugeOralu() {
  clearInterval(zTaimer);
  document.getElementById("zhyldam").classList.add("jasyryn");
  document.getElementById("viktorina").classList.add("jasyryn");
  document.getElementById("oiyn-tandau").classList.remove("jasyryn");
  rekordtardyKorset();
}

// Кездейсоқ бүтін сан: min-нен max-қа дейін (екеуі де кіреді)
function kezdeisoq(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

rekordtardyKorset();


// =====================================================
// 2. ЖЫЛДАМ ЕСЕП
// =====================================================

let zTaimer = null;
let zUaqyt = 60;
let zUpai = 0;
let zKombo = 0;
let zDurysJauap = 0;
let zKutu = false; // жауаптан кейін келесі мысалды күтіп тұрғанда басуға болмайды

function zhyldamBastau() {
  document.getElementById("oiyn-tandau").classList.add("jasyryn");
  document.getElementById("zhyldam").classList.remove("jasyryn");
  document.getElementById("z-sony").classList.add("jasyryn");
  document.getElementById("z-suraq").classList.remove("jasyryn");
  document.getElementById("z-nuskalar").classList.remove("jasyryn");

  zUaqyt = 60;
  zUpai = 0;
  zKombo = 0;
  zKutu = false;
  zEsepterdiJanartu();
  zMysalJasau();

  clearInterval(zTaimer);
  zTaimer = setInterval(function () {
    zUaqyt = zUaqyt - 1;
    zEsepterdiJanartu();
    if (zUaqyt <= 0) zhyldamAyaqtau();
  }, 1000);
}

function zEsepterdiJanartu() {
  document.getElementById("z-uaqyt").textContent = zUaqyt;
  document.getElementById("z-kombo").textContent = zKombo;
  document.getElementById("z-upai").textContent = zUpai;
}

// Жаңа мысал: қосу, азайту немесе көбейту
function zMysalJasau() {
  let amal = kezdeisoq(1, 3);
  let a, b, matin;

  if (amal === 1) {
    a = kezdeisoq(5, 60);
    b = kezdeisoq(5, 40);
    zDurysJauap = a + b;
    matin = a + " + " + b;
  } else if (amal === 2) {
    a = kezdeisoq(20, 90);
    b = kezdeisoq(2, a);         // жауап теріс болмасын
    zDurysJauap = a - b;
    matin = a + " − " + b;
  } else {
    a = kezdeisoq(2, 12);
    b = kezdeisoq(2, 12);
    zDurysJauap = a * b;
    matin = a + " × " + b;
  }
  document.getElementById("z-suraq").textContent = matin + " = ?";

  // 4 нұсқа: біреуі дұрыс, үшеуі оған жақын сандар
  let nuskalar = [zDurysJauap];
  while (nuskalar.length < 4) {
    let san = zDurysJauap + kezdeisoq(-10, 10);
    if (san >= 0 && nuskalar.indexOf(san) === -1) nuskalar.push(san);
  }
  nuskalar = aralastyru(nuskalar);

  let oryn = document.getElementById("z-nuskalar");
  oryn.innerHTML = "";
  for (let i = 0; i < nuskalar.length; i++) {
    let batyrma = document.createElement("button");
    batyrma.className = "btn";
    batyrma.textContent = nuskalar[i];
    batyrma.onclick = function () {
      zJauapBeru(nuskalar[i], batyrma);
    };
    oryn.appendChild(batyrma);
  }
}

function zJauapBeru(san, batyrma) {
  if (zKutu || zUaqyt <= 0) return;
  zKutu = true;

  if (san === zDurysJauap) {
    zKombo = zKombo + 1;
    // Комбо 5-тен асса, әр дұрыс жауап 2 ұпай береді
    if (zKombo >= 5) zUpai = zUpai + 2;
    else zUpai = zUpai + 1;
    batyrma.classList.add("durys");
  } else {
    zKombo = 0;
    batyrma.classList.add("qate");
  }
  zEsepterdiJanartu();

  // Түс көрінсін деп сәл күтіп, келесі мысалды шығарамыз
  setTimeout(function () {
    zKutu = false;
    if (zUaqyt > 0) zMysalJasau();
  }, 350);
}

function zhyldamAyaqtau() {
  clearInterval(zTaimer);
  document.getElementById("z-suraq").classList.add("jasyryn");
  document.getElementById("z-nuskalar").classList.add("jasyryn");
  document.getElementById("z-sony").classList.remove("jasyryn");
  document.getElementById("z-natije").textContent = "⭐ " + zUpai;

  let oqushy = oqushyAlu();
  let baga = "Уақыт бітті!";
  if (zUpai > oqushy.oiyndar.zhyldam) {
    oqushy.oiyndar.zhyldam = zUpai;
    baga = "🏆 Жаңа рекорд!";
  }
  oqushySaqtau(oqushy);
  document.getElementById("z-baga").textContent = baga;
  if (zUpai > 0) upaiQosu(zUpai);
}

document.getElementById("bastau-zhyldam").onclick = zhyldamBastau;
document.getElementById("z-qaita").onclick = zhyldamBastau;


// =====================================================
// 3. РАС ПА, ӨТІРІК ПЕ?
// =====================================================

let vSuraqtar = [];
let vNomir = 0;
let vDurys = 0;

function viktorinaBastau() {
  document.getElementById("oiyn-tandau").classList.add("jasyryn");
  document.getElementById("viktorina").classList.remove("jasyryn");
  document.getElementById("v-sony").classList.add("jasyryn");

  // Барлық сұрақтарды араластырып, алғашқы 10-ын аламыз
  vSuraqtar = aralastyru(VIKTORINA).slice(0, 10);
  vNomir = 0;
  vDurys = 0;
  vSuraqtyKorset();
}

function vSuraqtyKorset() {
  document.getElementById("v-nomir").textContent = vNomir + 1;
  document.getElementById("v-durys").textContent = vDurys;
  document.getElementById("v-suraq").textContent = vSuraqtar[vNomir].suraq;
  document.getElementById("v-suraq").classList.remove("jasyryn");
  document.getElementById("v-batyrmalar").classList.remove("jasyryn");
  document.getElementById("v-tusindirme").textContent = "";
  document.getElementById("v-kelesi").classList.add("jasyryn");
  document.getElementById("v-ras").disabled = false;
  document.getElementById("v-otirik").disabled = false;
}

function vJauapBeru(oqushyRasDedi) {
  let suraq = vSuraqtar[vNomir];
  document.getElementById("v-ras").disabled = true;
  document.getElementById("v-otirik").disabled = true;

  let tusindirme = document.getElementById("v-tusindirme");
  if (oqushyRasDedi === suraq.ras) {
    vDurys = vDurys + 1;
    tusindirme.innerHTML = "<span class='jasyl'>✅ Дұрыс! " + suraq.tusindirme + "</span>";
  } else {
    tusindirme.innerHTML = "<span class='qyzyl'>❌ Қате. " + suraq.tusindirme + "</span>";
  }
  document.getElementById("v-durys").textContent = vDurys;

  let kelesi = document.getElementById("v-kelesi");
  kelesi.classList.remove("jasyryn");
  if (vNomir === vSuraqtar.length - 1) kelesi.textContent = "Нәтижені көру →";
  else kelesi.textContent = "Келесі →";
}

function vKelesi() {
  if (vNomir < vSuraqtar.length - 1) {
    vNomir = vNomir + 1;
    vSuraqtyKorset();
  } else {
    viktorinaAyaqtau();
  }
}

function viktorinaAyaqtau() {
  document.getElementById("v-suraq").classList.add("jasyryn");
  document.getElementById("v-batyrmalar").classList.add("jasyryn");
  document.getElementById("v-kelesi").classList.add("jasyryn");
  document.getElementById("v-tusindirme").textContent = "";
  document.getElementById("v-sony").classList.remove("jasyryn");
  document.getElementById("v-natije").textContent = vDurys + " / " + vSuraqtar.length;

  let oqushy = oqushyAlu();
  if (vDurys > oqushy.oiyndar.viktorina) {
    oqushy.oiyndar.viktorina = vDurys;
    oqushySaqtau(oqushy);
    habarKorset("🏆 Жаңа рекорд!");
  }
  // Әр дұрыс жауап 2 ұпай
  if (vDurys > 0) upaiQosu(vDurys * 2);
}

document.getElementById("bastau-viktorina").onclick = viktorinaBastau;
document.getElementById("v-qaita").onclick = viktorinaBastau;
document.getElementById("v-ras").onclick = function () { vJauapBeru(true); };
document.getElementById("v-otirik").onclick = function () { vJauapBeru(false); };
document.getElementById("v-kelesi").onclick = vKelesi;
