'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TorneioSchema = new Schema({
    idTorneio:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: 'ID do Torneio é obrigatório!'
    },
    maos:[{ 
        idMao:{
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: 'ID da Mão é obrigatório!'
        },
        linhas:[{
            type: String
        }]
    }],
    processado:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Torneio', TorneioSchema);
