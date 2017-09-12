(function() {
    'use strict';

    angular
        .module('claimControllers', ['claimServices'])
        .controller('createClaimCtrl', function($location, $timeout, Claim, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                claimdate: (new Date()).toISOString(),
                claimamount: 0
            };
            controllerScope.addClaim = function() {
                var localeDate = new Date(controllerScope.claimData.claimdate)
                controllerScope.claimData.sequenceName = AD2BS(localeDate.getFullYear() + "-" + (localeDate.getMonth() + 1) + "-" + localeDate.getDate()).split("-")[0];
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