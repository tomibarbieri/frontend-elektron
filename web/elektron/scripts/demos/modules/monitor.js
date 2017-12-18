angular.module('theme.demos.monitor', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket',
    'chart.js'
    ])

  .controller('MonitorController', ['$scope', '$timeout', '$window', '$http', '$filter', 'Notifier', function($scope, $timeout, $window, $http, $filter, Notifier, $websocket) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    $scope.websocketStatus = false;
    $scope.switchStatus2 = 1;

    $scope.chart;

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        $scope.components_server_enabled = $filter('filter')($scope.components_server, { enabled: true }, true);
        $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { enabled: false }, true);

    }, function(response){
        console.log("problemas de conexion");
    });

    $scope.refreshConnection = function(){
      if ($scope.websocketStatus == false) {
        $scope.openWebsocketConnection();
      } else {
        Notifier.simpleInfo("Conexion establecida","Ya esta establecida la conexion en tiempo real");
      }
    }


    $http({
        method:'GET',
        url: url_server + '/devices/36/data/13/12/2017/'
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


    var url_websocket = "ws://" + ip_server + ":8888/websocket";
    console.log(url_websocket);
    var ws = new WebSocket(url_websocket,'ws');

    ws.onopen = function() {
      ws.send("Hello, world");
      $scope.websocketStatus = true;
    };

    ws.onclose = function() {
      $scope.websocketStatus = false;
    }

    ws.onerror = function() {
      $scope.websocketStatus = false;
    }

    ws.onmessage = function(message) {
        console.log(message.data);

        var json = JSON.parse(message.data);
        console.log(json.data_value);

        $scope.last_value = json.data_value;

        console.log($scope.line.data[0]);

        $scope.line.data[0].splice(0,1);


        console.log($scope.line.data[0].push(json.data_value));

        console.log($scope.line.data[0][9]);

        if ($scope.chart) {
            $scope.chart.update();
        }

      };

  }]);
