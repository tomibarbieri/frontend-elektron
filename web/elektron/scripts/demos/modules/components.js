angular
  .module('theme.demos.components', [])
  .controller('ComponentsController', ['$scope', '$http','Notifier', function($scope, $http, Notifier) {
    'use strict';

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        Notifier.simpleSuccess("Componentes cargados", "Se han cargado con exito un total de " + response.data.devices.length + " componentes.");
    }, function(response){
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la informacion de los componentes del servidor");
    });

    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var data2 = {'label': data.name};

      var url = url_server + '/devices/'+ id +'/updatelabel';

      var serializedData = $.param(data2);
      console.log(serializedData);

      var send = $http({
        method: 'POST',
        url: url,
        data: serializedData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.turnOnComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/turnon';
      var send = $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].devicestate.name = 'on';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.turnOffComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/shutdown';
      var send = $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].devicestate.name = 'off';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.enableComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/enable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].enabled = 'true';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.disableComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/disable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].enabled = 'false';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

}]);
