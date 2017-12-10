/**
 * http://usejsdoc.org/
 */
console.log("server start");
var request = require('request');
var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/iTravelDB";
var mysql = require("./mysql");
var config = require('./config');
var client = require('./connection.js'); 
var nodemailer = require('nodemailer');
var email_user = null;

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "intelligenttravelagent@gmail.com",
        pass: "sjsuita295"
    }
});

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

}

function getTop3Raters(hotels,callback){
    mongo.connect(mongoURL, function(){
        var coll = mongo.collection('UserPredictedRatings_hotel');
        var tmp = [];
        coll.find({"userId.email": email_user}, {"rating": 1}).toArray(function(err, userRatings){
            if (userRatings) {
                console.log("Data retrieved successfully");
                userRatings1 = userRatings[0]['rating'];
                for(var key in userRatings1)
                {
                    for(var j=0; j<hotels.length;j++)
                    {
                        if(hotels[j]._id == key){
                            var json = {};
                            json["_id"] = hotels[j]._id;
                            json["rating"] = userRatings1[hotels[j]._id];
                            tmp.push(json);
                        }
                    }
                }
                tmp = tmp.sort(function (a, b) {
                    return -a.rating.localeCompare(b.rating);
                });
                callback(null,tmp.slice(0,6));
            }else {
                console.log("returned false");
                json_responses = {"statusCode" : 401};
                res.send(json_responses);
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
		var hotelName=attributes.hotelObject[option].hotelName;
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
		        console.log("booking ID "+JSON.stringify(result));
		        //MONGO CALL
		        mailobj={
		        		"email": email,
		        		"bookingId":result.insertId,
		        		"booking": module,
		        		"destination": destination,
		        		"hotelname": hotelName,
		        		"startdate": start_date,
		        		"enddate":end_date,
		        		"amount":price,
		        		"user": user
		        }
		        sendmail(mailobj);
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
	email_user = req.param('user');
	var sd=req.param('sdatetime');
	var ed=req.param('edatetime');
	sd=new Date(sd);
	ed=new Date(ed);
	console.log(sd,ed);
	console.log(email);
	myjson['query']['function_score']['query']['bool']['must'][0]['match']['destination']['query']=req.param('destination');
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
			  body: myjson},function (error, response,status) {
			  var hotelOptions={};
			  var hotel_speech={};
			  var hotelObjects={};
			  var response1;
			    if (error){
			      console.log("search error: "+error)
			    }
			    else {
                    getTop3Raters(response.hits.hits,function (err,arr)
                    {
                        var speechText="";
                        for(j=0;j<6;j++){
                            for(i=0;i<response.hits.hits.length;i++) {
                                if(response.hits.hits[i]._id ==arr[j]._id) {
                                	console.log(response.hits.hits[i]._source)
                                	delete response.hits.hits[i]._source["availability"];
                                    details = response.hits.hits[i]._source;
                                    
                                    option = j + 1;
                                    speechText = "Option " + option + ", " + details.roomType + " room type in a " + details.starRating + " star " + details.propertyType + ", " + details.hotelName + ", for $" + details.dailyRate + " per day, with amenities like " + details.amenities[0] + " and " + details.amenities[1] + ". ";
                                    optionNumber = "Option " + option + ", " + details.roomType + " room type in a " + details.starRating + " star " + details.propertyType + ", " + details.hotelName + ", for $" + details.dailyRate + " per day.";

                                    hotel_speech[option] = speechText;
                                    hotelOptions[option] = optionNumber;
                                    hotelObjects[option] = details;
                                    hotelObjects[option]['_id']=response.hits.hits[i]._id;
                                }
                            }
                        }
                        response1 ={"statusCode":200,
                            "hotels":hotel_speech,
                            "hotelObject":hotelObjects,
                            "hotelOptions":hotelOptions
                        };
                        console.log("Response generated"+JSON.stringify(response1));
                        res.send(response1);
                        });
                    }
			});
	  }
	});
	};
	
	/*{
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
		}*/
	
	function sendmail(obj){
	    var mailOptions={
	            to : obj['email'],
	            subject : "Congratulations for your Hotel Booking",
	            html:
	                '<p><b>Hello '+obj["user"]+'</b></p>' +
	                '<p>You have successfully booked <b>'+obj["hotelname"]+'</b> in <b>'+obj["destination"]+ '</b> from <b>'+obj["startdate"]+'</b> to <b>'+
	                obj["enddate"]+'</b> for <b>$'+obj["amount"] +'</b>.<br/></p>'+
	                '<p><b>Your Booking Id is: '+obj["bookingId"]+'</b>.'+
	                '<p>If you have any questions with your booking please reach out to ITA team at <b>intelligenttravelagent@gmail.com</b> or login to your online account.</b> </p>'
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