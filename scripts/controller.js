'use strict';
angular.module('metrogas')

.controller('LoginCtrl', ['$ionicPlatform', '$cordovaDevice', '$rootScope', '$scope', 'LoginService', '$state', '$ionicPopup', 'UserService', 'ventasService', '$ionicLoading', '$cordovaDevice', function($ionicPlatform, $cordovaDevice, $rootScope, $scope, LoginService, $state, $ionicPopup, UserService, ventasService, $ionicLoading){

    $ionicPlatform.ready(function() {
        //console.log($cordovaDevice.getDevice());

        var mode = 'develop'; //cambiar valor entre develop y produccion segun corresponda
        var model = "";
        var uuid = "";

        //detecccion de modo para saltar la comprobación de dispositivo
        if(mode === 'produccion'){
            model = $cordovaDevice.getModel();
            uuid = $cordovaDevice.getUUID();
            $scope.data = {
                username: "",
                password: "",
                deviceId: uuid,
                deviceModel: model
            };
        }else{
            model = "";
            uuid = "";
            $scope.data = {
                username: "test",
                password: "test",
                deviceId: uuid,
                deviceModel: model
            };
        }

        //console.log($scope.data);

        $scope.login = function () {
            $ionicLoading.show({
                template: 'Iniciando Sesión...',
                animation: 'fade-in',
                showBackdrop: true
            });
            $scope.loginVar = LoginService.loginUser($scope.data.username, $scope.data.password, $scope.data.deviceId, $scope.data.deviceModel).query(
                function (response) {

                    $scope.loginInfo = response;

                    if ($scope.loginInfo.statusCode === 0) {

                        sessionStorage.userSession = angular.toJson($scope.loginInfo);

                        var _token = JSON.parse(sessionStorage.userSession).sessionToken;

                        $scope.userData = UserService.getUserData(_token);
                        ventasService.getComunas(_token);
                        ventasService.getCalles(_token);
                        ventasService.getGrillas(_token);
                        ventasService.getCargas(_token);
                        ventasService.getTipoAcciones();
                        ventasService.getMotivos();
                        $ionicLoading.hide();
                        $rootScope.loginShow = false;
                        $state.go('app');

                        //borramos filtrosDA de direcciones asignadas al iniciar sesion
                        $scope.filterOptions={
                            calle: "",
                            comuna: "",
                            grilla: "",
                            recorrida: "",
                            contactada: "",
                            //ic: "",
                            carga: ""
                        };
                        console.log('borrando filtrosDA');
                        console.log('guardando filtrosDA');
                        sessionStorage.filtrosDA = angular.toJson($scope.filterOptions);
                        console.log(sessionStorage.filtrosDA);

                        //borramos filtros del historial al iniciar sesion
                        $scope.filterOptions={
                            calle: "",
                            comuna: "",
                            grilla: "",
                            recorrida: "",
                            contactada: "",
                            //ic: "",
                            carga: ""
                        };
                        console.log('borrando filtrosH');
                        console.log('guardando filtrosH');
                        sessionStorage.filtrosH = angular.toJson($scope.filterOptions);
                        console.log(sessionStorage.filtrosH);

                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Ups!',
                            template: $scope.loginInfo.errorDesc
                        });
                    }
                },
                function (response) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Ups!',
                        template: 'Algo ha pasado, vuelve a intentar más tarde'
                    });
                }
            );
        };
    });
}])

.controller('SideNavCtrl', ['$rootScope', '$scope', '$ionicSideMenuDelegate', '$state', function ($rootScope, $scope, $ionicSideMenuDelegate, $state) {

    $scope.$watch(function(){
        return window.localStorage.getItem('user');
    }, function(){
        $scope.user = JSON.parse(window.localStorage.getItem('user'));
    });

    $scope.toggleMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.close = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $scope.endSesion = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
        $rootScope.loginShow = true;
        localStorage.removeItem('user');
        sessionStorage.removeItem('userSession');
        $state.go('login')
    };
    
}])

.controller('HomeCtrl',['$scope', 'UserService', function($scope, UserService){
    $scope.visitadas = localStorage.visitadas;
}])

