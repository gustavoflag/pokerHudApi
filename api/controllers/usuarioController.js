var mongoose = require('mongoose'),
Usuario = mongoose.model('Usuario'),
bcrypt = require('bcrypt-nodejs'),
jwt = require('jsonwebtoken');
var controller = require('./controllerBase');
var httpReturnHelper = require('../helpers/httpReturnHelper');

exports.listar = function(req, res) {
  Usuario.find({})
    .then((usuarios) => {
      usuarios.forEach((usuario) => {
        usuario.senha = undefined;
      });

      return res.json(usuarios);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.alterarSenha = function(req, res){
  Usuario.findById(req.user._id)
    .then((usuario) => {
      if (!usuario){
        return res.json({ message: `Usuário não encontrado` });
      }

      if (!usuario.compararSenha(req.body.senhaAntiga)) {
        return res.status(401).json({ message: `Senha antiga não confere` });
      }

      if (req.body.novaSenha == req.body.senhaAntiga) {
        return res.status(401).json({ message: `Nova senha deve ser diferente da antiga` });
      }

      var salt = bcrypt.genSaltSync(10);
      usuario.senha = bcrypt.hashSync(req.body.novaSenha, salt);
      usuario.save()
        .then((usuarioSalvo) => {
          usuarioSalvo.senha = undefined;
          return httpReturnHelper.success(res, `Senha alterada`, usuarioSalvo);
        })
        .catch((err) => httpReturnHelper.error(res, err));
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.alterarPermissoes = function(req, res){
  Usuario.findById(req.params.usuarioId)
    .then((usuario) => {
      if (!usuario){
        return res.json({ message: `Usuário não encontrado` });
      }

      usuario.administrador = req.body.administrador;
      usuario.save()
        .then((usuarioSalvo) => {
          usuarioSalvo.senha = undefined;
          return httpReturnHelper.success(res, `Permissão alterada`, usuarioSalvo);
        })
        .catch((err) => httpReturnHelper.error(res, err));
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.inserir = function(req, res) {
  var novoUsuario = new Usuario(req.body);

  var salt = bcrypt.genSaltSync(10);
  novoUsuario.senha = bcrypt.hashSync(req.body.senha, salt);
  novoUsuario.save()
    .then((usuarioSalvo) => {
      usuarioSalvo.senha = undefined;
      return httpReturnHelper.success(res, `Usuario incluído`, usuarioSalvo);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.login = function(req, res) {
  Usuario.findOne({
    login: req.body.login
  }, function(err, user) {
    if (err)
      return res.status(440).json(err);
    if (!user) {
      return res.status(401).json({ message: 'Falha na autenticação. Usuário não encontrado.' });
    } else if (user) {
      if (!user.compararSenha(req.body.senha)) {
        return res.status(401).json({ message: 'Falha na autenticação. Senha não confere.' });
      } else {
        return res.json({ message: 'Usuário autenticado', userId: user._id, administrador: user.administrador, token: jwt.sign({ login: user.login, _id: user._id }, 'RESTFULAPIs', { expiresIn: 86400 })});
      }
    }
  });
};

exports.loginRequerido = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ message: 'Usuário não autorizado.' });
  }
};

exports.perfilAdminRequerido = function(req, res, next) {
  Usuario.findById(req.user._id)
    .then((usuario) => {
      if (!usuario){
        return res.json({ message: `Usuário não encontrado` });
      }

      if (usuario.administrador){
        next();
      }
      else {
        return res.status(401).json({ message: 'Usuário não autorizado a realizar essa operação.' });
      }
    })
    .catch((err) => httpReturnHelper.error(res, err));
};
