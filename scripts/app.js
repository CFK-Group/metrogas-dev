'use strict';
angular.module('metrogas', ['ionic','ui.router','ngCordova', 'ngStorage', 'angular.filter','ngResource','ionic.wizard'])
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
            url: '/edit/:id/:from',
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

        .state('app.historial',{
            url: '/historial',
            views: {
                'content@': {
                    templateUrl: 'views/historial.html',
                    controller: 'HistorialCtrl'
                }
            }
        })

        .state('app.modify',{
            url: '/modify/:id/:from',
            views: {
                'content@': {
                    templateUrl: 'views/modify.html',
                    controller: 'EditCtrl'
                }
            }
        })

        .state('app.new',{
            url: '/new',
            views: {
                'content@': {
                    templateUrl: 'views/create.html',
                    controller: 'NewCtrl'
                }
            }
        })

        .state('app.aux',{
            url:'/aux/:from',
            views: {
                'content@': {
                    controller: 'auxCtrl'
                }
            }
        })

    ;

    $urlRouterProvider.otherwise('login');

}).run(
    function($rootScope, $ionicSideMenuDelegate, $ionicPlatform, $state, $cordovaDevice){

        var fecha = new Date();
        var fechaActual = fecha.getDate().toString() + '/' + fecha.getMonth().toString() + '/' + fecha.getFullYear().toString();
        console.log('fecha actual: ' + fechaActual);
        console.log('fecha ultima visita: ' + localStorage.fechaUltimaVisita);
        console.log('Visitadas Hoy: ' + $rootScope.visitadas);

        if(fechaActual !== localStorage.fechaUltimaVisita){
            $rootScope.visitadas = 0;
            localStorage.visitadas = $rootScope.visitadas;
        }else{
            $rootScope.visitadas = localStorage.visitadas;
        }

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
            else if($state.current.name==="app.modify")
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app.historial');
                }
            }
            else if($state.current.name==="app.historial")
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app');
                }
            }
            else if($state.current.name==="app.accioncomercial")
            {
                if($ionicSideMenuDelegate.isOpen()) {
                    $ionicSideMenuDelegate.toggleLeft(false);
                }else {
                    $state.go('app.historial');
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