var express = require('express'),
  app = express(),
  port = process.env.PORT || 5500,
  mongoose = require('mongoose'),
  jsonwebtoken = require('jsonwebtoken'),
  bodyParser = require('body-parser'),
  Usuario = require('./api/models/usuario'),
  Jogador = require('./api/models/jogador'),
  Mao = require('./api/models/mao'),
  Torneio = require('./api/models/torneio');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokerHudApi2', { useNewUrlParser: true }); //LOCAL
//mongoose.connect(process.env.MONGODB_URI || 'mongodb://heroku_nwr6gcbj:lij4u0eb5r67oqgqn999irmaek@cluster-nwr6gcbj-shard-00-00.azfzd.mongodb.net:27017,cluster-nwr6gcbj-shard-00-01.azfzd.mongodb.net:27017,cluster-nwr6gcbj-shard-00-02.azfzd.mongodb.net:27017/heroku_nwr6gcbj?ssl=true&replicaSet=atlas-mxzc3a-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true }); //TQSOP-STATS

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/pokerHudRoutes');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT'){
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode){
      if (err)
        req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

routes(app);

app.listen(port);

console.log('API iniciada, porta: ' + port);
