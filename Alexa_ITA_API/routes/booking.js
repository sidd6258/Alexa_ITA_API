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
exports.fetchBookingData = function(req, res){
    console.log("fetchBookingData");
    if(!req.param("email")){
        console.log("Unable to get all details from User");
        res.send({"statusCode" : 400});
    }else{
        var email = req.param("email");
        //console.log("email->"+email);
        var query= "Select booking_id, mongo_id, module, start_date, end_date, source, destination, price from booking where email = '"+email+"' order by booking_id desc";
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
                    for(var i=0; i<result.length; i++) {
                        jsonArr.push(result[i].mongo_id);
                    }
                    var ids = jsonArr.toString().split(",");
                    var obj_ids = ids.map(function(id){return ObjectId(id);});
                    mongo.connect(mongoURL, function() {
                        var coll = mongo.collection('carDataset');
                        coll.find({"_id": {"$in": obj_ids}}).toArray(function (err, carData) {
                            if (carData) {
                                console.log("Car data retrieved successfully");
                                json_responses.carData = carData;
                            }
                        });
                    });
                    mongo.connect("mongodb://"+config.mongoDB.host+":"+config.mongoDB.port+"/flightapi", function() {
                        var coll = mongo.collection('flightdata');
                        coll.find({"_id": {"$in": obj_ids}}).toArray(function (err, flightData) {
                            if (flightData) {
                                console.log("Flight data retrieved successfully");
                                json_responses.flightData = flightData;
                            }
                        });
                    });
                    mongo.connect("mongodb://"+config.mongoDB.host+":"+config.mongoDB.port+"/ita_hotel", function() {
                        var coll = mongo.collection('hoteldb');
                        coll.find({"_id": {"$in": obj_ids}}).toArray(function (err, hotelData) {
                            if (hotelData) {
                                console.log("Hotel data retrieved successfully");
                                json_responses.hotelData = hotelData;
                                //console.log("json_responses",JSON.stringify(json_responses));
                                res.send(json_responses);
                            }
                        });
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
