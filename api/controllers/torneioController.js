var mongoose = require('mongoose');
var Torneio = mongoose.model('Torneio');
var Mao = mongoose.model('Mao');
var Jogador = mongoose.model('Jogador');

var jogadorController = require('./jogadorController');
var maoController = require('./maoController');

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
                return res.json({ message: `Mão já inserida` });
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
        let torneioRetorno = {
          idTorneio: torn.idTorneio,
          processado: torn.processado,
          data: undefined
        };

        if (torn.maos && torn.maos.length > 0){
          torneioRetorno.data = torn.maos[0].data;
        }

        retorno.push(torneioRetorno);        
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
        ,data: undefined
        ,maos: []
      }

      if (torneio.maos && torneio.maos.length > 0){
        statusTorneio.data = torneio.maos[0].data;
      }
  
      torneio.maos.forEach(mao => {
        let statusMao = { 
           idMao: mao.idMao
          ,processado: mao.processado
          ,ganhador: mao.ganhador
          ,summary: mao.summary
          ,data: mao.data
          ,pote: mao.pote
          ,bordo: mao.bordo
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
};

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
};

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

exports.pegaInfoMaos = function(req, res) {
  Torneio.findOne({ idTorneio: req.body.idTorneio })
    .then((torneio) => {
        if (!torneio){
            return res.status(440).json({ error: { message: `Torneio não encontrado` } });
        }

        torneio.maos.forEach(mao => {
          pegaInfoMao(mao);
        });    

        torneio.maos.sort(function(a, b){
          return a.data - b.data;
        });

        torneio.save()
          .then((torneioSalvo) => {
            res.json({ message: `Torneio ${torneio.idTorneio} processado` });
          })
          .catch((err) => console.log(`Erro ao salvar #${torneio.idTorneio}`));  
    })
    .catch((err) => {
        console.log(err);
    });
};

exports.exportarTodasMaos = function(req, res) {
  Torneio.findOne({ idTorneio: req.params.idTorneio })
    .then((torneio) => {
        if (!torneio){
            return res.status(440).json({ error: { message: `Torneio não encontrado` } });
        }

        let linhasTorneio = [];
             
        torneio.maos.forEach(mao => {
         linhasTorneio = linhasTorneio.concat(mao.linhas);
         linhasTorneio.push("");
         linhasTorneio.push("");
       });
 
       return res.json(linhasTorneio);
    })
    .catch((err) => {
        console.log(err);
    });
}

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

function insereMaoSync(maos, torneio, callback){
  maoController.inserirMao(new Mao(maos[0]), (err, mensagem) => {
    if (err){
      console.log(`Mão: ${maos[0].idPokerstars} - Erro: ${err}`);
    } else {
      let maoTorneio = torneio.maos.find(m => "#" + m.idMao == maos[0].idPokerstars);
      pegaInfoMao(maoTorneio);
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

      torneio.maos.sort(function(a, b){
        return a.data - b.data;
      });

      torneio.save()
        .then((torneioSalvo) => {
          console.log(`Torneio #${torneio.idTorneio} Processado`);
          callback(null, `Torneio #${torneio.idTorneio} Processado`);
        })
        .catch((err) => console.log(`Erro ao salvar #${torneio.idTorneio}`));  
      
    }
  });
}

function pegaInfoMao(mao){ 
  let leitura = false;

  mao.linhas.forEach(line => {
    if (line.indexOf("Hand #") != -1){
        var sptData = line.split("BRT [");
        if (sptData.length > 1){
           var strData = sptData[1].replace(" ET]", "").replace("/", "-").replace("/", "-");
           if (strData && strData.length > 0){
             try{
               mao.data = new Date(strData);
             } catch (e){
               console.log('exception', e);
             }
           }
        }
    } else if (line.indexOf("*** SUMMARY ***") != -1){
      leitura = true;
      mao.summary = "";
      mao.ganhador = "";
      mao.bordo = "";
    } else if (leitura) {
      mao.summary += line + '\n';

      if (line.indexOf("Total pot") != -1){
        sptPote = line.split("|");
        if (sptPote && sptPote.length > 0){
          mao.pote = sptPote[0].replace("Total pot ", "").replace(" ", "");
        }
      } else if (line.indexOf("Board") != -1){
        mao.bordo = line.replace("Board [", "").replace("]", "");
      } else if (line.indexOf("won") != -1 
                 || line.indexOf("collected") != -1){

        var sptLine = line.split(':');
        if (sptLine && sptLine.length > 1){
          var jogAcao = sptLine[1].trim();
          var sptJogAcao = jogAcao.split(" ");
          if (sptJogAcao && sptJogAcao.length > 0){
            if (mao.ganhador.length > 0){
              mao.ganhador += " / ";
            }
            mao.ganhador += sptJogAcao[0].trim();
          }
        }
        
      }
    }
  });
}