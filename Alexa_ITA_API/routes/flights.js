/**
 * http://usejsdoc.org/
 */
var request = require('request');
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://localhost:27017/flightapi";
var mysql = require("./mysql");
var config = require('./config');
var myJSONObject=
{
	input:"Denver",
	sdatetime:"2017-4-12",
	edatetime:"2017-4-14"
};

var jsonobj={"src":"San Jose",
		"input":"Denver",
		"sdatetime":"",
		"edatetime":"",
		"lat":"",
		"lon":""
		};


exports.search=function(req,res)
{
	var speechText="";
	var details={};
	var option = 0;
	var flightOptions={};
	var flightObjects={};
	console.log(req.param('date'));
	/*myJSONObject.input=req.param('input');
	myJSONObject.sdatetime=req.param('sdatetime');
	myJSONObject.edatetime=req.param('edatetime');*/
	queryobject={
			"source.city" : req.param('origin'),
			"destination.city":req.param('destination'),
			"trip.segment.leg.departureTime":{$regex:"^"+req.param('date')+"*"}
	}
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('flightdata');

		coll.find({
			"source.city" : req.param('origin'),
			"destination.city":req.param('destination'),
			"trip.segment.leg.departureTime":{$regex:"^"+req.param('date')}
	}).toArray(function(err, flights){
			console.log(flights)
			speechText="The top search results are. ";
			flights.forEach(function(element,index){
				details=element;
				option=index+1;
				speechText+="Option"+option+", "+details['trip']['segment'][0]['flight']['carrier']+" "+details['trip']['segment'][0]['flight']['number']+" from "+details['source']['city']+" to "+details['destination']['city']+" for "+details['trip']['saleTotal']+".";
				optionNumber="Option"+option+", "+details['trip']['segment'][0]['flight']['carrier']+" "+details['trip']['segment'][0]['flight']['number']+" from "+details['source']['city']+" to "+details['destination']['city']+" for "+details['trip']['saleTotal']+".";
				flightOptions[option]=optionNumber;
				flightObjects[option]=details;
			});
			
			
			var respon={"statusCode":200,
    				"flights":speechText,
    				"flightObject":flightObjects,
    				"flightOptions":flightOptions
    			};
			console.log("Response generated");
			res.send(respon);

		});
	});	
}
exports.flightBooking= function(req,resp) {	
	var attributes=req.param('attributes');
	console.log(JSON.stringify(attributes));
	var option=attributes.flight_selection
	var mongo_id=attributes.flightObject[option]._id;
	var module="flight";
	var start_date=attributes.startdate_flight;
	var end_date='null';
	var source=attributes.origin_flight;
	var destination=attributes.destination_flight;
	var price=attributes.flightObject[option].pricing.saleTotal;
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
}

exports.searchf=function(req,res)
{
	console.log(req);
	jsonobj.src=req.param('src');
	jsonobj.input=req.param('input');
	console.log(jsonobj);
	//myJSONObject.request.slice[0].date=req.param('date');
	request({
	    url: "https://homerest.herokuapp.com/req/fly",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: jsonobj
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
           // console.log(JSON.stringify(response.body));
            //res.send(response);
            console.log(response.body);
            /*for(i=0;i<response.body.trips.tripOption.length;i++)
            	{
            	details={};
            	details.price=response.body.trips.tripOption[i].saleTotal;
            	details.id=response.body.trips.tripOption[i].id;
            	details.carrier=response.body.trips.tripOption[i].slice[0].segment[0].flight.carrier;
            	details.departure=response.body.trips.tripOption[i].slice[0].segment[0].leg[0].departureTime;
            	details.duration=response.body.trips.tripOption[i].slice[0].segment[0].leg[0].duration;
            	flight.push(details);
            	console.log(flight);
            	console.log(details);
            	var ress={"statusCode":200,
            				"flight":flight
            			};
            	
            	}*/
            res.send(response.body);
        }
		else
			{
			console.log(response.status=500);
			res.send(response);
			}
	});
	
}