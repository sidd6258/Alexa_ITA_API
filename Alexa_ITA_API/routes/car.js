/**
 * http://usejsdoc.org/
 */
var request = require('request');
var nodemailer = require("nodemailer");

var mongo = require("../routes/mongo");
var mongoURL = "mongodb://ainuco.ddns.net:4325/iTravelDB";
var mysql = require("./mysql");
var config = require('./config');
var client = require('./connection.js'); 
const moment=require('moment');
var email_user = null;

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

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "intelligenttravelagent@gmail.com",
        pass: "sjsuita295"
    }
});

exports.search= function(req,resp) {

}

function getTop3Raters(cars,callback){
    mongo.connect(mongoURL, function(){
        var coll = mongo.collection('UserPredictedRatings_car');
        var tmp = [];
        coll.find({"userId.email": email_user}, {"rating": 1}).toArray(function(err, userRatings){
        	
            if (userRatings) {
            	 
                console.log("Data retrieved successfully");
               // console.log('user1------>' + JSON.stringify(userRatings[0]));
                userRatings1 = userRatings[0]['rating'];
               // console.log('user2------>' + JSON.stringify(userRatings1));
                //console.log("length"+Object.keys(userRatings1).length);

                for(var key in userRatings1)
                	
                	{
                	
                    for(var j=0; j<cars.length;j++)
                    {
                             //console.log("userRatings[i].(cars[j]._id)", userRatings1[cars[j]._id]);
                    	//console.log("rating object"+userRatings1[cars[j]._id]);
                	//console.log("car object"+cars[j]._id);
                  if(cars[j]._id == key){
                     var json = {};
                            json["id"] = cars[j]._id;
                            json["rating"] = userRatings1[cars[j]._id];
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
exports.carBooking= function(req,resp) {
	var attributes=req.param('attributes');
	var option=attributes.car_selection
	var mongo_id=attributes.carObject[option]._id;
	var module="car";
	var start_date=attributes.startdate_car;
	var end_date=attributes.enddate_car;
	var source='null';
	var destination=attributes.destination_car;
	var price=attributes.carObject[option].dailyRate;
	var email=attributes.profile.email;
	var carModel=attributes.carObject[option].carModel;
	var carBrand=attributes.carObject[option].carBrand;
	var rentalAgency=attributes.carObject[option].rentalAgency;
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
	        mailobj={
	        		"email": email,
	        		"bookingId":result.insertId,
	        		"booking": module,
	        		"destination": destination,
	        		"carModel": carModel,
	        		"carBrand":carBrand,
	        		"rentalAgency":rentalAgency,
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
}

exports.car_elastic=function(req,res){
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
	  	                     { "match": { "carBrand":{ "query":"Audi","boost":3}   
	  	                     }
	  	                     },
	  	                     { "match": { "rentalAgency":{ "query":"Enterprice budget", "operator": "or","boost":2}   }},
	  	                     { "match": { "mileage":{ "query":"300"}   }},
	  	                     { "match": { "dailyRate":{ "query":150,"boost":4}   }}
	  	                     
	  	                    
	  	                   ]
			      }
			  },
			   "functions": [
			        {
			          "exp": {
			            "dailyRate": {
			              "origin": "150",
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
	});
	
	request({
		url:'http://localhost:3000/users/'+email,
		method: "GET",
	    json: true,   
		}, function (error, response, body) {
  if(response)
	  {
	  console.log(body[0]);
	  if(body[0]['preferences']['car']['car_model'].length==1)
	  myjson['query']['function_score']['query']['bool']['should'][0]['match']['carBrand']['query']=body[0]['preferences']['car']['car_model'];
	  else
	  {
		  text='';
		  body[0]['preferences']['car']['car_model'].forEach(function(elt, i) {
		   text=text+' '+elt;
		   	  myjson['query']['function_score']['query']['bool']['should'][0]['match']['carBrand']['query']=text;

		  });
	  }
	  if(body[0]['preferences']['car']['car_rental_company'].length==1)
	  myjson['query']['function_score']['query']['bool']['should'][1]['match']['rentalAgency']['query']=body[0]['preferences']['car']['car_rental_company'];
	  else
	  {
		  text='';
		  body[0]['preferences']['car']['car_rental_company'].forEach(function(elt, i) {
		   text=text+' '+elt;
			  
		  });
		  myjson['query']['function_score']['query']['bool']['should'][1]['match']['rentalAgency']['query']=text
			  
	  }
	  myjson['query']['function_score']['query']['bool']['should'][2]['match']['mileage']['query']=body[0]['preferences']['car']['car_mileage'];
	myjson['query']['function_score']['query']['bool']['should'][3]['match']['dailyRate']['query']=body[0]['preferences']['car']['car_price'];
	console.log(JSON.stringify(myjson));
	client.search({  
			  index: 'car_nested',
			  type: 'doc',
			  body: myjson},function (error, response,status) {
			  var carOptions={};
			  var carObjects={};
			  var car_speech={};
			  var speechText='';
			  var response1;
			    if (error){
			      console.log("search error: "+error);
			      res.send(error);
			    }
			    else {
                    getTop3Raters(response.hits.hits,function (err,arr){
                        for(j=0;j<6;j++){
                            for(i=0;i<response.hits.hits.length;i++){
                                if(response.hits.hits[i]._id ==arr[j].id)
                                {
                                    console.log(response.hits.hits[i]._id);
                                    delete response.hits.hits[i]._source["availability"];
                                    console.log(arr[j].id);
                                    details = response.hits.hits[i]._source;
                                    option = j+1;
                                    if(option == 1)
                                    {
                                        speechText = "Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
                                        speechText += " and seating avaialble for "+details.seating + " Total price is $"+ details.dailyRate+". ";
                                        optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
                                        
                                        car_speech[option]=speechText;
                                        carOptions[option]=optionNumber;
                                        carObjects[option]=details;
                                        carObjects[option]['_id']=response.hits.hits[i]._id;
                                    }
                                    else{
                                        speechText = " Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+" with features "+details.carFeatures;
                                        speechText += " and seating avaialble for "+details.seating + " Total price is $"+ details.dailyRate+".";
                                        optionNumber="Option "+option+", "+details.carModel+ ", "+details.carBrand +", with type as "+ details.carType+".";
                                        
                                        car_speech[option]=speechText;
                                        carOptions[option]=optionNumber;
                                        carObjects[option]=details;
                                        carObjects[option]['_id']=response.hits.hits[i]._id;
                                    }
                                }
                            }
                        }

                        var respon={"statusCode":200,
                            "cars":car_speech,
                            "carObject":carObjects,
                            "carOptions":carOptions
                        };
                        console.log("Response generated");
                        res.send(respon);
                    });
			   /* console.log("search response: "+JSON.stringify(response));
			    res.send(response);*/
			    }
			    });
}
  
		});
}

function sendmail(obj){
    var mailOptions={
            to : obj['email'],
            subject : "Congratulations for your Rental Car Booking",
            html:
                '<p><b>Hello '+obj["user"]+'</b></p>' +
                '<p>You have successfully booked <b>'+obj["carModel"]+' '+obj["carBrand"]+
                '</b> in <b>'+obj["destination"]+
                '</b> with Rental company <b>'+obj["rentalAgency"]+
                '</b> from <b>'+obj["startdate"]+
                '</b> to <b>'+obj["enddate"]+
                '</b> for <b>$'+obj["amount"]+
                '</b>.<br/></p>'+'<p><b>Your Booking Id is: '+obj["bookingId"]+
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

