'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MaoSchema = new Schema({
  idPokerstars:{
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'ID da mão é obrigatório!'
  },
  preFlop:{
    type:[{
      nomeJogador:{
        type: String
      },
      acao:{
        type: String
      }
    }]
  }
});

module.exports = mongoose.model('Mao', MaoSchema);
