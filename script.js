const pecas = {
  0: [0, 0],
  1: [0, 1],
  2: [1, 1],
  3: [0, 2],
  4: [1, 2],
  5: [2, 2],
  6: [0, 3],
  7: [1, 3],
  8: [2, 3],
  9: [3, 3],
  10: [0, 4],
  11: [1, 4],
  12: [2, 4],
  13: [3, 4],
  14: [4, 4],
  15: [0, 5],
  16: [1, 5],
  17: [2, 5],
  18: [3, 5],
  19: [4, 5],
  20: [5, 5],
  21: [0, 6],
  22: [1, 6],
  23: [2, 6],
  24: [3, 6],
  25: [4, 6],
  26: [5, 6],
  27: [6, 6],
};

$(document).ready(function () {
  oJogo();
});

function oJogo() {
  $("#start").on("click", () => {
    $("#start").remove();
    $("#dificuldade_txt").removeClass("hidden");
    $("#main_btns").append(
      ["Fácil", "Díficil"].map((text) => {
        return $("<div>", { text, class: "btn mx-1" }).on("click", () =>
          start()
        );
      })
    );
  });
}

function start() {
  let pecasInGame = Array.from(Array(28).keys());
  const jogadorPecas = [];
  const botPecas = [];
  let jogadorMaior = 0;
  let botMaior = 0;

  console.debug(pecasInGame);
  while (jogadorPecas.length < 7) {
    const p = Math.floor(Math.random() * 27);
    if (pecasInGame.includes(p)) {
      const [p1, p2] = pecas[p];
      jogadorPecas.push(p);
      pecasInGame = pecasInGame.filter((o) => o !== p);
      if (jogadorMaior < p1 + p2) jogadorMaior = p1 + p2;
    }
  }

  while (botPecas.length < 7) {
    const p = Math.floor(Math.random() * 27);
    if (pecasInGame.includes(p)) {
      const [p1, p2] = pecas[p];
      botPecas.push(p);
      pecasInGame = pecasInGame.filter((o) => o !== p);
      if (botMaior < p1 + p2) botMaior = p1 + p2;
    }
  }
  console.debug(pecasInGame);
  console.debug(botPecas);
  console.debug(jogadorPecas);

  $(".container-opcoes-jogo").addClass("hidden");
  $(".container-jogo").removeClass("hidden");
  addPecasTela("jogador-pecas", jogadorPecas);
  addPecasTela("bot-pecas", botPecas);

  // jogoState(jogadorMaior >= botMaior ? "jogador" : "bot");
}

async function jogoState(t) {
  let turno = t;
  while (jogadorPecas.length > 0 || botPecas.length > 0 || pecasInGame > 0) {
    $(`#${turno}-pecas`).addClass("is-turno");
  }
}

function addPecasTela(id, listPecas) {
  $(`#${id}`).append(
    listPecas.map((p) => {
      const [p1, p2] = pecas[p];
      return $("<div>", { id: `peca_${p}`, class: "peca-container" }).append(
        $("<div>", { class: "peca" })
          .append($("<div>", { class: `peca_metade p1 vl_${p1}` }))
          .append($("<div>", { class: `peca_metade p2 vl_${p2}` }))
      );
    })
  );
}
