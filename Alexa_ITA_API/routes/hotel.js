/**
 * http://usejsdoc.org/
 */
console.log("server start");
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/ita_hotel";
var mysql = require("./mysql");
var config = require('./config');
var client = require('./connection.js');  

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, stopDate) {
   var dateArray = new Array();
   var currentDate = startDate;
   while (currentDate <= stopDate) {
     dateArray.push(currentDate)
     currentDate = currentDate.addDays(1);
   }
   return dateArray;
 }


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
	
exports.elasticsearch=function(req,res){
	myjson={
			"query": {
			    "function_score": {
			  "query": {
				    "bool": {
				    	"must":[ 
				    		{
				          "match": {
				                    "destination": { 
				                        "query":    "Albuquerque" ,
				                        "operator": "and"
				                    }
				                }
				           }
				           
				        
				      ],
				      "should": [
		  	                     { "match": { "starRating":{ "query":5}   
		  	                     }
		  	                     },
		  	                     { "match": { "location":{ "query":"downtown"}   }}
		  	                     
		  	                    
		  	                   ]
				      }
				  },
				   "functions": [
				        {
				          "exp": {
				            "starRating": {
				              "origin": "5",
				              "scale": "1",
				              "decay": 0.999
				            }
				          }
				        }
				      ]
				}
			}
	};
	json_date={
	          "nested": {
		            "path": "availability", 
		            "query": {
		              "bool": {
		                "must": [ 
		                  {
		                    "match": {
		                      "availability.date": "10/22/2017"
		                    }
		                  },
		                  {
		                    "match": {
		                      "availability.status": "true"
		                    }
		                  }
		        		]
		        		
		              }
		            }
		            
		          }
		        };
	
	var email=req.param('user');
	var sd=req.param('sdatetime');
	var ed=req.param('edatetime');
	sd=new Date(sd);
	ed=new Date(ed);
	console.log(sd,ed);
	console.log(email);
	var datearray=getDates(sd,ed);
	console.log(datearray);
	datearray.forEach(function(elt, i) {
		day=elt.getDate();
		mon=elt.getMonth();
		year=elt.getFullYear();
		datee=(mon+1)+"/"+day+"/"+year;
		json_date["nested"]['query']['bool']['must'][0]['match']['availability.date']=datee;
		console.log(JSON.stringify(json_date));
		myjson['query']['function_score']['query']['bool']['must'].push(json_date);
	})
	
	
	
	request({
		url:'http://localhost:3000/users/'+email,
		method: "GET",
	    json: true,   
		}, function (error, response, body) {
  if(response)
	  {
	  console.log(body[0]);
	  myjson['query']['function_score']['query']['bool']['should'][0]['match']['starRating']['query']=body[0]['preferences']['hotel']['hotel_star_rating'];
	  myjson['query']['function_score']['query']['bool']['should'][1]['match']['location']['query']=body[0]['preferences']['hotel']['hotel_location'];
	  console.log(JSON.stringify(myjson))
	  client.search({  
			  index: 'hotel_nested',
			  type: 'doc',
			  body: {
				  "query": {
					    "bool": {
					    	"must":[ 
					    		{
					          "match": {
					                    "destination": { 
					                        "query":    "Albuquerque" ,
					                        "operator": "and"
					                    }
					                }
					           },
					           {
					          "nested": {
					            "path": "availability", 
					            "query": {
					              "bool": {
					                "must": [ 
					                  {
					                    "match": {
					                      "availability.date": "10/22/2017"
					                    }
					                  },
					                  {
					                    "match": {
					                      "availability.status": "true"
					                    }
					                  }
					        		]
					              }
					            }
					            
					          }
					        },
					        {
					          "nested": {
					            "path": "availability", 
					            "query": {
					              "bool": {
					                "must": [ 
					                  {
					                    "match": {
					                      "availability.date": "10/23/2017"
					                    }
					                  },
					                  {
					                    "match": {
					                      "availability.status": "true"
					                    }
					                  }
					        		]
					              }
					            }
					            
					          }
					        },
					        {
					          "nested": {
					            "path": "availability", 
					            "query": {
					              "bool": {
					                "must": [ 
					                  {
					                    "match": {
					                      "availability.date": "10/24/2017"
					                    }
					                  },
					                  {
					                    "match": {
					                      "availability.status": "true"
					                    }
					                  }
					        		]
					              }
					            }
					            
					          }
					        }
					      ]
					    }
					  }
					}
			},function (error, response,status) {
			    if (error){
			      console.log("search error: "+error)
			    }
			    else {
			      console.log("--- Response ---");
			      console.log(response);
			      console.log("--- Hits ---");
			      response.hits.hits.forEach(function(hit){
			        console.log(hit);
			      })
			      res.send(response)
			    }
			});
	  }
	});
    
		
	}