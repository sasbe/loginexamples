(function() {
    'use strict';

    var app = angular
        .module('appRoutes', ['ngRoute'

        ])
        .config(function($routeProvider, $locationProvider) {
            $routeProvider.when('/', {
                    templateUrl: 'app/pages/home.html',
                    authencticated: true,
                    controller: 'listController',
                    controllerAs: "claims"
                })
                .when('/claimDetails/:id', {
                    templateUrl: 'app/pages/claim/claimDetails.html',
                    authencticated: true,
                    controller: 'claimDetails',
                    controllerAs: "claimDetails"
                })
                .when('/register', {
                    templateUrl: 'app/pages/users/register.html',
                    controller: 'regCtrl',
                    controllerAs: 'register',
                    authencticated: true

                })
                .when('/login', {
                    templateUrl: 'app/pages/users/login.html',
                    authencticated: false
                })
                .when('/logout', {
                    templateUrl: 'app/pages/users/logout.html',
                    authencticated: true
                })
                .when('/profile', {
                    templateUrl: 'app/pages/users/profile.html',
                    authencticated: true
                })
                .when('/facebook/:token', {
                    templateUrl: 'app/pages/users/social/social.html',
                    controller: "facebookCtrl",
                    controllerAs: "facebook",
                    authencticated: false
                })
                .when('/facebookerror', {
                    templateUrl: 'app/pages/users/login.html',
                    controller: "facebookCtrl",
                    controllerAs: "facebook",
                    authencticated: false
                })
                .when('/createClaim', {
                    templateUrl: 'app/pages/claim/createClaim.html',
                    controller: "createClaimCtrl",
                    controllerAs: "createClaim",
                    authencticated: true
                })
                .otherwise({ redirectTo: '/' });

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

        });
    app.run(['$rootScope', 'Auth', '$location', function($rootScope, Auth, $location) {
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (next.$$route.authencticated == false) {
                console.log("No authentication required");
                if (Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/profile');
                }
            } else if (next.$$route.authencticated == true) {
                if (!Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/login');
                }
                console.log("Authentication is required");
            }
        });
    }])

}());