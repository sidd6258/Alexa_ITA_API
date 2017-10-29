/**
 * http://usejsdoc.org/
 */
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/iTravelDB";
var mysql = require("./mysql");
var config = require('./config');
const moment=require('moment');
exports.search= function(req,resp) {
	var details={};
	var cars=[];
	var speechText = "";
	var option = 0;
	var input=req.param('destination');;
    var startDate = req.param('sdatetime');
   var endDate = req.param('edatetime');
    queryObject={destination:input,availability:{$not:{$elemMatch:{date:{$gte: new Date(startDate),$lte: new Date(endDate)},status:false}}}}
    console.log("queryObject"+JSON.stringify(queryObject));
    var carOptions={};
    var carObjects={};
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('carDataset');
		coll.find(queryObject,{availability:0}).toArray(function(err, cars){
			if (cars) {
				console.log(cars.length);
				if(cars.length > 0)
				{
				for(i=0;i<3;i++){
					details = cars[i];
					option = i+1;
					if(option == 1)
						{
						speechText += "The top search results are. Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
						speechText += " and seating avaialble for "+details.seating + " Total price is "+ details.dailyRate+". ";		
						optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
						carOptions[option]=optionNumber;
						carObjects[option]=details;
						}
					else{
						speechText += " Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
						speechText += " and seating avaialble for "+details.seating + " Total price is "+ details.dailyRate+".";
						optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
						carOptions[option]=optionNumber;
						carObjects[option]=details;
					}
					}
					var respon={"statusCode":200,
		    				"cars":speechText,
		    				"carObject":carObjects,
		    				"carOptions":carOptions
		    			};
					console.log("Response generated");
					resp.send(respon);
				}
			else{
				speechText += "no results found";
				var respon={"statusCode":200,
	    				"cars":speechText,
	    				"carObject":cars,
	    				"carOptions":carOptions
	    			};
				resp.send(respon);
			}
			}else {
				console.log("returned false");
				json_responses = {"statusCode" : 401};
				callback(null,json_responses);
			}
		});
	});
	
}
exports.carBooking= function(req,resp) {
	var attributes=req.param('attributes');
	console.log(JSON.stringify(attributes));
    var setBooking = "Insert into booking (User_id, Card_number, Card_name, Expiry_date, CVV_number) " +
    "VALUES('" + userId + "','" + card_number_enc + "','" + card_holder_name + "','" + exp_date + "','" + cvv_enc + "')";
	//console.log(setUser);
	mysql.insertData(function (err, result) {
	    if (err) {
	        console.log(err);
	    }
	    else {
	        console.log("Successfully inserted details in MYSQL");
	    }
	}, setBooking);
	var respon={"statusCode":200};
	resp.send(respon);
}
