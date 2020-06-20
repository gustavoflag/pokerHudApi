var mongoose = require('mongoose');
var Torneio = mongoose.model('Torneio');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');

var jogadorController = require('./jogadorController');

var torneiosPendentes = [];
var emProcessamento = false;

exports.inserir = function(req, res) {
    Torneio.findOne({ idTorneio: req.body.idTorneio })
        .then((torneio) => {
            if (torneio){
                return res.json({ message: "Torneio já existe", obj: torneio._id });
            }
            var novoTorneio = new Torneio(req.body);
        
            novoTorneio.save()
            .then((torneioSalvo) => {
                return res.json({ message: "Torneio inserido", obj: torneioSalvo._id });
            })
            .catch((err) => res.status(440).json({error: err}));
        })
        .catch((err) => res.status(440).json({error: err}));
};

exports.inserirMao = function(req, res) {
    Torneio.findOne({ idTorneio: req.params.idTorneio })
        .then((torneio) => {
            if (!torneio){
                return res.status(440).json({ error: { message: `Torneio não encontrado` } });
            }

            if (torneio.maos.find(m => m.idMao == req.body.idMao)){
                return res.status(440).json({ error: { message: `Mão já inserida` } });
            }
      
            torneio.maos.push(req.body);

            torneio.save()
                .then((torneioSalvo) => {
                    return res.json({ message: "Mão inserida", obj: torneioSalvo._id });
                })
                .catch((err) => res.status(440).json({error: err}));
        })
        .catch((err) => {
            res.status(440).json({error: err})
        });
};

exports.consultar = function(req, res) {
  Torneio.findOne({ idTorneio: req.params.idTorneio })
    .then((torneio) => {
        if (!torneio){
            return res.status(440).json({ error: { message: `Torneio não encontrado` } });
        }
  
        return res.json(torneio);
    })
    .catch((err) => {
        res.status(440).json({error: err})
    });
};

exports.listar = function(req, res) {
  Torneio.find({})
    .then((torneios) => {
      let retorno = [];
      
      torneios.forEach(torn => {
        retorno.push({
          idTorneio: torn.idTorneio,
          processado: torn.processado
        })
      });

      return res.json(retorno);
    })
    .catch((err) => res.status(440).json({error: err}))
};

exports.consultarStatus = function(req, res) {
  Torneio.findOne({ idTorneio: req.params.idTorneio })
    .then((torneio) => {
      if (!torneio){
        return res.status(440).json({ error: { message: `Torneio não encontrado` } });
      }

      let statusTorneio = {
         idTorneio: torneio.idTorneio
        ,processado: torneio.processado
        ,maos: []
      }
  
      torneio.maos.forEach(mao => {
        let statusMao = { 
           idMao: mao.idMao
          ,processado: mao.processado
        };

        statusTorneio.maos.push(statusMao);
      });

      return res.json(statusTorneio);
    })
    .catch((err) => {
      res.status(440).json({error: err})
    });
};

exports.consultarMao = function(req, res) {
  Torneio.findOne({ idTorneio: req.params.idTorneio })
    .then((torneio) => {
        if (!torneio){
            return res.status(440).json({ error: { message: `Torneio não encontrado` } });
        }

        let maoTorneio = torneio.maos.find(m => m.idMao == req.params.idMao);
  
        return res.json(maoTorneio);
    })
    .catch((err) => {
        res.status(440).json({error: err})
    });
}

