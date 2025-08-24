// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAb6R5SCz7gbNAKeuj1-dzOE-HSlH8FFvY",
  authDomain: "ipae-adventure-10a86.firebaseapp.com",
  projectId: "ipae-adventure-10a86",
  storageBucket: "ipae-adventure-10a86.firebasestorage.app",
  messagingSenderId: "659680882741",
  appId: "1:659680882741:web:16c9bd0dbdf6582d16c17c"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// PIN do admin
const ADMIN_PIN = "TentaAgoraViado";

// Lista de times
const times = ["Bird","Bravus","Fire","Ice","Sand","Speed","Stone","Storm","Taurus","Tiger"];

// --------------------
// Modo admin
// --------------------
const botaoAdmin = document.getElementById("adminToggle");
botaoAdmin.addEventListener("click", () => {
  if (!document.body.classList.contains("admin")) {
    const entrada = prompt("Digite o PIN de administrador:");
    if (entrada === ADMIN_PIN) {
      document.body.classList.add("admin");
      alert("✅ Modo admin ativado");
    } else {
      alert("❌ PIN incorreto");
    }
  } else {
    document.body.classList.remove("admin");
    alert("🔒 Modo admin desativado");
  }
});

// --------------------
// Inserir pontos
// --------------------
function inserirPontos(botao) {
  const linha = botao.closest("tr");
  const time = linha.cells[1].innerText.trim();
  const pontosCell = linha.cells[2];
  const input = linha.querySelector("input[type='number']");
  const valor = parseInt(input.value, 10);

  if (!isNaN(valor) && valor >= 0) {
    pontosCell.innerText = valor;
    input.value = "";

    // Salvar no Firestore
    db.collection("times").doc(time).set({ pontos: valor })
      .then(() => console.log("✅ Pontos salvos para", time))
      .catch((error) => console.error("❌ Erro ao salvar:", error));

    atualizarPosicoes();
  } else {
    alert("Digite um valor válido!");
  }
}

// --------------------
// Atualizar ranking
// --------------------
function atualizarPosicoes() {
  const tbody = document.getElementById("tabela").tBodies[0];
  const linhas = Array.from(tbody.rows);

  linhas.sort((a, b) => parseInt(b.cells[2].innerText, 10) - parseInt(a.cells[2].innerText, 10));

  linhas.forEach((linha, i) => {
    linha.cells[0].innerText = i + 1;
    tbody.appendChild(linha);
  });
}

// --------------------
// Inicializar documentos no Firestore
// --------------------
function inicializarTimes() {
  times.forEach(time => {
    db.collection("times").doc(time).get().then(doc => {
      if (!doc.exists) {
        db.collection("times").doc(time).set({ pontos: 0 });
      }
    });
  });
}

// --------------------
// Snapshot Firestore
// --------------------
function iniciarSnapshot() {
  db.collection("times").onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const time = doc.id;
      const pontos = doc.data()?.pontos || 0;

      const tabela = document.getElementById("tabela").tBodies[0];
      for (const linha of tabela.rows) {
        if (linha.cells[1].innerText.trim() === time) {
          linha.cells[2].innerText = pontos;
        }
      }
    });
    atualizarPosicoes();
  });
}

// --------------------
// Inicialização completa
// --------------------
window.addEventListener("load", () => {
  inicializarTimes();
  iniciarSnapshot();
});
