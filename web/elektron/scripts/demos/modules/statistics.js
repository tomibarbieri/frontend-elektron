angular
  .module('theme.demos.statistics', ['chart.js'])
  .controller('StatisticsController', ['$scope', '$http', '$filter', 'Notifier', '$window', function($scope, $http, $filter, Notifier, $window) {
    'use strict';

    console.log("Statistics");

    var url_server = 'http://158.69.223.78:8000';

    $scope.doughnut;
    $scope.bar;
    $scope.loadingbar = false;
    $scope.spinnerbar = false;
    $scope.spinnerdoughnout = false;
    $scope.spinnerstatistics = false;
    $scope.statisticserror = false;
    $scope.barerror = false;

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
    }];

    $scope.currentPrecision = {
      'id': 0,
      'label': 'Por día',
      'url': 'perday'
    };

    $scope.reloadpage = function () {
      $window.location.reload();
    }

    $scope.spinnerbar = true;
    $scope.spinnerdoughnout = true;
    $scope.spinnerstatistics = true;

    $http({
        method:'GET',
        url: url_server + '/devices/statistics'
    }).then(function(response){
        console.log(response.data);

        Notifier.simpleSuccess('Componentes cargados con exito','Desde el servidor con los datos.')
        $scope.components_statistics = response.data.devices;
        console.log($scope.components_statistics);
        $scope.spinnerstatistics = false;
        $scope.$apply();

        $scope.createDoughnutChart();

    }, function(response){
        $scope.statisticserror = true;
        $scope.spinnerstatistics = false;
        $scope.spinnerdoughnout = false;
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la información de los componentes del servidor");
    });


    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        $scope.createBarChart();
    }, function(response){
        $scope.spinnerbar = false;
        $scope.barerror = true;
        console.log("problemas de conexion");
    });

    $scope.changeCriteria = function(id_selected) {
      $scope.loadingbar = true;
      var selected = $filter('filter')($scope.barPrecision, {id: id_selected});
      var selectedPrecision = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';
      $scope.currentPrecision = selectedPrecision;
      $scope.barlabels = [];
      $scope.getComponentData('left',$scope.currentBarLeft);
      $scope.getComponentData('right',$scope.currentBarRigth);
    }

    $scope.changeLeftBarComponent = function(id) {
      $scope.loadingbar = true;
      console.log(id);
      $scope.changeBarComponent(id,'left');
    }

    $scope.changeRigthBarComponent = function(id) {
      $scope.loadingbar = true;
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
          Notifier.simpleSuccess('Tabla comparativa','Datos cargados con exito para el componente');
          $scope.graficateComponentBar(response.data.data, side);
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Tabla comparativa - Error","No se pudo traer la informacion del componente por problemas de conexión");
          $scope.spinnerbar = false;
          $scope.barerror = true;
          $scope.loadingbar = false;
      });
    }

    $scope.graficateComponentBar = function(data, side) {

      $scope.spinnerbar = false;
      $scope.loadingbar = false;

      var length = (data.length >= 6) ? 6 : data.length;

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
          if (data[i].data_value == null) {
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
      $scope.getComponentData('left',$scope.currentBarLeft);
      $scope.getComponentData('rigth',$scope.currentBarRigth);
    }

    $scope.createDoughnutChart = function() {
      for (var i = 0; i < $scope.components_statistics.length; i++) {
        var percent = ($scope.components_statistics[i].device_percent) ? $filter('number')($scope.components_statistics[i].device_percent, 2) : 0;
        var label = $scope.components_statistics[i].device.label + ' (' + percent + '%)';
        $scope.doughnutlabels.push(label);
        $scope.doughnutdata.push(percent);
      }
      $scope.spinnerdoughnout = false;
    }
}]);
