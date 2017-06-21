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

        //uses only if user has internet connection
        this.getByIC = function(_ic){
            return $resource(baseURL+"getbyic", {ic: _ic}, {'query': {isArray: false}});
        };

        //uses only if user has internet connection
        this.getById = function(_id){
            return $resource(baseURL+"getbyid", {id: _id});
        };

        //get all comunas related to the user for use on filters
        this.getComunas = function (token) {
            $resource(baseURL+"getcomunas", {token: token}).query(
                function (response) {
                    window.localStorage.setItem('comunas', angular.toJson(response));
                    return true;
                }
            );
        };

        //get all calles related to the user for use on filters
        this.getCalles = function (token) {
            $resource(baseURL+"getcalles", {token: token}).query(
                function (response) {
                    window.localStorage.setItem('calles', angular.toJson(response));
                    return true;
                }
            );
        };

        //get all grillas related to the user for use on filters
        this.getGrillas = function (token) {
            $resource(baseURL+"getgrillas", {token: token}).query(
                function (response) {
                    window.localStorage.setItem('grillas', angular.toJson(response));
                    return true;
                }
            );
        };

        this.getCargas = function (token)   {
            $resource(baseURL+"getcargas", {token: token}).query(
                function (response) {
                    window.localStorage.setItem('cargas', angular.toJson(response));
                    return true;
                }
            );
        };

        this.getTipoAcciones = function (){
            $resource(baseURL+"gettipoacciones").query(
                function (response) {
                    window.localStorage.setItem('tac', angular.toJson(response));
                    return true;
                }
            );
        };

        this.getAcciones = function(ventaid){
            return $resource(baseURL+"getacciones", {ventaid: ventaid});
        };

        this.getMotivos = function(){
            $resource(baseURL+"getmotivos").query(
                function (response) {
                    //motivos
                    //1	contacto rechazado
                    //2	no hay interes
                    //3	justificacion
                    var contacto = [];
                    var interes = [];
                    var justificacion = [];

                    for(var i = 0; i < response.length ; i++){
                        switch (response[i].tipo_motivo_id){
                            case 1:
                                contacto.push(response[i]);
                                break;
                            case 2:
                                interes.push(response[i]);
                                break;
                            case 3:
                                justificacion.push(response[i]);
                                break;
                        }
                    }

                    window.localStorage.setItem('motivos_no_contacto', angular.toJson(contacto));
                    window.localStorage.setItem('motivos_no_interes', angular.toJson(interes));
                    window.localStorage.setItem('motivos_justificacion', angular.toJson(justificacion));
                    return true;
                }
            );
        };

        //guardar las modificaciones a la venta/direccion
        this.edit = function (){
            return $resource(baseURL+"save", null, {'query': {isArray: true}});
        };

        //guardar las acciones comerciales para la venta
        this.saveAC = function(){
            return $resource(baseURL+"saveac");
        }
    }])
;