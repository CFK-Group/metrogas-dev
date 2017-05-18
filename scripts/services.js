'use strict';
angular.module('metrogas')

    .constant("baseURL","http://metrogas.xpass.cl/web/mobile/")

    .service('LoginService', ['$resource', 'baseURL', function($resource, baseURL) {
        
        this.loginUser = function(_usr, _psw, _deviceId, _deviceModel) {
            
            var login = $resource(baseURL+"login", {username: _usr, pass: _psw, deviceId: _deviceId, deviceModel: _deviceModel}, {'query': {isArray: false}});
            return login;
        }
    }])

    .service('UserService', ['$resource', 'baseURL', function($resource, baseURL){
        
        this.getUserData = function (_token){
            if(typeof sessionStorage.userSession !== 'undefined'){
                 $resource(baseURL+"userdata", {token: _token}, {'query': {isArray: false}}).query(
                     function(response){
                         if(response !== "error"){
                             window.localStorage.setItem('user', angular.toJson(response));
                             return response;
                         }
                 });
            }
        }
        
    }])

    .service('ventasService', ['$resource', 'baseURL', function($resource, baseURL){
        this.getVentas = function(token){
            return $resource(baseURL+"getventas", {token: token});
        };
        
        this.getByIC = function(_ic){
            return $resource(baseURL+"getbyic", {ic: _ic});
        };
        
        this.getById = function(_id){
            return $resource(baseURL+"getbyic", {ic: _id});
        };

        this.getComunas = function () {
            $resource(baseURL+"getcomunas").query(
                function (response) {
                    window.localStorage.setItem('comunas', angular.toJson(response));
                    return true;
                }
            );
        };

        this.getCalles = function () {
            $resource(baseURL+"getcalles").query(
                function (response) {
                    window.localStorage.setItem('calles', angular.toJson(response));
                    return true;
                }
            );
        };

        this.getGrillas = function () {
            $resource(baseURL+"getgrillas").query(
                function (response) {
                    window.localStorage.setItem('grillas', angular.toJson(response));
                    return true;
                }
            );
        };
    }])
;