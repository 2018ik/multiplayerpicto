var express = require("express")
var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var path = require('path')
var mysql = require('mysql')

app.use("/css",  express.static(path.join(__dirname, '/css')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/ui.html');
});

var sqlol = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'words'
})
 
// Log any errors connected to the db
sqlol.connect(function(err){
    if (err) console.log(err)
})

function getKey(data) {
  for (var prop in data)
    return prop;
}

var users = {}
var clients = []
var conte
var host = null
var choiceword = "sdfasdfasdfasdfasdfdsaf"
io.on('connection', function(socket){
    var currentPlayer, myNick
    if(clients.length == 0){
      host = socket.id
      socket.emit('do host stuff')
    }
    console.info('New client connected (id=' + socket.id + ').');
    clients.push(socket.id);
    console.info('this is the client array: ' + clients)
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket.id);
        if (index != -1) {
            
            io.emit('chat message', users[socket.id] + " has disconnected")
            clients.splice(index, 1);
            if(socket.id == host){
              host = clients[0]
              if(clients.length == 0){
                host = null
              }
            }
            delete users[socket.id];
            console.info('Client gone (id=' + socket.id + ').');
            console.info('this is the client array: ' + clients)
            io.emit('user disconnect', socket.id)
        }
    });
    socket.on('get name', function(nawa){
      for(var key in users){
        socket.emit('user connect', users[key], key)
      }
      users[socket.id] = nawa
      myNick = nawa
      io.emit('user connect', nawa, socket.id)
      io.emit('chat message', myNick + " has connected");
    });
    
    // socket.on('send image to server', function(canvas){
    //   conte = canvas 
    // });
    // socket.on('set canvas', function(){
    //   socket.emit('set canvas',conte)
    // })
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
			io.emit('draw', line);
    });
	  socket.on('my turn now', function(msg){
	    io.emit('special message', "It is now "+users[socket.id] +"'s"+" turn to draw!")
	  })
    socket.on('clearCanvas', function (){
			io.emit('clearCanvas');
	  });
	  socket.on('send word to server', function(word){
	      choiceword = word.toLowerCase()
	     // var sql = "INSERT INTO datatable (name, word) VALUES ('"+users[socket.id]+"','"+word+"')"
	     // sqlol.query(sql, function (err, result) {
      //     if (err) throw err;
      //     console.log(result)
      //     });
	  })
});
    


http.listen(process.env.PORT, process.env.IP, function(){
})