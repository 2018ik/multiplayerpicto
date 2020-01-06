$(function () {
    var socket = io();
    $("#save").on('click', function(){
	  let name = $("#username").val()
	  if(name.length > 0){
		//$('#chatnick').val(name)
		console.log(name)
		socket.emit('get name', name)
		socket.emit('set canvas')
		$('#enterName').modal('hide')
	  }
	})    
	$("#scaleset").on('click',function(){
		$('#setscale').modal('show')
	})
	$("#savew").on('click', function(){
		let word = $("#userword").val()
		if(word.length > 0){
			socket.emit('send word to server', word)
			$('#enterWord').modal('hide')
			$('#wordlabel').text(word)
		}
	})
	
	$(document).on('input change', '#zoomslider', function() {
		endPos = $('#zoomslider').val();
		ctx= $("#canvas")[0].getContext('2d');
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(1*endPos/100,1*endPos/100)
		$('#curvalue').text(endPos/100)
	});
	$("#pickword").on('click', function(){
		socket.emit('check status')

	})
    $("#m").on('keyup', function (e) {
      if (e.keyCode == 13) {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
      }
	});
	$("#pickColor").on('click', function(){
		$("#favcolor")[0].click();
	})
	$("#users").on('click', ".userbox", function(){
		$('#m').val("@"+$(this).text());
		$("#m").focus()
	})
	socket.on('check status', function(bool){
		if(bool) $('#enterWord').modal({backdrop: 'static', keyboard: false}) 
		else $('#nothost').modal('show')
	})
    socket.on('clear the board', function(){
      $('#wordlabel').html("")
      socket.emit('clearCanvas');
	})
	socket.on('set drawer', function(name){
		$('#drawer').text(name)
	})
	socket.on('set word', function(word){
		$('#currentword').text(word)
	})
    socket.on('special message', function(msg){
      $('#chatcontent').append($('<p>').css({'color': '#3b5998', 'font-weight': 'bold'}).text(msg));
      $('#chatcontent').scrollTop($('#chatcontent')[0].scrollHeight);
    });
    socket.on('chat message', function(msg){
      $('#chatcontent').append($('<p>').text(msg));
      $('#chatcontent').scrollTop($('#chatcontent')[0].scrollHeight);
    });
    socket.on('user connect', function(name, key){
      var e = $('<li><a class = "userbox">' + name + ' </a></li>')
      $('#users').append(e);
      e.attr('id', key);
    })
    socket.on('user disconnect', function(index){
      $('#' + index).remove();
    })
    socket.on('setup game', function(){
      $('#enterName').modal({backdrop: 'static', keyboard: false}) 
      console.log("it worked")
	  /* var choice = window.prompt("You have guessed the word first, or are the only person on right now. Pick a word.", "apple")
	socket.emit('my turn now')
	$('#wordbox').html(choice)
	socket.emit('send word to server',choice) */
    })
    //canvas stuff
    var canvas = $('#canvas'),
		  selectedcolor = $('.color'),
		  context = canvas[0].getContext('2d'),
		  lastpoint = null,
		  status = false,
		  myturn = true;
	    socket.on('draw', draw);
    $('#clearCanvas').click(function(){
			socket.emit('clearCanvas');
    });
    socket.on('clearCanvas', function(){
      console.log("clicked")
      context.clearRect(0,0, canvas.width(), canvas.height());
    })
	  function draw(line) {
		  context.lineJoin = 'round';
		  context.lineWidth = line.lineWidth
		  context.strokeStyle = line.color
		  context.beginPath();
		
		  if(line.from) {
			  context.moveTo(line.from.x, line.from.y);
		  }else{
			  context.moveTo(line.to.x-1, line.to.y);
		  }
		
		  context.lineTo(line.to.x, line.to.y);
		  context.closePath();
		  context.stroke();
		  
	    }
    canvas.mouseout(function(e) {
	    status = false;
	  });
	
	  canvas.mouseup(function(e) {
  		status = false;
    });
    canvas.mousedown(function(e) {
  		if(myturn) {
  			status = true;
  			var newpoint = { x: e.pageX - this.offsetLeft, y: e.pageY - this.offsetTop},
  				line = { from: null, to: newpoint, color: $("#favcolor").val(), lineWidth: $('#favsize').val()};
  			
  			draw(line);
  			lastpoint = newpoint;
  			socket.emit('draw', line);
  	  }
	  });
	
	  canvas.mousemove(function(e) {
  		if(myturn && status) {
  			var newpoint = { x: e.pageX - this.offsetLeft, y: e.pageY - this.offsetTop},
  				line = { from: lastpoint, to: newpoint, color: $("#favcolor").val(), lineWidth: $('#favsize').val()};
  			
  			draw(line);
  			lastpoint = newpoint;
  			socket.emit('draw', line);
  		} 
  	});
  	$(document).ready(function () {
		$('#sidebarCollapse').on('click', function () {
			$('#sidebar').toggleClass('active');
			$(this).toggleClass('active');
		});
	});
	  
  });
