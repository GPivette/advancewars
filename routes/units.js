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

module.exports.createUnit = createUnit;
module.exports.router = router;