.controller('AsignCtrl',['$scope', '$ionicModal', 'ventasService', '$ionicLoading', function($scope, $ionicModal, ventasService, $ionicLoading){

    $ionicLoading.show();

    if(sessionStorage.filtrosDA !== undefined){
        console.log('filter options = '+$scope.filterOptions);
        $scope.filterOptions = JSON.parse(sessionStorage.filtrosDA);
    }else{
        console.log('blanqueando filtros');
        $scope.filterOptions={
            calle: "",
            comuna: "",
            grilla: "",
            recorrida: "",
            contactada: "",
            //ic: "",
            carga: ""
        };
    }

    var _token = JSON.parse(localStorage.getItem('user')).api_token;
    //llamar a la api con solicitudes para ver las ventas...
    ventasService.getVentas(_token).query().$promise.then(
        function(response){
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('views/filtermodal.html',{
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.modal = modal;
                $scope.direcciones = JSON.parse(JSON.stringify(response));
                $scope.allComunas = JSON.parse(localStorage.getItem('comunas'));
                $scope.allCalles = JSON.parse(localStorage.getItem('calles'));
                $scope.allGrilla = JSON.parse(localStorage.getItem('grillas'));
                $scope.allCargas = JSON.parse(localStorage.getItem('cargas'));
            });

            $scope.openModal = function(index) {
                console.log(sessionStorage.filtrosDA);
                if(sessionStorage.filtrosDA !== undefined){
                    $scope.filterOptions = JSON.parse(sessionStorage.filtrosDA);
                }else{
                    $scope.filterOptions={
                        calle: "",
                        comuna: "",
                        grilla: "",
                        recorrida: "",
                        contactada: "",
                        //ic: "",
                        carga: ""
                    };
                }
                $scope.modal.show();
            };

            $scope.closeModal = function(index) {
                $scope.modal.hide();
            };

            $scope.guardarFiltros = function () {
                console.log('guardando filtrosDA');
                sessionStorage.filtrosDA = angular.toJson($scope.filterOptions);
                console.log(sessionStorage.filtrosDA);
            };

            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });

            $scope.resetFilter = function () {
                $scope.filterOptions={
                    calle: "",
                    comuna: "",
                    grilla: "",
                    recorrida: "",
                    contactada: "",
                    //ic: "",
                    carga: ""
                };
                console.log('borrando filtrosDA');
                console.log($scope.filterOptions);
            };

            $scope.search = function(row) {
                // console.log(row);
                return (
                    angular.lowercase(row.direccion).toString().indexOf(angular.lowercase($scope.filterOptions.calle) || "") !== -1 &&
                    angular.lowercase(row.comuna).toString().indexOf(angular.lowercase($scope.filterOptions.comuna) || "") !== -1 &&
                    angular.lowercase(row.grilla).toString().indexOf(angular.lowercase($scope.filterOptions.grilla) || "") !== -1 &&
                    angular.lowercase(row.recorrida).toString().indexOf(angular.lowercase($scope.filterOptions.recorrida) || "") !== -1 &&
                    angular.lowercase(row.contactada).toString().indexOf(angular.lowercase($scope.filterOptions.contactada) || "") !== -1 &&
                    angular.lowercase(row.carga_id).toString().indexOf(angular.lowercase($scope.filterOptions.carga) || "") !== -1
                    //angular.lowercase(row.IC).toString().indexOf(angular.lowercase($scope.filterOptions.ic) || "") !== -1
                );
            };
        }
    );
}])

