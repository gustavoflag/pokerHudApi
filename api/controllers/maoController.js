var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao){
  if (acao.indexOf("folds") != -1){
    jogador.preFlop.folds++;
  } else if (acao.indexOf("calls") != -1){
    jogador.preFlop.calls++;
  } else if (acao.indexOf("raises") != -1){
    jogador.preFlop.raises++;
  }
  console.log(jogador);
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

        novaMao.preFlop.forEach((jogadorAcao) => {
          Jogador.findOne({ nome: jogadorAcao.nomeJogador })
            .then((jogadorExistente) => {
              if (!jogadorExistente){

                var novoJogador = new Jogador({
                  nome: jogadorAcao.nomeJogador,
                  preFlop: { }
                });

                novoJogador.maos++;
                //consolidaAcaoPreFlop(novoJogador, jogadorAcao.acao);

                if (jogadorAcao.acao.indexOf("folds") != -1){
                  novoJogador.preFlop.folds++;
                } else if (jogadorAcao.acao.indexOf("calls") != -1){
                  novoJogador.preFlop.calls++;
                } else if (jogadorAcao.acao.indexOf("raises") != -1){
                  novoJogador.preFlop.raises++;
                }
                console.log(novoJogador);

                novoJogador.save()
                  .then((jogador) => {
                    count++;
                    if (count === novaMao.preFlop.length){
                      return controller.inserir(novaMao, nomeItem, res);
                    }
                  })
                  .catch((err) => console.log(err));// httpReturnHelper.error(res, err));

              } else {

                jogadorExistente.maos++;
                //consolidaAcaoPreFlop(jogadorExistente, jogadorAcao.acao);

                if (jogadorAcao.acao.indexOf("folds") != -1){
                  jogadorExistente.preFlop.folds++;
                } else if (jogadorAcao.acao.indexOf("calls") != -1){
                  jogadorExistente.preFlop.calls++;
                } else if (jogadorAcao.acao.indexOf("raises") != -1){
                  jogadorExistente.preFlop.raises++;
                }
                console.log(jogadorExistente);

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
        });
      }
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};
