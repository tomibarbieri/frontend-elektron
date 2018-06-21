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
    $scope.spinner = false;
    $scope.current_period;
    $scope.configuration = {};
    $scope.selectedperiod = false;
    $scope.selectedComponent = {};
    $scope.components = [];
    $scope.historyerror = false;
    $scope.historynodataerror = false;
    $scope.historyerrornocomponents = false;

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

    // Variables para el paginado
    $scope.selectpagebutton = true;
    $scope.nextbutton = true;
    $scope.indexbutton = true;
    $scope.previousbutton = true;
    $scope.lastbutton = true;
    $scope.inLastPage = false;
    $scope.inFirstPage = true;

    $scope.calculatePages = function () {
      $scope.number_pages = [];
      $scope.current_page = 1;
      for (var i = 1; i <= $scope.pagesdata.pages; i++) {
        $scope.number_pages.push(i);
      }
      if ($scope.number_pages.length <= 1) {
        $scope.previousbutton = true;
        $scope.lastbutton = true;
      }
      else {
        $scope.previousbutton = false;
        $scope.lastbutton = false;
        $scope.selectpagebutton = false;
      }
    }

    // FUNCIONES

    // carga los componentes del server
    $scope.loadComponents = function() {
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
          else {
            $scope.historyerrornocomponents = true;
            $scope.historyerrormessage = "No hay componentes en el sistema";
          }
      }, function(response){
        $scope.historyerrornocomponents = true;
        $scope.historyerrormessage = "Error de conexion en el servidor";
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

      // Proceso la fecha y hora hasta
      var month = $filter('date')(new Date($scope.configuration.dateTo), 'MM');
      var day = $filter('date')(new Date($scope.configuration.dateTo), 'dd');
      var year = $filter('date')(new Date($scope.configuration.dateTo), 'yyyy');
      var hourto = $scope.configuration.timeTo.substring(0,$scope.configuration.timeTo.indexOf(':'));
      if (hourto.length < 2) {
        hourto = '0' + hourto;
      }

      var dateT = day + "/" + month + "/" + year + '/' + hourto;

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
            $scope.data_sum_period = response.data.data_sum_period;
            $scope.calculatePages();
            $scope.graficate();
            Notifier.simpleSuccess("Datos del período seleccionado", "Cargados con éxito");
          }
          else {
            Notifier.simpleError("No hay datos para el periodo seleccionado", "Problemas de conexion");
            $scope.errormessage = "No hay datos para ese periodo";
            $scope.historynodataerror = true;
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
      $scope.line.series = ['Potencia en Watts'];
      $scope.line.labels = [];
      $scope.line.data = [[]];

      var data_sense = $scope.data;
      console.log(data_sense);

      for (var i = 0; i < data_sense.length; i++) {
        console.log($filter('date')(data_sense[i].date, 'dd-M-yyyy H:mm Z', 'UTC'));
        var hora = $filter('date')(data_sense[i].date, "HH:mm", 'UTC');
        var dia = $filter('date')(data_sense[i].date, 'dd', 'UTC');
        var mes = $filter('date')(data_sense[i].date, 'MM', 'UTC');

        var data_2 = data_sense[i].data_value;

        if ($scope.configuration.precision.id == 'perhour') {
          var label = '(' + dia + '/' + mes + ') ' + hora;
        } else {
          var label = dia + '/' + mes;
        }

        $scope.line.labels.push(label);
        $scope.line.data[0].push(data_2);
      }
    }

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
        $scope.historynodataerror = false;
        $scope.historyerror = false;
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

    $scope.loadComponents();

  }]);
