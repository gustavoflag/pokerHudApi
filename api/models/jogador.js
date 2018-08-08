'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var JogadorSchema = new Schema({
  nome:{
    type: String,
    unique: true,
    trim: true,
    required: 'Nome do Jogador é obrigatório!'
  },
  maos:{
    type: Number,
    default: 0
  },
  preFlopFolds:{
    type: Number,
    default: 0
  },
  preFlopCalls:{
    type: Number,
    default: 0
  },
  preFlopRaises:{
    type: Number,
    default: 0
  },
  preFlop3Bets:{
    type: Number,
    default: 0
  },
  estatisticas:{
    type:{
      pfr:{
        type: Number
      },
      vpip:{
        type: Number
      }
    }
  }
});

module.exports = mongoose.model('Jogador', JogadorSchema);
