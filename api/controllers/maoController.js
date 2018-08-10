var mongoose = require('mongoose');
var controller = require('./controllerBase');
var jogadorController = require('./jogadorController');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao, jaRaise){
  if (acao.indexOf("folds") != -1){
    if (!jaRaise){
      jogador.preFlopFolds++;
    } else {
      if (jogador.preFlopRaises > 0 || jogador.preFlop3Bets > 0){
        if (jogador.preFlopRaiseFolds == 0){
            jogador.preFlopRaiseFolds++;
        }
      } else {
        jogador.preFlopFoldsBet++;
      }
    }
    return false;
  } else if (acao.indexOf("calls") != -1){
    if (!jaRaise){
      jogador.preFlopLimps++;
    } else {
      if (jogador.preFlopRaises > 0 || jogador.preFlop3Bets > 0){
        if (jogador.preFlopRaiseCalls == 0){
          jogador.preFlopRaiseCalls++;
        }
      } else {
        if (jogador.preFlopCalls == 0 && jogador.preFlopLimps == 0){
          jogador.preFlopCalls++;
        }
      }
    }
    return false;
  } else if (acao.indexOf("checks") != -1){
    jogador.preFlopChecks++;
    return false;
  } else if (acao.indexOf("raises") != -1){
    if (!jaRaise){
      jogador.preFlopRaises++;
    } else {
      if (jogador.preFlopRaises > 0){
        jogador.preFlop4Bets++;
      } else {
        jogador.preFlop3Bets++;
      }
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

        var jogadoresSalvar = [];
        var jaRaise = false;

        novaMao.preFlop.forEach((jogadorAcao) => {

            var jogador = jogadoresSalvar.find((jogador) => jogador.nome == jogadorAcao.nomeJogador);

            if (!jogador){
              jogador = new Jogador({
                nome: jogadorAcao.nomeJogador
              });
              jogador.maos++;

              jogadoresSalvar.push(jogador);
            }

            var jaRaiseLocal = consolidaAcaoPreFlop(jogador, jogadorAcao.acao, jaRaise);
            jaRaise = jaRaise || jaRaiseLocal;

        });

        //console.log(jogadoresSalvar);

        jogadorController.agregarDadosJogadores(jogadoresSalvar, (err, data) => {
          if (err)
            console.log(err);

          return controller.inserir(novaMao, nomeItem, res);
        });
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
