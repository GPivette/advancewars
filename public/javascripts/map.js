Map={};
Map.socket = io.connect('http://172.20.1.30:3000/'); 
Map.canvas = document.getElementById('map');
Map.canvas.height = window.innerHeight;
Map.canvas.width = window.innerWidth;
Map.context = Map.canvas.getContext("2d");
Map.sprites = new Image();
Map.sprites.src = '/images/map_sprites.png';

Map.socket.emit('requireMap');

Map.socket.on('newMap', function(map)
{
	for (var i = map.length - 1; i >= 0; i--) 
	{
		console.log(map[i]);
		if(map[i].sprite < 75)
		{
			Map.context.drawImage(Map.sprites,17*map[i].sprite,0,16,16,map[i].y*16,map[i].x*16,16,16);
		}
		else
		{
			Map.context.drawImage(Map.sprites,17*map[i].sprite,0,16,31,map[i].y*16,map[i].x*16,16,31);
		}
	}
});