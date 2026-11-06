// =====================================================
// МЕНІҢ НӘТИЖЕМ
// =====================================================

menuSalu("natizhe.html");

let oqushy = oqushyAlu();


// ----- 1. Санау: тек қазір бар сабақ пен есептерді санаймыз -----

let otkenSabak = 0;
for (let i = 0; i < SABAKTAR.length; i++) {
  if (oqushy.sabaktar[SABAKTAR[i].id]) otkenSabak = otkenSabak + 1;
}
let sheshilgenEsep = 0;
for (let i = 0; i < ESEPTER.length; i++) {
  if (oqushy.esepter[ESEPTER[i].id]) sheshilgenEsep = sheshilgenEsep + 1;
}
let dalDik = 0;
if (oqushy.talpynys > 0) dalDik = Math.round(oqushy.durysSany * 100 / oqushy.talpynys);


// ----- 2. Профиль және деңгей -----
// Деңгей ұпайға байланысты: әр 200 ұпай — жаңа деңгей

let aty = oqushy.aty || "Оқушы";
let dengei = Math.floor(oqushy.upai / 200) + 1;
let kelesiDengeige = 200 - (oqushy.upai % 200);

document.getElementById("avatar").textContent = aty.charAt(0).toUpperCase();
document.getElementById("aty").textContent = aty;
document.getElementById("dengei").textContent =
  "🎓 " + dengei + "-деңгей · келесі деңгейге " + kelesiDengeige + " ұпай қалды";


// ----- 3. Негізгі сандар -----

let sandar = [
  ["⭐ Ұпай", oqushy.upai],
  ["🔥 Қатарынан", oqushy.qatar + " күн"],
  ["📘 Сабақ", otkenSabak + " / " + SABAKTAR.length],
  ["✏️ Есеп", sheshilgenEsep + " / " + ESEPTER.length],
  ["🎯 Дәлдік", dalDik + "%"]
];
let html = "";
for (let i = 0; i < sandar.length; i++) {
  html += "<div class='karta'><span class='mut'>" + sandar[i][0] + "</span><b>" + sandar[i][1] + "</b></div>";
}
document.getElementById("sandar").innerHTML = html;


// ----- 4. Тараулар және кеңес -----

html = "";
let alsizTarau = null;
let enAzPayz = 101;
for (let i = 0; i < TARAULAR.length; i++) {
  let tarau = TARAULAR[i];
  let payz = tarauPayzy(tarau.id);
  html +=
    "<div class='tarau-qatar'><span>" + tarau.belgi + " " + tarau.aty + "</span><b>" + payz + "%</b></div>" +
    "<div class='jolaq'><i style='width:" + payz + "%;background:" + tarau.tus + "'></i></div>";
  if (payz < enAzPayz) {
    enAzPayz = payz;
    alsizTarau = tarau;
  }
}
document.getElementById("taraular").innerHTML = html;

// Ең әлсіз тарауда келесі өтілмеген сабақты ұсынамыз
let kenes = "";
if (enAzPayz === 100) {
  kenes = "🏆 Барлық тарау толық өтілді! Енді тесттерді тапсырып көр.";
} else {
  let sabaktar = tarauSabaktary(alsizTarau.id);
  let usynys = null;
  for (let i = 0; i < sabaktar.length; i++) {
    if (!oqushy.sabaktar[sabaktar[i].id] && sabakAshykPa(sabaktar[i])) {
      usynys = sabaktar[i];
      break;
    }
  }
  if (usynys) {
    kenes = "💡 <b>Кеңес:</b> " + alsizTarau.aty + " тарауы әлі әлсіз. «" + usynys.aty + "» сабағынан баста." +
            "<br><a class='btn btn-sary btn-kishi' style='margin-top:10px' href='sabak.html?id=" + usynys.id + "'>Сабаққа өту →</a>";
  } else {
    kenes = "💡 <b>Кеңес:</b> " + alsizTarau.aty + " тарауының есептерін шығарып көр." +
            "<br><a class='btn btn-sary btn-kishi' style='margin-top:10px' href='esepter.html'>Есептерге өту →</a>";
  }
}
document.getElementById("kenes").innerHTML = "<div style='background:#fff8e6;border-radius:14px;padding:14px'>" + kenes + "</div>";


// ----- 5. Тесттер мен ойындар -----

html = "";
for (let i = 0; i < TESTTER.length; i++) {
  let test = TESTTER[i];
  let natije = "<span class='mut'>тапсырылмаған</span>";
  if (oqushy.testter[test.id] !== undefined) {
    natije = "<b>" + oqushy.testter[test.id] + " / " + test.suraqtar.length + "</b>";
  }
  html += "<div class='tarau-qatar'><span>📝 " + test.aty + "</span>" + natije + "</div>";
}
html += "<div class='tarau-qatar' style='margin-top:20px'><span>⚡ Жылдам есеп (рекорд)</span><b>" + oqushy.oiyndar.zhyldam + "</b></div>";
html += "<div class='tarau-qatar'><span>🧠 Рас па, өтірік пе? (рекорд)</span><b>" + oqushy.oiyndar.viktorina + " / 10</b></div>";
document.getElementById("testter").innerHTML = html;


// ----- 6. Белгішелер -----
// [белгі, атауы, қалай алынады, алынды ма]

let testSheberi = false;
for (let i = 0; i < TESTTER.length; i++) {
  if (oqushy.testter[TESTTER[i].id] >= 9) testSheberi = true;
}

let belgiler = [
  ["🌱", "Алғашқы қадам", "1 сабақ өт", otkenSabak >= 1],
  ["📚", "Оқымысты", "6 сабақ өт", otkenSabak >= 6],
  ["🎓", "Барлығын білемін", "Барлық сабақты өт", otkenSabak >= SABAKTAR.length],
  ["✏️", "Есепші", "10 есеп шығар", sheshilgenEsep >= 10],
  ["🧮", "Есеп шебері", "30 есеп шығар", sheshilgenEsep >= 30],
  ["🏆", "Тест шебері", "Тестте 9+ ұпай ал", testSheberi],
  ["🔥", "Тұрақты", "3 күн қатарынан кір", oqushy.qatar >= 3],
  ["⚡", "Жылдам ойлау", "Жылдам есепте 20+ ұпай", oqushy.oiyndar.zhyldam >= 20],
  ["⭐", "Жұлдыз", "500 ұпай жина", oqushy.upai >= 500]
];

html = "";
for (let i = 0; i < belgiler.length; i++) {
  let synyp = "belgi-karta";
  if (!belgiler[i][3]) synyp += " jabyq";
  html += "<div class='" + synyp + "'><div class='em'>" + belgiler[i][0] + "</div><b>" + belgiler[i][1] + "</b><small>" + belgiler[i][2] + "</small></div>";
}
document.getElementById("belgiler").innerHTML = html;
