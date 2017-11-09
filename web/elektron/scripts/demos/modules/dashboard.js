angular.module('theme.demos.dashboard', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket',
    'chart.js'
    ])

  .controller('DashboardController', ['$scope', '$timeout', '$window', '$http', '$filter', function($scope, $timeout, $window, $http, $filter, $websocket) {
    'use strict';
    var moment = $window.moment;
    var _ = $window._;

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
        [1, 2500],
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
      label: 'Costo'
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
      label: 'Consumo total'
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
        content: 'View Count: %y'
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

    $scope.chart;

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      $scope.chart = chart;
    });

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $http({
        method:'GET',
        url: url_server + '/data/'
    }).then(function(response){
        console.log(response.data.data);
        console.log(response.data);
        $scope.line = {};

        $scope.line.series = ['Potencia'];

        $scope.line.labels = [];
        $scope.line.data = [[]];

        for (var i = 0; i < 20; i++) {
          var date = $filter('date')(response.data.data[i].date, "dd/MM/yyyy");
          var data = response.data.data[i].data_value;
          console.log(data);
          $scope.line.labels.push(date);
          $scope.line.data[0].push(data);
        }

    }, function(response){
        console.log("problemas de conexion");
    });


    var url_websocket = "ws://" + ip_server + ":8888/websocket";
    console.log(url_websocket);
    var ws = new WebSocket(url_websocket,'ws');

    ws.onopen = function() {
      ws.send("Hello, world");
    };


    ws.onmessage = function(message) {
        console.log(message.data);

        var json = JSON.parse(message.data);
        console.log(json.data_value);

        $scope.last_value = json.data_value;

        console.log($scope.line.data[0]);

        $scope.line.data[0].splice(0,1);


        console.log($scope.line.data[0].push(json.data_value));

        console.log($scope.line.data[0][9]);

        if ($scope.chart) {
            $scope.chart.update();
        }

      };




    $scope.drp_start = moment().subtract(1, 'days').format('MMMM D, YYYY');
    $scope.drp_end = moment().add(31, 'days').format('MMMM D, YYYY');
    $scope.drp_options = {
      ranges: {
        'Hoy': [moment(), moment()],
        'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 días': [moment().subtract(6, 'days'), moment()],
        'Ultimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Este mes': [moment().startOf('month'), moment().endOf('month')],
        'El mes anterior': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
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
