/**
 * New node file
 */
//var app =  angular.module('signUpApp', ["checklist-model"]);
app.controller('signUpController',function($scope,$http, $window){
    $scope.IsPDVisible = true;
    $scope.IsADVisible = false;
    $scope.IsPYDVisible = false;
    $scope.IsFPVisible = false;
    $scope.IsCPVisible = false;
    $scope.IsHPVisible = false;
    $scope.days = [
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];
    $scope.features = [
        'Automatic Transmission', 
        'Power Steering', 
        'Air Conditioning', 
        'Air Bags',
        'AM/FM Stereo',
        'Anti-Lock Brakes',
        'Cruise Control',
        'CD Player'
    ];
    $scope.car_features = {
        features: []
    };
    $scope.airline_days = {
        days: []
    };
   /* $scope.checkAll = function() {
        $scope.flightDays.days = angular.copy($scope.days);
        $scope.carFeatures.features = angular.copy($scope.features);
    };
    $scope.uncheckAll = function() {
        $scope.flightDays.days = [];
        $scope.carFeatures.features = [];
    };*/
    //console.log($scope.flightDays);
    $scope.page2 = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsPDVisible = $scope.IsPDVisible ? false : true;
        $scope.IsADVisible = $scope.IsADVisible ? false : true;
      /*  $localstorage.set(first_name, $scope.first_name);
        $localstorage.set(last_name, $scope.last_name);
        $localstorage.set(gender, $scope.gender);
        $localstorage.set(email, $scope.email);
        $localstorage.set(mobile, $scope.mobile);
        $localstorage.set(dob, $scope.dob);*/
        //console.log("$scope.first_name"+$scope.first_name);
    };
    $scope.backToPage1 = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsPDVisible = $scope.IsPDVisible ? false : true;
        $scope.IsADVisible = $scope.IsADVisible ? false : true;
       /* $localstorage.set(first_name, $scope.first_name);
        $localstorage.set(last_name, $scope.last_name);
        $localstorage.set(gender, $scope.gender);
        $localstorage.set(email, $scope.email);
        $localstorage.set(mobile, $scope.mobile);
        $localstorage.set(dob, $scope.dob);*/
        //console.log("$scope.first_name"+$scope.first_name);
    };
    $scope.page3 = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsADVisible = $scope.IsADVisible ? false : true;
        $scope.IsFPVisible = $scope.IsFPVisible ? false : true;
        /*$localstorage.set(address_line_1, $scope.address_line_1);
        $localstorage.set(address_line_2, $scope.address_line_2);
        $localstorage.set(city, $scope.city);
        $localstorage.set(region, $scope.region);
        $localstorage.set(country, $scope.country);
        $localstorage.set(postal_code, $scope.postal_code);*/
        //console.log("$scope.first_name"+$scope.first_name);
    };
    $scope.backToPage2 = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsADVisible = $scope.IsADVisible ? false : true;
        $scope.IsFPVisible = $scope.IsFPVisible ? false : true;
        /*$localstorage.set(address_line_1, $scope.address_line_1);
        $localstorage.set(address_line_2, $scope.address_line_2);
        $localstorage.set(city, $scope.city);
        $localstorage.set(region, $scope.region);
        $localstorage.set(country, $scope.country);
        $localstorage.set(postal_code, $scope.postal_code);*/
        //console.log("$scope.first_name"+$scope.first_name);
    };
    $scope.page4 = function () {
        $scope.IsFPVisible = $scope.IsFPVisible ? false : true;
        $scope.IsCPVisible = $scope.IsCPVisible ? false : true;
        /*$localstorage.set(airline_name, $scope.airline_name);
        $localstorage.set(airline_class, $scope.airline_class);
        $localstorage.set(city, $scope.city);
        $localstorage.set(region, $scope.region);
        $localstorage.set(country, $scope.country);
        $localstorage.set(postal_code, $scope.postal_code);*/
    };
    $scope.backToPage3 = function () {
        $scope.IsFPVisible = $scope.IsFPVisible ? false : true;
        $scope.IsCPVisible = $scope.IsCPVisible ? false : true;
    };
    $scope.page5 = function () {
        $scope.IsCPVisible = $scope.IsCPVisible ? false : true;
        $scope.IsHPVisible = $scope.IsHPVisible ? false : true;
    };
    $scope.backToPage4 = function () {
        $scope.IsCPVisible = $scope.IsCPVisible ? false : true;
        $scope.IsHPVisible = $scope.IsHPVisible ? false : true;
    };
    $scope.page6 = function () {
        $scope.IsHPVisible = $scope.IsHPVisible ? false : true;
        $scope.IsPYDVisible = $scope.IsPYDVisible ? false : true;
    };
    $scope.backToPage5 = function () {
        $scope.IsHPVisible = $scope.IsHPVisible ? false : true;
        $scope.IsPYDVisible = $scope.IsPYDVisible ? false : true;
    };
    /*console.log("$scope.first_name"+$scope.first_name);
    console.log("$scope.last_name"+$scope.last_name);
    console.log("$scope.password"+$scope.password);
    console.log("$scope.gender"+$scope.gender);
    console.log("$scope.email"+$scope.email);
    console.log("$scope.mobile"+$scope.mobile);
    console.log("$scope.dob"+$scope.dob);
    console.log("$scope.address_line_1"+$scope.address_line_1);
    console.log("$scope.address_line_2"+$scope.address_line_2);
    console.log("$scope.city"+$scope.city);
    console.log("$scope.region"+$scope.region);
    console.log("$scope.country"+$scope.country);
    console.log("$scope.postal_code"+$scope.postal_code);
    console.log("$scope.card_holder_name"+$scope.card_holder_name);
    console.log("$scope.card_number"+$scope.card_number);
    console.log("$scope.expiry_month"+$scope.expiry_month);
    console.log("$scope.expiry_year"+$scope.expiry_year);*/
    $scope.signUp = function (){
        $http({
            method : "POST",
            data :{
                "first_name": $scope.first_name,
                "last_name": $scope.last_name,
                "password": $scope.password,
                "gender": $scope.gender,
                "email": $scope.email,
                "mobile": $scope.mobile,
                "dob": $scope.dob,
                "address_line_1": $scope.address_line_1,
                "address_line_2": $scope.address_line_2,
                "city": $scope.city,
                "region": $scope.region,
                "country": $scope.country,
                "postal_code": $scope.postal_code,
                "airline_name" : $scope.airline_name,
                "airline_class" : $scope.airline_class,
                "airline_days" : $scope.airline_days,
                "airline_time" : $scope.airline_time,
                "car_model": $scope.car_model,
                "car_rental_company": $scope.car_rental_company,
                "car_mileage": $scope.car_mileage,
                "car_price": $scope.car_price,
                "car_features" : $scope.car_features,
                "hotel_star_rating" : $scope.hotel_star_rating,
                "hotel_location" : $scope.hotel_location,
                "hotel_price": $scope.hotel_price,
                "food_type": $scope.food_type,
                "food_cuisine": $scope.food_cuisine,
                "card_holder_name": $scope.card_holder_name,
                "card_number" : $scope.card_number,
                "expiry_month" : $scope.expiry_month,
                "expiry_year" : $scope.expiry_year,
                "cvv" : $scope.cvv
            },
            url : '/signUp'
        }).success(function (data) {
            console.log("Inside success of signup controller");
            if (data.statusCode != 200) {
                //window.location.assign("/signUp");
                console.log("Failed to process");
            } else {
                window.location.assign("/logIn");
            }
        });
    };
});
/*app.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue || false;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            if($window.localStorage[key] != undefined)
                return JSON.parse($window.localStorage[key] || '');
            return false;
        },
        remove: function(key){
            $window.localStorage.removeItem(key);
        },
        clear: function(){
            $window.localStorage.clear();
        }
    }
}]);*/