/**
 * http://usejsdoc.org/
 */
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ec2-54-88-192-167.compute-1.amazonaws.com:27017/iTravelDB";
const moment=require('moment');
var carObject = 
{
	"input":"",
	"sdatetime":"",
	"edatetime":""	
};
exports.search= function(req,resp) {
	var details={};
	var cars=[];
	var speechText = "";
	var option = 0;
	var input=req.param('destination');;
    var startDate = new Date(req.param('sdatetime'));
   var endDate = new Date(req.param('edatetime'));
    var a = [new Date(req.param('sdatetime'))];
    
    while(startDate < endDate) {
        a.push(startDate);
        startDate = new Date(startDate.setDate(
        		startDate.getDate() + 1
        ))
    }
    dateString="[";
    for(i=0;i<a.length;i++){
    	if(i<a.length-1)
    	dateString=dateString+"{date:moment(new Date(\""+a[i]+"\")).utc(+120).toDate(),status:true},";
    	else
    	dateString=dateString+"{date:moment(new Date(\""+a[i]+"\")).utc(+120).toDate(),status:true}]";
    }

    console.log("dateString"+dateString);
    dateObject=eval(dateString);
    console.log("dateObject"+dateObject);
    queryObject={destination:input,availability:{$all:dateObject}};
    console.log(input);
    console.log("queryObject"+JSON.stringify(queryObject));
    var carOptions={};
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at search: ' + mongoURL);
		var coll = mongo.collection('carDataset');

		coll.find(queryObject,{"availability":0}).toArray(function(err, cars){
			if (cars) {
				console.log(cars.length);
				if(cars.length > 0)
				{
				speechText += "the top search result is.";
				for(i=0;i<3;i++){
					details = cars[i];
					option = i+1;
					
						speechText += "Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
						speechText += " and seating avaialble for "+details.seating + " Total price is "+ details.dailyRate+". ";		
						optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
						carOptions[option]=optionNumber;
						
					}
					var respon={"statusCode":200,
		    				"cars":speechText,
		    				"carObject":cars,
		    				"carOptions":carOptions
		    			};
					console.log("Response generated");
					resp.send(respon);
				}
			else{
				speechText += "no results found";
				var respon={"statusCode":404,
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