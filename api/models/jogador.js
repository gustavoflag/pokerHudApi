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
  preFlopFoldsBet:{
    type: Number,
    default: 0
  },
  preFlopLimps:{
    type: Number,
    default: 0
  },
  preFlopChecks:{
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
  preFlopRaiseFolds:{
    type: Number,
    default: 0
  },
  preFlopRaiseCalls:{
    type: Number,
    default: 0
  },
  preFlop3Bets:{
    type: Number,
    default: 0
  },
  preFlop4Bets:{
    type: Number,
    default: 0
  },

  flops:{
    type: Number,
    default: 0
  },
  flopBets:{
    type: Number,
    default: 0
  },
  flopCBets:{
    type: Number,
    default: 0
  },
  flopFolds:{
    type: Number,
    default: 0
  },
  flopCBetFolds:{
    type: Number,
    default: 0
  },
  flopCBetCalls:{
    type: Number,
    default: 0
  },
  flopCBetRaises:{
    type: Number,
    default: 0
  },
  flopChecks:{
    type:Number,
    default: 0
  },
  flopCheckRaises:{
    type:Number,
    default: 0
  },
  flopCheckCalls:{
    type:Number,
    default: 0
  },
  flopCheckFolds:{
    type:Number,
    default: 0
  },
  flopRaises:{
    type:Number,
    default: 0
  },
  flopCalls:{
    type:Number,
    default: 0
  },

  turns:{
    type: Number,
    default: 0
  },
  turnBets:{
    type: Number,
    default: 0
  },
  turnFolds:{
    type: Number,
    default: 0
  },
  turnRaises:{
    type:Number,
    default: 0
  },
  turnCalls:{
    type:Number,
    default: 0
  },
  turnChecks:{
    type:Number,
    default: 0
  },
  turnCheckRaises:{
    type:Number,
    default: 0
  },
  turnCheckCalls:{
    type:Number,
    default: 0
  },
  turnCheckFolds:{
    type:Number,
    default: 0
  },


  rivers:{
    type: Number,
    default: 0
  },
  riverBets:{
    type: Number,
    default: 0
  },
  riverFolds:{
    type: Number,
    default: 0
  },
  riverRaises:{
    type:Number,
    default: 0
  },
  riverCalls:{
    type:Number,
    default: 0
  },
  riverChecks:{
    type:Number,
    default: 0
  },
  riverCheckRaises:{
    type:Number,
    default: 0
  },
  riverCheckCalls:{
    type:Number,
    default: 0
  },
  riverCheckFolds:{
    type:Number,
    default: 0
  },

  estatisticas:{
  }
});

module.exports = mongoose.model('Jogador', JogadorSchema);
