(function() {
    'use strict';

    angular
        .module('claimControllers', ['claimServices'])
        .controller('createClaimCtrl', function($location, $timeout, Claim, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                claimdate: (new Date()).toISOString(),
            };
            controllerScope.addClaim = function() {
                $scope.$emit("appLoading", true);
                Claim.addClaim(controllerScope.claimData).then(function(data) {
                    if (data.data.success) {
                        $timeout(function() {
                            $location.path('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    controllerScope.appLoading = false;
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
        })

}());