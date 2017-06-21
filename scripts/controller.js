'use strict';
angular.module('metrogas')

.controller('LoginCtrl', ['$rootScope', '$scope', 'LoginService', '$state', '$ionicPopup', 'UserService', 'ventasService', '$ionicLoading', function($rootScope, $scope, LoginService, $state, $ionicPopup, UserService, ventasService, $ionicLoading){
    $scope.data = {
        username: "test",
        password: "test",
        deviceModel : "",
        deviceId: ""
    };

    $scope.login = function() {
        $ionicLoading.show({
            template: 'Iniciando Sesión...',
            animation: 'fade-in',
            showBackdrop: true
        });
        $scope.loginVar = LoginService.loginUser($scope.data.username, $scope.data.password, $scope.data.deviceModel, $scope.data.deviceId).query(
            function(response){

                $scope.loginInfo = response;

                if($scope.loginInfo.statusCode === 0){
                    
                    sessionStorage.userSession = angular.toJson($scope.loginInfo);
                    
                    var _token = JSON.parse(sessionStorage.userSession).sessionToken;

                    $scope.userData = UserService.getUserData(_token);
                    ventasService.getVentas(_token).query(
                        function(response){
                            localStorage.setItem('direcciones', angular.toJson(response));
                        }
                    );
                    ventasService.getComunas(_token);
                    ventasService.getCalles(_token);
                    ventasService.getGrillas(_token);
                    ventasService.getCargas(_token);
                    ventasService.getTipoAcciones();
                    ventasService.getMotivos();
                    $ionicLoading.hide();
                    $rootScope.loginShow = false;
                    $state.go('app');
                }else{
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Ups!',
                        template: $scope.loginInfo.errorDesc
                    });
                }
            },
            function(response){
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Ups!',
                    template: 'Algo ha pasado, vuelve a intentar más tarde'
                });
            }
        );
    };
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

}])

.controller('AsignCtrl',['$scope', '$ionicModal', function($scope, $ionicModal){

    $ionicModal.fromTemplateUrl('views/filtermodal.html',{
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modal = modal;
        $scope.direcciones = JSON.parse(localStorage.getItem('direcciones'));
        $scope.allComunas = JSON.parse(localStorage.getItem('comunas'));
        $scope.allCalles = JSON.parse(localStorage.getItem('calles'));
        $scope.allGrilla = JSON.parse(localStorage.getItem('grillas'));
        $scope.allCargas = JSON.parse(localStorage.getItem('cargas'));
    });
    
    $scope.openModal = function() {
        $scope.modal.show();
    };
   
    $scope.closeModal = function() {
        $scope.modal.hide();
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
    };
    
    $scope.filterOptions={
        calle: "",
        comuna: "",
        grilla: "",
        recorrida: "",
        contactada: "",
        //ic: "",
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
            angular.lowercase(row.carga_id).toString().indexOf(angular.lowercase($scope.filterOptions.carga) || "") !== -1
            //angular.lowercase(row.IC).toString().indexOf(angular.lowercase($scope.filterOptions.ic) || "") !== -1
        );
    };
}])

.controller('EditCtrl',['$scope', '$stateParams', '$state', 'ventasService', '$ionicLoading', '$ionicPopup', function($scope, $stateParams, $state, ventasService, $ionicLoading, $ionicPopup){

    $scope.motivos_no_contacto = JSON.parse(localStorage.getItem('motivos_no_contacto'));
    console.log($scope.motivos_no_contacto);

    $scope.motivos_no_interes = JSON.parse(localStorage.getItem('motivos_no_interes'));
    console.log($scope.motivos_no_interes);

    $scope.motivos_justificacion = JSON.parse(localStorage.getItem('motivos_justificacion'));
    console.log($scope.motivos_justificacion);

    var id = parseInt($stateParams.id,10); //get Id parameter;
    $ionicLoading.show({
          content: 'Obteniendo Información...',
          animation: 'fade-in',
          showBackdrop: true
      });

    ventasService.getById(id).get().$promise.then(
        //funcion correctamente ejecutada
        function(response){
            console.log(response);
            $scope.direccion = response;
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
                nombre: null,
                numero: $scope.direccion.numero,
                observacion: $scope.direccion.observacion,
                recorrida: null,
                rut: null,
                tipo_vivienda: $scope.direccion.tipo_vivienda,
                usuarios_id: $scope.direccion.usuarios_id
            };
            $ionicLoading.hide();
            $scope.step = '1';

            $scope.stepForward = function(nextStep){
                $scope.step = nextStep;
            };

            $scope.cancel = function(){
                $scope.model = $scope.model = {
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
                    nombre: null,
                    numero: $scope.direccion.numero,
                    observacion: $scope.direccion.observacion,
                    recorrida: null,
                    rut: null,
                    tipo_vivienda: $scope.direccion.tipo_vivienda,
                    usuarios_id: $scope.direccion.usuarios_id
                };
                $state.go('app.asignadas');
            };

            $scope.editarVenta = function (){
                var data = [$scope.model, $scope.direccion];
                ventasService.edit().save(data).$promise.then(
                    function (response2) {
                        console.log(response2);
                        $ionicLoading.hide();
                        var a = $ionicPopup.alert({
                            title: 'Ok',
                            template: 'Información guardada correctamente'
                        });
                        a.then(function(res){
                                $ionicLoading.show();
                        });
                        if($scope.step !== '6'){
                            $state.go('app.asignadas');
                        }else{
                            $state.go('app.accioncomercial', {idVenta: $scope.direccion.id, idCarga: $scope.direccion.carga_id, from: "edit"});
                        }

                    },
                    function (response_){
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'UPS!!',
                            template: 'Algo pasó, intentaremos nuevamente' + response_
                        });
                        $scope.editarVenta();
                        $ionicLoading.show();
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

            $scope.executeSaving= function () {
                $ionicLoading.show();
                $scope.editarVenta();
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
    .controller('AccionCtrl',['$scope', '$ionicModal', '$stateParams', '$ionicLoading', 'ventasService', '$ionicPopup', function($scope, $ionicModal, $stateParams, $ionicLoading, ventasService, $ionicPopup) {
        var idVenta = $stateParams.idVenta;
        var idCarga = $stateParams.idCarga;
        var from = $stateParams.from;
        if (from !== "edit"){
            $ionicLoading.show();
        }
        ventasService.getAcciones(idVenta).then(
            function(data){
                $ionicLoading.hide();
                $scope.accionesComerciales = JSON.parse(angular.toJson(data));
                console.log($scope.accionesComerciales);
            },
            function(data){

            }
        );
        $scope.model = {
            accion_id: null,
            fecha_accion: "",
            resultado: "",
            fecha_resultado: "",
            idVenta: idVenta,
            idCarga: idCarga
        };

        $scope.tac = JSON.parse(localStorage.getItem("tac"));

        console.log("Venta: " + idVenta);
        console.log("Carga: " + idCarga);

        $ionicModal.fromTemplateUrl('views/AddACmodal.html',{
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        $scope.enviar = function(){
            $ionicLoading.show();
            ventasService.saveAC().save($scope.model).$promise.then(
                function(response){
                    console.log(response);
                    $ionicLoading.hide();
                    var alert = $ionicPopup.alert({
                        title: 'Guardado',
                        template: 'Accion añadida correctamente'
                    });
                    alert.then(
                        function(){
                            $ionicLoading.show();

                        }
                    );
                },
                function(response){
                    $ionicLoading.hide();
                }

            );
        }


    }])

;