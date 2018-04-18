angular
  .module('theme.demos.components', [])
  .controller('ComponentsController', ['$scope', '$http','Notifier', '$window', function($scope, $http, Notifier, $window) {
    'use strict';

    $scope.spinner = true;
    $scope.onbutton = false;
    $scope.offbutton = false;
    $scope.activatebutton = false;
    $scope.desactivatebutton = false;
    $scope.loading = false;
    $scope.componentserror = false;

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.reloadpage = function () {
      $window.location.reload();
    }

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.spinner = false;
        $scope.components_server = response.data.devices;
        Notifier.simpleSuccess("Componentes cargados", "Se han cargado con exito un total de " + response.data.devices.length + " componentes.");
    }, function(response){
        $scope.spinner = false;
        $scope.componentserror = true;
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la informacion de los componentes del servidor");
    });

    $scope.saveComponent = function(data, id) {
      $scope.loading = true;
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var url = url_server + '/devices/'+ id +'/updatelabel';
      var data2 = {'label': data.name};
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
          $scope.loading = false;
          console.log(response);
          Notifier.simpleSuccess('Componente guardado','El nombre del componente se ha editado con éxito');
      }, function(response){
          $scope.loading = false;
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo guardar','Por problemas de conexión no se pudo guardar');
      });
    };

    $scope.turnOnComponent = function(index,id) {
      $scope.loading = true;
      $scope.onbutton = true;
      $scope.offbutton = true;
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
          $scope.loading = false;
          $scope.offbutton = false;
          $scope.onbutton = false;
          $scope.components_server[index].devicestate.name = 'on';
          Notifier.simpleSuccess('Componente encendido','El componente se ha encendido con éxito');
      }, function(response){
          $scope.loading = false;
          $scope.offbutton = false;
          $scope.onbutton = false;
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo encender','Por problemas de conexión no se pudo encender el componente');
      });
    };

    $scope.turnOffComponent = function(index,id) {
      $scope.loading = true;
      $scope.offbutton = true;
      $scope.onbutton = true;
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
          $scope.loading = false;
          $scope.offbutton = false;
          $scope.onbutton = false;
          $scope.components_server[index].devicestate.name = 'off';
          Notifier.simpleSuccess('Componente apagado','El componente se ha apagado con éxito');
        }, function(response){
          $scope.loading = false;
          $scope.offbutton = false;
          $scope.onbutton = false;
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo apagar','Por problemas de conexión no se pudo apagar el componente');
      });
    };

    $scope.enableComponent = function(index,id) {
      $scope.loading = true;
      $scope.desactivatebutton = true;
      $scope.activatebutton = true;
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
          $scope.loading = false;
          $scope.activatebutton = false;
          $scope.desactivatebutton = false;
          $scope.components_server[index].enabled = 'true';
          Notifier.simpleSuccess('Componente activado','El componente se ha activado con éxito');
      }, function(response){
          $scope.loading = false;
          $scope.activatebutton = false;
          $scope.desactivatebutton = false;
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo activar','Por problemas de conexión no se pudo activar el componente');
      });
    };

    $scope.disableComponent = function(index,id) {
      $scope.loading = true;
      $scope.desactivatebutton = true;
      $scope.activatebutton = true;
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
          $scope.loading = false;
          $scope.desactivatebutton = false;
          $scope.activatebutton = false;
          $scope.components_server[index].enabled = 'false';
          Notifier.simpleSuccess('Componente desactivado','El componente se ha desactivado con éxito');
        }, function(response){
          $scope.loading = false;
          $scope.desactivatebutton = false;
          $scope.activatebutton = false;
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo desactivar','Por problemas de conexión no se pudo desactivar el componente');
      });
    };

}]);
