angular
  .module('theme.demos.statistics', ["chart.js"])
  .controller('StatisticsController', ['$scope', '$http', function($scope, $http) {
    'use strict';

    console.log("Statistics");

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $scope.doughnut;

    $scope.$on('chart-create', function (evt, chart) {
      console.log(chart);
      console.log(chart.config.type);
      console.log(chart.config.data);
      if (chart.config.type) {
        $scope.doughnut = chart;
      }

    });


    $scope.doughnutlabels = [];
    $scope.doughnutdata = [];

    $scope.labels1 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Aire acondicionado', 'Heladera'];

    $scope.data1 = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;

        for (var i = 0; i < $scope.components_server.length; i++) {
          $scope.doughnutlabels.push($scope.components_server[i].label);
          $scope.doughnutdata.push(Math.floor((Math.random() * 100) + 1));
        }

    }, function(response){
        console.log("problemas de conexion");
    });

    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var data2 = {'label': data.name};

      var url = url_server + '/devices/'+ id +'/updatelabel';

      var serializedData = $.param(data2);
      console.log(serializedData);

      var send = $http({
        method: 'POST',
        url: url,
        data: serializedData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

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

    $scope.enableComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/enable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].enabled = 'true';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.disableComponent = function(index,id) {
      var url = url_server + '/devices/' + id + '/disable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.components_server[index].enabled = 'false';
      }, function(response){
          console.log("problemas de conexion");
      });
    };

}]);
