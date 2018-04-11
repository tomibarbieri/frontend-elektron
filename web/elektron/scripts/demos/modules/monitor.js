angular.module('theme.demos.monitor', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket',
    'chart.js'
    ])

  .controller('MonitorController', ['$scope', '$timeout', '$window', '$http', '$filter', '$rootScope', 'Notifier', function($scope, $timeout, $window, $http, $filter, $rootScope, Notifier) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    $scope.websocketStatus = false;
    $scope.switchStatus2 = 1;
    $scope.websocketplay = true;
    $scope.spinner = true;
    $scope.loading = false;

    $scope.charts = [];

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    /*$scope.$on('chart-create', function (evt, chart) {
      if ($scope.components_server_enabled) {
        if ($scope.charts.length < $scope.components_server_enabled.length) {
          $scope.charts.push(chart);
          console.log('nuevo chart');
          console.log(chart);
          console.log($scope.charts);
        }
      } else {
        $scope.charts.push(chart);
      }
    });*/

    $scope.pauseWebsocket = function () {
      $scope.websocketplay = false;
    }

    $scope.playWebsocket = function () {
      $scope.websocketplay = true;
    }

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){

        $scope.spinner = false;

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
          var labels = [];
          var data = [[]];
          console.log($scope.components_server_enabled);
          var last = ($scope.components_server_enabled[component].lastdata.length > 10)? 10 : $scope.components_server_enabled[component].lastdata.length;
          console.log(last);
          for (var i = 0; i < last; i++) {
            var date = $scope.components_server_enabled[component].lastdata[i].date;
            var hora = $filter('date')(date, "HH:mm");
            var dia = $filter('date')(date, 'dd');
            var mes = $filter('date')(date, 'MM');

            var label = '(' + dia + '/' + mes + ') ' + hora;
            labels.push(label);
            data[0].push($scope.components_server_enabled[component].lastdata[i].data_value);
          }

          $scope.line[$scope.components_server_enabled[component].device_mac] = {
                                                                        'series': ['Potencia'],
                                                                        'labels': labels,
                                                                        'data': data,
                                                                        'status': false
                                                                      };
        }

        $scope.loadWebsocket();

    }, function(response){
        Notifier.simpleError('Error de la conexion', 'Se ha detectado un error de la conexion al buscar los dispositivos');
        console.log("problemas de conexion");
    });

    $scope.refreshConnection = function(){
      if ($rootScope.ws) {
        $scope.websocketStatus = false;
        $rootScope.ws.close();
      }
      $rootScope.ws = undefined;
      console.log("refresh");
      $scope.loadWebsocket();
    }

    $scope.loadWebsocket = function() {

      $scope.loading = true;
      Notifier.simpleInfo("Iniciando conexion en tiempo real", "Para el componente elegido inicialmente.");

      if ($rootScope.ws == undefined) {
        var url_websocket = "ws://" + ip_server + ":8888/websocket";
        $rootScope.ws = new WebSocket(url_websocket);
        console.log("nuevo ws");
      } else {
        console.log("recuperando ws");
      }

      $rootScope.ws.onopen = function() {
        $scope.loading = false;
        $scope.websocketStatus = true;
        Notifier.simpleSuccess('Conexion establecida','Se ha establecido la conexion para la vision de datos en tiempo real.')
        $scope.$apply();
      };

      $rootScope.ws.onclose = function() {
        $scope.loading = false;
        $scope.websocketStatus = false;
      }

      $rootScope.ws.onerror = function() {
        $scope.loading = false;
        $scope.websocketStatus = false;
        //Notifier.simpleError('Error en la conexion','Se ha detectado un error en la conexion para la vision de datos en tiempo real.')
      }

      $rootScope.ws.onmessage = function(message) {

          $scope.websocketStatus = true;

          var json = JSON.parse(message.data);

          $scope.current_data = json;
          $scope.current_data_date = new Date(json.data_datetime);
          $scope.$apply();

          if (json != undefined && $scope.websocketplay == true) {

            console.log(json);
            $scope.last_value = json.data_value;

            var current_mac = json.device_mac;

            var date = new Date(json.data_datetime);

            var hora = $filter('date')(date, "HH:mm");
            var dia = $filter('date')(date, 'dd');
            var mes = $filter('date')(date, 'MM');

            var label = '(' + dia + '/' + mes + ') ' + hora;

            $scope.line[current_mac].labels.splice(0,1);
            $scope.line[current_mac].labels.push(label);

            $scope.line[current_mac].data[0].splice(0,1);
            $scope.line[current_mac].data[0].push(json.data_value)

            $scope.line[current_mac].status = true;

            /*if ($scope.charts) {
                for (var i = 0; i < $scope.charts.length; i++) {
                  $scope.charts[i].update();
                }
                $scope.$apply()
            }*/
            $scope.$apply();
          }
        };
    }

  }]);
