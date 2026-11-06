// =====================================================
// БАСТЫ БЕТ
// =====================================================

menuSalu("index.html");


// ----- 1. Сәлемдесу және прогресс -----

function betTolturu() {
  let oqushy = oqushyAlu();

  // Аты болса, тақырыпта атымен сәлемдесеміз
  if (oqushy.aty) {
    document.getElementById("salem").innerHTML = "Сәлем, <em>" + oqushy.aty + "</em>! Бүгін не үйренеміз?";
  }

  document.getElementById("upai-sany").textContent = oqushy.upai;
  document.getElementById("qatar").textContent = oqushy.qatar;

  // "Жалғастыру" батырмасы келесі сабаққа апарады
  let sabak = kelesiSabak();
  let batyrma = document.getElementById("jalgastyru");
  if (sanau(oqushy.sabaktar) > 0 && sabak) {
    batyrma.textContent = "Жалғастыру: " + sabak.aty + " →";
    batyrma.href = "sabak.html?id=" + sabak.id;
  } else if (sabak) {
    batyrma.href = "sabak.html?id=" + sabak.id;
  }

  // Тараулар бойынша прогресс жолақтары
  let html = "";
  for (let i = 0; i < TARAULAR.length; i++) {
    let tarau = TARAULAR[i];
    let payz = tarauPayzy(tarau.id);
    html +=
      "<div class='tarau-qatar'><span>" + tarau.belgi + " " + tarau.aty + "</span><b>" + payz + "%</b></div>" +
      "<div class='jolaq'><i style='width:" + payz + "%;background:" + tarau.tus + "'></i></div>";
  }
  document.getElementById("progress").innerHTML = html;

  // Күн тапсырмасының қысқаша күйі
  let kun = kunDeregi();
  let kunJazuy = "Бүгін 5 есеп шығар, +50 ұпай ал · " + kun.sheshilgen.length + " / 5";
  if (kun.bonus) kunJazuy = "✅ Бүгінгі тапсырма орындалды!";
  document.getElementById("kun-qysqa").textContent = kunJazuy;
}


betTolturu();
