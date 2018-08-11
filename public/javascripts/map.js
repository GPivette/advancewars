Map={};
Map.socket = io.connect('http://172.20.1.30:3000/'); 
Map.canvas = document.getElementById('map');
Map.canvas.height = window.innerHeight;
Map.canvas.width = window.innerWidth;
Map.context = Map.canvas.getContext("2d");
Map.sprites = new Image();
Map.sprites.src = '/images/map_sprites.png';
Map.units_sprites = new Image();
Map.units_sprites.src = '/images/Map_units.png';
Map.highlight = false;
Map.highlighted = [];
Map.units= [];

Map.socket.emit('requireGame');

function getMousePos(canvas, evt) 
	{
    var rect = canvas.getBoundingClientRect();
    var pos = {'x': Math.floor((evt.clientY - rect.top)/Map.ratio), 'y': Math.floor((evt.clientX - rect.left)/Map.ratio)-6};
    return pos;
		}

Map.canvas.addEventListener('mousedown', function(evt) 
	{
        var mousePos = getMousePos(Map.canvas, evt);
        console.log(mousePos)
        Map.socket.emit('click',mousePos,Map.highlight,Map.highlighted,Map.units);
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

Map.socket.on('newGame', function(battle)
	{
		var map = battle.map;
		var unitsList = battle.units;

		Map.ratio = Math.min(Map.canvas.height/map.H,Map.canvas.width/(map.W+6));
		console.log(Map.ratio)

		Map.canvas.height = map.H*Map.ratio;
		Map.canvas.width = (map.W+6)*Map.ratio;

		for (var i = map.map.length - 1; i >= 0; i--) 
		{
			if(map.map[i].sprite < 75)
			{
				Map.context.drawImage(Map.sprites,17*map.map[i].sprite,0,16,16,(6+map.map[i].y)*Map.ratio,map.map[i].x*Map.ratio,Map.ratio,Map.ratio);
			}
			else
			{
				Map.context.drawImage(Map.sprites,17*map.map[i].sprite,0,16,31,(6+map.map[i].y)*Map.ratio,((map.map[i].x-(15/16))*Map.ratio),Map.ratio,(31/16)*Map.ratio);
			}
		}

		for (var i = unitsList.length - 1; i >= 0; i--) 
		{
			Map.context.drawImage(Map.units_sprites,16*unitsList[i].sprite.right,0,16,16,(6+unitsList[i].position.y)*Map.ratio,unitsList[i].position.x*Map.ratio,Map.ratio,Map.ratio);
		}
	});

Map.socket.on('caseType', function(mapCase)
	{
		var adjustment = 60;
		var pixels = Map.context.getImageData(mapCase.y*Map.ratio,mapCase.x*Map.ratio,Map.ratio,Map.ratio);

		if (Map.highlight)
		{	
			Map.context.drawImage(Map.sprites,17*mapCase.sprite,0,16,16,mapCase.y*Map.ratio,mapCase.x*Map.ratio,Map.ratio,Map.ratio)
		}
		else{Map.context.putImageData(brighten(pixels,adjustment),mapCase.y*Map.ratio,mapCase.x*Map.ratio);}

		Map.highlight = !Map.highlight;
	});

Map.socket.on('unitSelected', function(tiles, units)
{
	var adjustment = 60;

	if(Map.highlight)
	{
		for (var i = 0; i < Map.highlighted.length; i++)
		{
			if(Map.highlighted[i].sprite < 75)
			{
				Map.context.drawImage(Map.sprites,17*Map.highlighted[i].sprite,0,16,16,(6+Map.highlighted[i].y)*Map.ratio,Map.highlighted[i].x*Map.ratio,Map.ratio,Map.ratio);
			}
			else
			{
				Map.context.drawImage(Map.sprites,17*Map.highlighted[i].sprite,0,16,31,(6+Map.highlighted[i].y)*Map.ratio,((Map.highlighted[i].x-(15/16))*Map.ratio),Map.ratio,(31/16)*Map.ratio);
			}
		}
		for (var i = units.length - 1; i >= 0; i--) 
		{
			Map.context.drawImage(Map.units_sprites,16*units[i].sprite.right,0,16,16,(6+units[i].y)*Map.ratio,units[i].x*Map.ratio,Map.ratio,Map.ratio);
		}
		Map.highlighted = [];
	}
	else
	{
		for (var i = 0; i < tiles.length; i++) 
	 	{
	 		var pixels = Map.context.getImageData((6+tiles[i].tile.y)*Map.ratio,tiles[i].tile.x*Map.ratio,Map.ratio,Map.ratio);
			Map.context.putImageData(brighten(pixels,adjustment),(6+tiles[i].tile.y)*Map.ratio,tiles[i].tile.x*Map.ratio);
			Map.highlighted.push(tiles[i].tile);
		}
		Map.highlighted.sort(function(a, b){return a.x - b.x});
	}

	Map.highlight = !Map.highlight;
});

Map.socket.on('newUnit', function(unit)
{
	Map.context.drawImage(Map.units_sprites,16*unit.sprite.right,0,16,16,(6+unit.y)*Map.ratio,unit.x*Map.ratio,Map.ratio,Map.ratio);
	Map.context.fillStyle = '#FFFFFF';
	Map.context.fillRect(0,0,5*Map.ratio,Map.canvas.height)
	Map.units = [];
});

Map.socket.on('baseSelected', function(units)
{
	console.log(units);
	for (var i = units.length - 1; i >= 0; i--) 
	{
		Map.context.drawImage(Map.sprites,17*4,0,16,16,3*Map.ratio,(i+2)*Map.ratio,Map.ratio,Map.ratio);
		Map.context.drawImage(Map.units_sprites,16*units[i].sprite.right,0,15,16,3*Map.ratio,(i+2)*Map.ratio,Map.ratio,Map.ratio);
		Map.units.push({'unit': units[i], 'x': i+2})
	}
})