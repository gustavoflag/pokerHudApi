'use strict';

var mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  Schema = mongoose.Schema;

var UsuarioSchema = new Schema({
  login:{
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Login é obrigatório!'
  },
  senha:{
    type: String,
    required: 'Senha é obrigatória!'
  },
  dataCriacao:{
    type: Date,
    default: Date.now
  },
  administrador:{
    type: Boolean,
    default: false
  }
});

UsuarioSchema.methods.compararSenha = function(senha){
  return bcrypt.compareSync(senha, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
