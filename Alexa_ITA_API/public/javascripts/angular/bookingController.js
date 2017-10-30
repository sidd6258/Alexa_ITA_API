var app = angular.module('bookingApp', []);
app.controller('bookingController',function($scope,$http) {
    console.log("Inside bookingController");
    $scope.filter = "";
    $scope.sortReverse = false;
    $scope.sortType = 'booking_id';
    $scope.init = function(value){
        $scope.email = value;
        $http({
            method : "POST",
            data :{
                "email" : $scope.email
            },
            url : '/bookingHistory'
        }).success(function(data){
            console.log("Inside success of bookingController");
            if (data.statusCode == 401) {
                $scope.invalid_login = false;
                $scope.unexpected_error = true;
            } else {
                //console.log("data", JSON.stringify(data.data));
                $scope.bookings = data.data;
            }
        }).error(function (error){
            $scope.invalid_login = true;
            $scope.unexpected_error = false;
        });
    };
});