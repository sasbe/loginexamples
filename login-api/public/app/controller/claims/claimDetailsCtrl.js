(function() {
    'use strict';

    angular
        .module('ClaimDetailsController', ['claimServices', 'ngRoute'])
        .controller('claimDetails', function($scope, $location, $timeout, Claim, $routeParams) {
            var controllerScope = this;
            controllerScope.editMode = false;
            Claim.getClaimDetails($routeParams.id).then(function(data) {
                if (data.data.success) {
                    controllerScope.claimData = data.data.claim;
                    controllerScope.access = data.data.access;
                } else {
                    $scope.$emit("errorReceived", data.data.message);
                }
            }, function(response) {
                $scope.$emit("errorReceived", response.statusText);
            });
            controllerScope.changeMode = function() {
                if (controllerScope.editMode) {
                    //emit apploading
                    $scope.$emit("appLoading", true);
                    //save the content first
                    Claim.updateClaim(controllerScope.claimData._id, {
                        dischargedate: !controllerScope.claimData.dischargedate ? "" : controllerScope.claimData.dischargedate,
                        reimbursedamount: !controllerScope.claimData.reimbursedamount ? "" : controllerScope.claimData.reimbursedamount
                    }).then(function(response) {
                        if (!response.data.success) {
                            $scope.$emit("errorReceived", response.data.message);
                        }
                        $scope.$emit("appLoading", false);
                    }, function(response) {
                        $scope.$emit("errorReceived", response.statusText);
                    });
                    // then change the mode
                    controllerScope.editMode = !controllerScope.editMode;
                    //emit apploaded

                } else {
                    controllerScope.oldData = angular.copy(controllerScope.claimData);
                    controllerScope.editMode = !controllerScope.editMode;
                }
            }
            controllerScope.cancelEdit = function() {
                if (controllerScope.editMode) {
                    controllerScope.claimData = controllerScope.oldData;
                    controllerScope.editMode = false;
                }
            }
        });
}());