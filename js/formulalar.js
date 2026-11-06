// =====================================================
// ФОРМУЛАЛАР ЖИНАҒЫ
// =====================================================

menuSalu("formulalar.html");

let tandalganTarau = "barlygy";


// ----- 1. Тарау бойынша сүзгі батырмалары -----

function suzgiSalu() {
  let suzgi = document.getElementById("suzgi");
  suzgi.innerHTML = "";
  let tizim = [{ id: "barlygy", aty: "Барлығы", belgi: "📚" }];
  for (let i = 0; i < TARAULAR.length; i++) tizim.push(TARAULAR[i]);

  for (let i = 0; i < tizim.length; i++) {
    let batyrma = document.createElement("button");
    batyrma.className = "btn btn-kishi";
    if (tizim[i].id === tandalganTarau) batyrma.className += " belsendi";
    batyrma.textContent = tizim[i].belgi + " " + tizim[i].aty;
    batyrma.onclick = function () {
      tandalganTarau = tizim[i].id;
      suzgiSalu();
      formulalardyKorset();
    };
    suzgi.appendChild(batyrma);
  }
}


// ----- 2. Формулаларды шығару (іздеуге сай) -----

function formulalardyKorset() {
  let izdeu = document.getElementById("izdeu").value.trim().toLowerCase();
  let html = "";

  for (let i = 0; i < FORMULALAR.length; i++) {
    let f = FORMULALAR[i];

    // Тарау сүзгісі
    if (tandalganTarau !== "barlygy" && f.tarau !== tandalganTarau) continue;

    // Іздеу: атауында, формуласында немесе мысалында сөз бар ма?
    let matin = (f.aty + " " + f.formula + " " + f.mysal).toLowerCase();
    if (izdeu !== "" && matin.indexOf(izdeu) === -1) continue;

    let tarau = taraudyTabu(f.tarau);
    html +=
      "<div class='karta formula-karta'>" +
        "<span class='mut' style='font-size:14px'>" + tarau.belgi + " " + tarau.aty + "</span>" +
        "<h3 style='margin-top:4px'>" + f.aty + "</h3>" +
        "<div class='f'>" + f.formula + "</div>" +
        "<div class='mysal'>Мысал: " + f.mysal + "</div>" +
      "</div>";
  }

  if (html === "") {
    html = "<div class='karta'><p class='mut'>Ештеңе табылмады. Басқа сөзбен іздеп көр.</p></div>";
  }
  document.getElementById("formulalar").innerHTML = html;
}

// Әр әріп жазылған сайын іздейміз
document.getElementById("izdeu").oninput = formulalardyKorset;

suzgiSalu();
formulalardyKorset();
