var showModalCtrl = function ($scope, $http, $modalInstance, $sharedContestProperties) {
    $scope.users = $sharedContestProperties.getProperty("users");
    //console.log("$scope.users showModalCtrl "+JSON.stringify($scope.users));
    $scope.email = $sharedContestProperties.getProperty("email");
    console.log("$scope.email "+$scope.email);
    $http({
        method : "POST",
        data :{
            "email" : $scope.email
        },
        url : '/booking'
    }).success(function (data) {
        console.log("Inside success of login controller");
        if (data.statusCode == 401) {
            $scope.invalid_login = false;
            $scope.unexpected_error = true;
        } else {
            $scope.fullData = data;
            console.log("$scope.fullData------>", JSON.stringify($scope.fullData));
        }
    }).error(function (error){
        $scope.invalid_login = true;
        $scope.unexpected_error = false;
    });
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
app.controller('adminHomeController', function($scope, $http) {
    console.log("Inside adminHomeController");
   $http({
        method : "GET",
        url : "/admin/getUserDetails"
   }).success(function(data){
        if(data.statusCode != 401){
            console.log("after success in fetchUserDetails ");
            $scope.users = data;
            //console.log("Users--> ", $scope.users);
        }
   });
    $scope.itemsPerPage = 15;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.showModal = function($scope, $modal, $window, $location, $sharedContestProperties) {
        $scope.setValue = function (users, email) {
            $sharedContestProperties.setProperty("users", users);
            $sharedContestProperties.setProperty("email", email);
        };
        $scope.open = function () {
            var showModalInstance = $modal.open({
                templateUrl: 'showModal.html',
                controller: showModalCtrl,
                windowClass: 'app-modal-window'
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
});