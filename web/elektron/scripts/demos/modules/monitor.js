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

    $scope.charts = [];

    $scope.$on('chart-create', function (evt, chart) {
      if ($scope.components_server_enabled) {
        if ($scope.charts.length <= $scope.components_server_enabled.length) {
          $scope.charts.push(chart);
          console.log('nuevo chart');
          console.log(chart);
          console.log($scope.charts);
        }
      } else {
        $scope.charts.push(chart);
      }
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

        $scope.line = {};

        var hora = $filter('date')(new Date(), "HH:mm");
        var dia = $filter('date')(new Date(), 'dd');
        var mes = $filter('date')(new Date(), 'MM');

        var label = '(' + dia + '/' + mes + ') ' + hora;

        for (var component in $scope.components_server_enabled) {
          $scope.line[$scope.components_server_enabled[component].device_mac] =
          {
            'series':['Potencia'],
            'labels':[label,label,label,label,label,label,label,label,label,label],
            'data':[[0,0,0,0,0,0,0,0,0,0]],
            'status': false
          };
        }

        console.log($scope.line);

        $scope.loadWebsocket();

    }, function(response){
        console.log("problemas de conexion");
    });

    $scope.refreshConnection = function(){
      if ($scope.websocketStatus == false) {
        $scope.loadWebsocketConnection();
      } else {
        Notifier.simpleInfo("Conexion establecida","Ya esta establecida la conexion en tiempo real");
      }
    }

    $scope.loadWebsocket = function() {
      var url_websocket = "ws://" + ip_server + ":8888/websocket";
      console.log(url_websocket);
      var ws = new WebSocket(url_websocket);

      ws.onopen = function() {
        ws.send("Hello, world");
        $scope.websocketStatus = true;
        $scope.$apply();
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
          $scope.last_value = json.data_value;
          var current_mac = json.device_mac;

          $scope.line[current_mac].data[0].splice(0,1);
          $scope.line[current_mac].data[0].push(json.data_value)

          $scope.line[current_mac].status = true;

          var date = new Date(json.data_datetime);

          var hora = $filter('date')(date, "HH:mm");
          var dia = $filter('date')(date, 'dd');
          var mes = $filter('date')(date, 'MM');

          var label = '(' + dia + '/' + mes + ') ' + hora;

          $scope.line[current_mac].labels.splice(0,1);
          $scope.line[current_mac].labels.push(label);

          if ($scope.charts) {
              for (var i = 0; i < $scope.charts.length; i++) {
                $scope.charts[i].update();
              }
              $scope.$apply()
          }
        };
    }

  }]);
