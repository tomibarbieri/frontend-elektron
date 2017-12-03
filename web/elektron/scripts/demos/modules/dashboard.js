angular.module('theme.demos.dashboard', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket',
    'chart.js'
    ])

  .controller('DashboardController', ['$scope', '$timeout', '$window', '$http', '$filter', function($scope, $timeout, $window, $http, $filter, $websocket) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.websocketStatus = false;       // estado de la conexion de websocket
    $scope.chart;                         // variable para tener guardado el grafico y refrescarlos
    $scope.current_component;             // componente que filtra los websockets

    // Funcion para asociar la creacion del chart y guardar la variable
    $scope.$on('chart-create', function (evt, chart) {
      $scope.chart = chart;
    });

    // Obtiene todos los dispositivos para mostrarlos
    $http({
          method:'GET',
          url: url_server + '/devices/'
      }).then(function(response){
          console.log(response.data);

          $scope.components_server = response.data.devices;

          $scope.current_component = $scope.components_server[0];

          $scope.components_server_enabled = $filter('filter')($scope.components_server, { enabled: true }, true);
          $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { enabled: false }, true);

      }, function(response){
          console.log("problemas de conexion");
    });

    // Obtiene los data tasks para contarlos y ponerlos en el box
    $http({
          method:'GET',
          url:'http://158.69.223.78:8000/tasks/datatasks'
      }).then(function(response){
          console.log(response.data);
          $scope.datatasks_server = response.data.datatasks;
          console.log($scope.datatasks_server);
      }, function(response){
          console.log("problemas de conexion");
    });

    // Obtiene los date time tasks para contarlos y ponerlos en el box
    $http({
          method:'GET',
          url:'http://158.69.223.78:8000/tasks/datetimetasks'
      }).then(function(response){
          console.log(response.data);
          $scope.datetimetasks_server = response.data.datetimetasks;
          console.log($scope.datetimetasks_server);
      }, function(response){
          console.log("problemas de conexion");
    });

    // Obtiene toda la data medida para
    $http({
          method:'GET',
          url: url_server + '/data/'
      }).then(function(response){
          console.log(response.data.data);
          console.log(response.data);
          $scope.line = {};

          var data_sense = response.data.data;
          var inicio = (data_sense.length >= 20) ? (data_sense.length - 20) : (0);
          var fin = data_sense.length;

          console.log(inicio,fin);

          $scope.line.series = ['Potencia'];

          $scope.line.labels = [];
          $scope.line.data = [[]];

          for (var i = inicio; i < fin; i++) {
            console.log(data_sense[i]);
            var hora = $filter('date')(data_sense[i].date, "HH:mm");
            var dia = $filter('date')(data_sense[i].date, 'dd');
            var mes = $filter('date')(data_sense[i].date, 'MM');

            var data = data_sense[i].data_value;

            var label = '(' + dia + '/' + mes + ') ' + hora;
            $scope.line.labels.push(label);
            $scope.line.data[0].push(data);
          }

      }, function(response){
          console.log("problemas de conexion");
    });

    // funcion para el select
    $scope.changeCurrentComponent = function(ids) {
      console.log(ids);
      var selected = $filter('filter')($scope.components_server, {id: ids})[0];
      console.log(selected);
      $scope.current_component = selected;
    };

    // funcion para regenerar el ws
    $scope.reloadWebsocketConnection = function() {
      console.log("Regenerate WS connection");

      if ($scope.ws) {
        $scope.ws.terminate();
      }

      var url_websocket = "ws://" + ip_server + ":8888/websocket";
      $scope.ws = new WebSocket(url_websocket,'ws');

      $scope.ws.onopen = function() {
        ws.send("Conectado");
        $scope.websocketStatus = true;
      };

      $scope.ws.onclose = function() {
        $scope.websocketStatus = false;
      };

      $scope.ws.onerror = function() {
        $scope.websocketStatus = false;
      };

      $scope.ws.onmessage = function(message) {
          console.log(message.data);
          var json = JSON.parse(message.data);

          // chequea que el dato sea del componente elegido y lo muestra
          if (message.data.device_mac == $scope.current_component.device_mac) {
            // Saca el primero del arreglo y pone uno nuevo al final
            $scope.line.data[0].splice(0,1);
            $scope.line.data[0].push(json.data_value);
            if ($scope.chart) {
                $scope.chart.update();
            }
          }

      };
      console.log($scope.ws);
    };

    $scope.reloadWebsocketConnection();

  }]);
