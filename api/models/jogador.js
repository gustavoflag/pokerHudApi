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
  estatisticas:{
    type:{
      fs:{
        type: Number
      },
      vpip:{
        type: Number
      },
      pfR:{
        type: Number
      },
      pfCR:{
        type: Number
      },
      pf3B:{
        type: Number
      },
      pfF3B:{
        type: Number
      },
      pf4B:{
        type: Number
      },
      pfF4B:{
        type: Number
      },
      vpip_pfR:{
        type: String
      }
    }
  }
});

module.exports = mongoose.model('Jogador', JogadorSchema);
