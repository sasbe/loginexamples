(function() {
    'use strict';

    angular
        .module('userControllers', ['userServices'])
        .controller('regCtrl', function($location, $timeout, User, $scope) {
            var controllerScope = this;
            controllerScope.regData = {
                username: 'sagar',
                emailid: 'subedisagar52@gmail.com',
                password: 'password',
                employeenumber: 1,
                designation: "Director",
                level: "",
                availableLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                woffice: "BUSINESS MANAGEMENT DEPARTMENT",
            }
            controllerScope.regUser = function() {
                $scope.$emit("appLoading", true);
                User.create(controllerScope.regData).then(function(data) {
                    $scope.$emit("appLoading", false);
                    if (data.data.success) {
                        $scope.$emit("successReceived", data.data.message + '......Redirecting');
                        $timeout(function() {
                            $location.url('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
        })
        .controller('facebookCtrl', function($routeParams, Auth, $window, $location) {
            var controllerScope = this;
            if ($window.location.pathname == "/facebookerror") {
                $scope.$emit("errorReceived", "facebook email not found in databse");
            } else {
                Auth.facebook($routeParams.token);
                $location.path('/');
            }
        });

}());