.controller('EditCtrl',['$scope', '$stateParams', '$state', 'ventasService', '$ionicLoading', '$ionicPopup', '$cordovaGeolocation', '$rootScope', function($scope, $stateParams, $state, ventasService, $ionicLoading, $ionicPopup, $cordovaGeolocation, $rootScope) {

    $scope.motivos_no_contacto = JSON.parse(localStorage.getItem('motivos_no_contacto'));
    //console.log($scope.motivos_no_contacto);

    $scope.motivos_no_interes = JSON.parse(localStorage.getItem('motivos_no_interes'));
    //console.log($scope.motivos_no_interes);

    $scope.motivos_justificacion = JSON.parse(localStorage.getItem('motivos_justificacion'));
    //console.log($scope.motivos_justificacion);


    var id = parseInt($stateParams.id,10); //get Id parameter;
    $ionicLoading.show({
          content: 'Obteniendo Información...',
          animation: 'fade-in',
          showBackdrop: true
      });

    ventasService.getById(id).get().$promise.then(
        //funcion correctamente ejecutada
        function(response){
            //console.log(response);
            $scope.direccion = response;
            if($stateParams.from === "historial"){
                $scope.model = JSON.parse(JSON.stringify($scope.direccion));
            }else {
                $scope.model = {
                    IC: $scope.direccion.IC,
                    block: $scope.direccion.block,
                    carga_id: $scope.direccion.carga_id,
                    casa: $scope.direccion.casa,
                    comuna: $scope.direccion.comuna,
                    consumo_invierno: $scope.direccion.consumo_invierno,
                    contactada: null,
                    correo_BBDD: $scope.direccion.correo_BBDD,
                    correo_actualizado: null,
                    direccion: $scope.direccion.direccion,
                    dpto: $scope.direccion.dpto,
                    fecha: $scope.direccion.fecha,
                    fono_BBDD: $scope.direccion.fono_BBDD,
                    fono_actualizado: null,
                    grilla: $scope.direccion.grilla,
                    id: $scope.direccion.id,
                    interes: null,
                    justificacion: $scope.direccion.justificacion,
                    motivo_contacto: null,
                    motivo_interes: null,
                    nombre: $scope.direccion.nombre,
                    numero: $scope.direccion.numero,
                    observacion: $scope.direccion.observacion,
                    recorrida: null,
                    rut: null,
                    tipo_vivienda: $scope.direccion.tipo_vivienda,
                    usuarios_id: $scope.direccion.usuarios_id
                };
            }
            $scope.model.correo_actualizado = $scope.direccion.correo_BBDD;
            $scope.model.fono_actualizado = $scope.direccion.fono_BBDD;
            //console.log($scope.model);
            $ionicLoading.hide();
            $scope.step = '1';

            $scope.stepForward = function(nextStep){
                $scope.step = nextStep;
            };

            $scope.cancel = function(){
                if($stateParams.from === "historial"){
                    $scope.model = JSON.parse(JSON.stringify($scope.direccion));
                    $state.go('app.historial');
                }else {
                    $scope.model = {
                        IC: $scope.direccion.IC,
                        block: $scope.direccion.block,
                        carga_id: $scope.direccion.carga_id,
                        casa: $scope.direccion.casa,
                        comuna: $scope.direccion.comuna,
                        consumo_invierno: $scope.direccion.consumo_invierno,
                        contactada: null,
                        correo_BBDD: $scope.direccion.correo_BBDD,
                        correo_actualizado: null,
                        direccion: $scope.direccion.direccion,
                        dpto: $scope.direccion.dpto,
                        fecha: $scope.direccion.fecha,
                        fono_BBDD: $scope.direccion.fono_BBDD,
                        fono_actualizado: null,
                        grilla: $scope.direccion.grilla,
                        id: $scope.direccion.id,
                        interes: null,
                        justificacion: $scope.direccion.justificacion,
                        motivo_contacto: null,
                        motivo_interes: null,
                        nombre: $scope.direccion.nombre,
                        numero: $scope.direccion.numero,
                        observacion: $scope.direccion.observacion,
                        recorrida: null,
                        rut: null,
                        tipo_vivienda: $scope.direccion.tipo_vivienda,
                        usuarios_id: $scope.direccion.usuarios_id
                    };
                    $state.go('app.asignadas');
                }
            };

            $scope.incrementarVisitasDiarias = function () {
                localStorage.visitadas = parseInt(localStorage.visitadas) + 1;
                var fecha = new Date();
                localStorage.fechaUltimaVisita = fecha.getDate().toString() + '/' + fecha.getMonth().toString() + '/' + fecha.getFullYear().toString();
            };

            $scope.editarVenta = function (){
                ventasService.edit().save($scope.model).$promise.then(
                    function (response2) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Ok',
                            template: 'Información guardada correctamente'
                        });
                        $scope.incrementarVisitasDiarias();
                        if($scope.step !== '6'){
                            $state.go('app.asignadas');
                        }else{
                            $state.go('app.accioncomercial', {idVenta: $scope.direccion.id, idCarga: $scope.direccion.carga_id, from: "edit", direccion: $scope.direccion.direccion + " " + $scope.direccion.numero});
                        }
                    },
                    function (response_){
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'UPS!!',
                            template: 'Algo pasó, intente nuevamente' + response_
                        });
                    }

                )
            };

            $scope.addAccionComercial = function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Continuar',
                    template: '¿Deseas agregar una acción comercial?',
                    cancelText: 'No',
                    okText: 'Si'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        //si apreta si
                        $scope.date = new Date();
                        $scope.step = '6';
                        $scope.executeSaving();
                    } else {
                        //si apreta no
                        $scope.executeSaving();
                    }
                });
            };

            $scope.executeSaving = function () {
                $ionicLoading.show();
                $scope.editarVenta();
                var userData = JSON.parse(localStorage.getItem('user'));
                var _token = userData.api_token;
                ventasService.getVentas(_token);
                ventasService.getHistorial(_token);
            }



        },
        //error en la funcion
        function(response){
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Ups!',
                template: 'Algo ha pasado, vuelve a intentar más tarde'
            });
        }
    );

    //var direcciones = JSON.parse(localStorage.getItem('direcciones')); //get direcciones from localstorage
    /*
    function findDireccion(address) {
        return address.IC === item; // verifica si el campo IC es igual al parametro  de la url
    }
    $scope.direccion = direcciones.find(findDireccion);
    console.log($scope.direccion);
    $scope.model = JSON.parse(JSON.stringify($scope.direccion));
*/
    /*
    function isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        console.log(aProps);
        console.log(bProps);
        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length !== bProps.length) {
            return false;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
    */
    //  $scope.edit = function(){
  //      console.log(ventasService.edit().update({IC: $scope.model.IC}, $scope.model));
    /*
        PARA OFFLINE

        var arr = [];
        if (!isEquivalent($scope.model, $scope.direccion)) { //evalua si el elemento fue modificado o no comparandolo con el mismo elemento en el array original
            if (localStorage.getItem('modified_dir') !== null) { //si existía algun elemento modificado en cola se agrega este elemento a la cola, de lo contrario
                var existent = JSON.parse(localStorage.getItem('modified_dir'));
                arr.push(existent);
                arr.push($scope.model);
                localStorage.setItem('modified_dir', angular.toJson(arr));
            } else { //se crea el elemento
                arr.push($scope.model);
                localStorage.setItem('modified_dir', [angular.toJson(arr)]);
            }
        }*/
    /*   console.log($scope.model);
        console.log($scope.direccion);
        console.log(isEquivalent($scope.model, $scope.direccion));
        console.log('-------------');

    }*/

}])

