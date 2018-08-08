
var contact = [{'x':0,'y':1},{'x':0,'y':-1},{'x':1,'y':0},{'x':-1,'y':0}];
var ground = ['Plain','Forest','Mountain','Road','HQ','City','Base','Airport','Port','Communication Tower'];
var around =  [{'x':1, 'y':1},{'x':1, 'y':-1},{'x':-1, 'y':1},{'x':-1, 'y':-1},{'x':0, 'y':1},{'x':0,'y':-1},{'x':1,'y':0},{'x':-1,'y':0}];

var express = require('express');
var router = express.Router();

module.exports.contact = contact;
module.exports.ground = ground;
module.exports.around = around;

