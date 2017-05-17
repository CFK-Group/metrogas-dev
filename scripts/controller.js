'use strict';
angular.module('metrogas')

.controller('LoginCtrl', ['$rootScope', '$scope', 'LoginService', '$state', '$ionicPopup', 'UserService', function($rootScope, $scope, LoginService, $state, $ionicPopup, UserService){

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
                console.log($scope.loginInfo);
                if($scope.loginInfo.statusCode === 0){
                    
                    sessionStorage.userSession = angular.toJson($scope.loginInfo);
                    
                    var _token = JSON.parse(sessionStorage.userSession).sessionToken;
                    
                    console.log("controller: " + _token);
                    
                    $scope.userData = UserService.getUserData(_token);
                    console.log($scope.userData);

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

    console.log("aaa");

    $scope.$watch(function(){
        return window.localStorage.getItem('user');
    }, function(){
        $scope.user = JSON.parse(window.localStorage.getItem('user'));
        console.log($scope.user);
    });

    console.log($scope.user);

    $scope.toggleMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.close = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $scope.endSesion = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
        $rootScope.loginShow = false;
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
            nodo: "",
            cuadrante: "",
            estado: "",
            comuna: "",
            fecha: "",
            tipo_actividad: ""
        };
    }
    
    $scope.direcciones = ventasService.getVentas(JSON.parse(window.localStorage.getItem('user')).api_token).query();
    console.log($scope.direcciones);
    /*$scope.allComunas = TaskService.getComunas();
    $scope.allNodes = TaskService.getNodes();
    $scope.allCuadrantes = TaskService.getCuadrantes();
    $scope.allStatus =  TaskService.getStatus();
    
    $scope.search = function(row) {
        return (
            angular.lowercase(row.ubicacion[0].comuna).toString().indexOf(angular.lowercase($scope.filterOptions.comuna) || "") !== -1 &&
            angular.lowercase(row.ubicacion[0].nodo).toString().indexOf(angular.lowercase($scope.filterOptions.nodo) || "")!== -1 &&
            angular.lowercase(row.ubicacion[0].cuadrante).toString().indexOf(angular.lowercase($scope.filterOptions.cuadrante) || "") !== -1 &&
            angular.lowercase(row.estado).toString().indexOf(angular.lowercase($scope.filterOptions.estado) || "") !== -1
        );
    };*/
}])

.controller('EditCtrl',['$scope', '$stateParams', '$state', 'ventasService', function($scope, $stateParams, $state, ventasService){
    $scope.item = parseInt($stateParams.ic);
    //console.log($scope.item);
    $scope.venta = ventasService.getByIC($scope.item).query();
    console.log($scope.venta);
}])