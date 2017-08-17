(function() {
    'use strict';

    angular
        .module('ListControllers', ['claimServices'])
        .controller('listController', function($scope, $location, $timeout, Claim, $http) {
            var controllerScope = this;
            controllerScope.orderBy = "claimno";
            controllerScope.reverse = true;
            controllerScope.claims = [];
            controllerScope.sortBy = function(propertyName) {
                controllerScope.reverse = (controllerScope.orderBy === propertyName) ? !controllerScope.reverse : false;
                controllerScope.orderBy = propertyName;
            }
            Claim.getClaims().then(function(response) {
                    if (response.data.success) {
                        controllerScope.claims = response.data.claims;
                    } else {
                        $scope.$emit("errorReceived", response.data.message);
                    }
                },
                function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            controllerScope.print = function() {
                $scope.$emit("appLoading", true);
                Claim.print(controllerScope.claims).then(function(response) {
                    if (response.data.success) {
                        var ifr = $('<iframe id="secretIFrame" src="" style="display:none; visibility:hidden;"></iframe>');
                        $('body').append(ifr);
                        var iframeURL = response.data.url + "?temp=" + Date.now();
                        window.open(iframeURL);
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", response.data.message);
                    }
                });
            }
        });
}());