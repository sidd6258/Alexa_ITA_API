/**
 * http://usejsdoc.org/
 */
var request = require('request');
var myJSONObject=
{
	"request": {
				    "passengers": 
							    {
							      "adultCount": "1",
							      "childCount": "0",
							      "infantInLapCount": "0",
							      "infantInSeatCount": "0",
							      "seniorCount": "0"
							    },
				    "slice": 
						    [
						      {
						        "origin": "",
						        "destination": "LAX",
						        "date": "2017-09-19"
						      }
						    ],
				    "solutions": "5"
			  }
};

var jsonobj={"src":"San Jose",
		"input":"Denver",
		"sdatetime":"",
		"edatetime":"",
		"lat":"",
		"lon":""
		};


exports.searchh=function(req,res){

	var myJSONObject={
			  "request": {
				    "passengers": {
				      "adultCount": "1",
				      "childCount": "0",
				      "infantInLapCount": "0",
				      "infantInSeatCount": "0",
				      "seniorCount": "0"
				    },
				    "slice": [
				      {
				        "origin": "SFO",
				        "destination": "LAX",
				        "date": "2017-09-19"
				      }
				    ],
				    "solutions": "5"
				  }
				};
	request({
	    url: "https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyA7AZRIufiuhGdyaQF5w7eatte_CRbbqCk",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
            console.log(response);
            res.send(response);
        }
		else
			{
			console.log(error);
			res.send("error");
			}
	});
	
};

exports.search=function(req,res)
{
	console.log(myJSONObject.request.slice[0].destination);
	console.log(req.param('destination'));
	myJSONObject.request.slice[0].origin=req.param('origin');
	myJSONObject.request.slice[0].destination=req.param('destination');
	myJSONObject.request.slice[0].date=req.param('date');
	var details={};
	var flight=[];
	if(req.count)
		{
	myJSONObject.request.passengers.adultCount=req.count;
		}
	console.log(myJSONObject);
	request({
	    url: "https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyA7AZRIufiuhGdyaQF5w7eatte_CRbbqCk",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {
            console.log(JSON.stringify(response.body));
            //res.send(response);
            console.log(response.body.trips.tripOption.length);
            for(i=0;i<response.body.trips.tripOption.length;i++)
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
            	
            	}
            res.send(ress);
        }
		else
			{
			console.log(response.status=500);
			res.send(response);
			}
	});
	
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