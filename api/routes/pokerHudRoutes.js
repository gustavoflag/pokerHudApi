'use strict';
module.exports = function(app) {
  var usuarioController = require('../controllers/usuarioController.js');

  app.route('/auth')
    .get(usuarioController.loginRequerido, usuarioController.listar);

  app.route('/auth/cadastrar')
    .post(usuarioController.inserir);

  app.route('/auth/login')
    .post(usuarioController.login);
};
