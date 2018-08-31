var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var data = require('./data')
var typy = require('typy');

function promisedMongoOne(collection, query)
{
	return new Promise (function(resolve, reject)
	{
		MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) 
	  	{
			if (err) throw err;
			var dbo = db.db("advancewars");
			dbo.collection(collection).findOne(query,function(err, result) 
			{
				if (err) reject(err);
				resolve(result); 
				db.close();
			});
		});
	});
}

function findInArray(array, filter)
{
	return array.filter(function(item)
	{
		for(var key in filter)
		{
			if (item[key] === undefined || item[key] != filter[key])
    		return false;
		}
		return true;
	});
}

function getMaze(map)
{
	var list = [];
	var record = {};

	var terrains = {
		1:'Plain',
		2:'Forest',
		3:'Mountain',
		4:'Road',
		5:'River',
		6:'Sea',
		7:'Shoal',
		8:'Reef',
		9:'Bridge',
		'A':'HQ',
		'B':'City',
		'C':'Base',
		'D':'Airport',
		'E':'Port',
		'F':'Communication Tower'
	};

	for (var i = 0; i<map.length; i++) 
	{
		for (var j = 0; j<map[i].length; j++) 
		{
			if(!isNaN(map[i][j]))
			{
				record = {'x':i,'y':j,'type':terrains[map[i][j]]};
			}
			else
			{
				if(map[i][j].length < 2)
				{
					record = {'x':i,'y':j,'type':terrains[map[i][j]],'captured':false,'player':null,'isProducing':false};
				}
				else
				{
					record = {'x':i,'y':j,'type':terrains[map[i][j][0]],'captured':true,'player':parseInt(map[i][j][1]),'isProducing':false};
				}
			}
			list.push(record);
		} 
	}
	return list;
}

