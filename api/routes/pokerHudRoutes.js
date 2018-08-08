'use strict';
module.exports = function(app) {
  var usuarioController = require('../controllers/usuarioController.js');
  var maoController = require('../controllers/maoController.js');
  var jogadorController = require('../controllers/jogadorController.js');

  app.route('/auth')
    .get(usuarioController.loginRequerido, usuarioController.listar);

  app.route('/auth/cadastrar')
    .post(usuarioController.inserir);

  app.route('/auth/login')
    .post(usuarioController.login);

  app.route('/mao')
    .get(usuarioController.loginRequerido, maoController.listar)
    .post(usuarioController.loginRequerido, maoController.inserir);

  app.route('/jogador')
    .get(usuarioController.loginRequerido, jogadorController.listar)
    .post(usuarioController.loginRequerido, jogadorController.consultarVarios);

  app.route('/jogador/:nome')
    .get(usuarioController.loginRequerido, jogadorController.consultar);

  app.route('/jogador/agregar')
    .post(usuarioController.loginRequerido, jogadorController.agregarDados);

};
