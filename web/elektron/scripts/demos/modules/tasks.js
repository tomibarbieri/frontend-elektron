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

    // Reemplazar por Ajax

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

    // Data tasks

    $scope.editDataTask = function(data,id) {

      var data2 = {'taskstate':1, 'taskfunction':1, 'label': data.label, 'description': '', 'owner':'root', 'data_value': data.data_value, 'device_mac': 'fe:12:52:12:92'};
      var url_task = "http://158.69.223.78:8000/tasks/datatasks/" + id + "/update";

      $http({
          method:'POST',
          url: url_task,
          data: $.param(data2),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
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
      /*$scope.inserted = {
        id: $scope.datatasks_server.length + 1,
        //name: '',
        ip: '',
        last: '',
      };
      $scope.datatasks_server.push($scope.inserted);*/
    };

    // Data time tasks

    $scope.editDateTimeTask = function(data,id) {

      console.log($scope.datetimetasks_server[$scope.datetimetasks_server.length - 1]);
      console.log(id);
      if ($scope.datetimetasks_server[$scope.datetimetasks_server.length - 1].id != id) {

          var data3 = {'taskstate':'1', 'taskfunction':'1', 'label': data.label, 'description':'taks is done', 'owner':'root', 'datetime': data.data_value, 'device_mac':'11:11:11:11'}
          console.log(data3);
          //var data2 = {'taskstate':1, 'taskfunction':1, 'label': data.label, 'description': '', 'owner':'root', 'data_value': data.data_value, 'device_mac': 'fe:12:52:12:92'};
          var url_task = "http://158.69.223.78:8000/tasks/datetimetasks/" + id + "/update";

          $http({
              method:'POST',
              url: url_task,
              data: $.param(data3),
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
          }).then(function(response){
              console.log(response.data);
          }, function(response){
              console.log("problemas de conexion");
          });

      } else {

          console.log(data);

          var data3 = {'taskstate':'1', 'taskfunction':'1', 'label': data.label, 'description':'taks is done', 'owner':'root', 'datetime': data.data_value, 'device_mac':'11:11:11:11'}
          console.log(data3);
          //var data2 = {'taskstate':1, 'taskfunction':1, 'label': data.label, 'description': '', 'owner':'root', 'data_value': data.data_value, 'device_mac': 'fe:12:52:12:92'};
          var url_task = "http://158.69.223.78:8000/tasks/datetimetasks/create";

          $http({
              method:'POST',
              url: url_task,
              data: $.param(data3),
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
          }).then(function(response){
              console.log(response.data);
          }, function(response){
              console.log("problemas de conexion");
          });

      }
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
        lable: '',
        device_label: '',
        last: '',
      };
      $scope.datetimetasks_server.push($scope.inserted);

    };

  }]);
