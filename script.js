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

let pecasInGame = [];
let jogadorPecas = [];
let botPecas = [];
let tabuleiroPecas = [];

$(document).ready(function () {
  oJogo();
});

function oJogo() {
  $("#start").on("click", () => {
    $("#start").remove();
    $("#dificuldade_txt").removeClass("hidden");
    $("#main_btns").append(
      ["Fácil", "Díficil", "Impossível"].map((text, i) => {
        return $("<div>", {
          text,
          class: `btn mx-1 ${i === 2 ? "btn_fear" : ""}`,
        }).on("click", () => start());
      })
    );
  });
}

function start() {
  pecasInGame = Array.from(Array(28).keys());
  jogadorPecas = [];
  botPecas = [];
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

  $(".container-opcoes-jogo").addClass("hidden");
  $(".container-jogo").removeClass("hidden");
  addPecasTela("jogador-pecas", jogadorPecas, "jogador");
  addPecasTela("bot-pecas", botPecas);

  // $("#img-bot").height($("#img-bot").width());
  $("#img-bot>img").attr("src", `https://robohash.org/${Date.now()}?bgset=bg2`);
  /* $("#img-jogador>img").attr(
    "src",
    `https://robohash.org/${Date.now()}?set=set5`
  ); */

  // jogoState(jogadorMaior >= botMaior ? 0 : 1);
  jogoState(1);
}

async function jogoState(t) {
  let turno = t;
  let pontas = [];
  while (
    jogadorPecas.length > 0 &&
    botPecas.length > 0 &&
    pecasInGame.length > 0
  ) {
    $(".list-pecas").removeClass("is-turno");
    $(`#${{ 0: "jogador", 1: "bot" }[turno]}-pecas`).addClass("is-turno");
    $(`#img-${{ 1: "jogador", 0: "bot" }[turno]}`).removeClass("is-turno");
    $(`#img-${{ 0: "jogador", 1: "bot" }[turno]}`).addClass("is-turno");

    console.debug(turno);
    console.debug(pecasInGame);
    console.debug(botPecas);
    console.debug(jogadorPecas);

    let peca;

    if (turno === 1) {
      await delay((Math.floor(Math.random() * 4) + 1) * 1000);
      const vl = botPecas[Math.floor(Math.random() * botPecas.length)];
      botPecas = botPecas.filter((p) => p != vl);
      $(`.peca-container[id=peca_${vl}]`).remove();
      peca = vl;
    } else {
      await new Promise((res) => {
        $(".peca.jogador")
          .off("click")
          .on("click", function () {
            const [_, vl] = $($(this).parent()).attr("id").split("_");
            jogadorPecas = jogadorPecas.filter((p) => p != vl);
            $(this).parent().remove();
            peca = vl;
            res();
          });
      });
    }

    tabuleiroPecas.push(peca);
    addPecasTela("tabuleiro", [peca]);

    turno = !turno * 1;
  }
  console.debug("cabo");
}

function addPecasTela(id, listPecas, extra = "") {
  $(`#${id}`).append(
    listPecas.map((p) => {
      const [p1, p2] = pecas[p];
      return $("<div>", { id: `peca_${p}`, class: "peca-container" }).append(
        $("<div>", { class: `peca ${extra}` })
          .append($("<div>", { class: `peca_metade p1 vl_${p1}` }))
          .append($("<div>", { class: `peca_metade p2 vl_${p2}` }))
      );
    })
  );
}

const delay = (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};
