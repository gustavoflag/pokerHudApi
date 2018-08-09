var mongoose = require('mongoose');
var controller = require('./controllerBase');
var jogadorController = require('./jogadorController');
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
  } else if (acao.indexOf("checks") != -1){
    jogador.preFlopChecks++;
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

exports.listar = function(req, res) {
  return controller.listar(Mao, res);
};

exports.inserir = function(req, res) {
  var novaMao = new Mao(req.body);

  Mao.findOne({ idPokerstars: novaMao.idPokerstars })
    .then((maoExistente) => {
      if (maoExistente){
        return httpReturnHelper.error(res, { message: `Mão já existente` });//res.status(440).json({ message: `Mão já existente` });
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

        jogadorController.agregarDadosJogadores(jogadoresSalvar, (err, data) => {
          if (err)
            console.log(err);

          return controller.inserir(novaMao, nomeItem, res);
        });
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
