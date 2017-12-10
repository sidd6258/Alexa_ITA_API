//Redirects to the homepage
var nodemailer = require("nodemailer");
var mysql = require("./mysql");
var mongo = require("./mongo");
var config = require('./config');
var mongoURL = "mongodb://"+config.mongoDB.host+":"+config.mongoDB.port+"/"+config.mongoDB.database;
//var mongoURL = "mongodb://localhost:27017/iTravelDB";
var ObjectId = require('mongodb').ObjectID;
exports.goToBookingPage = function(req,res){
    //Checks before redirecting whether the session is valid
    if(req.session.userId)
    {
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("bookingPage",{userId:req.session.userId, email:req.session.email});
    }
    else
    {
        //res.redirect('/logout');
    }
};
var getFlightData =  function(json_responses) {
    console.log("Inside getFlightData");
    return new Promise(function(resolve, reject) {
        mongo.connect(mongoURL, function () {
            //console.log("obj_ids1",json_responses.obj_ids);
            var coll = mongo.collection('flightDataset');
            coll.find({"_id": {"$in": json_responses.obj_ids}}).toArray(function (err, flightData) {
                if (flightData) {
                    //console.log("Flight data retrieved successfully" + JSON.stringify(flightData));
                    json_responses.flightData = flightData;
                    resolve(json_responses);
                }else{
                    console.log("error"+err);
                    reject(err);
                }
            });
        });
    });
};

var getCarData = function(json_responses){
    console.log("Inside getCarData");
    return new Promise(function(resolve, reject) {
        mongo.connect(mongoURL, function () {
            //console.log("obj_ids2",json_responses.obj_ids);
            var coll = mongo.collection('carDataset');
            coll.find({"_id": {"$in": json_responses.obj_ids}}).toArray(function (err, carData) {
                if (carData) {
                    //console.log("Car data retrieved successfully" + JSON.stringify(carData));
                    json_responses.carData = carData;
                    resolve(json_responses);
                }else{
                    console.log("error"+err);
                    reject(err);
                }
            });
        });
    });
};

var getHotelData =  function(json_responses) {
    console.log("Inside getHotelData");
    return new Promise(function (resolve, reject) {
        mongo.connect(mongoURL, function() {
            //console.log("obj_ids3",json_responses.obj_ids);
            var coll = mongo.collection('hotelDataset');
            coll.find({"_id": {"$in": json_responses.obj_ids}}).toArray(function (err, hotelData) {
                if (hotelData) {
                    //console.log("Hotel data retrieved successfully"+JSON.stringify(hotelData));
                    json_responses.hotelData = hotelData;
                    resolve(json_responses);
                }else{
                    console.log("error"+err);
                    reject(err);
                }
            });
        });
    });
};

exports.fetchFutureBookingData = function(req, res){
    console.log("fetchFutureBookingData");
    if(!req.param("email")){
        console.log("Unable to get all details from User");
        res.send({"statusCode" : 400});
    }else{
        var email = req.param("email");
        //console.log("email->"+email);
        var query= "Select booking_id, mongo_id, module, start_date, end_date, source, destination, price from booking where email = '"+email+"' and start_date > NOW() order by start_date desc";
        var json_responses = {};
        mysql.fetchData(function (err, result) {
            if (err) {
                throw err;
            }
            else {
                if (result.length > 0) {
                    //console.log(JSON.stringify(result));
                    json_responses.statusCode = 200;
                    json_responses.data = result;
                    //console.log("json_responses",JSON.stringify(json_responses));
                    var jsonArr = [];
                    //console.log("result.length",result.length);
                    for(var i=0; i<result.length; i++) {
                        if(result[i].mongo_id != undefined){
                            jsonArr.push(result[i].mongo_id);
                        }
                    }
                    var ids = jsonArr.toString().split(",");
                    var obj_ids = ids.map(function(id){return ObjectId(id);});
                    console.log("obj_ids0",obj_ids);
                    json_responses.obj_ids = obj_ids;
                    getFlightData(json_responses).then(function(json_responses) {
                        return getCarData(json_responses);
                    }).then(function(json_responses) {
                        return getHotelData(json_responses);
                    }).then(function(json_responses){
                        console.log("json_responses",JSON.stringify(json_responses));
                        res.send(json_responses);
                    });
                }else{
                    console.log("No data found");
                    json_responses.statusCode = 401;
                    res.send(json_responses);
                }
            }
        }, query);
    }
}

exports.fetchBookingData = function(req, res){
    console.log("fetchBookingData");
    if(!req.param("email")){
        console.log("Unable to get all details from User");
        res.send({"statusCode" : 400});
    }else{
        var email = req.param("email");
        //console.log("email->"+email);
        var query= "Select booking_id, mongo_id, module, start_date, end_date, source, destination, price from booking where email = '"+email+"' and start_date <= NOW() order by start_date desc";
        var json_responses = {};
        mysql.fetchData(function (err, result) {
            if (err) {
                throw err;
            }
            else {
                if (result.length > 0) {
                    //console.log(JSON.stringify(result));
                    json_responses.statusCode = 200;
                    json_responses.data = result;
                    //console.log("json_responses",JSON.stringify(json_responses));
                    var jsonArr = [];
                    //console.log("result.length",result.length);
                    for(var i=0; i<result.length; i++) {
                        if(result[i].mongo_id != undefined){
                            jsonArr.push(result[i].mongo_id);
                        }
                    }
                    var ids = jsonArr.toString().split(",");
                    var obj_ids = ids.map(function(id){return ObjectId(id);});
                    //console.log("obj_ids0",obj_ids);
                    json_responses.obj_ids = obj_ids;
                    getFlightData(json_responses).then(function(json_responses) {
                        return getCarData(json_responses);
                    }).then(function(json_responses) {
                        return getHotelData(json_responses);
                    }).then(function(json_responses){
                        res.send(json_responses);
                    });
                }else{
                    console.log("No data found");
                    json_responses.statusCode = 401;
                    res.send(json_responses);
                }
            }
        }, query);
    }
};


function sendmail(obj){
    var mailOptions={
            to : "siddharth6258@gmail.com",
            subject : "How are you",
            text : "I'm good"
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
         }else{
                console.log("Message sent: " + response);
             }
    });
 };
