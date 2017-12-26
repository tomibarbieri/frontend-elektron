angular.module('theme.demos.history', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'chart.js',
    'theme.core.services'
  ])
  .controller('HistoryController', ['$scope', '$timeout', '$window', '$http', '$filter', 'Notifier', function($scope, $timeout, $window, $http, $filter, Notifier) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.chart;
    $scope.datos_medidos = 22;
    $scope.total_datos = 322;
    $scope.currentData = [];
    $scope.currentDataIndex = 0;
    $scope.previousPageDisable = false;
    $scope.nextPageDisable = false;
    //$scope.current_component;
    $scope.current_period;

    $scope.costo_estimado = 1245;

    $scope.date_config = {
      'dateFrom': new Date(),
      'dateTo': new Date(),
      'timeFrom': new Date(),
      'timeTo': new Date()
    }

    $scope.components = [{
      'id': 0,
      'label': 'Todos'
    }];
    $scope.selectedComponent = {
      'label': "Todos",
      'id': 0
    };

    $scope.loadComponents = function() {
      console.log("Loading components...");
      Notifier.simpleInfo('Cargando componentes','Cargando desde el servidor');
      $http({
          method:'GET',
          url: url_server + '/devices/'
      }).then(function(response){
          //console.log(response.data.devices);
          $scope.components_server = response.data.devices;
          //$scope.current_component = $scope.components_server[0];
          $scope.components.push.apply($scope.components, $scope.components_server);
          //$scope.components.concat(response.data.devices);
          //console.log($scope.components);
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Error al traer los componentes", "Problemas de conexion");
      });
    };

    $scope.loadComponents();

    $scope.showComponentsFunction = function() {
      var selected = $filter('filter')($scope.components, {id: $scope.selectedComponent.id});
      //console.log(selected);
      return ($scope.selectedComponent.label && selected.length) ? selected[0].label : 'Not set';
    };

    // guarda la variable del chart para luego hacer update
    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });

    // Busca los datos de una fecha determinada
    $scope.loadDay = function(day_p) {

      //$scope.showDynamic();


      var day = $filter('date')(day_p._d, "dd/MM/yyyy")
      Notifier.simpleInfo('Cargando datos para dia', day);
      console.log(day);

      $http({
          method:'GET',
          url: url_server + '/data/' + day + '/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          //Notifier.simpleSuccess('Datos cargados con exito','Se han traido ' + response.data.data.length + ' datos.')

          //console.log(response.data.data);
          //console.log(response.data);
          $scope.currentData = response.data.data;
          Notifier.simpleSuccess('Datos cargados con éxito', 'Los datos (' + response.data.data + ') fueron obtenidos con éxito y se estan ubicando en el gráfico');
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Error al traer los datos", "Problemas de conexion");
      });
    }

    // Busca los datos entre dos fechas
    $scope.loadDayToDay = function(day_from, day_to) {

      var dayf = $filter('date')(day_from._d, "dd/MM/yyyy")
      var dayt = $filter('date')(day_to._d, "dd/MM/yyyy")

      Notifier.simpleInfo('Cargando datos entre los dias', dayf + ' y ' + dayt);

      $http({
          method:'GET',
          url: url_server + '/data/' + dayf + '/' + dayt + '/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          //Notifier.simpleSuccess('Datos cargados con exito','Se han traido ' + response.data.data.length + ' datos.')
          //console.log(response.data.data);
          //console.log(response.data);
          $scope.currentData = response.data.data;
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("Problemas de conexion", "No se pudo estableces la conexion con el servidor");
          Notifier.simpleError("Error al traer los datos", "Problemas de conexion");
      });
    }

    // funcion generica para traer data
    $scope.loadAllData = function(dateFrom, timeFrom, dateTo, timeTo) {
      console.log("Loading data from all components...");

      var capelequeque = '';
      if (dateFrom) {
        capelequeque += $filter('date')(dateFrom, "dd/MM/yyyy") + '/';
        if (timeFrom) {
            capelequeque += $filter('date')(timeFrom, "HH") + '/';
        if (dateTo) {
            capelequeque += $filter('date')(dateTo, "dd/MM/yyyy") + '/';
            if (timeTo) {
              capelequeque += $filter('date')(timeTo, "HH") + '/';
            }
          }
        }
      }

      console.log(capelequeque);

      var final_url = url_server + '/data/' + capelequeque;

      $http({
          method:'GET',
          url: final_url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          //console.log(response.data.data);
          //console.log(response.data);
          $scope.currentData = response.data.data;
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("problemas de conexion");
      });
    }

    // Funcion generica para traer la data de un componente determinado
    $scope.loadOneData = function(componentId, dateFrom, timeFrom, dateTo, timeTo) {
      console.log("Loading data from one component");

      // armado de la ruta
      var capelequeque = '';

      if (dateFrom) {
        capelequeque += $filter('date')(dateFrom, "dd/MM/yyyy") + '/';
        if (timeFrom) {
            capelequeque += $filter('date')(timeFrom, "HH") + '/';
        if (dateTo) {
            capelequeque += $filter('date')(dateTo, "dd/MM/yyyy") + '/';
            if (timeTo) {
              capelequeque += $filter('date')(timeTo, "HH") + '/';
            }
          }
        }
      }

      console.log(capelequeque);

      var final_url = url_server + '/devices/' + componentId + '/data/' + capelequeque;

      $http({
          method:'GET',
          url: final_url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          console.log(response.data.data);
          //console.log(response.data);
          $scope.currentData = response.data.data;
          if (response.data.data > 0) {
            $scope.graficate(response.data.data);
          } else {
            Notifier.simpleError('No hay datos','No hay datos para el componente seleccionado. ');
          }

      }, function(response){
          console.log("problemas de conexion");
      });
    }

    // funcion luego de elegir los campos del form de estadisticas
    $scope.updateChart = function(date_config) {
      var selected = $filter('filter')($scope.components, {id: date_config.component});
      $scope.selectedComponent = ($scope.selectedComponent.label && selected.length) ? selected[0] : 'Not set';
      console.log($scope.selectedComponent);
      console.log(date_config);
      if (date_config.component == 0) {
        $scope.loadAllData(date_config.dateFrom, date_config.timeFrom, date_config.dateTo, date_config.timeTo);
      } else {
        $scope.loadOneData(date_config.component, date_config.dateFrom, date_config.timeFrom, date_config.dateTo, date_config.timeTo);
      }

    }

    // funcion final que le llega la data para graficar
    $scope.graficate = function(data,not_new) {



      //$scope.simpleSuccess('Datos cargados!', 'Los datos fueron obtenidos con éxito y se estan cargando en el gráfico');

      if (not_new === undefined) {
        $scope.currentDataIndex = 0;
      }


      //$scope.currentData = data;
      console.log($scope.currentDataIndex);
      $scope.previousPageDisable = $scope.currentDataIndex == 0 ? true : false;
      $scope.nextPageDisable = ($scope.currentDataIndex + 20 >= $scope.currentData.length) ? true : false;
      $scope.line = {};

      $scope.line.series = ['Potencia'];

      $scope.line.labels = [];
      $scope.line.data = [[]];

      var data_sense = data;
      console.log(data_sense);
      // REVISAR LA ITERACION PARA MOSTAR BIEN EL PAGINADO
      for (var i = 19; i >= 0; i--) {
        var hora = $filter('date')(data_sense[i].date, "HH:mm");
        var dia = $filter('date')(data_sense[i].date, 'dd');
        var mes = $filter('date')(data_sense[i].date, 'MM');

        var data_2 = data_sense[i].data_value;

        var label = '(' + dia + '/' + mes + ') ' + hora;
        $scope.line.labels.push(label);
        $scope.line.data[0].push(data_2);
      }
      if ($scope.chart) {
          console.log("Grafico actualizado");
          $scope.chart.update();
      }

      //$scope.updateBoxes(data);

    }

    // funcion para avanzar a la siguiente pagina
    $scope.nextPage = function() {

      console.log("Next page ..."); // {{(currentData.length <= 20 && currentDataIndex >= currentData.length) ? true : false }}
      console.log($scope.currentData);
      console.log($scope.currentDataIndex);
      console.log($scope.currentData.length);
      if ($scope.currentDataIndex + 20 <= $scope.currentData.length - 20) {
        $scope.currentDataIndex = $scope.currentDataIndex + 20;
      } else {
        $scope.currentDataIndex = $scope.currentData.length - 20;
      }
      console.log($scope.currentDataIndex);

      var copy_array = $scope.currentData.slice();
      console.log(copy_array);
      console.log($scope.currentData);
      var data = copy_array.slice($scope.currentDataIndex, $scope.currentDataIndex + 20);
      console.log(data);
      $scope.graficate(data,true);

    }

    // funcion para ir a la pagina anterior
    $scope.previousPage = function() {

      console.log("Previous page ..."); // {{currentDataIndex == 0 ? true : false}}
      console.log($scope.currentData);
      console.log($scope.currentDataIndex);
      console.log($scope.currentData.length);
      (($scope.currentDataIndex <= 20) ? $scope.currentDataIndex = 0 : $scope.currentDataIndex -= 20);
      console.log($scope.currentDataIndex);

      var copy_array = $scope.currentData.slice();
      console.log(copy_array);
      console.log($scope.currentData);
      var data = copy_array.slice($scope.currentDataIndex, $scope.currentDataIndex + 20);
      console.log(data);
      $scope.graficate(data,true);

    }

    // funcion para actualizar los boxes en cada pagina
    $scope.updateBoxes = function(data) {
      console.log(data);
      $scope.datos_medidos = data.length;
      var total = 0;
      data.forEach(function(element) {
          total += parseInt(element.data_value);
      });
      $scope.total_datos = total;
      console.log(total);

    }

    $scope.loadDayToDay(moment().subtract(7, 'days'), moment());

    $scope.periods = [
      {id: '1', name: 'Hoy', function: $scope.loadDay, date: moment() },
      {id: '2', name: 'Ayer', function: $scope.loadDay, date: moment().subtract(1, 'days') },
      {id: '3', name: 'Últimos 7 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(7, 'days') },
      {id: '4', name: 'Últimos 14 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(14, 'days')},
      {id: '5', name: 'Último mes', function: $scope.loadDayToDay, date: moment().subtract(1, 'month'), dateTo: moment().subtract(2, 'month')},
      {id: '6', name: 'Este mes', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(1, 'month')},
    ]

    $scope.current_period = $scope.periods[3];

    // funcion para el select
    $scope.changeCurrentPeriod = function(ids) {
      console.log(ids);
      var selected = $filter('filter')($scope.periods, {id: ids})[0];
      console.log(selected);
      $scope.current_period = selected;
    };


    // COSAS VIEJAS _ BORRAR
 /*
    $scope.epDiskSpace = {
      animate: {
        duration: 0,
        enabled: false
      },
      barColor: '#e6da5c',
      trackColor: '#ebedf0',
      scaleColor: false,
      lineWidth: 5,
      size: 100,
      lineCap: 'circle'
    };

    $scope.epBandwidth = {
      animate: {
        duration: 0,
        enabled: false
      },
      barColor: '#d95762',
      trackColor: '#ebedf0',
      scaleColor: false,
      lineWidth: 5,
      size: 100,
      lineCap: 'circle'
    };
*/

  }]);
