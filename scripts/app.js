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
            })

        .state('app.accioncomercial',{
            url: '/accioncomercial/:idVenta/:idCarga/:from/:direccion',
            views: {
                'content@': {
                    templateUrl: 'views/accioncomercial.html',
                    controller: 'AccionCtrl'
                }
            }
        })
    ;

    $urlRouterProvider.otherwise('login');

}).run(
    function($rootScope, $ionicSideMenuDelegate, $ionicPlatform, $state, $stateParams){
        $rootScope.loginShow= true;
        $rootScope.user = "";
        $ionicPlatform.registerBackButtonAction(function (event) {

            if($state.current.name==="app" || $state.current.name==="login"){
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    navigator.app.exitApp();
                }
            }
            else if($state.current.name==="app.edit")
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app.asignadas');
                }
            }
            else if($state.current.name==="app.accioncomercial" && $stateParams.from === "edit" )
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app.asignadas');
                }
            }
            else if($state.current.name==="app.asignadas")
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app');
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