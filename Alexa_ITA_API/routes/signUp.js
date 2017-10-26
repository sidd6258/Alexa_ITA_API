var mongo = require("./mongo");
var mysql = require("./mysql");
var config = require('./config');
var mongoSessionConnectURL = "mongodb://"+config.mongoDB.host+":"+config.mongoDB.port+"/"+config.mongoDB.database;
//var mongoSessionConnectURL = "mongodb://localhost:27017/iTravelDB";
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var key = '00%i%Travel%System%00';

exports.goToSignUpPage = function(req,res){
	console.log("In goToSignUpPage");
    res.render('signUpPage', function(err, result) {
 	   // render on success
 	   if (!err) {
            res.end(result);
 	   }
 	   // render or error
 	   else {
	        res.end('An error occurred');
	        console.log(err);
 	   }
    });
};

exports.afterSignUpPage = function(req,res){
	console.log("In afterSignUpPage");
	//console.log(req.body);
	//console.log("req--->"+JSON.stringify(req.body));
	if(!req.param("email") || !req.param("password") || !req.param("first_name") || !req.param("last_name") || !req.param("mobile") || !req.param("dob") ||
		!req.param("gender")){
		console.log("Unable to get all details from User");
		res.send({"statusCode" : 500});
	}else{
		var email = req.param("email");
		var password = req.param("password");
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
		var airline_time = req.param("airline_time");
		var car_model = req.param("car_model");
		var car_rental_company = req.param("car_rental_company");
		var car_mileage = req.param("car_mileage");
		var car_price = req.param("car_price");
		var car_features = req.param("car_features");
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
		var hash = bcrypt.hashSync(password);
		var msg_payload = {
			"first_name": first_name,
			"last_name": last_name,
			"email": email,
			"password": hash,
			"gender": gender,
			"dob": dob,
			"contact_information": 
            {
                "mobile": mobile,
                "address":
                {
                    "address_line_1": address_line_1,
                    "address_line_2": address_line_2,
                    "city": city,
                    "region": region,
                    "country": country,
                    "postal_code": postal_code
                }
            },
            "preferences":{
            	"flight":{
            		"airline_name" : airline_name,
            		"airline_class" : airline_class,
            		"airline_days" : airline_days,
            		"airline_time" : airline_time
            	},
            	"hotel":{
            		"hotel_star_rating" : hotel_star_rating,
            		"hotel_location" : hotel_location,
            		"hotel_price" : hotel_price
            	},
            	"car":{
            		"car_model" : car_model,
            		"car_rental_company" : car_rental_company,
            		"car_mileage" : car_mileage,
            		"car_price" : car_price,
            		"car_features" : car_features
            	},
            	"food_cuisine" : food_cuisine,
            	"food_type" : food_type
            }
		};
		//console.log("msg_payload"+JSON.stringify(msg_payload));

		mongo.connect(mongoSessionConnectURL, function(){
			var coll = mongo.collection('users');
			//console.log('Connected to mongo at: ' + mongoSessionConnectURL);
			coll.insertOne(msg_payload, function(err, user){
				if (user) {
					console.log("User details inserted sucessfully");
					json_responses = {"statusCode" : 200, "message": "Inserted sucessfully"};
					if(card_holder_name != undefined && card_number != undefined && expiry_month != undefined && expiry_year != undefined && cvv != undefined) {
                        coll.findOne({"email": email}, function (err, user) {
                            //console.log("Finding user");
                            //console.log("user----->" + JSON.stringify(user));
                            if (user) {
                                var userId = user._id;
                                //console.log("userId retrieved");
                                //console.log("userId--->" + userId);
                                var card_number_enc = crypto.createCipher("aes-256-ctr", key).update(card_number, "utf-8", "hex");
                                //console.log("card_number_enc--->" + card_number_enc);
                                var exp_date = new Date('20' + expiry_year + '-' + expiry_month + '-' + 01).toISOString().slice(0, 10);
                                //console.log("exp_date--->" + exp_date);
                                var cvv_enc = crypto.createCipher("aes-256-ctr", key).update(cvv, "utf-8", "hex");
                                //console.log("cvv_enc--->" + cvv_enc);
                                if (typeof userId != "undefined") {
                                    var setUser = "Insert into Credit_card_details (User_id, Card_number, Card_name, Expiry_date, CVV_number) " +
                                        "VALUES('" + userId + "','" + card_number_enc + "','" + card_holder_name + "','" + exp_date + "','" + cvv_enc + "')";
                                    //console.log(setUser);
                                    mysql.insertData(function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            console.log("Successfully inserted details in MYSQL");
                                        }
                                    }, setUser);
                                }
                            }
                            else {
                                console.log("Unable to find userId, hence credit card details are not stored");
                            }
                        });
                    }
					res.send(json_responses);
				} else {
					console.log("returned false");
					json_responses = {"statusCode" : 401, "message": "Insertion failed"};
					res.send(json_responses);
				}
			});
		});
	}
};