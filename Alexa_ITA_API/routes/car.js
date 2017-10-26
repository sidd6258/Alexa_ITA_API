/**
 * http://usejsdoc.org/
 */
var request = require('request');
var carObject = 
{
	"input":"",
	"sdatetime":"",
	"edatetime":""	
};
exports.search= function(req,resp) {
	carObject.input = req.param('input');
	carObject.sdatetime = req.param('sdatetime');
	carObject.edatetime = req.param('edatetime');
	var details={};
	var cars=[];
	var speechText = "";
	var option = 0;
	console.log("car object is "+carObject);

	request({
	    url: "https://homerest.herokuapp.com/req/car",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: carObject
	}, function (error, response, body){
		console.log("car object is "+carObject);
		if (!error && response.statusCode == 200) {
			if(response.body.carinfo.length > 0)
				{
				for(i=0;i<2;i++){
					details = response.body.carinfo[i];
					option = i+1;
					if(option == 1)
						{
						speechText += "the top 2 search results are. Option "+option+", "+ details["model"]+" with features "+details["features"];
						speechText += " and seating avaialble for "+details["typicalseating"] + " Total price is "+ details["totalprice"]+" " +details["currencycode"]+". ";
						}
					else{
						speechText += " Option "+option+", "+ details["model"]+" with features "+details["features"];
						speechText += " and seating avaialble for "+details["typicalseating"] + " Total price is "+ details["totalprice"]+" " +details["currencycode"]+". ";
					}
					}
					var respon={"statusCode":200,
		    				"cars":speechText
		    			};
					console.log("Response from the request of Rental car search is "+respon);
					resp.send(respon);
				}
			else{
				speechText += "no results found";
				var respon={"statusCode":200,
	    				"cars":speechText
	    			};
				resp.send(respon);
			}

		}else{
			console.log(response.status=500);
			resp.send(response);
		}
	});
	
}