/**
 * http://usejsdoc.org/
 */
var request = require('request');
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/iTravelDB";
var mysql = require("./mysql");
var config = require('./config');
var client = require('./connection.js');  
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "intelligenttravelagent@gmail.com",
        pass: "sjsuita295"
    }
});
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
	var price=attributes.flightObject[option].price;
	var email=attributes.profile.email;
	var user=attributes.mongo_user.first_name;
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
	        console.log("resutl "+JSON.stringify(result));
		        mailobj={
		        		"bookingid":result.insertId,
		        		"email": email,
		        		"booking": module,
		        		"flightname": attributes.flightObject[option].carrier,
		        		"source":source,
		        		"destination":destination,
		        		"startdate": start_date,
		        		"enddate":end_date,
		        		"amount":price,
		        		"departureTime":attributes.flightObject[option].departureTime,
		        		"duration":attributes.flightObject[option].duration,
		        		"class":attributes.flightObject[option]["class"],
		        		"user": user
		        }
		        sendmail(mailobj);
		    	var respon={"statusCode":200};
		    	resp.send(respon);	        	
	    }
	}, setBooking);
}

function getTop3Raters(flights,callback){
    mongo.connect(mongoURL, function(){
        var coll = mongo.collection('UserPredictedRatings_flight');
        var tmp = [];
        coll.find({"userId.email": "siddharth.gupta@sjsu.edu"}, {"rating": 1}).toArray(function(err, userRatings){
        	
            if (userRatings) {
            	 
                console.log("Data retrieved successfully");
               // console.log('user1------>' + JSON.stringify(userRatings[0]));
                userRatings1 = userRatings[0]['rating'];
               // console.log('user2------>' + JSON.stringify(userRatings1));
                //console.log("length"+Object.keys(userRatings1).length);

                for(var key in userRatings1)
                	
                	{
                	
                    for(var j=0; j<10;j++)
                    {
                             //console.log("userRatings[i].(cars[j]._id)", userRatings1[cars[j]._id]);
                    	//console.log("rating object"+userRatings1[cars[j]._id]);
                	//console.log("car object"+cars[j]._id);
                  if(flights[j]._id == key){
                     var json = {};
                            json["id"] = flights[j]._id;
                            json["rating"] = userRatings1[flights[j]._id];
                            tmp.push(json);
                  }
                       
               }
            }
                //console.log('tmp', tmp);
                
                tmp = tmp.sort(function (a, b) {
                    return -a.rating.localeCompare(b.rating);
                });
          console.log('tmp', tmp);
          
        callback(null,tmp.slice(0,6));
          
            }else {
                console.log("returned false");
                json_responses = {"statusCode" : 401};
                res.send(json_responses);
            }
        });
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
            
            res.send(response.body);
        }
		else
			{
			console.log(response.status=500);
			res.send(response);
			}
	});
	
}

