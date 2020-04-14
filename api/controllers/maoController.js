var mongoose = require('mongoose');
var controller = require('./controllerBase');
var jogadorController = require('./jogadorController');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');

var nomeItem = 'Mão';
var maosPendentes = [];
var emProcessamento = false;

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
        if (jogador.preFlopCalls > 0){
          jogador.preFlopCalls = 0;
        }
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

exports.consultar = function(req, res) {
  Mao.findOne({ idPokerstars: "#" + req.params.idPokerstars })
    .then((mao) => {
      if (!mao){
        return httpReturnHelper.error(res, { message: `Mão não encontrada` });
      }

      return res.json(mao);
    })
    .catch((err) => {
      res.status(440).json({error: err})
    });
};

function processaMaosPendentes(){
  emProcessamento = true;

  var novaMao = maosPendentes[0];

  var jogadoresSalvar = [];
  var jaRaise = false;

  console.log('processando mão:', novaMao.idPokerstars);

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

  jogadorController.agregarDadosJogadores(jogadoresSalvar, (err, data) => {
    if (err){
      console.log('Erro ao processar', err);
      emProcessamento = false;
    } else {
      maosPendentes.splice(0, 1);
      if (maosPendentes.length > 0){
        processaMaosPendentes();
      } else {
        emProcessamento = false;
      }
    }          
  });
}

exports.inserir = function(req, res) {
  var novaMao = new Mao(req.body);

  Mao.findOne({ idPokerstars: novaMao.idPokerstars })
    .then((maoExistente) => {
      if (maoExistente){
        return res.status(440).json({ message: `Mão já existente` });
      } else {
        var jogadoresSalvar = [];
        novaMao.preFlop.forEach((jogadorAcao) => {
          var jogador = jogadoresSalvar.find((jogador) => jogador == jogadorAcao.nomeJogador);
          if (!jogador){
            jogadoresSalvar.push(jogadorAcao.nomeJogador);
          }
        });

        if (jogadoresSalvar.length < 5){
          return res.status(440).json({ message: `Mão com menos de 5 jogadores, não será importada` });
        } else {
          novaMao.save()
            .then((item) => {
              maosPendentes.push(item);
              if (!emProcessamento){
                processaMaosPendentes();
              }
              return res.json({ message: `Mão incluída`, obj: item });
            })
            .catch((err) => {
              return res.status(440).json({error: err});
            }); 
        }  
      }  
    })
    .catch((err) => { 
      return res.status(440).json({error: err}) ;
    });
};
