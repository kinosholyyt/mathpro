// =====================================================
// FIREBASE БАПТАУЫ
// Firebase — Google-дың тегін дерекқоры. Оқушы аккаунттары,
// прогресі және сабақтар сонда сақталады, сондықтан кез келген
// құрылғыдан кіруге болады.
// Бұл баптау құпия емес: ол әр сайттың ішінде ашық тұрады.
// Қорғанысты Firestore ережелері (Rules) жасайды.
// =====================================================

let firebaseConfig = {
  apiKey: "AIzaSyBHQapTqM8BpGGhkP4YhSvieN5tT2dhwYg",
  authDomain: "mathpro-9c840.firebaseapp.com",
  projectId: "mathpro-9c840",
  storageBucket: "mathpro-9c840.firebasestorage.app",
  messagingSenderId: "733561148384",
  appId: "1:733561148384:web:81553c73e10f207172d185"
};

firebase.initializeApp(firebaseConfig);

let auth = firebase.auth();      // кіру және тіркелу
let db = firebase.firestore();   // дерекқор

// Әкімшінің поштасы. Сабақтарды тек осы аккаунт өзгерте алады.
let AKIMSHI_POSHTA = "admin@mathpro.app";

// Firebase логин емес, пошта сұрайды. Сондықтан логинге
// "@mathpro.app" қосып, пошта сияқты жасаймыз: ali2010 → ali2010@mathpro.app
function loginnenPoshta(login) {
  return login + "@mathpro.app";
}
