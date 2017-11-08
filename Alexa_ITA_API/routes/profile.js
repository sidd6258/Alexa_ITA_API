var mongo = require("./mongo");
var mysql = require("./mysql");
var config = require('./config');
var mongoURL = "mongodb://"+config.mongoDB.host+":"+config.mongoDB.port+"/"+config.mongoDB.database;
//var mongoURL = "mongodb://localhost:27017/iTravelDB";
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');
var key = '00%i%Travel%System%00';

exports.goToProfilePage = function(req,res){
    //Checks before redirecting whether the session is valid
    if(req.session.userId)
    {
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("profilePage",{userId:req.session.userId, email:req.session.email});
    }
    else
    {
        res.redirect('/');
    }
};

exports.fetchUserData = function(req,res) {
	console.log("In fetchUserData");
	var json_responses;
    var getCreditCardDetails = "select * from credit_card_details where User_id ='"+req.session.userId+"'";
	mongo.connect(mongoURL, function(){
		//console.log("Session Var:"+req.session.userId);
		//console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
        //console.log('coll: ' + simpleStringify(coll));
		coll.findOne({"_id": ObjectId(req.session.userId)}, {"first_name": 1, "last_name": 1, "email":1, "gender":1, "dob":1, "contact_information":1, "preferences":1, "_id":0}, function(err, user){
			if (user) {
				console.log("Data retrieved successfully");
				//console.log('user------>' + JSON.stringify(user));
                json_responses = {"statusCode" : 200, "message": "User retrieved successfully","results": user};
                mysql.fetchData(function (err, result) {
                    if (err) {
                        throw err;
                    }
                    else {
                        if (result.length > 0) {
                            //console.log("Results from MYSQL " + JSON.stringify(result));
                            //console.log("result.Card_name" + result[0].Card_name);
                            //console.log("result.CVV_number" + result[0].CVV_number);
                            //console.log("result.Card_number" + result[0].Card_number);
                            //console.log("result.Expiry_date" + result[0].Expiry_date);
                            var cvv = result[0].CVV_number;
                            var vals = result[0].Expiry_date.split('-');
                            var expiry_year = vals[0];
                            var expiry_month = vals[1];
                            var card_holder_name = result[0].Card_name;
                            var card_number = result[0].Card_number;
                            card_number = crypto.createDecipher("aes-256-ctr", key).update(card_number, "hex", "utf-8");
                            cvv = crypto.createDecipher("aes-256-ctr", key).update(cvv, "hex", "utf-8");
                            json_responses = {
                                "statusCode": 200,
                                "results": user,
                                "cvv": cvv,
                                "expiry_year": expiry_year,
                                "expiry_month": expiry_month,
                                "card_holder_name": card_holder_name,
                                "card_number": card_number
                            };
                            //console.log('json_responses------>' + JSON.stringify(json_responses));
                            res.send(json_responses);
                        } else {
                            res.send(json_responses);
                        }
                    }
                }, getCreditCardDetails);
			} else {
				console.log("returned false");
				json_responses = {"statusCode" : 401};
                res.send(json_responses);
			}
		});
	});
};