async function getFullMap(simpleMap)
{
	var mapArray = simpleMap;
	var map =[];
	var query;
	var sprite;
	var options;
	var result;

	for (var i = mapArray.length - 1; i >= 0; i--) 
	{
		switch(mapArray[i].type)
		{
			case 'Plain': case 'Forest': case 'Mountain': case 'Reef':
				query = {'type':mapArray[i].type};
				break;

			case 'Road': case 'Bridge':
				var joins = {};
				for (var k = data.contact.length - 1; k >= 0; k--) 
				{
					var filter = {'x':mapArray[i].x+data.contact[k].x, 'y':mapArray[i].y+data.contact[k].y};
					var test = findInArray(mapArray,filter);

					var query = {}, direction;

					query.type = mapArray[i].type;

					switch(k)
					{
						case 0:
							direction = 'right';
							break;
						case 1:
							direction = 'left';
							break;
						case 2:
							direction = 'down';
							break;
						case 3:
							direction = 'up';
							break;
					}

					if(test[0].type == mapArray[i].type || test[0].type == 'Bridge' || test[0].type == 'Road')
					{
						joins[direction] = true;
					}
					else
					{
						joins[direction] = false;
					}
				}
				query.joins = joins;
				joins =null;
				break;
			
			case 'River':
				var joins = {}, ground = {};
				for (var k = data.contact.length - 1; k >= 0; k--) 
				{
					var filter = {'x':mapArray[i].x+data.contact[k].x, 'y':mapArray[i].y+data.contact[k].y};
					var test = findInArray(mapArray,filter);

					var query = {}, direction;

					query.type = mapArray[i].type;

					switch(k)
					{
						case 0:
							direction = 'right';
							break;
						case 1:
							direction = 'left';
							break;
						case 2:
							direction = 'down';
							break;
						case 3:
							direction = 'up';
							break;
					}

					if(test[0].type == mapArray[i].type)
					{
						joins[direction] = true;
					}
					else
					{
						joins[direction] = false;
					}

					if(!(test[0].type == mapArray[i].type)&&(data.ground.includes(test[0].type)))
					{
						ground[direction]= true;
					}
					else
					{
						ground[direction]= false;
					}

				}
				ground['up_left']=null;
				ground['up_right']=null;
				ground['down_left']=null;
				ground['down_right']=null;

				query.joins = joins;
				query.ground = ground;
				
				joins = ground =null;
				break;

			case 'Shoal': 
				var joins = {}, ground = {};
				for (var k = data.contact.length - 1; k >= 0; k--) 
				{
					var filter = {'x':mapArray[i].x+data.contact[k].x, 'y':mapArray[i].y+data.contact[k].y};
					var test = findInArray(mapArray,filter);

					var query = {}, direction;

					query.type = mapArray[i].type;

					switch(k)
					{
						case 0:
							direction = 'right';
							break;
						case 1:
							direction = 'left';
							break;
						case 2:
							direction = 'down';
							break;
						case 3:
							direction = 'up';
							break;
					}

					if(test[0].type == mapArray[i].type)
					{
						joins[direction] = true;
					}
					else
					{
						joins[direction] = false;
					}

					if(!(test[0].type == mapArray[i].type)&&(data.ground.includes(test[0].type)))
					{
						ground[direction]= true;
					}
					else
					{
						ground[direction]= false;
					}

				}
				ground['up_left']=null;
				ground['up_right']=null;
				ground['down_left']=null;
				ground['down_right']=null;

				query.joins = joins;
				query.ground = ground;
				
				joins = ground =null;
				break;

			case 'Sea':
				var joins = {}, ground = {};
				for (var k = data.around.length - 1; k >= 0; k--) 
				{
					var filter = {'x':mapArray[i].x+data.around[k].x, 'y':mapArray[i].y+data.around[k].y};
					var test = findInArray(mapArray,filter);

					var query = {}, direction;

					query.type = mapArray[i].type;

					switch(k)
					{
						case 4:
							direction = 'right';
							break;
						case 5:
							direction = 'left';
							break;
						case 6:
							direction = 'down';
							break;
						case 7:
							direction = 'up';
							break;
						case 0:
							direction = 'down_right';
							break;
						case 1:
							direction = 'down_left';
							break;
						case 2:
							direction = 'up_right';
							break;
						case 3:
							direction = 'up_left';
							break;
					}

					
					switch(direction)
					{
						case 'up': case 'down': case 'left': case 'right':
							if(filter.x<0 || filter.x>23 || filter.y <0 || filter.y >30)
							{
								joins[direction]=true;
								ground[direction]=false;
							}
							else
							{
								if((test[0].type == mapArray[i].type) || test[0].type == 'Shoal'|| test[0].type == 'Bridge')
								{
									joins[direction] = true;
								}
								else
								{
									joins[direction] = false;
								}
								if(data.ground.includes(test[0].type))
								{
									ground[direction]= true;
								}
								else
								{
									ground[direction]= false;
								}
							}
							break;
						case 'up_right': case 'up_left': case 'down_left': case 'down_right':
							if(filter.x<0 || filter.x>23 || filter.y <0 || filter.y >30)
							{
								ground[direction]=false;
							}
							else
							{
								if(data.ground.includes(test[0].type))
								{
									ground[direction]= true;
								}
								else
								{
									ground[direction]= false;
								}
							}
						break;	 
					}
				}
				if (JSON.stringify(joins)  != JSON.stringify({'up':true,'down':true,'left':true,'right':true}))
				{
					ground['down_right']=null;
					ground['down_left']=null;
					ground['up_right']=null;
					ground['up_left']=null;
					ground['right']=ground.right;
					ground['left']=ground.left;
					ground['down']=ground.down;
					ground['up']=ground.up;
				}
				//query.joins = joins;
				query.ground = ground;	

				// result = await promisedMongoOne('sprites',query);
				// console.log(mapArray[i].x, mapArray[i].y);
				// console.log(query);
				// console.log(result);			

				joins = ground =test = filter =null;
				break;

			case 'HQ': case 'City': case 'Base': case 'Airport': case 'Port': case'Communication Tower':
				query = {'type':mapArray[i].type, 'player':mapArray[i].player};
				break;
		}
		
		// console.log('--------------------------------')
		// console.log(mapArray[i].x,mapArray[i].y);
		// console.log(query)

		result = await promisedMongoOne('sprites',query);
		sprite = result.position;

		// console.log(result.type,sprite);

		mapArray[i]['sprite']=sprite;
		map.push(mapArray[i]);

		//console.log(map);

		sprite = null;
		options = null;
		query = {};
	}
	return map;
}

function findCasesToGo(unit, battle)
{
	var units = battle.units;
	var map = battle.map.map;
	var added = true;
	var casesToGo = [];
	var used = [];
	casesToGo.push({'tile': findInArray(map, {'x':unit.x, 'y':unit.y})[0], 'points_left': unit.movement.pointspoints, 'treated': false});

	while(added)
	{
		added = false;
		for (var i = casesToGo.length - 1; i >= 0; i--) 
		{
			if(!casesToGo[i].treated)
			{
				casesToGo[i].treated = true;

				for (var k = data.contact.length - 1; k >= 0; k--) 
				{
					var newPosition = {'x':casesToGo[i].tile.x + data.contact[k].x, 'y':casesToGo[i].tile.y + data.contact[k].y};
					var tile = findInArray(map, newPosition);

					if(tile.length > 0)
					{
						var type = typy(unit, 'movement.'+tile[0].type).safeObject;
						var availablePoints = casesToGo[i].points_left - type;

						if(findInArray(used, newPosition).length == 0)
						{
							if(type != 0)
							{
								if(availablePoints >= 0)
								{
									if(availablePoints > 0)
									{
										var newCase = {'tile': tile[0], 'points_left': availablePoints, 'treated': false}
									}
									if(availablePoints == 0)
									{
										var newCase = {'tile': tile[0], 'points_left': availablePoints, 'treated': true}								
									}
									casesToGo.push(newCase);
									added =true;
									used.push(newCase.tile);
								}
							}
						}
					}	
				}
			}
			used.push(casesToGo[i].tile);
		}
	}
	casesToGo.sort(function(a, b){return a.tile.x - b.tile.x});
	return casesToGo;
}