.controller('AccionCtrl',['$rootScope', '$cordovaGeolocation', '$scope', '$ionicModal', '$stateParams', '$ionicLoading', 'ventasService', '$ionicPopup', function($rootScope, $cordovaGeolocation, $scope, $ionicModal, $stateParams, $ionicLoading, ventasService, $ionicPopup) {
    var idVenta = $stateParams.idVenta;
    var idCarga = $stateParams.idCarga;
    $scope.direccion = $stateParams.direccion;
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $ionicLoading.show();

    $scope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options){
            if (fromState.name === 'app.accioncomercial') {
                $scope.incrementarVisitasDiarias();
            }
    });


    $scope.acciones = function () {
        ventasService.getAcciones(idVenta).query(
            function (data) {
                $ionicLoading.hide();
                $scope.accionesComerciales = JSON.parse(JSON.stringify(data));
            },
            function (data) {
                $ionicPopup.alert({
                    title: 'Ups!',
                    template: 'Algo ha pasado, intente nuevamente'
                });
            }
        );
    };

    $scope.acciones();

    $scope.model = {
        accion_id: null,
        resultado: "",
        idVenta: idVenta,
        idCarga: idCarga
    };

    $scope.tac = JSON.parse(localStorage.getItem("tac"));

    //console.log("Venta: " + idVenta);
    //console.log("Carga: " + idCarga);

    $ionicModal.fromTemplateUrl('views/AddACmodal.html',{
        id: 1,
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modal_1 = modal;
    });

    $ionicModal.fromTemplateUrl('views/EditACmodal.html',{
        id: 2,
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modal_2 = modal;
    });

    $scope.openModal = function(index) {
        if (index === 1){
            $scope.modal_1.show();
        }else{
            $scope.modal_2.show();
        }
    };

    $scope.closeModal = function(index) {
        if (index === 1){
            $scope.modal_1.hide();
        }else{
            $scope.modal_2.hide();
        }
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal_1.remove();
        $scope.modal_2.remove();
    });

    $scope.chooseModal= function (index, model){
        model = model || null;
        if (model !== null){
            $scope.model = {
                id: model.id,
                accion_id: model.tipo_accion_comercial_id,
                resultado: model.resultado,
                observacion: model.observacion
            };
            //console.log($scope.model);
        }else{
            $scope.model = {
                accion_id: null,
                resultado: "",
                idVenta: idVenta,
                idCarga: idCarga,
                observacion : ""
            };
        }
        $scope.openModal(index);
    };

    $scope.incrementarVisitasDiarias = function () {
        localStorage.visitadas = parseInt(localStorage.visitadas) + 1;
        var fecha = new Date();
        localStorage.fechaUltimaVisita = fecha.getDate().toString() + '/' + fecha.getMonth().toString() + '/' + fecha.getFullYear().toString();
    };

    $scope.editar = function(){
        $ionicLoading.show();
        $cordovaGeolocation.getCurrentPosition(posOptions).then(
        function (position) {
            $scope.model.latitud = (position.coords.latitude).toString();
            $scope.model.longitud = (position.coords.longitude).toString();
            //console.log($scope.model);
            ventasService.updateAC().save($scope.model).$promise.then(
                function (response) {
                    //console.log(response);
                    $ionicLoading.hide();
                    var alert = $ionicPopup.alert({
                        title: 'Guardado',
                        template: 'Accion añadida correctamente'
                    });
                    alert.then(function () {
                        $scope.incrementarVisitasDiarias();
                        $scope.closeModal();
                        $scope.acciones();
                        var userData = JSON.parse(localStorage.getItem('user'));
                        var _token = userData.api_token;
                        ventasService.getVentas(_token);
                        ventasService.getHistorial(_token);
                    });
                },
                function (response) {
                    //console.log(response);
                    $ionicLoading.hide();
                    var alert = $ionicPopup.alert({
                        title: 'Ups!',
                        template: 'Algo ha pasado, intentaremos nuevamente'
                    });

                    alert.then(function () {
                        $scope.enviar();
                    });
                }
            );
        });
    };



    $scope.enviar = function(){
        console.log("starting loading modal");
        $ionicLoading.show();
        console.log("start selecting data to add to model");
        switch($scope.model.accion_id){
            case "1":
                $scope.model.accion = "Contactar Telefónicamente";
                break;
            case "2":
                $scope.model.accion = "Agendar Visita";
                break;
            case "3":
                $scope.model.accion = "Reagendar Visita";
                break;
            case "4":
                $scope.model.accion = "Generar Presupuesto";
                break;
            case "5":
                $scope.model.accion = "Enviar Correo";
                break;
            default:
                $scope.model.accion = null;
                break;
        }

        console.log("GetCurentPosition");

        $cordovaGeolocation.getCurrentPosition(posOptions).then(
            function (position) {
                console.log("Starting GetCurentPosition");
                console.log(position);

                $scope.model.latitud = (position.coords.latitude).toString();
                $scope.model.longitud = (position.coords.longitude).toString();

                console.log("Coordenadas obtenidas");
                console.log($scope.model);

                ventasService.saveAC().save($scope.model).$promise.then(
                    function (response) {
                        console.log("data enviada correctamente");
                        $ionicLoading.hide();
                        var alert = $ionicPopup.alert({
                            title: 'Guardado',
                            template: 'Accion añadida correctamente'
                        });
                        alert.then(function () {
                            $scope.closeModal();
                            $scope.incrementarVisitasDiarias();
                            $scope.acciones();
                            var userData = JSON.parse(localStorage.getItem('user'));
                            var _token = userData.api_token;
                            ventasService.getVentas(_token);
                            ventasService.getHistorial(_token);
                        });
                    },
                    function (response) {
                        console.log("ERROR:");
                        console.log(response);
                        $ionicLoading.hide();
                        var alert = $ionicPopup.alert({
                            title: 'Ups!',
                            template: 'Algo ha pasado, verifica que la ubicacion esté encendida'
                        });
                    }
                );
            },
            function(err){
                console.log(err);
            });
        }
    }])

