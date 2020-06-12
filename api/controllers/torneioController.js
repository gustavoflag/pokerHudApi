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