async function addMap()
{
	var map = [
			  [2,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,2,2,2,2,2  ],
			  [2,2,2,2,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,2,2,1,"B",2,2  ],
			  [2,6,6,2,2,1,1,6,6,6,6,6,6,6,1,2,1,6,6,6,6,6,6,6,2,1,1,1,1,1,2  ],
			  [2,2,2,2,2,2,2,6,6,6,6,6,6,1,"B",1,"B",1,6,6,6,6,6,6,2,1,1,1,1,1,2  ],
			  [2,2,1,1,1,1,"C",2,2,2,2,2,2,2,1,"C",2,1,2,2,2,2,2,2,2,"C",1,1,1,2,1  ],
			  [2,1,1,1,1,"C",1,6,6,6,6,6,6,2,1,4,1,2,6,6,6,6,6,6,1,1,"C",1,1,1,2  ],
			  [2,1,1,"C3",1,1,6,6,6,6,6,6,6,"E",1,4,1,"E",6,6,6,6,6,6,6,"E",1,"C",1,1,2  ],
			  [2,1,"C",4,1,"E",6,6,6,6,6,6,6,6,7,7,7,6,6,6,6,6,6,6,7,1,"C",4,1,1,1  ],
			  [2,2,1,4,1,2,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,1,1,4,2,1,1  ],
			  [2,1,2,4,2,1,7,6,6,6,6,6,6,6,7,7,7,6,6,6,6,6,6,6,7,1,"C",4,1,1,2  ],
			  [1,1,1,4,1,7,6,6,6,6,6,6,6,7,1,4,2,7,7,6,6,6,6,6,7,1,2,4,"B2",1,2  ],
			  [2,1,"B",4,1,7,6,6,6,6,6,6,7,1,1,4,1,1,1,7,6,6,6,6,6,7,1,4,2,1,2  ],
			  [2,1,1,4,1,7,6,6,6,6,6,7,1,1,"C",4,"B","C",1,1,7,6,6,6,6,7,"B",4,1,2,2  ],
			  [2,2,1,4,"B",7,6,6,6,6,7,1,2,"B",1,4,4,4,4,4,9,9,9,9,9,9,4,4,"A1",1,2  ],
			  [2,2,"A0",4,4,9,9,9,9,9,9,4,4,4,4,4,1,2,2,1,7,6,6,6,6,7,1,1,1,1,1  ],
			  [2,1,2,2,1,7,6,6,6,6,7,1,2,1,1,2,"B",1,1,7,6,6,6,6,6,7,1,1,2,2,1  ],
			  [2,1,1,1,1,7,6,6,6,6,6,6,"E",2,1,1,2,"E",6,6,6,6,6,6,7,1,1,2,6,6,2  ],
			  [1,1,2,1,1,7,6,6,6,6,6,6,6,6,2,1,1,6,6,6,6,6,6,6,7,1,1,1,2,2,2  ],
			  [1,2,1,1,1,1,7,6,6,6,6,6,6,6,7,7,7,6,6,6,6,6,6,7,1,1,1,1,1,1,2  ],
			  [2,1,"B","B",1,1,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,1,1,1,"B","B",1,2  ],
			  [2,"B",2,2,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,1,2,"C",1,1,1,1  ],
			  [2,1,1,1,"C",1,"E",6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,"E",1,1,"B","B",1,2  ],
			  [2,2,"B3",1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,2,2,2,1,1,2  ],
			  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6  ]];
  	var maze = getMaze(map); 
		var fullMap = await getFullMap(maze);
		console.log(fullMap);
		MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("advancewars");
		  dbo.collection("map").insertOne({'name':'Map1', 'map':fullMap}, function(err, res) {
		    if (err) throw err;
		    console.log("1 document inserted"); 
		    db.close();
		  });
		});
}

//addMap();

module.exports.router = router;
module.exports.findCasesToGo = findCasesToGo;