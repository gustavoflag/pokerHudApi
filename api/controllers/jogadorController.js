var mongoose = require('mongoose');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');
var Jogador = mongoose.model('Jogador');
var nomeItem = 'Jogador';

exports.listar = function(req, res) {
  return controller.listar(Jogador, res);
};
