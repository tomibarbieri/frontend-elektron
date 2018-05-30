angular.module('theme.demos.dashboard', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket',
    'chart.js'
    ])

  .controller('DashboardController', ['$scope', '$timeout', '$window', '$http', '$filter', '$rootScope', 'Notifier', function($scope, $timeout, $window, $http, $filter, $rootScope, Notifier, $websocket) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.websocketStatus = false;       // estado de la conexion de websocket
    $scope.chart;                         // variable para tener guardado el grafico y refrescarlos
    $scope.current_component;             // componente que filtra los websockets
    $scope.websocketplay = true;
    $scope.spinner = true;
    $scope.loading = true;
    $scope.dashboarderror = false;

    // Funcion para asociar la creacion del chart y guardar la variable
    $scope.$on('chart-create', function (evt, chart) {
      $scope.chart = chart;
    });

    $scope.reloadpage = function () {
      $window.location.reload();
    }

    // Obtiene todos los componentes para mostrarlos
    $http({
          method:'GET',
          url: url_server + '/devices/',
      }).then(function(response){
          console.log(response.data);

          $scope.components_server = response.data.devices;
          $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { ready: false }, true);
          $scope.components_server_enabled = $filter('filter')($scope.components_server, { ready: true }, true);

          if ($scope.components_server_enabled.length > 0) {
            $scope.current_component = $scope.components_server_enabled[0];
            $scope.loadInitialData();
            $scope.openWebsocketConnection();
          } else {
            Notifier.simpleError('No hay componentes', 'No hay componentes para mostrar datos en tiempo real');
            $scope.dashboarderror = true;
            $scope.current_component = {'label':'No hay'};
            $scope.dashboarderrormsje = "No hay componentes para mostrar datos en tiempo real";
            $scope.loading = false;
            $scope.spinner = false;
          }

      }, function(response){
          $scope.loading = false;
          $scope.spinner = false;
          $scope.current_component = {'label':'No hay'};
          $scope.dashboarderror = true;
          $scope.dashboarderrormsje = "Error de conexion en el servidor";
          Notifier.simpleError('Error de la conexion', 'Se ha detectado un error de la conexion al buscar los componentes');
    });

    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/data/totalwattstaxco2'
    }).then(function(response){
        console.log("general data");
        console.log(response.data);
        $scope.general_data = response.data;
    }, function(response){
        //Notifier.simpleError('Error de la conexion', 'Se ha detectado un error de la conexion al buscar los componentes');
        //show an appropriate message
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


    //Notifier.simpleInfo('Cargando datos', 'Cargando datos para el componente X');
    $scope.loadInitialData = function() {
      $http({
            method:'GET',
            url: url_server + '/devices/' + $scope.current_component.id + '/lastdata/20/'
        }).then(function(response){

            console.log(response.data.data);

            if (response.data.data.length > 0) {
              Notifier.simpleSuccess('Datos cargados', 'Los datos para el componente ' + $scope.current_component.label + ' fueron cargados con exito');
              $scope.graficate(response.data.data);
            } else {
              Notifier.simpleError('No hay datos','No hay datos para el componente ' + $scope.current_component.label)
            }

        }, function(response){
            $scope.loading = false;
            $scope.spinner = false;
            $scope.dashboarderror = true;
            console.log("problemas de conexion");
            Notifier.simpleError('Error de la conexion', 'Se ha detectado un error de la conexion al buscar la información');
      });
    }

    $scope.graficate = function(data){
        $scope.line = {};

        var data_sense = data;
        var inicio = (data_sense.length >= 20) ? (data_sense.length - 20) : (0);
        var fin = data_sense.length;

        $scope.line.series = ['Potencia'];

        $scope.line.labels = [];
        $scope.line.data = [[]];

        var labels = new Array();
        var datas = new Array();


        for (var i = fin - 1; i >= inicio; i--) {

          var hora = $filter('date')(data_sense[i].date, "HH:mm");
          var dia = $filter('date')(data_sense[i].date, 'dd');
          var mes = $filter('date')(data_sense[i].date, 'MM');

          var label = '(' + dia + '/' + mes + ') ' + hora;
          var data = data_sense[i].data_value;

          labels.push(label);
          datas.push(data);

        }

        $scope.spinner = false;
        $scope.line.labels = labels;
        $scope.line.data[0] = datas;

    }

    // funcion que se ejecuta cuando se selecciona un componente
    $scope.changeCurrentComponent = function(ids) {
      $scope.spinner = true;
      console.log(ids);
      var selected = $filter('filter')($scope.components_server, {id: ids})[0];
      console.log(selected);
      $scope.current_component = selected;
      // carga los datos del nuevo componente
      $scope.changeComponentWS();
    };

    // una vez seleccionado cambia los datos
    $scope.changeComponentWS = function(){

      if ($scope.websocketStatus == false) {
        $scope.openWebsocketConnection();
      }
      $scope.reloadData();

    }

    // Graficar
    $scope.reloadData = function(){
      //Notifier.simpleInfo('Cargando datos', 'Cargando datos para el componente X');
      var device_id = $scope.current_component.id;
      $http({
            method:'GET',
            url: url_server + '/devices/' + device_id + '/lastdata/20/'
        }).then(function(response){

            console.log(response.data.data);

            if (response.data.data.length > 0) {
              Notifier.simpleSuccess('Datos cargados', 'Los datos para el componente ' + $scope.current_component.label + ' fueron cargados con exito');
              $scope.graficate(response.data.data);
            } else {
              Notifier.simpleError('No hay datos','No hay datos para el componente ' + $scope.current_component.label)
            }

        }, function(response){
            $scope.loading = false;
            $scope.spinner = false;
            $scope.dashboarderror = true;
            console.log("problemas de conexion");
            Notifier.simpleError('Error de la conexion', 'Se ha detectado un error de la conexion');
      });
    };

    $scope.refreshConnection = function(){
      if ($rootScope.ws) {
        $rootScope.ws.close();
      }
      $scope.websocketStatus = false;
      $rootScope.ws = undefined;
      console.log("refresh");
      $scope.openWebsocketConnection();
    }

    $scope.pauseWebsocket = function () {
      $scope.websocketplay = false;
    }

    $scope.playWebsocket = function () {
      $scope.websocketplay = true;
    }

    // funcion para abrir una conexion ws
    $scope.openWebsocketConnection = function() {

      $scope.loading = true;

      if ($rootScope.ws == undefined) {
        var url_websocket = "ws://" + ip_server + ":8888/websocket";
        $rootScope.ws = new WebSocket(url_websocket);
        console.log("nuevo ws");
        Notifier.simpleInfo("Iniciando conexion en tiempo real", "Para el componente elegido inicialmente.");
      }
      else {
        console.log("recuperando ws");
        Notifier.simpleInfo("Reiniciando conexion en tiempo real", "Para el componente elegido inicialmente.");
      }

      //var url_websocket = "ws://" + ip_server + ":8888/websocket";
      //$scope.ws = new WebSocket(url_websocket);

      $rootScope.ws.onopen = function() {
        console.log("on open");
        $scope.websocketStatus = true;
        $scope.loading = false;
        $scope.$apply();
        Notifier.simpleSuccess('Conexion establecida','Se ha establecido la conexion para la vision de datos en tiempo real.')
      };

      $rootScope.ws.onclose = function() {
        $scope.loading = false;
        $scope.websocketStatus = false;
      };

      $rootScope.ws.onerror = function() {
        $scope.loading = false;
        $scope.websocketStatus = false;
        //Notifier.simpleError('Error en la conexion','Se ha detectado un error en la conexion para la vision de datos en tiempo real.')
      };

      $rootScope.ws.onmessage = function(message) {

          var data = JSON.parse(message.data);

          if ($scope.websocketStatus == false) {
            $scope.websocketStatus == true;
          }

          // chequea que el dato sea del componente elegido y lo muestra
          if ($scope.current_component) {

            if (data.device_mac == $scope.current_component.device_mac && $scope.websocketplay == true) {
              // Saca el primero del arreglo y pone uno nuevo al final
              console.log(data);

              $scope.current_data = data;
              $scope.current_data_date = new Date(data.data_datetime);
              $scope.$apply();

              var date = new Date(data.data_datetime);

              var hora = $filter('date')(date, "HH:mm");
              var dia = $filter('date')(date, 'dd');
              var mes = $filter('date')(date, 'MM');

              var label = '(' + dia + '/' + mes + ') ' + hora;

              var labels = Array.from($scope.chart.config.data.labels);
              var datas = Array.from($scope.chart.config.data.datasets[0].data);

              labels.splice(0,1);
              labels.push(label);

              datas.splice(0,1);
              datas.push(data.data_value.toString());

              if ($scope.chart) {

                $scope.chart.config.data.datasets[0].data = datas;
                $scope.chart.config.data.labels = labels;

                $scope.chart.update();

              }
            }
          } else {
            console.log('No fue seleccionado ningún componente');
          }


      };
      console.log($rootScope.ws);
    };

  }]);
