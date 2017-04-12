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