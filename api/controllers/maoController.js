var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao){
  if (acao.indexOf("folds") != -1){
    jogador.preFlopFolds++;
  } else if (acao.indexOf("calls") != -1){
    jogador.preFlopCalls++;
  } else if (acao.indexOf("raises") != -1){
    //if (!jaRaise){
      jogador.preFlopRaises++;
    //} else {
    //  jogador.preFlop3Bets++;
    //}
    //return true;
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

        novaMao.preFlop.forEach((jogadorAcao) => {

          Jogador.findOne({ nome: jogadorAcao.nomeJogador })
            .then((jogadorExistente) => {
              if (!jogadorExistente){

                var novoJogador = new Jogador({
                  nome: jogadorAcao.nomeJogador
                });

                jogadoresJaConsolidados.push(novoJogador.nome);

                novoJogador.maos++;
                consolidaAcaoPreFlop(novoJogador, jogadorAcao.acao);

                novoJogador.save()
                  .then((jogador) => {
                    count++;
                    if (count === novaMao.preFlop.length){
                      return controller.inserir(novaMao, nomeItem, res);
                    }
                  })
                  .catch((err) => console.log(err));// httpReturnHelper.error(res, err));

              } else {

                if (jogadoresJaConsolidados.indexOf(jogadorExistente.nome) == -1){
                  jogadoresJaConsolidados.push(jogadorExistente.nome);

                  jogadorExistente.maos++;
                  consolidaAcaoPreFlop(jogadorExistente, jogadorAcao.acao);

                  jogadorExistente.save()
                    .then((jogador) => {
                      count++;
                      if (count === novaMao.preFlop.length){
                        return controller.inserir(novaMao, nomeItem, res);
                      }
                    })
                    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
                } else {
                  count++;
                  if (count === novaMao.preFlop.length){
                    return controller.inserir(novaMao, nomeItem, res);
                  }
                }
              }
            })
            .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
        });
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
