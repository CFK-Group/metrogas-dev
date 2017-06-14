'use strict';
angular.module('metrogas', ['ionic','ui.router','ngCordova','angular.filter','ngResource','ionic.wizard'])
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
                url: '/edit/:id',
                views: {
                    'content@': {
                        templateUrl: 'views/edit.html',
                        controller: 'EditCtrl'
                    }
                }
            });

    $urlRouterProvider.otherwise('login');

}).run(
    function($rootScope, $ionicSideMenuDelegate, $ionicPlatform, $state, $ionicHistory){
        $rootScope.loginShow= true;
        $rootScope.user = "";
        console.log($ionicHistory);
        $ionicPlatform.registerBackButtonAction(function (event) {
            console.log($state.current.name);

                if($state.current.name=="app" || $state.current.name=="login"){
                    if($ionicSideMenuDelegate.isOpen()) {
                        $ionicSideMenuDelegate.toggleLeft(false);
                    }else {
                        navigator.app.exitApp();
                    }
                }
                else {
                    if($ionicSideMenuDelegate.isOpen()) {
                        $ionicSideMenuDelegate.toggleLeft(false);
                    }else {
                        navigator.app.backHistory();
                    }
                }
        }, 100)}
    );