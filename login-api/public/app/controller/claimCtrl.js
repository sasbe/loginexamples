(function() {
    'use strict';

    angular
        .module('claimControllers', ['claimServices'])
        .controller('createClaimCtrl', function($location, $timeout, Claim, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                employeeno: 1,
                claimno: '1',
                claimdate: '04/08/2017',
                claimoffice: 'new road',
                claimname: 'Medical Bills',
                claimamount: 12345,
                contactnum: 123456789,
                dischargedate: '',
                dischargeamount: '',
                remarks: ''
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