exports.processarMao = function(req, res) {
  Torneio.findOne({ idTorneio: req.params.idTorneio })
    .then((torneio) => {
        if (!torneio){
            return res.status(440).json({ error: { message: `Torneio não encontrado` } });
        }
  
        let maoTorneio = torneio.maos.find(m => m.idMao == req.params.idMao);
        if (maoTorneio.processado){
          return res.status(440).json({ error: { message: `Mão já processada` } });
        }

        Mao.findOne({ idPokerstars: "#" + req.params.idMao })
          .then((mao) => {
            if (!mao){
              return res.status(440).json({ error: { message: `Mão não encontrada` } });
            }

            processarMao(mao, (err, msg) => {
              if (err){
                console.log(`Mão: ${mao.idPokerstars} - Erro: ${err}`);
                return res.status(440).json({ error: err });
              } else {
                maoTorneio.processado = true;
        
                torneio.save()
                  .then((torneioSalvo) => {
                    console.log(`Mão: ${mao.idPokerstars} - Sucesso: ${msg}`);
                    return res.json({ message: msg });
                  })
                  .catch((err) => res.status(440).json({error: err}));                
            }
          });       
        })
        .catch((err) => {
          res.status(440).json({error: err})
        }); 
  })
  .catch((err) => {
    res.status(440).json({error: err})
  });    
}

const streets = {
    PRE_FLOP: 0,
    FLOP: 1,
    TURN: 2,
    RIVER: 3
}

exports.processar = function(req, res) {
    Torneio.findOne({ idTorneio: req.body.idTorneio })
        .then((torneio) => {
            if (!torneio){
                return res.status(440).json({ error: { message: `Torneio não encontrado` } });
            }

            res.json({ message: `Torneio ${torneio.idTorneio} em processamento` });

            torneiosPendentes.push(torneio);

            console.log(`Processando Torneio: #${torneio.idTorneio}`);
    
            if (!emProcessamento){
              emProcessamento = true;
              processarTorneiosPendentes();
            }            
        })
        .catch((err) => {
            console.log(err);
        });
};

function processarTorneiosPendentes(){
  let torneio = torneiosPendentes[0];

  processarTorneio(torneio, (err, msg) => {
    torneiosPendentes.splice(0, 1);
    if (torneiosPendentes.length > 0){
      processarTorneiosPendentes();
    } else {
      emProcessamento = false;
    }
  });
}

function processarTorneio(torneio, callback){
  maos = [];
  mao = {
      idPokerstars: ""
  };

  var leitura = false;            
  var street = 0;

  try{
      torneio.maos.forEach(maoTorneio => {
          maoTorneio.linhas.forEach(line => {
              if (line.indexOf("Hand #") != -1){
                  var pattern = /#\d*:/;
                  var res = line.match(pattern);
                  if (res){
                    mao.idPokerstars = res[0].replace(":", "");//.split(":")[0];
                  }
                  mao.preFlop = [];
                  mao.flop = [];
                  mao.turn = [];
                  mao.river = [];
                  street = streets.PRE_FLOP;
                } else if (line.indexOf("*** HOLE CARDS ***") != -1){
                  leitura = true;
                } else if (line.indexOf("*** FLOP ***") != -1){
                  leitura = true;
                  street++;
                } else if (line.indexOf("*** TURN ***") != -1) {
                  leitura = true;
                  street++;
                } else if (line.indexOf("*** RIVER ***") != -1){
                  leitura = true;
                  street++;
                } else if (line.indexOf("*** SHOW DOWN ***") != -1){
                  leitura = false;
                } else if (line.indexOf("*** SUMMARY ***") != -1){
                  leitura = false;
                  maos.push(mao);
                  mao = {
                    idPokerstars: ""
                  };
                } else if (line.indexOf("Dealt to ") != -1){
              
                } else if (line.indexOf("Uncalled bet ") != -1
                    || line.indexOf("collected ") != -1
                    || line.indexOf(" is sitting out") != -1
                    || line.indexOf(" has timed out") != -1
                    || line.indexOf(" has returned") != -1
                    || line.indexOf(" is disconnected") != -1
                    || line.indexOf(" is connected") != -1
                    || line.indexOf(" finished ") != -1
                    || line.indexOf(" said") != -1
                    || line.indexOf(" show hand") != -1
                    || line.indexOf(" shows ") != -1){
              
                } else if (line.indexOf(":") != -1){
                  if (leitura == true){
                    var sptLine = line.split(':');
                    var nome = sptLine[0];
                    var acao = "";
              
                    if (sptLine.length > 1){
                      acao = sptLine[1].trim();
                    }
              
                    if (nome != ""){
                      switch(street){
                        case streets.PRE_FLOP:
                          mao.preFlop.push({
                            nomeJogador: nome,
                            acao: acao
                          });
                          break;
                        case streets.FLOP: 
                          mao.flop.push({
                            nomeJogador: nome,
                            acao: acao
                          });
                          break;
                        case streets.TURN: 
                          mao.turn.push({
                            nomeJogador: nome,
                            acao: acao
                          });
                          break;
                        case streets.RIVER: 
                          mao.river.push({
                            nomeJogador: nome,
                            acao: acao
                          });
                          break;
                      }
                    }
                  }
                }
          });
      });
  } catch(e){
      console.log('exception', e);
  }

  insereMaoSync(maos, torneio, (err, msg) => {
    callback(err, 'torneio processado');
  });
}

