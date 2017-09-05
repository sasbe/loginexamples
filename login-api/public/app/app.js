(function() {
    'use strict';

    angular.module('userApp', ['appRoutes', 'userControllers', 'mainControllers', 'claimControllers', 'homeController', 'ListControllers', 'CommonDirectives', 'ClaimDetailsController', 'userServices', 'claimServices', 'commonServices', 'authServices', 'ngAnimate'])
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptors');
        });

}());