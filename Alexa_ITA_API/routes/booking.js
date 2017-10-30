//Redirects to the homepage
var mysql = require("./mysql");
exports.goToBookingPage = function(req,res){
    //Checks before redirecting whether the session is valid
    if(req.session.userId)
    {
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("bookingPage",{userId:req.session.userId, email:req.session.email});
    }
    else
    {
        //res.redirect('/logout');
    }
};
exports.fetchBookingData = function(req, res){
    console.log("fetchBookingData");
    if(!req.param("email")){
        console.log("Unable to get all details from User");
        res.send({"statusCode" : 400});
    }else{
        var email = req.param("email");
        //console.log("email->"+email);
        var query= "Select booking_id, module, start_date, end_date, destination, price from booking where email = '"+email+"' order by booking_id desc";
        var json_responses = {};
        mysql.fetchData(function (err, result) {
            if (err) {
                throw err;
            }
            else {
                if (result.length > 0) {
                    //console.log(JSON.stringify(result));
                    json_responses.statusCode = 200;
                    json_responses.data = result;
                    //console.log("json_responses",JSON.stringify(json_responses));
                    res.send(json_responses);
                }else{
                    console.log("No data found");
                    json_responses.statusCode = 401;
                    res.send(json_responses);
                }
            }
        }, query);
    }
};