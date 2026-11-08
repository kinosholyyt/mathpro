// =====================================================
// САБАҚ БЕТІ
// Сілтемеден сабақтың id-ін аламыз: sabak.html?id=alg1
// =====================================================

menuSalu("sabaktar.html");

let parametrler = new URLSearchParams(location.search);
let sabak = sabaktyTabu(parametrler.get("id"));


// ----- 1. Сабақ табылмаса немесе жабық болса -----

if (sabak === null) {
  document.querySelector("main").innerHTML =
    "<div class='karta'><h2>Сабақ табылмады 😕</h2><a class='btn btn-sary' href='sabaktar.html'>Сабақтар тізіміне</a></div>";
} else if (!sabakAshykPa(sabak)) {
  document.querySelector("main").innerHTML =
    "<div class='karta'><h2>🔒 Бұл сабақ әлі жабық</h2><p class='mut'>Алдымен алдыңғы сабақты өт.</p><br>" +
    "<a class='btn btn-sary' href='sabaktar.html'>Сабақтар тізіміне</a></div>";
} else {
  sabaktyKorset();
}


function sabaktyKorset() {
  let tarau = taraudyTabu(sabak.tarau);
  let oqushy = oqushyAlu();
  document.title = sabak.aty + " · MathPro";


  // ----- 2. Сол жақтағы сабақтар тізімі -----
  let sabaktar = tarauSabaktary(sabak.tarau);
  let panel = "<p class='mut' style='margin-bottom:10px'>" + tarau.belgi + " " + tarau.aty.toUpperCase() + "</p>";
  for (let i = 0; i < sabaktar.length; i++) {
    let s = sabaktar[i];
    let synyp = "";
    let belgi = i + 1;
    if (oqushy.sabaktar[s.id]) { synyp = "otken"; belgi = "✓"; }
    if (!sabakAshykPa(s)) { synyp = "jabyq"; belgi = "🔒"; }
    if (s.id === sabak.id) synyp += " qazir";
    panel += "<a class='" + synyp + "' href='sabak.html?id=" + s.id + "'><span class='san'>" + belgi + "</span>" + s.aty + "</a>";
  }
  document.getElementById("bui-panel").innerHTML = panel;


  // ----- 3. Тақырып -----
  document.getElementById("jol").textContent = "Сабақтар › " + tarau.aty;
  document.getElementById("taqyryp").textContent = sabak.aty;
  document.getElementById("malimet").textContent = "⏱ " + sabak.uaqyt + " минут · ⭐ +30 ұпай";


  // ----- 4. Видео -----
  // Әкімші толық сілтеме де, тек кодын да жаза алады
  let videoKody = youtubeKodyn(sabak.video);
  if (videoKody) {
    document.getElementById("video-orny").innerHTML =
      "<div class='video'><iframe src='https://www.youtube.com/embed/" + videoKody +
      "' allowfullscreen allow='encrypted-media; picture-in-picture'></iframe></div>";
  }


  // ----- 5. Теория -----
  let teoriya = sabak.teoriya;
  if (sabak.formula) teoriya += "<div class='formula'>" + sabak.formula + "</div>";
  if (sabak.erezheler) {
    for (let i = 0; i < sabak.erezheler.length; i++) {
      teoriya += "<p class='erezhe'>" + sabak.erezheler[i] + "</p>";
    }
  }
  document.getElementById("teoriya").innerHTML = teoriya;


  // ----- 6. Мысал: қадамдарды бір-бірлеп көрсетеміз -----
  document.getElementById("mysal-suraq").textContent = sabak.mysal.suraq;
  let qadamNomiri = 0;
  let kelesiBtn = document.getElementById("kelesi-qadam");

  kelesiBtn.onclick = function () {
    let qadam = document.createElement("div");
    qadam.className = "qadam";
    qadam.innerHTML = "<b>" + (qadamNomiri + 1) + "</b><span>" + sabak.mysal.qadamdar[qadamNomiri] + "</span>";
    document.getElementById("mysal-qadamdar").appendChild(qadam);
    qadamNomiri = qadamNomiri + 1;

    // Барлық қадам көрсетілсе, батырманы жасырамыз
    if (qadamNomiri >= sabak.mysal.qadamdar.length) {
      kelesiBtn.classList.add("jasyryn");
    }
  };
  kelesiBtn.onclick(); // бірінші қадам бірден көрінсін


  // ----- 7. Тексеру сұрағы -----
  let tekseru = sabak.tekseru;
  document.getElementById("tekseru-suraq").textContent = tekseru.suraq;
  let nuskalarOrny = document.getElementById("nuskalar");
  let natije = document.getElementById("tekseru-natije");

  for (let i = 0; i < tekseru.nuskalar.length; i++) {
    let batyrma = document.createElement("button");
    batyrma.className = "btn nuska";
    batyrma.textContent = tekseru.nuskalar[i];
    batyrma.onclick = function () {
      nuskaTandau(i, batyrma);
    };
    nuskalarOrny.appendChild(batyrma);
  }

  function nuskaTandau(nomir, batyrma) {
    if (nomir === tekseru.durys) {
      batyrma.classList.add("durys");
      natije.innerHTML = "<span class='jasyl'>🎉 Дұрыс! Сабақ өтілді.</span>";

      // Батырмаларды өшіреміз
      let barlygy = nuskalarOrny.querySelectorAll("button");
      for (let j = 0; j < barlygy.length; j++) barlygy[j].disabled = true;

      sabaktyAyaqtau();
    } else {
      batyrma.classList.add("qate");
      batyrma.disabled = true;
      natije.innerHTML = "<span class='qyzyl'>Қате. Теория мен мысалды тағы бір қарап, қайта таңда.</span>";
    }
  }

  // Бұрын өтілген сабақ болса, келесі батырмаларды бірден көрсетеміз
  if (oqushy.sabaktar[sabak.id]) {
    sonyndagyBatyrmalar();
  }
}


// ----- 8. Сабақ аяқталғанда -----

function sabaktyAyaqtau() {
  let oqushy = oqushyAlu();
  if (!oqushy.sabaktar[sabak.id]) {
    oqushy.sabaktar[sabak.id] = true;
    oqushySaqtau(oqushy);
    upaiQosu(30);

    // Сол жақтағы тізімде осы сабаққа ✓ қойып, келесі сабақтың құлпын ашамыз
    let qazirgi = document.querySelector("#bui-panel a.qazir");
    qazirgi.classList.add("otken");
    qazirgi.querySelector(".san").textContent = "✓";
    let jabyqtar = document.querySelectorAll("#bui-panel a.jabyq");
    if (jabyqtar.length > 0) {
      jabyqtar[0].classList.remove("jabyq");
      jabyqtar[0].querySelector(".san").textContent = "→";
    }
  }
  sonyndagyBatyrmalar();
}

function sonyndagyBatyrmalar() {
  document.getElementById("sonyndagy").classList.remove("jasyryn");

  // Келесі сабақ: дәл осы тараудағы келесісі, болмаса тізімге
  let sabaktar = tarauSabaktary(sabak.tarau);
  let kelesi = document.getElementById("kelesi-sabak");
  kelesi.href = "sabaktar.html";
  kelesi.textContent = "Барлық сабақтар →";
  for (let i = 0; i < sabaktar.length - 1; i++) {
    if (sabaktar[i].id === sabak.id) {
      kelesi.href = "sabak.html?id=" + sabaktar[i + 1].id;
      kelesi.textContent = "Келесі сабақ: " + sabaktar[i + 1].aty + " →";
    }
  }
}