exports.flight_elastic=function(req,res){
	myjson=
	{
		"query": 
			{
				"bool": 
				{
					"must":
					[ 
						{
							"match":
							{
					    		"destination.city":
					    		{ 
						        	"query":    "Cleveland " ,
						           	"operator": "and"
						        }
						    }
						},
						{
							"match": 
							{
						    	"source.city":
						    	{ 
					    	    	"query":    "San Jose" ,
					        		"operator": "and"
					        	}
					    	}
						},
						{
			        		"nested":
			        		{
				            	"path": "availability", 
			    	        	"query": 
			        	    	{
			            			"bool": 
			            			{
			                			"must": 
			                			[ 
			                				{
			                    				"match": 
			                    				{
				                    				"availability.date": "10/22/2017"
				                            	}
				                			},
			    	            			{
	        									"range" :
	        									{
	            									"availability.seats" :
	            									{
	                									"gte" : 1
	            									}
	        									}
	    									}	
	    								]
			        	        	}
			            		}
			        		}
			        	}
					           
					        
					],
					"should": 
					[
				  		{
			  				"match":
			  				{
			  					"carrier":
			  					{
			  						"query":"delta",
				  					"operator": "or"
				  				}   
				  	    	}
			  			},
			  	    	{
			  	    		"match":
				  	    	{
				  	    		"class":
				  	    		{
			  		    			"query":"Economy",
			  	    				"operator": "or"
			  	        	    }  
				  	        }
						}
				  	]
				}
			}
	}
	var email=req.param('user');
	var date=req.param('date');
	var destination=req.param('destination');
	var source=req.param('origin');
	date =new Date(date);
	console.log(date);
	day=date.getDate();
	mon=date.getMonth();
	year=date.getFullYear();
	datee=(mon+1)+"/"+day+"/"+year;
	myjson['query']['bool']['must'][0]['match']['destination.city']['query']=destination;
	myjson['query']['bool']['must'][1]['match']['source.city']['query']=source;
	myjson['query']['bool']['must'][2]['nested']['query']['bool']['must'][0]['match']["availability.date"]=datee;
	request({
		url:'http://localhost:3000/users/'+email,
		method: "GET",
	    json: true,   
		}, function (error, response, body) {
			if(response)
			{
				console.log(body[0]);
				if(body[0]['preferences']['flight']['airline_name'].length==1)
					myjson['query']['bool']['should'][0]['match']['carrier']['query']=body[0]['preferences']['flight']['airline_name'];
				else
				{
					text='';
					body[0]['preferences']['flight']['airline_name'].forEach(function(elt, i) 
					{
						text=text+' '+elt;
			  
					});
					myjson['query']['bool']['should'][0]['match']['carrier']['query']=text;
				}
				myjson['query']['bool']['should'][1]['match']['class']['query']=body[0]['preferences']['flight']['airline_class'];
				
					
				client.search(
				{  
					  index: 'flight_nested',
					  type: 'doc',
					  body: myjson
				},function (error, response,status) 
					{
						var flightOptions={};
						var flightObjects={};
						var speechText='';
						var response1;
					    if (error)
					    {
					    	console.log("search error: "+error)
					    }
					    else 
					    {
					    	console.log("--- Response ---");
					    	console.log(response);
					    	console.log("--- Hits ---");
					    	getTop3Raters(response.hits.hits,function (err,arr)
					    	{
					    		for(j=0;j<6;j++)
					    		{
					    			for(i=0;i<response.hits.hits.length;i++)
					    			{
					    				if(response.hits.hits[i]._id ==arr[j].id)
					    				{
					    					console.log(response.hits.hits[i]._id);
					    					delete response.hits.hits[i]._source["availability"];
					    					console.log(arr[j].id);
					    					details = response.hits.hits[i]._source;
					    					option = j+1;
					    					if(option == 1)
					    					{
					    						speechText += "Option "+option+", "+details.carrier+ " flight, in "+details['class'] +" section, on "+ date +" at "+details.departureTime +".";
					    						speechText += "The Total price is $"+ details.price+". ";
					    						optionNumber="Option "+option+", "+details.carrier+ " flight, in "+details['class'] +" section"+".";
					    						flightOptions[option]=optionNumber;
					    						flightObjects[option]=details;
					    						flightObjects[option]['_id']=response.hits.hits[i]._id;
					    					}
					    					else
					    					{
					    						speechText += "Option "+option+", "+details.carrier+ " flight, in "+details['class'] +" section, on "+ date +" at "+details.departureTime +".";
					    						speechText += "The Total price is $"+ details.price+". ";
					    						optionNumber="Option "+option+", "+details.carrier+ " flight, in "+details['class'] +" section"+".";
					    						flightOptions[option]=optionNumber;
					    						flightObjects[option]=details;
					    						flightObjects[option]['_id']=response.hits.hits[i]._id;
					    					}
					    				}
					    			}
					    		}
					    		var respon=
					    		{
					    			"statusCode":200,
					    			"flights":speechText,
					    			"flightObject":flightObjects,
					    			"flightOptions":flightOptions
					    		};
					    		console.log("Response generated");
					    		res.send(respon);
					    	});
					    	
					    }
					});
				}
		});
}
			

function sendmail(obj){
    var mailOptions={
            to : obj['email'],
            subject : "Congratulations for your Flight Booking",
            html:
                '<p><b>Hello '+obj["user"]+'</b></p>' +
                '<p>You have successfully booked a  <b>'+obj["flightname"]+
                '</b> flight to <b>'+obj["destination"]+
                '</b> from <b>'+obj["source"]+
                '</b> on <b>'+obj["startdate"]+
                '</b> for <b>$'+obj["amount"]+'.'+
                '<br/><b> Flight Departure Time: '+obj["departureTime"]+
                '</b>.<br/></p>'+'<p><b>Your Booking Id is: '+obj["bookingid"]+
                '</b>.'+'<p>If you have any questions with your booking please reach out to ITA team at <b>intelligenttravelagent@gmail.com</b> or login to your online account.</b> </p>'
                +'<p>Regards,<br/> ITA Team</p>'
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
                
         }else{
                console.log("Message sent: " + response);
                
             }
    });
 };
