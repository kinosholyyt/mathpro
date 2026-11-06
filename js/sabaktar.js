// =====================================================
// САБАҚТАР ТІЗІМІ
// =====================================================

menuSalu("sabaktar.html");

let oqushy = oqushyAlu();
let html = "";

// Әр тарау үшін бір карта жасаймыз
for (let i = 0; i < TARAULAR.length; i++) {
  let tarau = TARAULAR[i];
  let sabaktar = tarauSabaktary(tarau.id);
  let payz = tarauPayzy(tarau.id);

  html += "<div class='karta'>";
  html += "<h2>" + tarau.belgi + " " + tarau.aty + "</h2>";
  html += "<div class='jolaq'><i style='width:" + payz + "%;background:" + tarau.tus + "'></i></div>";
  html += "<div class='sabak-tizim'>";

  // Тараудың ішіндегі сабақтар
  for (let j = 0; j < sabaktar.length; j++) {
    let sabak = sabaktar[j];
    let otken = oqushy.sabaktar[sabak.id] === true;
    let ashyk = sabakAshykPa(sabak);

    if (otken) {
      html += "<a class='sabak-qatar otken' href='sabak.html?id=" + sabak.id + "'>" +
                "<span class='san'>✓</span>" + sabak.aty + "<span class='ong'>Өтілді</span></a>";
    } else if (ashyk) {
      html += "<a class='sabak-qatar' href='sabak.html?id=" + sabak.id + "'>" +
                "<span class='san'>" + (j + 1) + "</span>" + sabak.aty + "<span class='ong'>⏱ " + sabak.uaqyt + " мин</span></a>";
    } else {
      html += "<div class='sabak-qatar jabyq' title='Алдымен алдыңғы сабақты өт'>" +
                "<span class='san'>🔒</span>" + sabak.aty + "</div>";
    }
  }

  html += "</div></div>";
}

document.getElementById("taraular").innerHTML = html;
