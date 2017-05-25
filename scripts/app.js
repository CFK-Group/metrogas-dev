'use strict';
angular.module('metrogas', ['ionic','ui.router','ngCordova','angular.filter','ngResource'])
.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
        .state('login',{
            url: '/login',
            views: {
                'login': {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })

        .state('app',{
                url: '/',
                views: {
                    'sidenav' : {
                        templateUrl: 'views/sidenav.html'
                    },
                    'content@': {
                        templateUrl: 'views/home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })

        .state('app.asignadas',{
                url: '/asignadas',
                views: {
                    'content@': {
                        templateUrl: 'views/asignadas.html',
                        controller: 'AsignCtrl'
                    }
                }
            })

        .state('app.edit',{
                url: '/edit/:ic',
                views: {
                    'content@': {
                        templateUrl: 'views/edit.html',
                        controller: 'EditCtrl'
                    }
                }
            });

    $urlRouterProvider.otherwise('login');

}).run(
    function($rootScope) {
        $rootScope.loginShow= true;
        $rootScope.user = "";
    },

    function($ionicSideMenuDelegate, $ionicPlatform, $state){
        $ionicPlatform.registerBackButtonAction(function (event) {
            if($ionicSideMenuDelegate.isOpen){
                $ionicSideMenuDelegate.toggleLeft(false);
                if($state.current.name=="app" || $state.current.name=="login"){
                    navigator.app.exitApp();
                }
                else {
                    navigator.app.backHistory();
                }
            }
        }, 100)}
    );