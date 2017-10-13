angular.module('theme.demos.tasks', [])
  .controller('TasksController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
    'use strict';
    $scope.newTaskTitle = '';
    $scope.newTaskLabelText = '';
    $scope.showTasksTab = true;
    $scope.showCompletedTab = false;

    $scope.datatasks_server = [];
    $scope.datetimetasks_server = [];

    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/tasks/datatasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datatasks_server = response.data.datatasks;
        console.log($scope.datatasks_server);
    }, function(response){
        console.log("problemas de conexion");
    });

    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/tasks/datetimetasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datetimetasks_server = response.data.datetimetasks;
        console.log($scope.datetimetasks_server);
    }, function(response){
        console.log("problemas de conexion");
    });


    $scope.taskfunction = [
      {value: 'shutdown', text: 'Apagar'},
      {value: 'turnon', text: 'Encender'}
    ];

    $scope.taskstate = [
      {value: 'done', text: 'Finalizada'},
      {value: 'ready', text: 'Lista'}
    ];

    // Data task select
    $scope.showDataFunction = function($index) {
      var selected = $filter('filter')($scope.taskfunction, {value: $scope.datatasks_server[$index].taskfunction.name});
      return ($scope.datatasks_server[$index].taskfunction.name && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.showDataState = function($index) {
      var selected = $filter('filter')($scope.taskstate, {value: $scope.datatasks_server[$index].taskstate.name});
      return ($scope.datatasks_server[$index].taskstate.name && selected.length) ? selected[0].text : 'Not set';
    };

    // Data time task select
    $scope.showDateTimeFunction = function($index) {
      var selected = $filter('filter')($scope.taskfunction, {value: $scope.datetimetasks_server[$index].taskfunction.name});
      return ($scope.datetimetasks_server[$index].taskfunction.name && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.showDateTimeState = function($index) {
      var selected = $filter('filter')($scope.taskstate, {value: $scope.datetimetasks_server[$index].taskstate.name});
      return ($scope.datetimetasks_server[$index].taskstate.name && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.editDataTask = function(index,id) {
      $scope.datatasks_server.splice(index, 1);
      console.log(index);
      console.log(id);
      var url_task = "http://158.69.223.78:8000/tasks/datatasks/" + id + "/remove";
      console.log(url_task);
      $http({
          method:'GET',
          url: url_task
      }).then(function(response){
          console.log(response.data);
      }, function(response){
          console.log("problemas de conexion");
      });
    };


    $scope.removeDataTask = function(index,id) {
      $scope.datatasks_server.splice(index, 1);
      console.log(index);
      console.log(id);
      var url_task = "http://158.69.223.78:8000/tasks/datatasks/" + id + "/remove";
      console.log(url_task);
      $http({
          method:'GET',
          url: url_task
      }).then(function(response){
          console.log(response.data);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    // add user
    $scope.addDataTask = function() {
      $scope.inserted = {
        id: $scope.datatasks_server.length + 1,
        name: '',
        ip: '',
        last: '',
      };
      $scope.datatasks_server.push($scope.inserted);
    };


    $scope.removeDateTimeTask = function(index,id) {
      $scope.datatasks_server.splice(index, 1);
      console.log(index);
      console.log(id);
      var url_task = "http://158.69.223.78:8000/tasks/datetimetasks/" + id + "/remove";
      console.log(url_task);
      $http({
          method:'GET',
          url: url_task
      }).then(function(response){
          console.log(response.data);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    // add user
    $scope.addDateTimeTask = function() {
      $scope.inserted = {
        id: $scope.datetimetasks_server.length + 1,
        name: '',
        ip: '',
        last: '',
      };
      $scope.datetimetasks_server.push($scope.inserted);
    };

  }]);
