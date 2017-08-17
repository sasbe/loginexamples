(function() {
    'use strict';

    angular
        .module('claimServices', [])
        .factory('Claim', function($http) {
            var claimFactory = {};
            claimFactory.addClaim = function(data) {
                return $http.post('/claims/addClaim', data);
            }
            claimFactory.getClaims = function() {
                return $http.get("/claims/claimList");
            }

            claimFactory.getClaimDetails = function(claimid) {
                return $http.get("/claims/individual/" + claimid);
            }

            claimFactory.updateClaim = function(claimid, claimData) {
                return $http.post("/claims/updateClaim/" + claimid, claimData);
            }

            claimFactory.print = function(claimData) {
                return $http.post("/claims/print", claimData);
            }
            return claimFactory;
        })

}());