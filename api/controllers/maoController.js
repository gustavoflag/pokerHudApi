var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao, jaRaise){
  if (acao.indexOf("folds") != -1){
    jogador.preFlopFolds++;
    return false;
  } else if (acao.indexOf("calls") != -1){
    jogador.preFlopCalls++;
    return false;
  } else if (acao.indexOf("raises") != -1){
    if (!jaRaise){
      jogador.preFlopRaises++;
    } else {
      jogador.preFlop3Bets++;
    }
    return true;
  }
}

function adicionaMao(jogadorExistente, jogador){
  jogadorExistente.maos += jogador.maos;
  jogadorExistente.preFlopFolds += jogador.preFlopFolds;
  jogadorExistente.preFlopCalls += jogador.preFlopCalls;
  jogadorExistente.preFlopRaises += jogador.preFlopRaises;
  jogadorExistente.preFlop3Bets += jogador.preFlop3Bets;
}

function salvarJogadores(jogadores, novaMao, res){
  var count = 0;

  jogadores.forEach((jogador) => {
    Jogador.findOne({ nome: jogador.nome })
      .then((jogadorExistente) => {
        if (!jogadorExistente){
          jogadorExistente = new Jogador({
            nome: jogador.nome
          });
        }
        adicionaMao(jogadorExistente, jogador);

        jogadorExistente.save()
          .then((jogador) => {
            count++;
            if (count === jogadores.length){
              return controller.inserir(novaMao, nomeItem, res);
            }
          })
          .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
      })
      .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
  });
}

exports.listar = function(req, res) {
  return controller.listar(Mao, res);
};

exports.inserir = function(req, res) {
  var novaMao = new Mao(req.body);

  Mao.findOne({ idPokerstars: novaMao.idPokerstars })
    .then((maoExistente) => {
      if (maoExistente){
        return res.status(440).json({ message: `Mão já existente` });
      } else {

        var jogadoresJaConsolidados = [];
        var jogadoresSalvar = [];
        var jaRaise = false;

        novaMao.preFlop.forEach((jogadorAcao) => {
          if (jogadoresJaConsolidados.indexOf(jogadorAcao.nomeJogador) == -1){
            jogadoresJaConsolidados.push(jogadorAcao.nomeJogador);

            var jogador = new Jogador({
              nome: jogadorAcao.nomeJogador
            });

            jogador.maos++;
            var jaRaiseLocal = consolidaAcaoPreFlop(jogador, jogadorAcao.acao, jaRaise);
            jaRaise = jaRaise || jaRaiseLocal;

            jogadoresSalvar.push(jogador);
          }
        });

        salvarJogadores(jogadoresSalvar, novaMao, res);
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