.controller('HistorialCtrl', ['$ionicPopup', '$scope', '$state', '$ionicLoading', '$ionicModal', 'ventasService', function($ionicPopup, $scope, $state, $ionicLoading, $ionicModal, ventasService){

    $ionicLoading.show();

    if(sessionStorage.filtrosH !== undefined){
        console.log('filter options = '+$scope.filterOptions);
        $scope.filterOptions = JSON.parse(sessionStorage.filtrosH);
    }else{
        console.log('blanqueando filtros');
        $scope.filterOptions={
            calle: "",
            comuna: "",
            grilla: "",
            recorrida: "",
            contactada: "",
            //ic: "",
            carga: ""
        };
    }

    var _token = JSON.parse(localStorage.getItem('user')).api_token;
    ventasService.getHistorial(_token).query().$promise.then(
        function(response){
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('views/filtermodal.html',{
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.modal_1 = modal;
                $scope.direcciones = JSON.parse(JSON.stringify(response));
                $scope.allComunas = JSON.parse(localStorage.getItem('comunas'));
                $scope.allCalles = JSON.parse(localStorage.getItem('calles'));
                $scope.allGrilla = JSON.parse(localStorage.getItem('grillas'));
                $scope.allCargas = JSON.parse(localStorage.getItem('cargas'));
            });

            $ionicModal.fromTemplateUrl('views/EditDirModal.html',{
                id: 2,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.modal_2 = modal;
            });

            $scope.openModal = function(index) {
                if (index === 1){
                    console.log($scope.filterOptions);
                    if(sessionStorage.filtrosH !== undefined){
                        $scope.filterOptions = JSON.parse(sessionStorage.filtrosH);
                    }else{
                        $scope.filterOptions={
                            calle: "",
                            comuna: "",
                            grilla: "",
                            recorrida: "",
                            contactada: "",
                            //ic: "",
                            carga: ""
                        };
                    }
                    $scope.modal_1.show();
                }else{
                    $scope.modal_2.show();
                }
            };

            $scope.closeModal = function(index) {
                if (index === 1){
                    $scope.modal_1.hide();
                }else{
                    $scope.modal_2.hide();
                }
            };

            $scope.guardarFiltros = function () {
                console.log('guardando filtrosH');
                sessionStorage.filtrosH = angular.toJson($scope.filterOptions);
                console.log(sessionStorage.filtrosH);
            };

            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.modal_1.remove();
                $scope.modal_2.remove();
            });

            $scope.resetFilter = function () {
                $scope.filterOptions={
                    calle: "",
                    comuna: "",
                    grilla: "",
                    recorrida: "",
                    contactada: "",
                    //ic: "",
                    carga: ""
                };
                console.log('borrando filtrosDA');
                console.log($scope.filterOptions);
            };

            $scope.chooseModal= function (index, dir){
                dir = dir || null;
                if (dir !== null){
                    $scope.dir = {
                        direccion: dir.direccion,
                        casa: dir.casa,
                        block: dir.block,
                        dpto: dir.dpto,
                        comuna: dir.comuna,
                        IC: dir.IC,
                        grilla: dir.grilla,
                        nombre: dir.nombre,
                        rut: dir.rut,
                        fono_actualizado: dir.fono_actualizado,
                        correo_actualizado: dir.correo_actualizado,
                        observacion: dir.observacion,
                        id: dir.id
                    };
                }
                $scope.openModal(index);
            };

            $scope.incrementarVisitasDiarias = function () {
                localStorage.visitadas = parseInt(localStorage.visitadas) + 1;
                var fecha = new Date();
                localStorage.fechaUltimaVisita = fecha.getDate().toString() + '/' + fecha.getMonth().toString() + '/' + fecha.getFullYear().toString();
            };

            $scope.editarDir = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Continuar',
                    template: '¿Guardar cambios?',
                    cancelText: 'No',
                    okText: 'Si'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        //si apreta si
                        $scope.executeSaving();

                        $scope.$watch($scope.dir, function(){
                            ventasService.getHistorial(_token).query().$promise.then(
                                function(response){
                                    $scope.direcciones = JSON.parse(JSON.stringify(response));
                                }
                            )
                        });

                    } else {
                        //si apreta no
                    }
                });
            };

            $scope.executeSaving = function () {
                $ionicLoading.show();
                $scope.editarVenta();
                var userData = JSON.parse(localStorage.getItem('user'));
                var _token = userData.api_token;
                ventasService.getVentas(_token);
                ventasService.getHistorial(_token);
                $scope.closeModal(2);
                $state.go('app.aux', {from:'goToHistorial'});
            };

            $scope.editarVenta = function (){
                ventasService.edit().save($scope.dir).$promise.then(
                    function (response2) {
                        $ionicLoading.hide();
                        var alert = $ionicPopup.alert({
                            title: 'Ok',
                            template: 'Información guardada correctamente'
                        });
                        alert.then(function (res) {
                            $scope.incrementarVisitasDiarias();
                        });
                    },
                    function (response_){
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'UPS!!',
                            template: 'Algo pasó, intente nuevamente ' + response_
                        });
                        console.log(response_)
                        // $scope.editarVenta();
                        // $ionicLoading.show();
                    }
                )
            };

            $scope.resetFilter = function () {
                $scope.filterOptions={
                    calle: "",
                    comuna: "",
                    grilla: "",
                    recorrida: "",
                    contactada: "",
                    presupuestada: "",
                    carga: ""
                };
            };

            $scope.filterOptions={
                calle: "",
                comuna: "",
                grilla: "",
                recorrida: "",
                contactada: "",
                presupuestada: "",
                carga: ""
            };

            $scope.search = function(row) {
                //console.log(row);
                return (
                    angular.lowercase(row.direccion).toString().indexOf(angular.lowercase($scope.filterOptions.calle) || "") !== -1 &&
                    angular.lowercase(row.comuna).toString().indexOf(angular.lowercase($scope.filterOptions.comuna) || "") !== -1 &&
                    angular.lowercase(row.grilla).toString().indexOf(angular.lowercase($scope.filterOptions.grilla) || "") !== -1 &&
                    angular.lowercase(row.recorrida).toString().indexOf(angular.lowercase($scope.filterOptions.recorrida) || "") !== -1 &&
                    angular.lowercase(row.contactada).toString().indexOf(angular.lowercase($scope.filterOptions.contactada) || "") !== -1 &&
                    angular.lowercase(row.carga_id).toString().indexOf(angular.lowercase($scope.filterOptions.carga) || "") !== -1  &&
                    angular.lowercase(row.presupuestada).toString().indexOf(angular.lowercase($scope.filterOptions.presupuestada) || "") !== -1
                );
            };

            $scope.go = function(contactada, interesa, id, carga_id, from, direccion, numero){
                if (contactada === 1 && interesa === 1){
                    $state.go('app.accioncomercial', {idVenta: id, idCarga: carga_id, from: from, direccion: direccion + " " + numero});
                }else{
                    $state.go('app.modify', {id: id, from:from});
                }
            };
        }
    );
}])

