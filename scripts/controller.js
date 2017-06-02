'use strict';
angular.module('metrogas')

.controller('LoginCtrl', ['$rootScope', '$scope', 'LoginService', '$state', '$ionicPopup', 'UserService', 'ventasService', function($rootScope, $scope, LoginService, $state, $ionicPopup, UserService, ventasService){

    $scope.data = {
        username: "",
        password: "",
        deviceModel : "",
        deviceId: ""
    };

    $scope.login = function() {
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

                    $rootScope.loginShow = false;
                    $state.go('app');
                }else{
                    $ionicPopup.alert({
                        title: 'Ups!',
                        template: $scope.loginInfo.errorDesc
                    });
                }
            },
            function(response){
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

.controller('AsignCtrl',['$scope', '$ionicModal', 'ventasService', function($scope, $ionicModal, ventasService){
    
    $ionicModal.fromTemplateUrl('views/filtermodal.html',{
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
   
    $scope.resetFilter = function () {
        $scope.filterOptions={
            calle: "",
            comuna: "",
            grilla: "",
            recorrida: "",
            contactada: "",
            ic: "",
            carga: ""
        };
    };
    
    $scope.direcciones = JSON.parse(localStorage.getItem('direcciones'));
    $scope.allComunas = JSON.parse(localStorage.getItem('comunas'));
    $scope.allCalles = JSON.parse(localStorage.getItem('calles'));
    $scope.allGrilla = JSON.parse(localStorage.getItem('grillas'));
    $scope.allCargas = JSON.parse(localStorage.getItem('cargas'));

    $scope.filterOptions={
        calle: "",
        comuna: "",
        grilla: "",
        recorrida: "",
        contactada: "",
        ic: "",
        carga: ""
    };

    $scope.search = function(row) {
        return (
            angular.lowercase(row.direccion).toString().indexOf(angular.lowercase($scope.filterOptions.calle) || "") !== -1 &&
            angular.lowercase(row.comuna).toString().indexOf(angular.lowercase($scope.filterOptions.comuna) || "") !== -1 &&
            angular.lowercase(row.grilla).toString().indexOf(angular.lowercase($scope.filterOptions.grilla) || "") !== -1 &&
            angular.lowercase(row.recorrida).toString().indexOf(angular.lowercase($scope.filterOptions.recorrida) || "") !== -1 &&
            angular.lowercase(row.contactada).toString().indexOf(angular.lowercase($scope.filterOptions.contactada) || "") !== -1 &&
            angular.lowercase(row.carga).toString().indexOf(angular.lowercase($scope.filterOptions.carga) || "") !== -1 &&
            angular.lowercase(row.IC).toString().indexOf(angular.lowercase($scope.filterOptions.ic) || "") !== -1
        );
    };
}])

.controller('EditCtrl',['$scope', '$stateParams', '$state', 'ventasService', function($scope, $stateParams, $state, ventasService){
    var item = $stateParams.ic;
    var direcciones = JSON.parse(localStorage.getItem('direcciones'));

    function findDireccion(address) {
        return address.IC === item;
    }
    $scope.direccion = direcciones.find(findDireccion);
    console.log(direcciones.find(findDireccion));
}])
;