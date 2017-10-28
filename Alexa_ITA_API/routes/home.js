
//Redirects to the homepage
exports.goToHomePage = function(req,res){
	//Checks before redirecting whether the session is valid
	if(req.session.userId)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render("homePage",{userId:req.session.userId});
	}
	else
	{
		//res.redirect('/logout');
	}
};

exports.goToLogoutPage = function(req,res){
	console.log("In logout");
    req.session.destroy();
    res.redirect('/');
};