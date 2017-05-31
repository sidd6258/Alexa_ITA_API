/**
 * http://usejsdoc.org/
 */
console.log("request recieved");
var request = require('request');
var jsonObj = 
{
	"input":"",
	"sdatetime":"",
	"edatetime":""	
};
exports.search= function(req,resp) {
	jsonObj.input = req.param('input');
	jsonObj.sdatetime = req.param('sdatetime');
	jsonObj.edatetime = req.param('edatetime');
	console.log(jsonObj);
	var details={};
	var hotels=[];
	var speechText = "";
	var option = 0;

	console.log("sending request further");
	request({
	    url: " https://homerest.herokuapp.com/req/htl",
	    method: "POST",
	    json: true,   // <--Very important!!!
	    body: jsonObj
	}, function (error, response, body){
//		console.log(response.body);
		
		if (!error && response.statusCode == 200) {
			for(i=0;i<3;i++){
//			details = {};
			details = response.body.htlinfo[i];
			option = i+1;
			speechText += " Option "+option+", in "+ details["neighborhood"];
			speechText += ". Total price is "+ details["totalprice"]+" " +details["currencycode"]+". "
//			console.log(speechText);
//			hotels.push(details);
			
			
			
			}
			var respon={"statusCode":200,
    				"hotels":speechText
    			};
//			JSON.parse(respon);
			console.log(respon);
			resp.send(respon);

			console.log("request completed");
		}else{
			console.log(response.status=500);
			res.send(response);
		}
	});
	
	
}