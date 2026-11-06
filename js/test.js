// =====================================================
// ТЕСТ ТАПСЫРУ
// Сілтемеден тесттің id-ін аламыз: test.html?id=t_alg
// =====================================================

menuSalu("testter.html");

let parametrler = new URLSearchParams(location.search);
let test = null;
for (let i = 0; i < TESTTER.length; i++) {
  if (TESTTER[i].id === parametrler.get("id")) test = TESTTER[i];
}

let nomir = 0;          // қазіргі сұрақтың нөмірі (0-ден)
let jauaptar = [];      // оқушы таңдаған нұсқалар
let qalganUaqyt = 0;    // секундпен
let taimer = null;
let ayaqtaldy = false;


// ----- 1. Тестті бастау -----

if (test === null) {
  document.querySelector("main").innerHTML =
    "<div class='karta'><h2>Тест табылмады 😕</h2><a class='btn btn-sary' href='testter.html'>Тесттер тізіміне</a></div>";
} else {
  document.title = test.aty + " · MathPro";
  document.getElementById("test-aty").textContent = test.aty;
  qalganUaqyt = test.minut * 60;
  taimerdiKorset();
  taimer = setInterval(sekundOtti, 1000);
  suraqtyKorset();
}


// ----- 2. Таймер -----

function sekundOtti() {
  qalganUaqyt = qalganUaqyt - 1;
  taimerdiKorset();
  if (qalganUaqyt <= 0) {
    habarKorset("⏰ Уақыт бітті!");
    testtiAyaqtau();
  }
}

function taimerdiKorset() {
  let minut = Math.floor(qalganUaqyt / 60);
  let sekund = qalganUaqyt % 60;
  if (sekund < 10) sekund = "0" + sekund;
  let oryn = document.getElementById("taimer");
  oryn.textContent = "⏱ " + minut + ":" + sekund;
  // Соңғы 1 минутта таймер қызарады
  if (qalganUaqyt <= 60) oryn.className = "taimer az";
}


// ----- 3. Сұрақты көрсету -----

function suraqtyKorset() {
  let suraq = test.suraqtar[nomir];
  document.getElementById("nomir").textContent = "Сұрақ " + (nomir + 1) + " / " + test.suraqtar.length;
  document.getElementById("suraq").textContent = suraq.suraq;

  // Жоғарыдағы нүктелер: қай сұраққа жауап берілгенін көрсетеді
  let nuktelar = "";
  for (let i = 0; i < test.suraqtar.length; i++) {
    let synyp = "";
    if (jauaptar[i] !== undefined) synyp = "jauap";
    if (i === nomir) synyp = "qazir";
    nuktelar += "<i class='" + synyp + "'></i>";
  }
  document.getElementById("nuktelar").innerHTML = nuktelar;

  // Жауап нұсқалары
  let oryn = document.getElementById("nuskalar");
  oryn.innerHTML = "";
  let arip = ["A", "B", "C", "D"];
  for (let i = 0; i < suraq.nuskalar.length; i++) {
    let batyrma = document.createElement("button");
    batyrma.className = "btn test-nuska";
    if (jauaptar[nomir] === i) batyrma.className += " tandalgan";
    batyrma.textContent = arip[i] + ")  " + suraq.nuskalar[i];
    batyrma.onclick = function () {
      jauaptar[nomir] = i;
      suraqtyKorset();
    };
    oryn.appendChild(batyrma);
  }

  // Төменгі батырмалар
  document.getElementById("artqa").disabled = nomir === 0;
  let kelesi = document.getElementById("kelesi");
  kelesi.disabled = jauaptar[nomir] === undefined;
  if (nomir === test.suraqtar.length - 1) kelesi.textContent = "Аяқтау ✓";
  else kelesi.textContent = "Келесі →";
}

document.getElementById("kelesi").onclick = function () {
  if (nomir === test.suraqtar.length - 1) {
    testtiAyaqtau();
  } else {
    nomir = nomir + 1;
    suraqtyKorset();
  }
};

document.getElementById("artqa").onclick = function () {
  if (nomir > 0) {
    nomir = nomir - 1;
    suraqtyKorset();
  }
};


// ----- 4. Тест аяқталғанда -----

function testtiAyaqtau() {
  if (ayaqtaldy) return;   // екі рет аяқталмауы үшін
  ayaqtaldy = true;
  clearInterval(taimer);

  // Дұрыс жауаптарды санаймыз
  let durys = 0;
  for (let i = 0; i < test.suraqtar.length; i++) {
    if (jauaptar[i] === test.suraqtar[i].durys) durys = durys + 1;
  }
  let barlygy = test.suraqtar.length;

  // Нәтижені сақтаймыз. Ұпай тек рекорд жаңарса беріледі:
  // жаңа рекорд пен ескі рекордтың айырмасы × 5
  let oqushy = oqushyAlu();
  let eskiRekord = oqushy.testter[test.id] || 0;
  oqushy.talpynys = oqushy.talpynys + barlygy;
  oqushy.durysSany = oqushy.durysSany + durys;
  let janaRekord = oqushy.testter[test.id] === undefined || durys > eskiRekord;
  if (janaRekord) oqushy.testter[test.id] = durys;
  oqushySaqtau(oqushy);
  if (durys > eskiRekord) upaiQosu((durys - eskiRekord) * 5);

  // Нәтиже экраны
  document.getElementById("suraq-bolimi").classList.add("jasyryn");
  document.getElementById("natije-bolimi").classList.remove("jasyryn");
  document.getElementById("ball").textContent = durys + " / " + barlygy;
  document.getElementById("qaita").href = "test.html?id=" + test.id;

  let payz = durys * 100 / barlygy;
  let baga = "";
  if (payz >= 90) baga = "🏆 Керемет! Тақырыпты жақсы меңгергенсің.";
  else if (payz >= 70) baga = "👍 Жақсы! Қателерге қарап, тағы бір рет тапсырып көр.";
  else if (payz >= 50) baga = "🙂 Жаман емес. Сабақтарды қайталап шыққан дұрыс.";
  else baga = "📘 Алдымен сабақтарды қайта оқып, есептер шығарып көр.";
  if (durys > eskiRekord && eskiRekord > 0) baga += " Жаңа рекорд!";
  document.getElementById("baga").textContent = baga;

  // Әр сұрақтың талдауы
  let html = "";
  for (let i = 0; i < test.suraqtar.length; i++) {
    let suraq = test.suraqtar[i];
    let tandalgan = jauaptar[i];
    let durysPa = tandalgan === suraq.durys;
    let belgi = "❌";
    if (durysPa) belgi = "✅";
    let jauapMatini = "жауап берілмеді";
    if (tandalgan !== undefined) jauapMatini = suraq.nuskalar[tandalgan];

    html += "<div class='talday'><span style='font-size:22px'>" + belgi + "</span><div>" +
              "<b>" + (i + 1) + ". " + suraq.suraq + "</b><br>";
    if (durysPa) {
      html += "<span class='jasyl'>" + jauapMatini + "</span>";
    } else {
      html += "<span class='qyzyl'>Сенің жауабың: " + jauapMatini + "</span><br>" +
              "<span class='jasyl'>Дұрыс жауап: " + suraq.nuskalar[suraq.durys] + "</span>";
    }
    html += "</div></div>";
  }
  document.getElementById("talday").innerHTML = html;
  scrollTo(0, 0);
}
