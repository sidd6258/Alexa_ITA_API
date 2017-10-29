/**
 * http://usejsdoc.org/
 */
console.log("server start");
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/ita_hotel";
var mysql = require("./mysql");
var config = require('./config');

const moment=require('moment');
var jsonObj = 
{
	"input":"",
	"sdatetime":"",
	"edatetime":""	
};
exports.search= function(req,resp) {
	var details={};
	var hotels=[];
	var speechText = "";
	var option = 0;
	var input = req.param('destination');
	var startDate= new Date(req.param('sdatetime'));
	var endDate = new Date(req.param('edatetime'));
	var dates = [];
	var hotelOptions={};
	var hotelObjects={};

	
	var sdate = new Date(startDate);
	var edate = new Date(endDate);
	queryObject = {destination:input,availability:{$not:{$elemMatch:{date:{$gte:new Date(startDate),$lte:new Date(endDate)},status:false}}}};

	console.log("queryObject: "+JSON.stringify(queryObject));
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('hoteldb');
		coll.find(queryObject,{"availability":0}).toArray(function(err, hotels){
			if(hotels){
				console.log(hotels.length)
				if(hotels.length > 0)
				{
				speechText="The top search results are. ";
				for(i=0;i<3;i++){
					details = hotels[i];
					option = i+1;
					
						speechText += "Option "+option+", "+details.roomType+ " room type in a "+details.starRating+" star "+details.propertyType+", "+details.hotelName +", for "+ details.dailyRate+" per day, with amenities like "+details.amenities[0]+" and "+details.amenities[1]+". ";
						optionNumber= "Option "+option+", "+details.roomType+ " room type in a "+details.starRating+" star "+details.propertyType+", "+details.hotelName +", for "+ details.dailyRate+" per day.";

						hotelOptions[option]=optionNumber;
						hotelObjects[option]=details;
					}
					var respon={"statusCode":200,
		    				"hotels":speechText,
		    				"hotelObject":hotelObjects,
		    				"hotelOptions":hotelOptions
		    			};
					console.log("Response generated");
					resp.send(respon);
				}
			else{
				speechText = "no results found";
				var respon={"statusCode":404,
	    				"hotels":speechText,
	    				"hotelObject":hotels,
	    				"hotelOptions":hotelOptions
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
	
	exports.hotelBooking= function(req,resp) {
		var attributes=req.param('attributes');
		var option=attributes.hotel_selection
		var mongo_id=attributes.hotelObject[option]._id;
		var module="hotel";
		var start_date=attributes.startdate_hotel;
		var end_date=attributes.enddate_hotel;
		var source='null';
		var destination=attributes.destination_hotel;
		var price=attributes.hotelObject[option].dailyRate;
		var email=attributes.profile.email;
		console.log(JSON.stringify(attributes));
	    var setBooking = "Insert into booking (mongo_id, module, start_date, end_date, source, destination, price, email) " +
	    "VALUES('" + mongo_id + "','" + module + "','" + start_date + "','" + end_date + "','" + source + "','" + destination + "','" + price + "','" + email + "')";
		console.log(setBooking);
		mysql.insertData(function (err, result) {
		    if (err) {
		        console.log(err);
		    }
		    else {
		        console.log("Successfully inserted details in MYSQL");
		    	var respon={"statusCode":200};
		    	resp.send(respon);
		    }
		}, setBooking);
	
//	coll.find(queryObject).toArray(function(err, hotels){
	
}