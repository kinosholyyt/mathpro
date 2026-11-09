// =====================================================
// ЕСЕПТЕР БЕТІ
// esepter.html?sabak=alg1 — тек бір сабақтың есептері
// =====================================================

menuSalu("esepter.html");

let parametrler = new URLSearchParams(location.search);
let tandalganSabak = parametrler.get("sabak");   // бір сабақ таңдалса
let tandalganTarau = "barlygy";                   // қай тарау көрсетіледі


// ----- 1. Шешілген есептер санын жаңарту -----

function sanyJanartu() {
  let oqushy = oqushyAlu();
  let san = 0;
  for (let i = 0; i < ESEPTER.length; i++) {
    if (oqushy.esepter[ESEPTER[i].id]) san = san + 1;
  }
  document.getElementById("sheshildi").textContent = san;
  document.getElementById("barlygy").textContent = ESEPTER.length;

  // Әр сабақтың тақырыбындағы "2 / 4 шешілді" санын да жаңартамыз
  let sanaqtar = document.querySelectorAll("[data-sabak-sanaq]");
  for (let i = 0; i < sanaqtar.length; i++) {
    let esepter = sabakEsepteri(sanaqtar[i].getAttribute("data-sabak-sanaq"));
    let sheshilgen = 0;
    for (let j = 0; j < esepter.length; j++) {
      if (oqushy.esepter[esepter[j].id]) sheshilgen = sheshilgen + 1;
    }
    sanaqtar[i].textContent = sheshilgen + " / " + esepter.length + " шешілді";
  }
}


// ----- 2. Сүзгі батырмалары -----

function suzgiSalu() {
  let suzgi = document.getElementById("suzgi");
  suzgi.innerHTML = "";

  // "Барлығы" + әр тарау
  let tizim = [{ id: "barlygy", aty: "Барлығы", belgi: "📚" }];
  for (let i = 0; i < TARAULAR.length; i++) tizim.push(TARAULAR[i]);

  for (let i = 0; i < tizim.length; i++) {
    let batyrma = document.createElement("button");
    batyrma.className = "btn btn-kishi";
    if (tizim[i].id === tandalganTarau && !tandalganSabak) batyrma.className += " belsendi";
    batyrma.textContent = tizim[i].belgi + " " + tizim[i].aty;
    batyrma.onclick = function () {
      tandalganTarau = tizim[i].id;
      tandalganSabak = null;
      history.replaceState(null, "", "esepter.html"); // сілтемеден ?sabak= алып тастаймыз
      suzgiSalu();
      esepterdiKorset();
    };
    suzgi.appendChild(batyrma);
  }
}


// ----- 3. Есептерді сабақтар бойынша топтап шығару -----

function esepterdiKorset() {
  let oryn = document.getElementById("esepter");
  oryn.innerHTML = "";
  let oqushy = oqushyAlu();

  for (let i = 0; i < SABAKTAR.length; i++) {
    let sabak = SABAKTAR[i];

    // Сүзгіге сай келмейтін сабақтарды өткізіп жібереміз
    if (tandalganSabak && sabak.id !== tandalganSabak) continue;
    if (!tandalganSabak && tandalganTarau !== "barlygy" && sabak.tarau !== tandalganTarau) continue;

    let esepter = sabakEsepteri(sabak.id);
    if (esepter.length === 0) continue;

    // Осы сабақтың неше есебі шешілген
    let sheshilgen = 0;
    for (let j = 0; j < esepter.length; j++) {
      if (oqushy.esepter[esepter[j].id]) sheshilgen = sheshilgen + 1;
    }

    // Сабақтың тақырыбы
    let tarau = taraudyTabu(sabak.tarau);
    let bas = document.createElement("div");
    bas.className = "sabak-tobi";
    bas.innerHTML =
      "<h2 style='margin:0'>" + tarau.belgi + " " + sabak.aty + "</h2>" +
      "<span class='mut' data-sabak-sanaq='" + sabak.id + "'>" + sheshilgen + " / " + esepter.length + " шешілді</span>" +
      "<a class='btn btn-bos btn-kishi' href='sabak.html?id=" + sabak.id + "'>Сабақты оқу</a>";
    oryn.appendChild(bas);

    // Есеп карталары
    let tor = document.createElement("div");
    tor.className = "esep-tizim";
    oryn.appendChild(tor);
    for (let j = 0; j < esepter.length; j++) {
      esepKartasy(esepter[j], tor, sanyJanartu);
    }
  }

  if (oryn.innerHTML === "") {
    oryn.innerHTML = "<div class='karta'><p class='mut'>Бұл бөлімде әзірге есеп жоқ.</p></div>";
  }
}


// ----- 4. Бетті іске қосу -----

if (tandalganSabak) {
  let sabak = sabaktyTabu(tandalganSabak);
  if (sabak) tandalganTarau = sabak.tarau;
  else tandalganSabak = null;
}

suzgiSalu();
esepterdiKorset();
sanyJanartu();
