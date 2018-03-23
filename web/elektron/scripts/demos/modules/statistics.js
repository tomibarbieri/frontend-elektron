angular
  .module('theme.demos.statistics', ['chart.js'])
  .controller('StatisticsController', ['$scope', '$http', '$filter', 'Notifier', function($scope, $http, $filter, Notifier) {
    'use strict';

    console.log("Statistics");

    var url_server = 'http://158.69.223.78:8000';

    $scope.doughnut;
    $scope.bar;

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      console.log(chart.config.type);
      console.log(chart.config.data);
      if (chart.config.type == 'doughnut') {
        $scope.doughnut = chart;
      }
      else {
        $scope.bar = chart;
      }
    });

    $scope.doughnutlabels = [];
    $scope.doughnutdata = [];

    $scope.barlabels = [];
    $scope.barseries = [];
    $scope.bardata = [[],[]];

    $scope.barPrecision = [{
      'id': 0,
      'label': 'Por día',
      'url': 'perday'
    }, {
      'id': 1,
      'label': 'Por hora',
      'url': 'perhour'
    }, {
      'id': 2,
      'label': 'Cada 5 seg',
      'url': 'normal'
    }];

    $scope.currentPrecision = {
      'id': 0,
      'label': 'Por día',
      'url': 'perday'
    };


    $http({
        method:'GET',
        url: url_server + '/devices/statistics'
    }).then(function(response){
        console.log(response.data);

        $scope.components_statistics = response.data.devices;

    }, function(response){
        console.log("problemas de conexion");
    });


    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        Notifier.simpleSuccess('Datos cargados con exito','Desde el servidor')

        $scope.createBarChart();
        $scope.createDoughnutChart();

    }, function(response){
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la informacion de los componentes del servidor");
    });

    $scope.changeCriteria = function(id_selected) {
      var selected = $filter('filter')($scope.barPrecision, {id: id_selected});
      var selectedPrecision = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';

      $scope.currentPrecision = selectedPrecision;

      $scope.barlabels = [];

      $scope.getComponentData('left',$scope.currentBarLeft);
      $scope.getComponentData('right',$scope.currentBarRigth);

    }

    $scope.changeLeftBarComponent = function(id) {
      console.log(id);
      $scope.changeBarComponent(id,'left');
    }

    $scope.changeRigthBarComponent = function(id) {
      console.log(id);
      $scope.changeBarComponent(id,'right');
    }

    $scope.changeBarComponent = function(id_selected, side) {

      var selected = $filter('filter')($scope.components_server, {id: id_selected});
      var selectedComponent = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';

      $scope.getComponentData(side,selectedComponent);

      if (side == 'left') {
        $scope.currentBarLeft = selectedComponent;
        $scope.barseries[0] = $scope.currentBarLeft.label;
      }
      else {
        $scope.currentBarRigth = selectedComponent;
        $scope.barseries[1] = $scope.currentBarRigth.label;
      }
      console.log($scope.barseries);
    }

    $scope.getComponentData = function(side, component) {

      var c = component;

      $http({
          method:'GET',
          url: url_server + '/devices/' + c.id + '/data/' + $scope.currentPrecision.url // modificar la URL /devices/id/data/perhour
      }).then(function(response){
          console.log(response.data.data);
          //$scope.components_server = response.data.devices;
          Notifier.simpleSuccess('Tabla comparativa','Datos cargados con exito para el componente');
          $scope.graficateComponentBar(response.data.data, side);

      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Tabla comparativa - Error","No se pudo traer la informacion del componente por problemas de conexión");
      });
    }

    $scope.graficateComponentBar = function(data, side) {

      console.log($scope.barlabels.length);

      var length = (data.length >= 6) ? 6 : data.length;
      console.log(length);


      if ($scope.barlabels.length == 0) {
        console.log('preparando footer');
        for (var i = length-1; i > 0; i--) {
          var time;
          if ($scope.currentPrecision.url == 'perday') {
            time = $filter('date')(data[i].date, 'shortDate');
          } else {
            if ($scope.currentPrecision.url == 'perhour') {
              time = $filter('date')(data[i].date, 'shortTime')
            } else {
              console.log('chicharitoo');
            }
          }
          $scope.barlabels.push(time);
        }
      }

      if (side == 'left') {
        console.log('izquierda');
        $scope.bardata[0] = [];
        for (var i = length-1; i > 0; i--) {
          console.log(data);
          console.log(i);
          if (data[i].data_value == null) {
            console.log("vuelta");
            $scope.bardata[0].push(0);
          } else {
            $scope.bardata[0].push(data[i].data_value);
          }
        }
      } else {
        console.log('derecha');
        $scope.bardata[1] = [];

        for (var i = length-1; i > 0; i--) {
          if (data[i].data_value == null) {
            console.log("vuelta");
            $scope.bardata[1].push(0);
          } else {
            $scope.bardata[1].push(data[i].data_value);
          }
        }
      }

    }

    $scope.createBarChart = function() {

      $scope.currentBarLeft = $scope.components_server[0];
      $scope.currentBarRigth = $scope.components_server[0];

      $scope.barseries = [$scope.currentBarLeft.label, $scope.currentBarRigth.label];

      $scope.getComponentData('left',$scope.currentBarLeft)
      $scope.getComponentData('rigth',$scope.currentBarRigth)

    }

    $scope.createDoughnutChart = function() {
      for (var i = 0; i < $scope.components_server.length; i++) {
        $scope.doughnutlabels.push($scope.components_server[i].label);
        $scope.doughnutdata.push(Math.floor((Math.random() * 100) + 1));
      }
    }

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


}]);
