// =====================================================
// КҮН ТАПСЫРМАСЫ
// Күн сайын 5 есеп. Бәрін шешсе +50 бонус ұпай.
// =====================================================

menuSalu("index.html");

let bugingiEsepter = kunTapsyrmasyEsepteri();


// ----- 1. Прогресті көрсету -----

function kunProgresi() {
  let kun = kunDeregi();
  let san = kun.sheshilgen.length;
  document.getElementById("kun-sany").textContent = san + " / 5";
  document.getElementById("kun-jolaq").style.width = (san * 20) + "%";
  if (kun.bonus) {
    document.getElementById("kun-bonus").textContent = "🎉 Бүгінгі тапсырма орындалды! Ертең жаңа есептер күтеді.";
  }
}


// ----- 2. Есеп шешілгенде -----

function kunEsebiSheshildi(esep) {
  kunDeregi(); // күн ауысса, деректі жаңартады
  let oqushy = oqushyAlu();

  // Бүгінгі тізімге қосамыз (бір есеп бір-ақ рет саналады)
  if (oqushy.kun.sheshilgen.indexOf(esep.id) === -1) {
    oqushy.kun.sheshilgen.push(esep.id);
  }

  // 5 есептің бәрі шешілсе, бонус береміз (күніне бір рет)
  let bonusBer = oqushy.kun.sheshilgen.length >= 5 && !oqushy.kun.bonus;
  if (bonusBer) oqushy.kun.bonus = true;
  oqushySaqtau(oqushy);

  if (bonusBer) {
    // Есептің өз ұпайы туралы хабар көрінсін деп сәл кейін береміз
    setTimeout(function () {
      upaiQosu(50);
      habarKorset("🏆 Күн тапсырмасы орындалды! +50 ұпай");
    }, 1900);
  }
  kunProgresi();
}


// ----- 3. Бетті іске қосу -----

let oryn = document.getElementById("kun-esepter");
for (let i = 0; i < bugingiEsepter.length; i++) {
  esepKartasy(bugingiEsepter[i], oryn, kunEsebiSheshildi);
}
kunProgresi();
