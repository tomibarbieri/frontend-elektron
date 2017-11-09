angular.module('theme.demos.statistics', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'chart.js'
  ])
  .controller('StatisticsController', ['$scope', '$timeout', '$window', '$http', '$filter', function($scope, $timeout, $window, $http, $filter) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.chart;
    $scope.datos_medidos = 22;
    $scope.total_datos = 322;

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });

    $scope.loadDay = function(day_p) {

      var day = $filter('date')(day_p._d, "dd/MM/yyyy")
      console.log(day);

      $http({
          method:'GET',
          url: url_server + '/data/' + day + '/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          console.log(response.data.data);
          console.log(response.data);
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("problemas de conexion");
      });
    }

    $scope.loadDayToDay = function(day_from, day_to) {

      var dayf = $filter('date')(day_from._d, "dd/MM/yyyy")
      var dayt = $filter('date')(day_to._d, "dd/MM/yyyy")

      $http({
          method:'GET',
          url: url_server + '/data/' + dayt + '/' + dayf + '/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
      }).then(function(response){

          console.log(response.data.data);
          console.log(response.data);
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("problemas de conexion");
      });
    }

    $scope.loadCurrentData = function() {

      var dateFrom = $scope.currendDateFrom;
      var dateTo = $scope.currendDateTo;

      var timeFrom = $scope.currendTimeFrom;
      var timeTo = $scope.currendTimeTo;

      var capelequeque = '';
      if (dateFrom) {
        capelequeque += dateFrom;
        if (timeFrom) {
            capelequeque += timeFrom;
        if (dateTo) {
            capelequeque += dateTo;
            if (timeTo) {
              capelequeque += timeTo;
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

          console.log(response.data.data);
          console.log(response.data);
          $scope.graficate(response.data.data);

      }, function(response){
          console.log("problemas de conexion");
      });
    }

    $scope.graficate = function(data) {

      console.log(data);
      $scope.line = {};

      $scope.line.series = ['Potencia'];

      $scope.line.labels = [];
      $scope.line.data = [[]];

      for (var i = 0; i < 20; i++) {
        var date = $filter('date')(data[i].date, "dd/MM/yyyy");
        var data_value = data[i].data_value;
        console.log(data_value);
        $scope.line.labels.push(date);
        $scope.line.data[0].push(data_value);
      }
      if ($scope.chart) {
          $scope.chart.update();
      }

      $scope.updateBoxes(data);

    }

    $scope.updateBoxes = function(data) {
      $scope.datos_medidos = data.length;
      var total = 0;
      data.forEach(function(element) {
          total += element.data_value;
      });
      $scope.total_datos = total;

    }


    $scope.select_data = {
    model: null,
    availableOptions: [
      {id: '1', name: 'Hoy', function: $scope.loadDay, date: moment() },
      {id: '2', name: 'Ayer', function: $scope.loadDay, date: moment().subtract(1, 'days') },
      {id: '3', name: 'Últimos 7 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(7, 'days') },
      {id: '4', name: 'Últimos 14 días', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(14, 'days')},
      {id: '5', name: 'Último mes', function: $scope.loadDayToDay, date: moment().subtract(1, 'month'), dateTo: moment().subtract(2, 'month')},
      {id: '6', name: 'Este mes', function: $scope.loadDayToDay, date: moment(), dateTo: moment().subtract(1, 'month')},
    ],
    selectedOption: {id: '1', name: 'Hoy', function: $scope.loadDay, date: moment()}
   };



   $scope.executeSelect = function() {
     console.log("daleguachoooo");
     if (!$scope.select_data.selectedOption.dateTo) {
       $scope.select_data.selectedOption.function($scope.select_data.selectedOption.date);
     } else {
       $scope.select_data.selectedOption.function($scope.select_data.selectedOption.date, $scope.select_data.selectedOption.dateTo);
     }

   }

   $scope.loadDay(moment());

























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




  }]);