exports.updateUserData = function(req,res) {
    console.log("In updateUserData");
    var json_responses;
    var first_name = req.param("first_name");
    var last_name = req.param("last_name");
    var mobile = req.param("mobile");
    var dob = req.param("dob");
    var gender = req.param("gender");
    var address_line_1 = req.param("address_line_1");
    var address_line_2 = req.param("address_line_2");
    var city = req.param("city");
    var region = req.param("region");
    var postal_code = req.param("postal_code");
    var country = req.param("country");
    var airline_name = req.param("airline_name");
    var airline_class = req.param("airline_class");
    var airline_days = req.param("airline_days");
    //console.log("airline_days", airline_days);
    var airline_time = req.param("airline_time");
    var car_model = req.param("car_model");
    var car_rental_company = req.param("car_rental_company");
    var car_mileage = req.param("car_mileage");
    var car_price = req.param("car_price");
    var car_features = req.param("car_features");
    //console.log("car_features", car_features);
    var hotel_star_rating = req.param("hotel_star_rating");
    var hotel_location = req.param("hotel_location");
    var hotel_price = req.param("hotel_price");
    var food_type = req.param("food_type");
    var food_cuisine = req.param("food_cuisine");
    var card_holder_name = req.param("card_holder_name");
    var card_number = req.param("card_number");
    var expiry_month = req.param("expiry_month");
    var expiry_year = req.param("expiry_year");
    var cvv = req.param("cvv");
    var msg_payload =
	{
		"first_name": first_name,
		"last_name": last_name,
		"gender": gender,
		"dob": dob,
		"contact_information": {
			"mobile": mobile,
			"address": {
				"address_line_1": address_line_1,
				"address_line_2": address_line_2,
				"city": city,
				"region": region,
				"country": country,
				"postal_code": postal_code
			}
		},
		"preferences": {
			"flight": {
				"airline_name": airline_name,
				"airline_class": airline_class,
				"airline_days":  airline_days,
				"airline_time": airline_time
			},
			"hotel": {
				"hotel_star_rating": hotel_star_rating,
				"hotel_location": hotel_location,
				"hotel_price": hotel_price
			},
			"car": {
				"car_model": car_model,
				"car_rental_company": car_rental_company,
				"car_mileage": car_mileage,
				"car_price": car_price,
				"car_features":  car_features
			},
			"food_cuisine": food_cuisine,
			"food_type": food_type
		}
	};
    mongo.connect(mongoURL, function () {
        //console.log("Session Var:" + req.session.userId);
        //console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');
        coll.update({"_id": ObjectId(req.session.userId)}, {
            $set: msg_payload
        }, function (err, user) {
            if (user) {
                console.log("Data Updated successfully");
                json_responses = {"statusCode": 200};
                var getCreditCardDetails = "select * from credit_card_details where User_id ='"+req.session.userId+"'";
                if(card_holder_name != undefined && card_number != undefined && expiry_month != undefined && expiry_year != undefined && cvv != undefined) {
                    var card_number_enc = crypto.createCipher("aes-256-ctr", key).update(card_number, "utf-8", "hex");
                    //console.log("card_number_enc--->" + card_number_enc);
                    var exp_date = new Date('20' + expiry_year + '-' + expiry_month + '-' + 01).toISOString().slice(0, 10);
                    //console.log("exp_date--->" + exp_date);
                    var cvv_enc = crypto.createCipher("aes-256-ctr", key).update(cvv, "utf-8", "hex");
                    //console.log("cvv_enc--->" + cvv_enc);
                    mysql.fetchData(function(err,result) {
                        if (err) {
                            throw err;
                        }
                        else {
                            if (result.length > 0) {
                                var updateCreditCard = "Update into credit_card_details set Card_number ='"+card_number_enc+"', Card_name ='"+card_holder_name
                                    +"', Expiry_date ='"+exp_date+"', CVV_number ='"+ cvv_enc+"' where User_id = '"+req.session.userId+"'";
                                //console.log(updateCreditCard);
                                mysql.insertData(function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log("Successfully inserted details in MYSQL");
                                    }
                                }, updateCreditCard);
                            }else{
                                var setCreditCard = "Insert into credit_card_details (User_id, Card_number, Card_name, Expiry_date, CVV_number) " +
                                    "VALUES('" + req.session.userId + "','" + card_number_enc + "','" + card_holder_name + "','" + exp_date + "','" + cvv_enc + "')";
                                //console.log(setCreditCard);
                                mysql.insertData(function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log("Successfully inserted details in MYSQL");
                                    }
                                }, setCreditCard);
                            }
                        }
                    });
                }
                res.send(json_responses);
            } else {
                console.log("returned false");
                json_responses = {"statusCode": 401};
                res.send(json_responses);
            }
        });
    });
};
/*
function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};*/