.controller('NewCtrl', ['$scope', 'ventasService', '$ionicPopup', '$state', function($scope, ventasService, $ionicPopup, $state){
    $scope.model = {
        IC: null,
        block: null,
        carga_id: 0,
        casa: null,
        comuna: "",
        consumo_invierno: null,
        contactada: 0,
        correo_BBDD: "",
        correo_actualizado: "",
        direccion: "",
        dpto: null,
        fono_BBDD: "",
        fono_actualizado: "",
        grilla: "no identificada",
        id: null,
        interes: 0,
        justificacion: "",
        motivo_contacto: "",
        motivo_interes: "",
        nombre: "",
        numero: "",
        observacion: "",
        recorrida: 0,
        rut: "",
        tipo_vivienda: "",
        usuarios_id: (JSON.parse(localStorage.getItem('user'))).id
    };
    $scope.enviar = function (){
        //console.log($scope.model);
        ventasService.guardar().save($scope.model).$promise.then(
            function(response){
                if (response){
                //console.log(response);
                var alert = $ionicPopup.alert({
                    title: '¡Exito!',
                    template: 'Datos guardados correctamente'
                });
                alert.then(function(){
                    var userData = JSON.parse(localStorage.getItem('user'));
                    var _token = userData.api_token;
                    ventasService.getVentas(_token);
                    ventasService.getHistorial(_token);
                    $state.go('app.asignadas');  //confirmar q este era el cambio que había q realizar
                });
            }},
            function(response){
                var alert = $ionicPopup.alert({
                    title: 'Ups!',
                    template: response
                });
            }
        );
    };
}])

.controller('auxCtrl',['$stateParams', '$state', function ($stateParams, $state) {
    if($stateParams.from === "goToHistorial"){
        $state.go('app.historial');
    }
}])
;