var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var typy = require('typy');
var async = require('async'); 

async function createUnit(position, unit)
{
	var newUnit = await promisedMongoOne('units',unit);

	newUnit.x = position.x;
	newUnit.y = position.y;
	newUnit.moved = false;

	return newUnit;
}

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

function promisedMongo(collection, query)
{
	return new Promise (function(resolve, reject)
	{
		MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) 
	  	{
			if (err) throw err;
			var dbo = db.db("advancewars");
			dbo.collection(collection).find(query).toArray(function(err, result) 
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

function move(battle, unit, dest)
{
	var unit = findInArray(battle.units,{'x':unit.x, 'y':unit.y})[0];
	unit.x = dest.x;
	unit.y = dest.y;

	return battle;
}

async function getBaseUnits()
{
	var units = await promisedMongo('units',{'type': "GRO"});
	units.sort(function(a, b){return a.id - b.id});
	return units;
}

module.exports.createUnit = createUnit;
module.exports.router = router;
module.exports.move = move;
module.exports.getBaseUnits = getBaseUnits;
