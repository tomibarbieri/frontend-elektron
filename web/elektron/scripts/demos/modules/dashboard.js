angular.module('theme.demos.dashboard', [
    'angular-skycons',
    'theme.demos.forms',
    'theme.demos.tasks',
    'ngWebSocket'
  ])
  .controller('DashboardController', ['$scope', '$timeout', '$window', function($scope, $timeout, $window, $websocket) {
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



    /*const WebSocket = require('ws');

    const ws = new WebSocket('ws://localhost:8888/websocket');

    ws.on('open', function open() {
      ws.send('something');
    });

    ws.on('message', function incoming(data) {
      console.log(data);
    });*/

    var ws = new WebSocket("ws://localhost:8888/websocket");
    //console.log(ws);

    //Open the socket and say hi
    ws.onopen = function() {
      ws.send("Hello, world");
    };

    //Receive message form server
    ws.onmessage = function (evt) {
      console.log("puto")
      var json = JSON.parse(evt.data);
      console.log(json);

      $scope.plotStatsData[0]['data'].shift();
      $scope.plotStatsData[0]['data'].push([10,json.data]);

      console.log($scope.plotStatsData[0]['data']);

    };

    //var dataStream = $websocket('ws://localhost:8888/websocket');

    /*
    var dataStream = $websocket('ws://localhost:8888/websocket');

    // 158.69.223.78
      // cambiar ip a la del servior por ejemplo 192.168.0.20
      console.log(dataStream);
      var collection = [];
      $scope.heladera = 33;
      $scope.lavarropas = 0;
      $scope.aire = 146;



      dataStream.onError(function functionName() {
        console.log("fallo el server");
      });

      dataStream.onMessage(function(message) {

        json = JSON.parse(message.data);
        console.log(json.data_value);

        $scope.line.data[0].shift();
        $scope.line.data[0].push(json.data);
        $scope.heladera = json.data_value;
        $scope.lavarropas = json.data_value;
        $scope.aire = json.data_value;

      });*/



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
