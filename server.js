var express = require("express")
var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var path = require('path')

app.use("/css",  express.static(path.join(__dirname, '/css')));
app.use("/js",  express.static(path.join(__dirname, '/js')));
app.use("/img",  express.static(path.join(__dirname, '/img')));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/ui.html');
});


var users = {}
var clients = []
var host = null
var choiceword = "blank"
var currentPlayer
io.on('connection', function(socket){
    var myNick
    socket.emit('setup game')

    //Sets up name of current drawer for all players
    if(host == null) io.emit('set drawer', 'no one')
    else io.emit('set drawer', users[host])

    //logging for debugging
    console.info('New client connected (id=' + socket.id + ').');
    clients.push(socket.id);
    console.info('this is the client array: ' + clients)

    //for when someone disconnects
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket.id);
        if (index != -1) {
            
            io.emit('chat message', users[socket.id] + " has disconnected")
            clients.splice(index, 1);
            if(socket.id == host){
              if(clients.length == 0){
                host = null
              }
              else{
              host = clients[0]
              }
            }
            delete users[socket.id];
            console.info('Client gone (id=' + socket.id + ').');
            console.info('this is the client array: ' + clients)
            io.emit('user disconnect', socket.id)
        }
    });

    socket.on('get name', function(username){
      for(var key in users){
        socket.emit('user connect', users[key], key)
      }
      users[socket.id] = username
      myNick = username
      io.emit('user connect', username, socket.id)
      io.emit('chat message', myNick + " has connected");
    });
    
    socket.on('chat message', function(msg){
      io.emit('chat message', users[socket.id] + ": "+msg);
      if(msg.toLowerCase().includes(choiceword)){
        io.emit('special message', users[socket.id] +" has guessed the word: " + choiceword +"!")
        io.emit('clear the board')
        host = socket.id
        socket.emit('do host stuff')
      }
    });
            
    socket.on('draw', function (line) {
      if(socket.id == host || host == null)
        io.emit('draw', line);
      else
        socket.emit('warning', "It is not your turn! Your strokes are only visible to yourself.")
    });
    socket.on('clearCanvas', function (){
      if(socket.id == host || host == null) io.emit('clearCanvas');
    });
    socket.on('check status', function(){
      if(socket.id == host || host == null){
        socket.emit('check status', true)
        host = socket.id
    }
      else socket.emit('check status', false);
    })
	  socket.on('send word to server', function(word){
      if(socket.id == host || host == null){
	      choiceword = word.toLowerCase()
        io.emit('special message', users[socket.id] + " is drawing. Try to guess his word!")
        io.emit('set drawer', users[host])
        socket.emit('set word', choiceword)
      }
	  })
});
    


http.listen(8000, process.env.IP, function(){
	console.log("connected to port " + 8000)
})
