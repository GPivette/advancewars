Map={};
Map.socket = io.connect('http://172.20.1.30:3000/'); 
Map.canvas = document.getElementById('map');
Map.canvas.height = window.innerHeight;
Map.canvas.width = window.innerWidth;
Map.context = Map.canvas.getContext("2d");
Map.sprites = new Image();
Map.sprites.src = '/images/map_sprites.png';
Map.highlight = false;
Map.highlighted = [];

Map.socket.emit('requireMap');

function getMousePos(canvas, evt) 
	{
    var rect = canvas.getBoundingClientRect();
    var pos = {'y': Math.floor((evt.clientX - rect.left)/Map.ratio), 'x': Math.floor((evt.clientY - rect.top)/Map.ratio)};
    return pos;
		}

Map.canvas.addEventListener('mousedown', function(evt) 
	{
        var mousePos = getMousePos(Map.canvas, evt);
        Map.socket.emit('click',mousePos);
     }, false);

function brighten(pixels, adjustment)
	{
		var d = pixels.data;
		for (var i=0; i<d.length; i+=3) 
		{
			d[i] += adjustment;
			d[i+1] += adjustment;
			d[i+2] += adjustment;
		}
		return pixels;
	}

function darken(pixels, pixels_data)
	{
		pixels.data = pixels_data;
		return pixels;
	}

Map.socket.on('newMap', function(map)
	{
		Map.ratio = Math.min(Map.canvas.height/map.H,Map.canvas.width/map.W);
		console.log(Map.ratio)

		Map.canvas.height = map.H*Map.ratio;
		Map.canvas.width = map.W*Map.ratio;

		for (var i = map.map.length - 1; i >= 0; i--) 
		{
			if(map.map[i].sprite < 75)
			{
				Map.context.drawImage(Map.sprites,17*map.map[i].sprite,0,16,16,map.map[i].y*Map.ratio,map.map[i].x*Map.ratio,Map.ratio,Map.ratio);
			}
			else
			{
				Map.context.drawImage(Map.sprites,17*map.map[i].sprite,0,16,31,map.map[i].y*Map.ratio,((map.map[i].x-(15/16))*Map.ratio),Map.ratio,(31/16)*Map.ratio);
			}
		}
	});

Map.socket.on('caseType', function(mapCase)
	{
		var adjustment = 60;
		var pixels = Map.context.getImageData(0,0,Map.ratio,Map.ratio);

		if (Map.highlight)
		{	
			Map.context.drawImage(Map.sprites,17*mapCase.sprite,0,16,16,mapCase.y*Map.ratio,mapCase.x*Map.ratio,Map.ratio,Map.ratio)
		}
		else{Map.context.putImageData(brighten(pixels,adjustment),0,0);}

		Map.highlight = !Map.highlight;
	});