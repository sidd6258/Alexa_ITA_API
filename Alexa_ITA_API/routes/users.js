var mongo = require("./mongo");
var mysql = require("./mysql");
var config = require('./config');
var mongoURL = "mongodb://"+config.mongoDB.username+":"+config.mongoDB.password+"@"+config.mongoDB.host+":"+config.mongoDB.port+"/"+config.mongoDB.database;
//var mongoURL = "mongodb://localhost:27017/iTravelDB";
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');
var key = '00%i%Travel%System%00';

exports.getAllUsers = function(req,res){
    mongo.connect(mongoURL, function() {
        var coll = mongo.collection('users');
        var result;
        coll.find({},{'_id': false}).toArray(function (err, users) {
            if(err){
                result = {"statusCode" : 401};
                console.log("err "+err);
                res.send(result);
            }else{
                if(users) {
                    users = JSON.stringify(users);
                    console.log("Users data retrieved successfully" + users);
                    res.send(users);
                }
            }
        });
    });
};

exports.getUser = function(req,res){
    var email = req.params.email;
    //console.log("email",email);
    mongo.connect(mongoURL, function() {
        var coll = mongo.collection('users');
        var result;
        coll.find({
        "email": email},{'_id': false}).toArray(function(err, user){
            if(err){
                result = {"statusCode" : 401};
                console.log("err "+err);
                res.send(result);
            }else{
                if (user) {
                    result = JSON.stringify(user);
                    res.send(result);
                }
            }
        });
    });
};

exports.updateUser = function(req,res){
    var email = req.params.email;
    var data = req.body;
    delete data._id;
    //console.log("data",data);
    mongo.connect(mongoURL, function() {
        var coll = mongo.collection('users');
        var result;
        //console.log("data1");
        coll.updateOne({"email": email}, {
            $set: data
        },function(err, user){
            console.log("data2 "+user);
            if(err){
                console.log("err "+err);
                result = {"statusCode" : 401};
                res.send(result);
            }else{
                if (user) {
                    result = JSON.stringify(user);
                    res.send(result);
                }
            }
        });
    });
};