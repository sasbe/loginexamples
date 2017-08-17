(function() {
    'use strict';

    angular
        .module('userServices', [])
        .factory('User', function($http) {
            var userFactory = {};
            userFactory.create = function(data) {
                return $http.post('/users/createUser', data)
            };
            userFactory.addClaim = function(data) {
                return $http.post('/claims/addClaim', data);
            }
            return userFactory;
        })

}());