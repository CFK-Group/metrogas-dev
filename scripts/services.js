'use strict';
angular.module('metrogas')

    .constant("baseURL","http://metrogas.xpass.cl/web/mobile/")

    .service('LoginService', ['$resource', 'baseURL', function($resource, baseURL) {
        
        this.loginUser = function(_usr, _psw, _deviceId, _deviceModel) {
            
            var login = $resource(baseURL+"login", {username: _usr, pass: _psw, deviceId: _deviceId, deviceModel: _deviceModel}, {'query': {isArray: false}});
            return login;
        }
    }])

    .service('ventasService', ['$resource', 'baseURL', function($resource, baseURL){
        this.getVentas = function(){
            return $resource(baseURL+"getventas");
        }
        
        this.getByIC = function(_ic){
            return $resource(baseURL+"getbyic", {ic: _ic});
        }
        
        this.getById = function(_id){
            return $resource(baseURL+"getbyic", {ic: _id});
        }
    }])
