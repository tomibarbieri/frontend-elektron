angular
  .module('theme.demos.statistics', ['chart.js'])
  .controller('StatisticsController', ['$scope', '$http', '$filter', 'Notifier', '$timeout', '$window', function($scope, $http, $filter, Notifier, $timeout, $window) {
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

    $scope.previousbutton = false;
    $scope.lastbutton = false;
    $scope.nextbutton = true;
    $scope.indexbutton = true;

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
        $scope.createDoughnutChart();

        $timeout( function(){
            $scope.$apply();
        }, 1000 );

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

    $scope.calculatePages = function () {

      if ($scope.number_pages == undefined) {$scope.number_pages = []};
      $scope.current_page = 1;
      if ($scope.pagesdata.pages > $scope.number_pages.length) {
        $scope.number_pages = [];
        for (var i = 1; i <= $scope.pagesdata.pages; i++) {
          $scope.number_pages.push(i);
        }
      }
      if ($scope.number_pages.length <= 1) {
        $scope.previousbutton = true;
        $scope.lastbutton = true;
      }
    }

    $scope.changeCriteria = function(precision) {
      $scope.currentPrecision = precision;
      //$scope.loadingbar = true;
      //var selected = $filter('filter')($scope.barPrecision, {id: id_selected});
      //$scope.currentPrecision = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';
      //$scope.currentPrecision = selectedPrecision;
      //$scope.barlabels = [];
      //$scope.getComponentData('left',$scope.currentBarLeft);
      //$scope.getComponentData('right',$scope.currentBarRigth);
    }

    $scope.changeLeftBarComponent = function(component) {
      $scope.currentBarLeft = component;
      //var selected = $filter('filter')($scope.components_server, {id: id_selected});
      //$scope.currentBarLeft = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';
    }

    $scope.changeRigthBarComponent = function(component) {
      $scope.currentBarRigth = component;
      //var selected = $filter('filter')($scope.components_server, {id: id_selected});
      //$scope.currentBarRigth = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';
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

    $scope.getComponentData = function(side, component, offset) {

      var c = component;

      var offset = '/1/5/1/';

      var month_to = $filter('date')(new Date(), 'MM');
      var day_to = $filter('date')(new Date(), 'dd');
      var year_to = $filter('date')(new Date(), 'yyyy');
      var hour_to = $filter('date')(new Date(), 'hh');

      var date_to = '' + day_to + '/' + month_to + '/' + year_to + '/' + hour_to + '/';

      var month_from = $filter('date')(new Date(c.created), 'MM');
      var day_from = $filter('date')(new Date(c.created), 'dd');
      var year_from = $filter('date')(new Date(c.created), 'yyyy');
      var hour_from = $filter('date')(new Date(c.created), 'hh');

      var date_from = '' + day_from + '/' + month_from + '/' + year_from + '/' + hour_from + '/';

      $http({
          method:'GET',
          url: url_server + '/devices/' + c.id + '/data/' + date_from + date_to + $scope.currentPrecision.url + offset // modificar la URL /devices/id/data/perhour
      }).then(function(response){
          console.log(response.data.data);
          $scope.pagesdata = response.data;
          //Notifier.simpleSuccess('Tabla comparativa','Datos cargados con exito para el componente');
          $scope.graficateComponentBar(response.data.data, side);
          $scope.calculatePages();

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
        for (var i = length-1; i >= 0; i--) {
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
        for (var i = length-1; i >= 0; i--) {
          if (data[i].data_value == null) {
            $scope.bardata[0].push(0);
          } else {
            $scope.bardata[0].push(data[i].data_value);
          }
        }
      } else {
        console.log('derecha');
        $scope.bardata[1] = [];

        for (var i = length-1; i >= 0; i--) {
          if (data[i].data_value == null) {
            $scope.bardata[1].push(0);
          } else {
            $scope.bardata[1].push(data[i].data_value);
          }
        }
      }

    }

    $scope.loadPage = function (page_id) {
      $scope.loadingbar = true;
      console.log(page_id);
      // procesa la ultima pagina
      if (page_id == 'last') {
        if ($scope.current_page != $scope.pagesdata.pages) {
          var offset = '' + (($scope.pagesdata.pages -1) * 5 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
          console.log(offset);
          $scope.loadDataPage('left',$scope.currentBarLeft,offset,true,false,$scope.pagesdata.pages);
          $scope.loadDataPage('right',$scope.currentBarRigth,offset,true,false,$scope.pagesdata.pages);
        }
      }
      // procesa la primer pagina
      else if (page_id == 1) {
        if ($scope.current_page != 1) {
          var offset = '1/5/1/';
          console.log(offset);
          $scope.loadDataPage('left',$scope.currentBarLeft,offset,false,true,page_id);
          $scope.loadDataPage('right',$scope.currentBarRigth,offset,false,true,page_id);
        }
      }
      // procesa todos los demas casos
      else {
        var offset = '';
        // para el caso que la pagina sea la final
        if (page_id == $scope.pagesdata.pages) {
          console.log('ultima pagina');
          offset = '' + (($scope.pagesdata.pages -1) * 5 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
          console.log(offset);
          $scope.loadDataPage('left',$scope.currentBarLeft,offset,true,false,page_id);
          $scope.loadDataPage('right',$scope.currentBarRigth,offset,true,false,page_id);
        }
        // para el resto de los casos
        else {
          offset = '' + ((page_id -1) * 5 + 1) + '/' + (page_id * 5) + '/1/';
          console.log(offset);
          $scope.loadDataPage('left',$scope.currentBarLeft,offset,false,false,page_id);
          $scope.loadDataPage('right',$scope.currentBarRigth,offset,false,false,page_id);
        }
      }
    }



    $scope.loadDataPage = function(side,component,offset,previousbutton,nextbutton,page_id) {

      console.log('loadDataPage');

      var month_to = $filter('date')(new Date(), 'MM');
      var day_to = $filter('date')(new Date(), 'dd');
      var year_to = $filter('date')(new Date(), 'yyyy');
      var hour_to = $filter('date')(new Date(), 'hh');

      var date_to = '' + day_to + '/' + month_to + '/' + year_to + '/' + hour_to + '/';

      var month_from = $filter('date')(new Date(component.created), 'MM');
      var day_from = $filter('date')(new Date(component.created), 'dd');
      var year_from = $filter('date')(new Date(component.created), 'yyyy');
      var hour_from = $filter('date')(new Date(component.created), 'hh');

      var date_from = '' + day_from + '/' + month_from + '/' + year_from + '/' + hour_from + '/';

      var url_ = url_server + '/devices/' + component.id + '/data/' + date_from + date_to + $scope.currentPrecision.url + '/' + offset;

      $http({
          method:'GET',
          url: url_,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response);
          $scope.data = response.data.data;
          if ($scope.data.length > 0) {
            $scope.previousbutton = previousbutton;
            $scope.lastbutton = previousbutton;
            $scope.nextbutton = nextbutton;
            $scope.indexbutton = nextbutton;
            $scope.current_page = page_id;
            $scope.barlabels = [];
            $scope.graficateComponentBar(response.data.data, side);
          }
          else {
            $scope.graficateComponentBar([{'data_value':0},{'data_value':0},{'data_value':0},{'data_value':0},{'data_value':0}], side);
            Notifier.simpleInfo('Tabla comparativa','El componente ' + component.label + ' no tiene datos asignados.');
            console.log("no hay datos para la pagina");
          }
      }, function(response){
          console.log("problemas");
          $scope.showiconloading = false;
          Notifier.simpleError('Tabla comparativa','Error al cargar el componente ' + component.label);
      });
    }

    $scope.changeBarChart = function () {
      Notifier.simpleInfo('Tabla comparativa','Cargando los datos de los componentes elegidos y precision correspondiente');
      $scope.loadingbar = true;
      $scope.pagesdata = 0;
      $scope.getComponentData('left',$scope.currentBarLeft);
      $scope.getComponentData('rigth',$scope.currentBarRigth);
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
        var total = $filter('number')($scope.components_statistics[i].device_data_sum/1000, 1);
        var label = $scope.components_statistics[i].device.label + ' (' + total + 'Kw)';
        $scope.doughnutlabels.push(label);
        $scope.doughnutdata.push(percent);
      }
      $scope.spinnerdoughnout = false;
    }
}]);
