var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Jogador';

function agregaMaos(jogadorExistente, jogador){
  jogadorExistente.maos += jogador.maos;

  jogadorExistente.preFlopFolds += jogador.preFlopFolds;
  jogadorExistente.preFlopFoldsBet += jogador.preFlopFoldsBet;
  jogadorExistente.preFlopLimps += jogador.preFlopLimps;
  jogadorExistente.preFlopChecks += jogador.preFlopChecks;
  jogadorExistente.preFlopCalls += jogador.preFlopCalls;
  jogadorExistente.preFlopRaises += jogador.preFlopRaises;
  jogadorExistente.preFlopRaiseFolds += jogador.preFlopRaiseFolds;
  jogadorExistente.preFlopRaiseCalls += jogador.preFlopRaiseCalls;
  jogadorExistente.preFlop3Bets += jogador.preFlop3Bets;
  jogadorExistente.preFlop4Bets += jogador.preFlop4Bets;
}

function calculaDadosEstatisticos(jogador){
  jogador.estatisticas = {
    pfR: jogador.maos > 0 ? (((jogador.preFlopRaises + jogador.preFlop3Bets) * 100) / jogador.maos) : 0,
    pfCR: (jogador.preFlopFoldsBet + jogador.preFlopCalls + jogador.preFlop3Bets > 0) ? ((jogador.preFlopCalls * 100) / (jogador.preFlopFoldsBet + jogador.preFlopCalls + jogador.preFlop3Bets)) : 0,
    vpip: jogador.maos > 0 ? (((jogador.preFlopRaises + jogador.preFlop3Bets + jogador.preFlopCalls) * 100) / jogador.maos) : 0,
    pf3B: (jogador.preFlopFoldsBet + jogador.preFlopCalls + jogador.preFlop3Bets > 0) ? ((jogador.preFlop3Bets * 100) / (jogador.preFlopFoldsBet + jogador.preFlopCalls + jogador.preFlop3Bets)) : 0
  }
}

function agregarDadosJogadores(jogadores, callback){
  var count = 0;
  jogadores.forEach((jogador) => {
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
            if (count == jogadores.length){
                callback(null, `Dados Agregados`);
            }
          })
          .catch((err) => callback(err, null));// httpReturnHelper.error(res, err));
      })
      .catch((err) => callback(err, null));// httpReturnHelper.error(res, err));
    });
}

exports.listar = function(req, res) {
  return controller.listar(Jogador, res);
};

exports.consultar = function(req, res) {
  Jogador.findOne({ nome: req.params.nome })
    .then((jogador) => {
      if (!jogador){
        return httpReturnHelper.error(res, { message: `Jogador não encontrado` });
      }

      calculaDadosEstatisticos(jogador);

      return res.json(jogador);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.consultarVarios = function(req, res) {
  Jogador.find({ nome: {$in: req.body} })
    .then((jogadores) => {
      if (!jogadores){
        return httpReturnHelper.error(res, { message: `Jogadores não encontrados` });
      }

      jogadores.forEach((jogador) => {
        calculaDadosEstatisticos(jogador);
      })

      return res.json(jogadores);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.agregarDados = function(req, res) {
  agregarDadosJogadores(req.body, (err, data) => {
    if (err)
      console.log(err); //return httpReturnHelper.error(res, err);

    return httpReturnHelper.success(res, data, null);
  });
}

exports.agregarDadosJogadores = agregarDadosJogadores;
