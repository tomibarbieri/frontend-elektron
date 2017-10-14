angular
  .module('theme.demos.components', [])
  .controller('ComponentsController', ['$scope', '$filter', '$http', function($scope, $filter, $http, $httpProvider) {
    'use strict';

    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        console.log($scope.components_server[0].label);
    }, function(response){
        console.log("problemas de conexion");
    });

    $scope.components = [{
      id: 1,
      name: 'Heladera',
      ip: "192.168.0.1",
      last: "39"
    }, {
      id: 2,
      name: 'Microondas',
      ip: "192.168.0.2",
      last: "54"
    }, {
      id: 3,
      name: 'Luces',
      ip: "192.168.0.3",
      last: "34"
    }];

    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var data2 = {'device_ip': data.ip, 'device_mac': data.mac, 'devicestate': 1, 'label': data.name};

      var serializedData = $.param(data2);
      console.log(serializedData);

      var send = $http({
        method: 'POST',
        url: 'http://192.168.0.21:8000/devices/update',
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

    /*
    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var data2 = {'device_ip': data.ip, 'device_mac': data.mac, 'devicestate': 1, 'label': data.name, 'data_value': 23};
      var serializedData = $.param(data2);
      console.log(serializedData);

      var send = $http({
        method: 'POST',
        url: 'http://163.10.33.153:8000/devices/create',
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
    };*/

    // remove component
    $scope.removeComponent = function(index) {
      $scope.components_server.splice(index, 1);
    };

    // add user
    $scope.addComponent = function() {
      $scope.inserted = {
        id: $scope.components_server.length + 1,
        name: '',
        ip: '',
        last: '',
      };
      $scope.components_server.push($scope.inserted);
    };
  }]);
