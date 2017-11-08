var app =  angular.module('logInApp',[]);
app.controller('logInController',function($scope,$http){
	$scope.invalid_login = true;
	$scope.unexpected_error = true;
    $scope.logIn = function(){
    	$http({
        	method : "POST",
	        data :{
	            "email" : $scope.email,
	            "password" : $scope.password
	        },
	        url : '/logIn'
    	}).success(function (data) {
	    	console.log("Inside success of login controller");
	    	if (data.statusCode == 401) {
	            $scope.invalid_login = false;
	            $scope.unexpected_error = true;
	        } else {
	            window.location.assign("/profile");
	        }
    	}).error(function (error){
        	$scope.invalid_login = true;
        	$scope.unexpected_error = false;
    	});
	};
});
