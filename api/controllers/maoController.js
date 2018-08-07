var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao, jaRaise){

  console.log('jogador:', jogador.nome, ' acao:', acao, ' jaRaise:', jaRaise);

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

        var count = 0;
        var jogadoresJaConsolidados = [];
        var jogadoresSalvar = [];
        var jaRaise = false;

        novaMao.preFlop.forEach((jogadorAcao) => {
          if (jogadoresJaConsolidados.indexOf(jogadorAcao.nomeJogador) == -1){
            jogadoresJaConsolidados.push(jogadorAcao.nomeJogador);
            /*
            console.log('jogador:', jogadorAcao.nomeJogador);
            console.log('acao:', jogadorAcao.acao);
            */

            var jogador = new Jogador({
              nome: jogadorAcao.nomeJogador
            });

            jogador.maos++;
            var jaRaiseLocal = consolidaAcaoPreFlop(jogador, jogadorAcao.acao, jaRaise);

            jaRaise = jaRaise || jaRaiseLocal;

            jogadoresSalvar.push(jogador);
          }
        });

        jogadoresSalvar.forEach((jogador) => {
          Jogador.findOne({ nome: jogadorAcao.nomeJogador })
            .then((jogadorExistente) => {
              if (!jogadorExistente){
                jogador.save()
                  .then((jogador) => {
                    count++;
                    if (count === novaMao.preFlop.length){
                      return controller.inserir(novaMao, nomeItem, res);
                    }
                  })
                  .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
              } else {
                //jogadorExistente
              }
            }
        });


        //console.log(jogadoresSalvar);


/*
            Jogador.findOne({ nome: jogadorAcao.nomeJogador })
              .then((jogadorExistente) => {
                if (!jogadorExistente){

                  console.log('inserindo novo jogador:', jogadorAcao.nomeJogador);
                  console.log('acao:', jogadorAcao.acao);

                  var novoJogador = new Jogador({
                    nome: jogadorAcao.nomeJogador
                  });

                  novoJogador.maos++;
                  jaRaise = jaRaise || consolidaAcaoPreFlop(novoJogador, jogadorAcao.acao, jaRaise);

                  novoJogador.save()
                    .then((jogador) => {
                      count++;
                      if (count === novaMao.preFlop.length){
                        return controller.inserir(novaMao, nomeItem, res);
                      }
                    })
                    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));

                } else {

                  console.log('alterando jogador:', jogadorAcao.nomeJogador);
                  console.log('acao:', jogadorAcao.acao);

                  jogadorExistente.maos++;
                  jaRaise = jaRaise || consolidaAcaoPreFlop(jogadorExistente, jogadorAcao.acao, jaRaise);

                  jogadorExistente.save()
                    .then((jogador) => {
                      count++;
                      if (count === novaMao.preFlop.length){
                        return controller.inserir(novaMao, nomeItem, res);
                      }
                    })
                    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));

                }
              })
              .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
            } else {
              count++;
              if (count === novaMao.preFlop.length){
                return controller.inserir(novaMao, nomeItem, res);
              }
            }*/
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
