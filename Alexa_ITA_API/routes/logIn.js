var mongo = require("./mongo");
var config = require('./config');
var mongoSessionConnectURL = "mongodb://"+config.mongoDB.username+":"+config.mongoDB.password+"@"+config.mongoDB.host+":"+config.mongoDB.port+"/"+config.mongoDB.database;
//var mongoSessionConnectURL = "mongodb://localhost:27017/iTravelDB";
var bcrypt = require('bcrypt-nodejs');

exports.goToLogInPage = function(req,res){
	console.log("In goToLogInPage");
    res.render('logInPage', function(err, result) {
  	   // render on success
  	   if (!err) {
            res.end(result);
  	   }
  	   // render or error
  	   else {
            res.end('An error occurred');
            console.log(err);
  	   }
     });
};

exports.afterLogInPage = function(req,res){
	console.log("In afterLogInPage");
	if(!req.param("email") || !req.param("password")){
		console.log("Unable to get all details from User");
		res.send({"login":"Fail"});
	}else{
		var email = req.param("email");
		var password = req.param("password");
		console.log("Fetching Data to authenticate");
		var msg_payload = {
			"email" : email
		};
		//console.log("msg_payload"+JSON.stringify(msg_payload));
		mongo.connect(mongoSessionConnectURL, function(){
			//console.log('Connected to mongo at: ' + mongoSessionConnectURL);
			var coll = mongo.collection('users');
			coll.findOne(msg_payload, function(err, user){
				//console.log("user----->"+JSON.stringify(user));
				if (user) {
					// This way subsequent requests will know the user is logged in.					
					if (bcrypt.compareSync(password, user.password))
					{
						console.log("User sucessfully authenticated");
						req.session.userId = user._id;
						//console.log(req.session.userId +" is stored in the session");
						json_responses = {"statusCode" : 200, "message": "LogIn sucessfully"};
					}
					else
					{
						console.log("returned false");
						json_responses = {"statusCode" : 401, "message": "LogIn Failed"};
						res.send(json_responses);
					}	
					res.send(json_responses);
				} else {
					console.log("returned false");
					json_responses = {"statusCode" : 401, "message": "LogIn Failed"};
					res.send(json_responses);
				}
			});
		});		
	}
};