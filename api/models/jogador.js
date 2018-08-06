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
  preFlop:{
    type:{
      folds:{
        type: Number,
        default: 0
      },
      calls:{
        type: Number,
        default: 0
      },
      raises:{
        type: Number,
        default: 0
      }
    }
  }
});

module.exports = mongoose.model('Jogador', JogadorSchema);
