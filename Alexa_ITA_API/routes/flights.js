/**
 * http://usejsdoc.org/
 */
var request = require('request');
var myJSONObject=
{
	input:"Denver",
	sdatetime:"2017-4-12 16:25",
	edatetime:"2017-4-14 16:25"
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
	console.log(req.param('input'));
	myJSONObject.imput=req.param('imput');
	myJSONObject.sdatetime=req.param('sdatetime');
	myJSONObject.edatetime=req.param('edatetime');
	console.log(myJSONObject);
	request({
	    url: "https://homerest.herokuapp.com/req/htl",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: myJSONObject
	}, function (error, response, body){
		if (!error && response.statusCode == 200) {

            console.log(response.body.htlinfo[0]);
            var ress={"statusCode":200,
    				"hotel":"success"
   			};
            res.send(response.body.htlinfo[0]);
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