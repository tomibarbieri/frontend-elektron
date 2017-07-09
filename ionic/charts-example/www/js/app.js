// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ionicApp', ['ionic','chart.js','angular-websocket'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('GraphCtrl', function($scope, $websocket) {

  // Acá los datos para el grafico de barras

  var dataStream = $websocket('ws://192.168.43.125:8888/websocket'); // cambiar ip a la del servior por ejemplo 192.168.0.20
  console.log(dataStream);
  var collection = [];

  dataStream.onMessage(function(message) {
    console.log("puto")
    console.log(message.data)
    json = JSON.parse(message.data);

    $scope.line.data[0].shift();
    $scope.line.data[0].push(json.data);

    //$scope.line.data[1].shift();
    //$scope.line.data[1].push(json.corriente);

    var date = new Date(json.timestamp*1000);
    date = date.toTimeString().split(' ')[0];
    //$scope.line.labels.shift();
    //$scope.line.labels.push(date);

    console.log(json);
    //collection.push(JSON.parse(message.data));
  });

  // Aca los datos para el grafico lineal

 /*  $scope.bar = {};
  $scope.bar.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.bar.series = ['Series A', 'Series B'];

  $scope.bar.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];*/

  // Aca los datos para el grafico lineal

  $scope.line = {};
  $scope.line.labels = ["E", "L", "E", "K", "T", "R", "A", "0", "0", "7"];
  $scope.line.series = ['Potencia', 'Corriente'];
  $scope.line.data = [
    [65, 59, 80, 81, 56, 55, 40, 33, 56, 88],
    [28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
  ];

  /*  Intento de actualizar con el click el chart

  $scope.onClick = function (evt) {
    $scope.line.data[0].shift();
    $scope.line.data[0] = $scope.line.data[0].push(70);
    $scope.line.data[1].shift();
    $scope.line.data[1] = $scope.line.data[1].push(50);
  };
  */
  /*$scope.datasetOverride = [{ 'yAxisID': 'y-axis-1' }, { 'yAxisID': 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };*/

});
