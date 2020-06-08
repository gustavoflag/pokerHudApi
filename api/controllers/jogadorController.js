var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Jogador';

function agregaMaos(jogadorExistente, jogador){
  jogadorExistente.maos += jogador.maos;

  //Pre-Flop
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

  //Flop
  jogadorExistente.flops += jogador.flops;
  jogadorExistente.flopBets += jogador.flopBets;
  jogadorExistente.flopRaises += jogador.flopRaises;
  jogadorExistente.flopCBets += jogador.flopCBets;
  jogadorExistente.flopCBetCalls += jogador.flopCBetCalls;
  jogadorExistente.flopCBetRaises += jogador.flopCBetRaises;
  jogadorExistente.flopFolds += jogador.flopFolds;
  jogadorExistente.flopCBetFolds += jogador.flopCBetFolds;
  jogadorExistente.flopChecks += jogador.flopChecks;
  jogadorExistente.flopCheckRaises += jogador.flopCheckRaises;
  jogadorExistente.flopCheckCalls += jogador.flopCheckCalls;
  jogadorExistente.flopCheckFolds += jogador.flopCheckFolds;
  jogadorExistente.flopCalls += jogador.flopCalls;

  //Turn
  jogadorExistente.turns += jogador.turns;
  jogadorExistente.turnBets += jogador.turnBets;
  jogadorExistente.turnFolds += jogador.turnFolds;
  jogadorExistente.turnRaises += jogador.turnRaises;
  jogadorExistente.turnCalls += jogador.turnCalls;
  jogadorExistente.turnChecks += jogador.turnChecks;
  jogadorExistente.turnCheckRaises += jogador.turnCheckRaises;
  jogadorExistente.turnCheckCalls += jogador.turnCheckCalls;
  jogadorExistente.turnCheckFolds += jogador.turnCheckFolds;

  //River
  jogadorExistente.rivers += jogador.rivers;
  jogadorExistente.riverBets += jogador.riverBets;
  jogadorExistente.riverFolds += jogador.riverFolds;
  jogadorExistente.riverRaises += jogador.riverRaises;
  jogadorExistente.riverCalls += jogador.riverCalls;
  jogadorExistente.riverChecks += jogador.riverChecks;
  jogadorExistente.riverCheckRaises += jogador.riverCheckRaises;
  jogadorExistente.riverCheckCalls += jogador.riverCheckCalls;
  jogadorExistente.riverCheckFolds += jogador.riverCheckFolds;
}

function calculaDadosEstatisticos(jogador){
  if (jogador.maos > 0){
    jogador.estatisticas = {
      //fs: (jogador.maos > 0) ? (((jogador.maos - jogador.preFlopFoldsBet - jogador.preFlopFolds - jogador.preFlopRaiseFold) * 100) / (jogador.maos)) : 0,
      vpip: ((jogador.preFlopRaises + jogador.preFlop3Bets + jogador.preFlopCalls + jogador.preFlopLimps) * 100) / jogador.maos,
      pfR: ((jogador.preFlopRaises + jogador.preFlop3Bets) * 100) / jogador.maos,
      pf3B: (jogador.preFlop3Bets * 100) / jogador.maos,
      pfF3B: (jogador.preFlopRaiseFolds * 100) / (jogador.preFlopRaiseFolds + jogador.preFlopRaiseCalls + jogador.preFlop4Bets),
      CR: ((jogador.flopCheckRaises + jogador.turnCheckRaises + jogador.riverCheckRaises) * 100
            / (jogador.flopCheckRaises + jogador.flopCheckCalls + jogador.flopCheckFolds
              + jogador.turnCheckRaises + jogador.turnCheckCalls + jogador.turnCheckFolds
              + jogador.riverCheckRaises + jogador.riverCheckCalls + jogador.riverCheckFolds)),
      CBet: ((jogador.flopCBets * 100) / (jogador.preFlopRaises - jogador.preFlopRaiseCalls - jogador.preFlopRaiseFolds + jogador.preFlop3Bets + jogador.preFlop4Bets)),
      FCBet:((jogador.flopCBetFolds * 100 ) / (jogador.flopCBetCalls + jogador.flopCBetRaises + jogador.flopCBetFolds))
    }
  }
  

  jogador.estatisticas.vpip_pfR = jogador.estatisticas.vpip.toFixed(0).toString() + '/' 
                                + jogador.estatisticas.pfR.toFixed(0).toString();
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
          .catch((err) => {
            console.log('JOGADOR CONTROLLE ERROR', 63, err);
            callback(err, null)
          });// httpReturnHelper.error(res, err));
      })
      .catch((err) => {
        console.log('JOGADOR CONTROLLE ERROR', 68, err);
        callback(err, null);
      });// httpReturnHelper.error(res, err));
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
    .catch((err) => {
      console.log('err', err);
      res.status(440).json({error: err})
    });
};

exports.consultarVarios = function(req, res) {
  Jogador.find({ nome: {$in: req.body} }).collation({ locale: "en" }).sort({ nome: 1 })
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

exports.consultarTodos = function(req, res) {
  Jogador.find({ maos: { $gt: 50 } }).collation({ locale: "en" }).sort({ nome: 1 })
    .then((jogadores) => {
      jogadores.forEach((jogador) => {
        calculaDadosEstatisticos(jogador);
      });

      if (req.params && req.params.order){
        let isAsc = false;
        if (req.params.asc){
          isAsc = req.params.asc == 'true' || req.params.asc == '1';
        }
        jogadores = sort(jogadores, req.params.order, isAsc);
      }

      return res.json(jogadores);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

function sort(jogadores, campo, isAsc){
  return jogadores.sort((a, b)=>{
    switch (campo) {
      case 'vpip': return compare(a.estatisticas.vpip, b.estatisticas.vpip, isAsc);
      case 'pfR': return compare(a.estatisticas.pfR, b.estatisticas.pfR, isAsc);
      case 'pf3B': return compare(a.estatisticas.pf3B, b.estatisticas.pf3B, isAsc);
      case 'pfF3B': return compare(a.estatisticas.pfF3B, b.estatisticas.pfF3B, isAsc);
      case 'CR': return compare(a.estatisticas.CR, b.estatisticas.CR, isAsc);
      case 'CBet': return compare(a.estatisticas.CBet, b.estatisticas.CBet, isAsc);
      case 'FCBet': return compare(a.estatisticas.FCBet, b.estatisticas.FCBet, isAsc);
      default: return 0;
    }
  });
  
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

exports.agregarDados = function(req, res) {
  agregarDadosJogadores(req.body, (err, data) => {
    if (err)
      console.log(err); //return httpReturnHelper.error(res, err);

    return httpReturnHelper.success(res, data, null);
  });
};

exports.autoCompleteNome = function(req, res) {
  var regex = new RegExp('^'+req.params.nome, 'i');
  Jogador.find({nome: regex},  { 'nome': 1 }).limit(20)
    .then((jogadores) => {
      if (!jogadores){
        return res.json([]);
      }

      return res.json(jogadores);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(440).json({error: err})
    });
};

exports.agregarDadosJogadores = agregarDadosJogadores;
