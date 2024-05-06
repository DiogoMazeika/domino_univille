$(document).ready(async function () {
  /* variaveis */
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
  let pontas = [];
  let jogadas = 0;
  let skipRes = () => {};
  const music = new Audio();

  /* funções auxiliares */
  const delay = (ms) => {
    return new Promise((res) => setTimeout(res, ms));
  };

  const thisPontas = (peca, pontas) =>
    pontas.filter((p) => pecas[peca]?.includes(p));

  const addPecasTabuleiro = (peca, { x1, x2, y1, y2 }, inverter) => {
    const [p1, p2] = pecas[peca];
    $('#tabuleiro').append(
      $('<div>', {
        class: 'tabuleiro-peca-container',
        style: `grid-row: ${y1}/${y2}; grid-column: ${x1}/${x2};`,
      }).append(
        $('<div>', { id: `peca_${peca}`, class: 'peca-container' }).append(
          $('<div>', { class: 'peca' })
            .append(
              $('<div>', { class: `peca_metade p1 vl_${inverter ? p2 : p1}` })
            )
            .append(
              $('<div>', { class: `peca_metade p2 vl_${inverter ? p1 : p2}` })
            )
        )
      )
    );
  };

  const addPlaceholders = (listPositions, [l0, l1], peca) => {
    const placeholders = [];

    if (peca.includes(l0)) {
      placeholders.push({
        div: $('<div>', {
          class: 'peca-placeholder',
          id: 'placeholder-start',
        }),
        i: 0,
      });
    }
    if (peca.includes(l1)) {
      placeholders.push({
        div: $('<div>', {
          class: 'peca-placeholder',
          id: 'placeholder-end',
        }),
        i: 1,
      });
    }

    placeholders.forEach(({ div, i }) => {
      const { x1, x2, y1, y2 } = listPositions[i];
      $('#tabuleiro').append(
        $('<div>', {
          class: 'tabuleiro-peca-container tabuleiro-placeholder-container',
          style: `grid-row: ${y1}/${y2}; grid-column: ${x1}/${x2};`,
        }).append($('<div>', { class: 'peca-container' }).append(div))
      );
    });

    return placeholders;
  };

  const addPecasTela = (id, listPecas, extra = '') => {
    const pieces = listPecas.map((p) => {
      const [p1, p2] = pecas[p];
      return $('<div>', { id: `peca_${p}`, class: 'peca-container' }).append(
        $('<div>', { class: `peca ${extra}` })
          .append($('<div>', { class: `peca_metade p1 vl_${p1}` }))
          .append($('<div>', { class: `peca_metade p2 vl_${p2}` }))
      );
    });
    $(`#${id}`).append(pieces);
    return pieces;
  };

  const loja = async (id, jogador = '') => {
    const vl = pecasInGame[Math.floor(Math.random() * pecasInGame.length)];
    pecasInGame = pecasInGame.filter((p) => p != vl);
    const [peca] = addPecasTela(`${id}-pecas`, [vl], jogador);
    if (pecasInGame.length < 1) $('#store').remove();

    if (id === 'bot') {
      botPecas.push(vl);
      return delay(1000).then(() => vl);
    }
    jogadorPecas.push(vl);
    return peca;
  };

  const jogadasPossiveis = (listPecas, pontas) => {
    return listPecas.filter(
      (peca) => pecas[peca].filter((p) => pontas.includes(p)).length > 0
    );
  };

  /* funções para controle de audio */
  const musicControl = (stop, vl = 0, nm) => {
    if (stop && music != null) {
      music.pause();
    } else {
      music.src = `p${nm ?? vl}.mp3`;
      music.play();
      music.onended = () => {
        musicControl(false, (vl + 1) % 3, nm);
      };
    }
  };

  const musicBtn = (jogoOn) => {
    $('#musica')
      .off('click')
      .on('click', function () {
        const status = $(this).attr('status');
        if (status === 'off') {
          $(this).attr('status', 'on');
          $(this).text('🔈');
          $(this).css('margin-right', '10px');
          if (jogoOn) musicControl(false, 0, '_lol');
          else musicControl(false);
        } else {
          $(this).attr('status', 'off');
          $(this).text('🔈X');
          $(this).css('margin-right', '0');
          musicControl(true);
        }
      });
  };

  /* funções para ações do bot */
  const botJogadaOpts = {
    0: (l, pontas) => {
      let list = l;
      let vl;
      while (thisPontas(vl, pontas).length < 1 && list.length > 0) {
        list = list.filter((p) => p != vl);
        vl = list[Math.floor(Math.random() * list.length)];
      }
      return [
        vl,
        list.length < 1,
        thisPontas(vl, pontas).includes(pontas[0]) ? 'start' : 'end',
      ];
    },
    1: (l, pontas) => {
      // console.debug([...pecasInGame, ...jogadorPecas]);
      const jogaveis = l
        .filter((p) => thisPontas(p, pontas).length > 0)
        .sort((a, b) => b - a);
      const carroca = jogaveis.find((p) => pecas[p][0] === pecas[p][1]);
      console.debug(jogaveis, carroca); //.find((p) => pecas[p][0] === pecas[p][1]));

      return [
        carroca ?? jogaveis[0],
        jogaveis.length < 1,
        thisPontas(carroca ?? jogaveis[0], pontas).includes(pontas[0])
          ? 'start'
          : 'end',
      ];
    },
  };

  /* funções para controle do jogo */
  const jogoState = async (t, dificuldade) => {
    let turno = t;
    let skippings = 0;
    const positions = {
      start: { x1: 50, x2: 53, y1: 3, y2: 5 },
      end: { x1: 53, x2: 56, y1: 3, y2: 5 },
    };
    while (jogadorPecas.length > 0 && botPecas.length > 0 && skippings < 2) {
      $('.list-pecas').removeClass('is-turno');
      $(`#${{ 0: 'jogador', 1: 'bot' }[turno]}-pecas`).addClass('is-turno');
      $(`#img-${{ 1: 'jogador', 0: 'bot' }[turno]}`).removeClass('is-turno');
      $(`#img-${{ 0: 'jogador', 1: 'bot' }[turno]}`).addClass('is-turno');
      if (turno === 0) $('.peca.jogador').addClass('is-turno');

      let peca;
      let position = 'end';

      $('.peca.jogador.is-turno').off('click');

      if (turno === 1) {
        await delay((Math.floor(Math.random() * 4) + 1) * 1000);
        let vl;
        let comprar = false;

        if (pontas.length < 1) vl = Math.max(...botPecas);
        else
          [vl, comprar, position] = botJogadaOpts[dificuldade](
            botPecas,
            pontas
          );

        if (comprar) {
          let newPeca;
          while (
            thisPontas(newPeca, pontas).length < 1 &&
            pecasInGame.length > 0
          ) {
            newPeca = await loja('bot');
          }
          if (thisPontas(newPeca, pontas).length > 0) vl = newPeca;
          position = thisPontas(newPeca, pontas).includes(pontas[0])
            ? 'start'
            : 'end';
        }

        if (vl !== undefined) {
          botPecas = botPecas.filter((p) => p != vl);
          $(`.peca-container[id=peca_${vl}]`).remove();
          peca = vl;
        }
      } else {
        const a = async function (res, div) {
          console.debug(div);
          $('.tabuleiro-placeholder-container').remove();
          const [_, vl] = $($(div).parent()).attr('id').split('_');
          const lados = thisPontas(vl, pontas);
          if (lados.length < 1) {
            return;
          }

          await new Promise((resP) => {
            addPlaceholders(
              [positions.start, positions.end],
              pontas,
              pecas[vl]
            ).forEach(({ div: placeholder }) => {
              $(placeholder).on('click', function () {
                [, position] = $(this).attr('id').split('-');
                $('.tabuleiro-placeholder-container').remove();
                resP();
              });
            });
          });
          jogadorPecas = jogadorPecas.filter((p) => p != vl);
          $(div).parent().remove();
          peca = vl;
          res();
        };

        jogadas = jogadasPossiveis(jogadorPecas, pontas).length;
        $('#store')
          .off('click')
          .on('click', async function () {
            if ($('#jogador-pecas').hasClass('is-turno') && jogadas < 1) {
              const newPeca = await loja('jogador', 'jogador');
              $(newPeca)
                .find('>div')
                .on('click', async function () {
                  const $div = this;
                  a(skipRes, $div);
                });
              console.debug(newPeca);
              jogadas = jogadasPossiveis(jogadorPecas, pontas).length;
            }
          });

        $('#skip')
          .off('click')
          .on('click', function () {
            if (
              $('#jogador-pecas').hasClass('is-turno') &&
              jogadas < 1 &&
              pecasInGame.length < 1
            ) {
              $('.tabuleiro-placeholder-container').remove();
              skipRes();
            }
          });

        await new Promise(async (res) => {
          skipRes = res;
          $('.peca.jogador.is-turno').on('click', async function () {
            const $div = this;
            a(res, $div);
          });
        });
        console.debug('res');
      }

      const ps = position === 'start';
      let inverter = false;
      if (peca !== undefined) {
        if (pontas.length < 1) {
          pontas = pecas[peca];
        } else {
          inverter = ps
            ? pontas[0] !== pecas[peca][1]
            : pontas[1] !== pecas[peca][0];

          pontas = [
            ps
              ? pecas[peca].find((p) => !pontas.includes(p)) ?? pecas[peca][1]
              : pontas[0],
            !ps
              ? pecas[peca].find((p) => !pontas.includes(p)) ?? pecas[peca][0]
              : pontas[1],
          ];
        }

        console.debug(pontas);

        tabuleiroPecas.push(peca);
        addPecasTabuleiro(peca, positions[position], inverter);

        if (ps) {
          positions[position].x2 = positions[position].x1;
          positions[position].x1 = positions[position].x1 - 3;
        } else {
          positions[position].x1 = positions[position].x2;
          positions[position].x2 = positions[position].x2 + 3;
        }
        skippings--;
      } else {
        skippings++;
      }

      turno = !turno * 1;
    }
    if (skippings === 2) {
      alert('empata');
    } else if (jogadorPecas.length < 1) {
      alert('winner winner chicken dinner');
    } else {
      alert('wasted');
    }
    console.debug('cabo');
  };

  const start = (dificuldade) => {
    pecasInGame = Array.from(Array(28).keys());
    jogadorPecas = [];
    botPecas = [];
    let jogadorMaior = 0;
    let botMaior = 0;

    if ($('#musica').attr('status') === 'on') {
      musicControl(true);
      musicControl(false, 0, '_lol');
    }
    musicBtn(true);

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

    $('.topbar').addClass('hidden');
    $('.conteudo').addClass('full');
    $('.container-opcoes-jogo').addClass('hidden');
    $('.container-jogo').removeClass('hidden');
    addPecasTela('jogador-pecas', jogadorPecas, 'jogador');
    addPecasTela('bot-pecas', botPecas);

    // $("#img-bot").height($("#img-bot").width());
    $('#img-bot>img').attr(
      'src',
      `https://robohash.org/${Date.now()}?bgset=bg2`
    );
    $('#img-jogador>img').attr(
      'src',
      `https://robohash.org/${Date.now()}?set=set4`
    );
    const $tabuleiroContainer = $('#tabuleiro-container');
    const scrollLeftMax =
      $tabuleiroContainer[0].scrollWidth - $tabuleiroContainer[0].clientWidth;
    $tabuleiroContainer.scrollLeft(scrollLeftMax / 2);

    // jogoState(jogadorMaior >= botMaior ? 0 : 1);
    jogoState(1, dificuldade);
  };

  const oJogo = () => {
    $('#start').on('click', () => {
      $('#start').remove();
      $('#dificuldade_txt').removeClass('hidden');
      $('#main_btns').append(
        ['Fácil', 'Impossível'].map((text, i) => {
          return $('<div>', {
            text,
            class: `btn mx-1 ${i === 1 ? 'btn_fear' : ''}`,
          }).on('click', () => start(i));
        })
      );
    });
  };

  /* começo */
  oJogo();
  musicBtn();
});
