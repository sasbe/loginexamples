(function() {
    'use strict';

    angular.module('userApp', ['appRoutes', 'userControllers', 'mainControllers', 'claimControllers',
            'ListControllers', 'ClaimDetailsController', 'userServices', 'claimServices', 'authServices', 'ngAnimate'
        ])
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptors');
        });

}());