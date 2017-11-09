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

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });

    $http({
        method:'GET',
        url: url_server + '/data/',
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


    $scope.loadToday = function() {

      console.log("load today");

      var day = '05/11/2017/';
      $http({
          method:'GET',
          url: url_server + '/data/' + day,
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
    }


    $scope.data = {
    model: null,
    availableOptions: [
      {id: '1', name: 'Hoy', function: $scope.loadToday },
      {id: '2', name: 'Ayer', function: ''},
      {id: '3', name: 'Últimos 7 días', function: ''},
      {id: '4', name: 'Últimos 14 días', function: ''},
      {id: '5', name: 'Último mes', function: ''},
      {id: '6', name: 'Este mes', function: ''},
    ],
    selectedOption: {id: '3', name: 'Últimos 14 días', function: ''}
   };



   $scope.executeSelect = function() {
     console.log("daleguachoooo");
     $scope.data.selectedOption.function();
   }

























    $scope.loadingChartData = false;
    $scope.refreshAction = function() {
      $scope.loadingChartData = true;
      $timeout(function() {
        $scope.loadingChartData = false;
      }, 2000);
    };

    $scope.percentages = [53, 65, 23, 99];
    $scope.randomizePie = function() {
      $scope.percentages = _.shuffle($scope.percentages);
    };

    $scope.plotStatsData = [{
      data: [
        [1, 1500],
        [2, 2200],
        [3, 1100],
        [4, 1900],
        [5, 1300],
        [6, 1900],
        [7, 900],
        [8, 1500],
        [9, 900],
        [10, 1200],
      ],
      label: 'Consumo'
    }, {
      data: [
        [1, 3100],
        [2, 4400],
        [3, 2300],
        [4, 3800],
        [5, 2600],
        [6, 3800],
        [7, 1700],
        [8, 2900],
        [9, 1900],
        [10, 2200],
      ],
      label: 'Consumo agravado'
    }];

    $scope.plotStatsOptions = {
      series: {
        stack: true,
        lines: {
          // show: true,
          lineWidth: 2,
          fill: 0.1
        },
        splines: {
          show: true,
          tension: 0.3,
          fill: 0.1,
          lineWidth: 3
        },
        points: {
          show: true
        },
        shadowSize: 0
      },
      grid: {
        labelMargin: 10,
        hoverable: true,
        clickable: true,
        borderWidth: 0
      },
      tooltip: true,
      tooltipOpts: {
        defaultTheme: false,
        content: 'Consumo: %y'
      },
      colors: ['#b3bcc7'],
      xaxis: {
        tickColor: 'rgba(0,0,0,0.04)',
        ticks: 10,
        tickDecimals: 0,
        autoscaleMargin: 0,
        font: {
          color: 'rgba(0,0,0,0.4)',
          size: 11
        }
      },
      yaxis: {
        tickColor: 'transparent',
        ticks: 4,
        tickDecimals: 0,
        //tickColor: 'rgba(0,0,0,0.04)',
        font: {
          color: 'rgba(0,0,0,0.4)',
          size: 11
        },
        tickFormatter: function(val) {
          if (val > 999) {
            return (val / 1000) + 'K';
          } else {
            return val;
          }
        }
      },
      legend: {
        labelBoxBorderColor: 'transparent',
      }
    };

    $scope.drp_start = moment().subtract(1, 'days').format('MMMM D, YYYY');
    $scope.drp_end = moment().add(31, 'days').format('MMMM D, YYYY');
    $scope.drp_options = {
      ranges: {
        'Hoy': [moment(), moment()],
        'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 días': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 días': [moment().subtract(29, 'days'), moment()],
        'Este mes': [moment().startOf('month'), moment().endOf('month')],
        'Último mes': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      },
      opens: 'left',
      startDate: moment().subtract(29, 'days'),
      endDate: moment()
    };

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
