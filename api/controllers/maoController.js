var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Mão';

function consolidaAcaoPreFlop(jogador, acao){
  console.log(jogador);
  if (acao.indexOf("folds") != -1){
    jogador.preFlop.folds++;
  } else if (acao.indexOf("calls") != -1){
    jogador.preFlop.calls++;
  } else if (acao.indexOf("raises") != -1){
    jogador.preFlop.raises++;
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

        novaMao.preFlop.forEach((jogadorAcao) => {
          count++;
          Jogador.findOne({ nome: jogadorAcao.nomeJogador })
            .then((jogadorExistente) => {
              if (!jogadorExistente){

                var novoJogador = new Jogador({
                  nome: jogadorAcao.nomeJogador,
                  preFlop: { }
                });

                novoJogador.maos++;
                consolidaAcaoPreFlop(novoJogador, jogadorAcao.acao);

                novoJogador.save()
                  .then((jogador) => {
                    if (count === novaLista.itens.length){
                      return controller.inserir(novaMao, nomeItem, res);
                    }
                  })
                  .catch((err) => httpReturnHelper.error(res, err));

              } else {

                jogadorExistente.maos++;
                consolidaAcaoPreFlop(jogadorExistente, jogadorAcao.acao);

                jogadorExistente.save()
                  .then((jogador) => {
                    if (count === novaLista.itens.length){
                      return controller.inserir(novaMao, nomeItem, res);
                    }
                  })
                  .catch((err) => httpReturnHelper.error(res, err));
              }
            })
            .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
        });
      }
    })
    .catch((err) => httpReturnHelper.error(res, err));
};
