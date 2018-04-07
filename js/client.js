$(document).ready(function() {
	var socket = io.connect('/');
	
	var canvas = $('#canvas'),
		clearcanvas = $('#clearcanvas'),
		clearchat = $('#clearchat'),
		selectedcolor = $('.color'),
		context = canvas[0].getContext('2d'),
		lastpoint = null,
		painting = false,
		myturn = false;
	
	socket.on('draw', draw);
	
	function draw(line) {
		context.lineJoin = 'round';
		context.lineWidth = 2;
		context.strokeStyle = line.color;
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
	canvas.mousedown(function () {
		return false;
	});
	
	canvas.mousedown(function(e) {
		if(myturn) {
			painting = true;
			var newpoint = { x: e.pageX - this.offsetLeft, y: e.pageY - this.offsetTop},
				line = { from: null, to: newpoint, color: selectedcolor.val() };
			
			draw(line);
			lastpoint = newpoint;
			socket.emit('draw', line);
		}
	});
	
	canvas.mousemove(function(e) {
		if(myturn && painting) {
			var newpoint = { x: e.pageX - this.offsetLeft, y: e.pageY - this.offsetTop},
				line = { from: lastpoint, to: newpoint, color: selectedcolor.val() };
			
			draw(line);
			lastpoint = newpoint;
			socket.emit('draw', line);
		}
	});
	
	canvas.mouseout(function(e) {
		painting = false;
	});
	
	canvas.mouseup(function(e) {
		painting = false;
	});
	
	socket.on('drawCanvas', function(canvasToDraw) {
		if(canvasToDraw) {
			canvas.width(canvas.width());
			context.lineJoin = 'round';
			context.lineWidth = 2;
			
			for(var i=0; i < canvasToDraw.length; i++)
			{		
				var line = canvasToDraw[i];
				context.strokeStyle = line.color;
				context.beginPath();
				if(line.from){
					context.moveTo(line.from.x, line.from.y);
				}else{
					context.moveTo(line.to.x-1, line.to.y);
				}
				context.lineTo(line.to.x, line.to.y);
				context.closePath();
				context.stroke();
			}
		}
	});
	
	clearcanvas.click(function() {
		if(myturn) {
			socket.emit('clearCanvas');
		}
	});
});
