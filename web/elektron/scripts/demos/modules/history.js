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
    $scope.spinner = false;
    $scope.current_period;
    $scope.configuration = {};
    $scope.selectedperiod = false;
    $scope.selectedComponent = {};
    $scope.components = [];
    $scope.historyerror = false;

    $scope.costo_estimado = 1245;

    $scope.date_config = {
      'dateFrom': new Date(),
      'dateTo': new Date(),
      'timeFrom': new Date(),
      'timeTo': new Date()
    }

    $scope.precisions = [{
        'label':'Por hora',
        'id':'perhour'
      },{
        'label':'Por dia',
        'id':'perday'
      }];

    /*$scope.selectedPrecision = {
      'label':'Por hora',
      'id':'perday'
    }*/


    $scope.reloadpage = function () {
      $window.location.reload();
    }

    $scope.updateCurrentComponent = function (component) {
      $scope.selectedComponent = component;
      $scope.configuration['component'] = component;
    }

    $scope.updateCurrentPrecision = function (precision) {
      $scope.selectedPrecision = precision;
      $scope.configuration['precision'] = precision;
    }

    // para armar el select de componentes
    $scope.showComponentsFunction = function() {
      var selected = $filter('filter')($scope.components, {id: $scope.selectedComponent.id});
      return ($scope.selectedComponent.label && selected.length) ? selected[0].label : 'Not set';
    };

    // carga las precisiones
    $scope.showPrecisions = function () {
      var selected = $filter('filter')($scope.precisions, {id: $scope.selectedPrecision.id});
      return ($scope.selectedPrecision.label && selected.length) ? selected[0].label : 'Not set';
    }

    // guarda la variable del chart para luego hacer update
    /*
    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });*/

    // Variables para el paginado
    $scope.nextbutton = true;
    $scope.indexbutton = true;
    $scope.previousbutton = false;
    $scope.lastbutton = false;
    $scope.inLastPage = false;
    $scope.inFirstPage = true;

    $scope.calculatePages = function () {
      $scope.number_pages = [];
      $scope.current_page = 1;
      for (var i = 1; i <= $scope.pagesdata.pages; i++) {
        $scope.number_pages.push(i);
      }
    }

    // FUNCIONES

    // carga los componentes del server
    $scope.loadComponents = function() {
      console.log("Loading components...");
      $http({
          method:'GET',
          url: url_server + '/devices/'
      }).then(function(response){
          console.log(response.data.devices);
          if (response.data.devices.length > 0) {
            $scope.components_server = response.data.devices;
            //$scope.selectedComponent = $scope.components_server[0];
            $scope.components.push.apply($scope.components, $scope.components_server);
            console.log($scope.components);
          }
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Error al traer los componentes", "Problemas de conexion");
      });
    };


    // para cargar la URL inicial
    $scope.loadUrl = function () {
      // armando la url

      // Proceso la fecha y hora desde
      var month = $filter('date')(new Date($scope.configuration.dateFrom), 'MM');
      var day = $filter('date')(new Date($scope.configuration.dateFrom), 'dd');
      var year = $filter('date')(new Date($scope.configuration.dateFrom), 'yyyy');
      var hourfrom = $scope.configuration.timeFrom.substring(0,$scope.configuration.timeFrom.indexOf(':'));
      if (hourfrom.length < 2) {
        hourfrom = '0' + hourfrom;
      }

      var dateF = day + "/" + month + "/" + year + '/' + hourfrom;
      $scope.configuration.dateFrom = $filter('date')(new Date($scope.configuration.dateFrom), 'dd/MM/yyyy');

      // Proceso la fecha y hora hasta
      var month = $filter('date')(new Date($scope.configuration.dateTo), 'MM');
      var day = $filter('date')(new Date($scope.configuration.dateTo), 'dd');
      var year = $filter('date')(new Date($scope.configuration.dateTo), 'yyyy');
      var hourto = $scope.configuration.timeTo.substring(0,$scope.configuration.timeTo.indexOf(':'));
      if (hourto.length < 2) {
        hourto = '0' + hourto;
      }

      var dateT = day + "/" + month + "/" + year + '/' + hourto;
      $scope.configuration.dateTo = $filter('date')(new Date($scope.configuration.dateTo), 'dd/MM/yyyy');

      if ($scope.configuration.precision.id == 'normal') {
        var precision = '';
      }
      else {
        var precision = $scope.configuration.precision.id + '/';
      }

      $scope.offset = '1/20/1/';

      $scope.url = url_server + '/devices/' + $scope.configuration.component.id + '/data/' + dateF + '/' + dateT + '/' + precision;
      console.log($scope.url);
    }

    // una vez que esta la url inicial se carga la data
    $scope.loadData = function() {
      $http({
          method:'GET',
          url: $scope.url + $scope.offset,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response);
          $scope.data = response.data.data;
          $scope.pagesdata = response.data;
          $scope.total_watts = response.data.data_sum_period;

          if ($scope.data.length > 0) {
            $scope.total_data = response.data.total_data;
            $scope.calculatePages();
            $scope.graficate();
            Notifier.simpleSuccess("Datos del período seleccionado", "Cargados con éxito");
          }
          else {
            Notifier.simpleError("No hay datos para el periodo seleccionado", "Problemas de conexion");
            $scope.errormessage = "No hay datos para ese periodo";
            $scope.historyerror = true;
            $scope.spinner = false;
          }
      }, function(response){
          $scope.errormessage = "Error de conexion en el servidor";
          $scope.historyerror = true;
          $scope.spinner = false;
          console.log("problemas");
          Notifier.simpleError("Error al traer los datos del periodo", "Problemas de conexion");
          //show an appropriate message
      });
    }


    // cuando cambiamos la pagina con los botones
    $scope.loadPage = function (page_id) {
        Notifier.simpleInfo("Buscando los datos de la pagina", "Conectando con el servidor");
        console.log(page_id);
        console.log(typeof page_id);
        // procesa la ultima pagina
        console.log($scope.pagesdata);
        $scope.spinner = true;
        if (page_id == 'last') {
          if ($scope.current_page != $scope.pagesdata.pages) {
            var offset = '' + (($scope.pagesdata.pages -1) * 20 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
            console.log(offset);
            $scope.loadDataPage(offset,true,false,$scope.pagesdata.pages);
          }
        }
        // procesa la primer pagina
        else if (page_id == 1) {
          if ($scope.current_page != 1) {
            var offset = '1/20/1/';
            console.log(offset);
            $scope.loadDataPage(offset,false,true,page_id);
          }
        }
        // procesa todos los demas casos
        else {
          var offset = '';
          // para el caso que la pagina sea la final
          if (page_id == $scope.pagesdata.pages) {
            console.log('ultima pagina');
            offset = '' + (($scope.pagesdata.pages -1) * 20 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
            console.log(offset);
            $scope.loadDataPage(offset,true,false,page_id);
          }
          // para el resto de los casos
          else {
            offset = '' + ((page_id -1) * 20 + 1) + '/' + (page_id * 20) + '/1/';
            console.log(offset);
            $scope.loadDataPage(offset,false,false,page_id);
          }
        }
    }

    // cargamos nuevamente los datos de la nueva pagina
    $scope.loadDataPage = function(offset,previousbutton,nextbutton,page_id) {
        $http({
            method:'GET',
            url: $scope.url + offset,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }).then(function(response){
            console.log(response);
            $scope.data = response.data.data;
            if ($scope.data.length > 0) {

              Notifier.simpleSuccess("Datos cargados para la pagina", "Se cargó la siguiente pagina");

              $scope.graficate();
              $scope.previousbutton = previousbutton;
              $scope.lastbutton = previousbutton;
              $scope.nextbutton = nextbutton;
              $scope.indexbutton = nextbutton;
              $scope.current_page = page_id;

            }
            else {
              Notifier.simpleError("No hay datos para esa pagina", "Hubo un error al seleccionar la pagina");
              $scope.spinner = false;
              $scope.errormessage = "No hay datos para esa pagina seleccionada";
              $scope.historyerror = true;
            }
        }, function(response){
            console.log("problemas");
            $scope.errormessage = "Error de conexion en el servidor";
            $scope.historyerror = true;
            $scope.spinner = false;
            Notifier.simpleError("Error al traer los datos de esa pagina", "Problemas de conexion");
        });
    }

    // funcion final que le llega la data para graficar
    $scope.graficate = function() {
      console.log("updating chart");

      $scope.spinner = false;

      $scope.line = {};
      $scope.line.series = ['Potencia'];
      $scope.line.labels = [];
      $scope.line.data = [[]];

      var data_sense = $scope.data;
      console.log(data_sense);

      for (var i = data_sense.length - 1; i >= 0; i--) {
        var hora = $filter('date')(data_sense[i].date, "HH:mm");
        var dia = $filter('date')(data_sense[i].date, 'dd');
        var mes = $filter('date')(data_sense[i].date, 'MM');

        var data_2 = data_sense[i].data_value;

        var label = '(' + dia + '/' + mes + ') ' + hora;
        $scope.line.labels.push(label);
        $scope.line.data[0].push(data_2);
      }
    }

    // Funcione viejas pero que pueden servir

    /*
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
    console.log(response.data);
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

    */

    // INICIO

    // funcion luego de elegir los campos del form de history
    $scope.updateChart = function (){


      console.log('updateChart');
      console.log($scope.configuration);

      var validate = (($scope.configuration != undefined)
                   && ($scope.configuration.component != undefined)
                   && ($scope.configuration.dateTo != undefined)
                   && ($scope.configuration.dateFrom != undefined)
                   && ($scope.configuration.timeTo != undefined)
                   && ($scope.configuration.timeFrom != undefined)
                   && ($scope.configuration.precision != undefined)
                 );

      if (validate) {
        Notifier.simpleInfo('Cargando datos para el pedido seleccionado','Esperando respuesta del servidor');
        $scope.loadUrl();
        $scope.loadData();
        $scope.selectedperiod = true;
        $scope.spinner = true;
      }
      else {
        // aclarar en el form cuales son
        // armar string aca
        Notifier.simpleError("Faltan ingresar campos del formulario", "Problemas de conexion");
      }
    }


    /*$scope.updateChart = function(date_config) {
      var selected = $filter('filter')($scope.components, {id: date_config.component});
      $scope.selectedComponent = ($scope.selectedComponent.label && selected.length) ? selected[0] : 'Not set';
      console.log($scope.selectedComponent);
      console.log(date_config);
      if (date_config.component == 0) {
        $scope.loadAllData(date_config.dateFrom, date_config.timeFrom, date_config.dateTo, date_config.timeTo);
      } else {
        $scope.loadOneData(date_config.component, date_config.dateFrom, date_config.timeFrom, date_config.dateTo, date_config.timeTo);
      }

    }*/

    // funcion para el select
    /*$scope.changeCurrentPeriod = function(ids) {
      console.log(ids);
      var selected = $filter('filter')($scope.periods, {id: ids})[0];
      console.log(selected);
      $scope.current_period = selected;
    };

    */


    // periodos predeterminados para seleccionar - revisar
    $scope.periods = [
      {id: '1', name: 'Hoy', function: $scope.loadDay, date: moment() },
      {id: '2', name: 'Ayer', function: $scope.loadDay, date: moment().subtract(1, 'days') },
      {id: '3', name: 'Últimos 7 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(7, 'days') },
      {id: '4', name: 'Últimos 14 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(14, 'days')},
      {id: '5', name: 'Último mes', function: $scope.loadDayToDay, date: moment().subtract(1, 'month'), dateTo: moment().subtract(2, 'month')},
      {id: '6', name: 'Este mes', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(1, 'month')},
    ]

    // MAIN PROGRAM
    $scope.current_period = $scope.periods[3];
    $scope.loadComponents();


  }]);
