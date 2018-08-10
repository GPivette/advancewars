var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var data = require('./data');
var maps = require('./map');
var units = require('./units');
var typy = require('typy');
var Game = {};

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

	socket.on('click', async function(position, selected)
	{
		if(selected)
		{
			socket.emit('unitSelected',[]);
		}
		else
		{
			var battle = await promisedMongoOne('game',{'begin_time': Game.begin_time});
			var map = battle.map.map;
			var unitsArray = battle.units;

			var tile = findInArray(map,position);
			var unit = findInArray(unitsArray,position);

			if(unit.length > 0)
			{
				socket.emit('unitSelected', maps.findCasesToGo(unit[0], battle));
			}
			else
			{
				if(data.buildings.includes(tile[0].type))
				{
					if(tile[0].type == 'Base')
					{
						var newUnit = await units.createUnit({'x':tile[0].x, 'y':tile[0].y},{'id':4});
						battle.units.push(newUnit);
						await promisedUpdate('game',{'players':battle.players, 'begin_time': battle.begin_time},battle);
						socket.emit('newUnit', newUnit);
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