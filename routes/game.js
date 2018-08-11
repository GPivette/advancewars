var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var data = require('./data');
var maps = require('./map');
var units = require('./units');
var typy = require('typy');
var Game = {'units': [],'building':{}};


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

function promisedInsert(collection,document)
{
	MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) 
	{
		  if (err) throw err;
		  var dbo = db.db("advancewars");
		  dbo.collection(collection).insertOne(document, function(err, res) {
		    if (err) throw err;
		    console.log("1 document inserted");
		    db.close();
		  });
		});
}

function promisedUpdate(collection,query,document)
{
	MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) 
	{
		if (err) throw err;
		var dbo = db.db("advancewars");
		dbo.collection(collection).updateOne(query,{$set:document}, function(err, res) 
		{
			if (err) throw err;
			console.log("1 document updated");
			db.close();
		});
	});
}

function respond(socket) 
{
	socket.on('requireGame',async function()
	{
		var map = await promisedMongoOne('map',{});
		var battle = {'map':map, 'units':[], 'players':[{'name':'Player1'}, {'name':'Player2'}], 'begin_time':Date.now()};

		Game = battle;

		await promisedInsert('game',battle);

		socket.emit('newGame',battle);
	});

	socket.on('click', async function(position, selected, selectedCases, unitsToCreate)
	{
		var battle = await promisedMongoOne('game',{'begin_time': Game.begin_time});
		if(unitsToCreate.length > 0)
		{
			var unitToAdd = findInArray(unitsToCreate, {'x':position.x})
			if(unitToAdd.length >0)
			{
				console.log(unitToAdd)
				var newUnit = await units.createUnit({'x':Game.building.x, 'y':Game.building.y},{'id':unitToAdd[0].unit.id});
				battle.units.push(newUnit);
				await promisedUpdate('game',{'players':battle.players, 'begin_time': battle.begin_time},battle);
				Game.building= {};
				socket.emit('newUnit', newUnit);
			}
		}
		else
		{
			if(position.y >=0)
			{
				if(selected)
				{
					var dest = findInArray(selectedCases,position);
					if(dest.length > 0)
					{
						dest = dest[0];
						var unitToAttack = findInArray(battle.units,position);
						if(unitToAttack.length > 0)
						{

						}
						else
						{
							if(!Game.unit.moved)
							{
								battle = units.move(battle,Game.unit, dest); 
								await promisedUpdate('game',{'begin_time': Game.begin_time},battle);
							}
						}
							
						// if (units.isAttackableUnit(dest).length > 0)
						// {
						// 	units.attack(unit1, unit2);
						// }
						// else
						// {
						 	
						// }
					}
					socket.emit('unitSelected',[],battle.units);
					Game.unit = {};
				}
				else
				{
					var map = battle.map.map;
					var unitsArray = battle.units;

					var tile = findInArray(map,position);
					var unit = findInArray(unitsArray,position);

					if(unit.length > 0)
					{
						Game.unit = unit[0];
						var casesToGo = maps.findCasesToGo(unit[0], battle);
						for (var i = unitsArray.length - 1; i >= 0; i--) 
						{
							var foundUnit = findInArray(casesToGo, {'x': unitsArray[i].x, 'y': unitsArray[i].y}) 
							if(foundUnit.length > 0)
							{
								Game.units.push(foundUnit[0]);
							}
						}
						socket.emit('unitSelected', maps.findCasesToGo(unit[0], battle), Game.units);
					}
					else
					{
						if(data.buildings.includes(tile[0].type))
						{
							if(tile[0].type == 'Base')
							{
								// var newUnit = await units.createUnit({'x':tile[0].x, 'y':tile[0].y},{'id':4});
								// battle.units.push(newUnit);
								// await promisedUpdate('game',{'players':battle.players, 'begin_time': battle.begin_time},battle);
								// socket.emit('newUnit', newUnit);
								Game.building = tile[0];
								socket.emit('baseSelected', await units.getBaseUnits());
							}
						}
					}
				}
			}
			
		}
			
	});

	socket.on('createNewMap',async function(map)
	{
		var fullMap = await maps.getFullMap(maps.getMaze(map));
	});
}

module.exports.router = router;
module.exports.respond = respond;