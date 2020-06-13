var mongoose = require('mongoose');
var Torneio = mongoose.model('Torneio');


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

            res.json({ message: `Torneio em processamento` });
    
            maos = [];
            mao = {
                idPokerstars: ""
            };

            var leitura = false;            
            var street = 0;

            var countMaosEnviadas = 0;

            try{
                torneio.maos.forEach(maoTorneio => {
                    console.log(`processando mão ${maoTorneio.idMao}`)
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

            //console.log(maos[0].preFlop);
        })
        .catch((err) => {
            res.status(440).json({error: err})
        });
};