//
function insereMaoSync(maos, torneio, callback){
  inserirMao(new Mao(maos[0]), (err, mensagem) => {
    if (err){
      console.log(`Mão: ${maos[0].idPokerstars} - Erro: ${err}`);
    } else {
      let maoTorneio = torneio.maos.find(m => "#" + m.idMao == maos[0].idPokerstars);
      maoTorneio.processado = true;
      console.log(`Mão: ${maos[0].idPokerstars} - Sucesso: ${mensagem}`);
    }

    maos.splice(0, 1);
    if (maos.length > 0){
      insereMaoSync(maos, torneio, callback);
    } else {
      
      let naoProcessados = torneio.maos.filter(m => !m.processado);
      if (naoProcessados && naoProcessados.length > 0){
        torneio.processado = false;  
      } else {
        torneio.processado = true;
      }     

      torneio.save()
        .then((torneioSalvo) => {
          console.log(`Torneio #${torneio.idTorneio} Processado`);
          callback(null, `Torneio #${torneio.idTorneio} Processado`);
        })
        .catch((err) => console.log(`Erro ao salvar #${torneio.idTorneio}`));  
      
    }
  });
}

function processarMao(novaMao, callback) {
  //console.log('novaMao', novaMao);
  try{
    var jogadoresSalvar = [];
    novaMao.preFlop.forEach((jogadorAcao) => {
      var jogador = jogadoresSalvar.find((jogador) => jogador == jogadorAcao.nomeJogador);
      if (!jogador){
        jogadoresSalvar.push(jogadorAcao.nomeJogador);
      }
    });
  
    if (jogadoresSalvar.length < 5){
      return callback(null, `Mão com menos de 5 jogadores, não será importada`);
    } else {
      novaMao.save()
        .then((item) => {
          var jogadoresSalvar = [];
          var jaRaise = false;
          var agressorPreFlop = null;
  
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
  
            var jogadorRaise = consolidaAcaoPreFlop(jogador, jogadorAcao.acao, jaRaise);
            if (jogadorRaise){
              agressorPreFlop = jogador;
            }
            jaRaise = jaRaise || jogadorRaise;
          });
  
          novaMao.flop.forEach((jogadorAcao) => {
            var jogador = jogadoresSalvar.find((jogador) => jogador.nome == jogadorAcao.nomeJogador);
            consolidaAcaoFlop(jogador, jogadorAcao.acao, agressorPreFlop);
          });
        
          novaMao.turn.forEach((jogadorAcao) => {
            var jogador = jogadoresSalvar.find((jogador) => jogador.nome == jogadorAcao.nomeJogador);
            consolidaAcaoTurn(jogador, jogadorAcao.acao);
          });
        
          novaMao.river.forEach((jogadorAcao) => {
            var jogador = jogadoresSalvar.find((jogador) => jogador.nome == jogadorAcao.nomeJogador);
            consolidaAcaoRiver(jogador, jogadorAcao.acao);
          });
        
          jogadorController.agregarDadosJogadores(jogadoresSalvar, (err, data) => {
            if (err){
              console.log('Erro ao processar', err);
              return callback(err, null);
            } else {
              return callback(null, `Mão processada`);
            }          
          });
  
          
        })
        .catch((err) => {
          return callback(err, null);
        }); 
    }  
  } catch (e){
    return callback(err, null);
  }
  
} 

