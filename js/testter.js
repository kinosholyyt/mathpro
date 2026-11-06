// =====================================================
// ТЕСТТЕР ТІЗІМІ
// =====================================================

menuSalu("testter.html");

let oqushy = oqushyAlu();
let html = "";

for (let i = 0; i < TESTTER.length; i++) {
  let test = TESTTER[i];
  let tarau = taraudyTabu(test.tarau);
  let suraqSany = test.suraqtar.length;

  // Бұрын тапсырған болса, ең жақсы нәтижесін көрсетеміз
  let natije = "<p class='mut'>Әлі тапсырылмаған</p>";
  let batyrma = "Бастау →";
  if (oqushy.testter[test.id] !== undefined) {
    let ball = oqushy.testter[test.id];
    let payz = Math.round(ball * 100 / suraqSany);
    natije =
      "<p>Ең жақсы нәтиже: <b>" + ball + " / " + suraqSany + "</b></p>" +
      "<div class='jolaq' style='margin-top:6px'><i style='width:" + payz + "%;background:" + tarau.tus + "'></i></div>";
    batyrma = "Қайта тапсыру →";
  }

  html +=
    "<div class='karta'>" +
      "<div class='ikon' style='font-size:34px'>" + tarau.belgi + "</div>" +
      "<h3 style='margin:8px 0 4px'>" + test.aty + "</h3>" +
      "<p class='mut' style='margin-bottom:12px'>" + suraqSany + " сұрақ · ⏱ " + test.minut + " минут</p>" +
      natije +
      "<a class='btn btn-sary' style='margin-top:16px' href='test.html?id=" + test.id + "'>" + batyrma + "</a>" +
    "</div>";
}

document.getElementById("testter").innerHTML = html;
