var mongoose = require('mongoose');
var httpReturnHelper = require('../helpers/httpReturnHelper');

exports.listar = function(model, res) {
  model.find({})
    .then((items) => {
      return res.json(items);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.consultar = function(model, id, name, res) {
  model.findById(id)
    .then((item) => {
      if (!item){
        return res.json({ message: `${name} não encontrado` });
      }
      return res.json(item);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.inserir = function(newItem, name, res) {
  newItem.save()
    .then((item) => {
      return httpReturnHelper.success(res, `${name} incluído`, item);
    })
    .catch((err) => console.log(err));// httpReturnHelper.error(res, err));
};

exports.alterar = function(model, id, body, name, res) {
  model.findOneAndUpdate({ _id: id }, body, {new: true})
    .then((item) => {
      if (!item){
        return res.json({ message: `${name} não encontrado` });
      }
      //return httpReturnHelper.success(res, `${name} alterado`, item);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};

exports.excluir = function(model, id, name, res) {
  model.findOneAndRemove({ _id: id })
    .then((item) => {
      if (!item){
        return res.json({ message: `${name} não encontrado` });
      }
      return httpReturnHelper.success(res, `${name} excluído`, item);
    })
    .catch((err) => httpReturnHelper.error(res, err));
};
