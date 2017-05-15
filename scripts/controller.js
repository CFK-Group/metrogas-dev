'use strict';
angular.module('metrogas')

.controller('LoginCtrl', ['$scope', 'LoginService', '$state', '$ionicPopup', function($scope, LoginService, $state, $ionicPopup){
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
                if($scope.loginInfo.statusCode == 0){
                    sessionStorage.userSession = angular.toJson($scope.loginInfo);
                    $state.go('app');
                }else{
                    var alertPopup = $ionicPopup.alert({
                        title: 'Ups!',
                        template: $scope.loginInfo.errorDesc
                    });
                }
            },
            function(response){
                var alertPopup = $ionicPopup.alert({
                    title: 'Ups!',
                    template: 'Algo ha pasado, vuelve a intentar más tarde'
                });
            }
        );
    };
}])

.controller('SideNavCtrl', ['$scope', '$ionicSideMenuDelegate', '$state', 'UserService', function ($scope, $ionicSideMenuDelegate, $state, UserService) {
    
    if (UserService.getUserData() && typeof localStorage.getItem('user')!== 'undefined'){
        $scope.user = localStorage.getItem('user');
    }
    
    $scope.toggleMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.close = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $scope.endSesion = function(){
        $ionicSideMenuDelegate.toggleLeft(false);
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
    
    $scope.direcciones = ventasService.getVentas().query();
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