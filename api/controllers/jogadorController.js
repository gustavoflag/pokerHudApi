var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Jogador';

function agregaMaos(jogadorExistente, jogador){
  jogadorExistente.maos += jogador.maos;
  jogadorExistente.preFlopFolds += jogador.preFlopFolds;
  jogadorExistente.preFlopCalls += jogador.preFlopCalls;
  jogadorExistente.preFlopRaises += jogador.preFlopRaises;
  jogadorExistente.preFlop3Bets += jogador.preFlop3Bets;
}

exports.listar = function(req, res) {
  return controller.listar(Jogador, res);
};

exports.agregarDados = function(req, res) {
  var count = 0;
  req.body.forEach((jogador) => {
    Jogador.findOne({ nome: jogador.nome })
      .then((jogadorExistente) => {
        if (!jogadorExistente){
          jogadorExistente = new Jogador({
            nome: jogador.nome
          });
        }
        
        agregaMaos(jogadorExistente, jogador);

        jogadorExistente.save()
          .then((jogador) => {
            count++;
            if (count == req.body.length){
                return httpReturnHelper.success(res, `Dados Agregados`);
            }
          })
          .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
      })
      .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
    });
}