function inserirMao(novaMao, callback) {  
    Mao.findOne({ idPokerstars: novaMao.idPokerstars })
      .then((maoExistente) => {
        if (maoExistente){
          return callback(null, `Mão já existente`);
        } else {
          processarMao(novaMao, (err, msg) => {
            return callback(err, msg);
          });
        }  
      })
      .catch((err) => { 
        return callback(err, null);
      });
};

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

function consolidaAcaoFlop(jogador, acao, agressorPreFlop){
  jogador.flops = 1;
  if (acao.indexOf("bets") != -1){
    jogador.flopBets++;

    if (jogador == agressorPreFlop){ //CBet
      jogador.flopCBets++;
    } 
  } else if (acao.indexOf("raises") != -1){
    jogador.flopRaises = 1;
    
    if (agressorPreFlop && agressorPreFlop.flopRaises > 0){
      jogador.flopCBetRaises = 1;
    }

    if (jogador.flopChecks > 0){
      jogador.flopCheckRaises = 1;
    } 
  } else if (acao.indexOf("checks") != -1){
    jogador.flopChecks++;
  } else if (acao.indexOf("folds") != -1){
    jogador.flopFolds++;

    if (agressorPreFlop && agressorPreFlop.flopRaises > 0){
      jogador.flopCBetFolds++;
    }

    if (jogador.flopChecks > 0){
      jogador.flopCheckFolds = 1;
    } 
  } else if (acao.indexOf("calls") != -1){
    jogador.flopCalls = 1;

    if (agressorPreFlop && agressorPreFlop.flopRaises > 0){
      jogador.flopCBetCalls = 1;
    }

    if (jogador.flopChecks > 0){
      jogador.flopCheckCalls = 1;
    } 
  }
}

function consolidaAcaoTurn(jogador, acao){
  jogador.turns = 1;
  if (acao.indexOf("bets") != -1){
    jogador.turnBets++;
  } else if (acao.indexOf("raises") != -1){
    jogador.turnRaises = 1;
    
    if (jogador.turnChecks > 0){
      jogador.turnCheckRaises = 1;
    } 
  } else if (acao.indexOf("checks") != -1){
    jogador.turnChecks++;
  } else if (acao.indexOf("folds") != -1){
    jogador.turnFolds++;
    
    if (jogador.turnChecks > 0){
      jogador.turnCheckFolds = 1;
    } 
  } else if (acao.indexOf("calls") != -1){
    jogador.turnCalls = 1;

    if (jogador.turnChecks > 0){
      jogador.turnCheckCalls = 1;
    } 
  }
}

function consolidaAcaoRiver(jogador, acao){
  jogador.rivers = 1;
  if (acao.indexOf("bets") != -1){
    jogador.riverBets++;
  } else if (acao.indexOf("raises") != -1){
    jogador.riverRaises = 1;
    
    if (jogador.riverChecks > 0){
      jogador.riverCheckRaises = 1;
    } 
  } else if (acao.indexOf("checks") != -1){
    jogador.riverChecks++;
  } else if (acao.indexOf("folds") != -1){
    jogador.riverFolds++;

    if (jogador.riverChecks > 0){
      jogador.riverCheckFolds = 1;
    } 
  } else if (acao.indexOf("calls") != -1){
    jogador.riverCalls = 1;

    if (jogador.riverChecks > 0){
      jogador.riverCheckCalls = 1;
    } 
  }
}