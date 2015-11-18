var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session')

var app = express();

var routes = require('./routes/routes');
var User = require('./models/user.js');
var Respuesta   = require('./models/respuesta');
var Pregunta    = require('./models/pregunta');

var connStr = 'mongodb://localhost:27017/votacionDB';
mongoose.connect(connStr, function(err) {
  if (err) throw err;
  console.log('Successfully connected to database');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use('/', routes);

var PORT = process.env.PORT || 3000,
    HOST = process.env.HOST || '192.168.0.7'

var server = require('http').createServer(app);
server.listen(PORT, HOST);

// Socket io //

var onlineUsers = {};
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
  //user connect
  socket.on("loginUser", function(username) {
    //check if the user is already logged
    if (onlineUsers[username]){
      socket.emit("userInUse");
      console.log('in use');
      return;
    }
    socket.username = username;
    onlineUsers[username] = socket.username;
    socket.emit("updateChat", "yo", "Bienvenido " + socket.username + ", te has conectado correctamente.");
    socket.broadcast.emit("updateChat", "conectado", "El usuario " + socket.username + " se ha conectado al chat.");
    io.sockets.emit("updateUserList", onlineUsers);
  });

  //user disconnect
  socket.on("disconnect", function(){
		delete onlineUsers[socket.username];
		//actualizamos la lista de usuarios en el chat, zona cliente
		io.sockets.emit("updateUserList", onlineUsers);
		//emitimos el mensaje global a todos los que están conectados con broadcasts
		socket.broadcast.emit("updateChat", "desconectado", "El usuario " + socket.username + " se ha desconectado del chat.");
	});

  socket.on('message', function(message) {
    //message for user chat
    socket.emit("updateChat", "msg", "Yo : " + message + ".");
    //message to other users
    socket.broadcast.emit("updateChat", "msg", socket.username + " dice: " + message + ".");
	});

  socket.on('publishQuestion', function(data) {
    var pregunta =  new Pregunta({
      pregunta : data.pregunta
    });
    pregunta.save(function(err,pre){
      if(pre){
        for(var i=0;i<data.respuestas.length - 1;i++){
          var respuesta = new Respuesta({
            respuesta: data.respuestas[i],
            idPregunta: pre._id
          });
          respuesta.save( function(err){
            if(err)
              console.log('Error');
          });
        }
        Respuesta.find({idPregunta: pre._id}).exec(function (err, respu) {
          socket.emit("updateChat", "pregunta", {pregunta: pre.pregunta, idPregunta: pre._id, respuestas: respu} );
          socket.broadcast.emit('updateChat', 'pregunta',  {pregunta: pre.pregunta, idPregunta: pre._id, respuestas: respu});
        });
      }
    });
  });

  socket.on("respondePregunta", function(data) {
    socket.emit("updateChat", "respuesta", {idPregunta: data.idPregunta, respuesta: data.respuesta} );
    socket.broadcast.emit("updateChat", "respuesta", {idPregunta: data.idPregunta, respuesta: data.respuesta} );
  });
});
