angular.module('theme.demos.tasks', [])
  .controller('TasksController', ['$scope', '$http', '$filter', 'Notifier', '$bootbox', function($scope, $http, $filter, Notifier, $bootbox) {
    'use strict';
    $scope.newTaskTitle = '';
    $scope.newTaskLabelText = '';
    $scope.showTasksTab = true;
    $scope.showCompletedTab = false;

    $scope.blockdatataskdiv = true;
    $scope.blockdatetimetaskdiv = true;

    $scope.datatasks_server = [];
    $scope.datetimetasks_server = [];

    var url_server = 'http://158.69.223.78:8000';
    var url_cape = 'http://163.10.33.173:8000';

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
    }, function(response){
        console.log("problemas de conexion");
    });

    $http({
        method:'GET',
        url: url_server + '/tasks/datatasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datatasks_server = response.data.datatasks;
        console.log($scope.datatasks_server);
    }, function(response){
        console.log("problemas de conexion");
    });

    $http({
        method:'GET',
        url: url_server + '/tasks/datetimetasks'
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

    $scope.repeatsCriteria = [
      {value: '0', text: 'Dia'},
      {value: '1', text: 'Hora'}
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

    $scope.showCriteriaTime = function($index) {
      var criteria = $scope.datetimetasks_server[$index].repeat_criteria.toString();
      var selected = $filter('filter')($scope.repeatsCriteria, {value: criteria});
      return ($scope.datetimetasks_server[$index].repeat_criteria.toString() && selected.length) ? selected[0].text : 'Not set';
    };


    // Data tasks
    $scope.currentDataTask = {
      'label': null,
      'description': null,
      'component': null,
      'max_value': null,
      'action': null,
      'repeats': null,
      'comparator': null
    }

    $scope.clearCurrendDataTask = function() {
        $scope.currentDataTask = {
          'label': null,
          'description': null,
          'component': null,
          'max_value': null,
          'action': null,
          'repeats': null,
          'comparator': null
        }
    }

    // add data task to server
    $scope.createDataTask = function() {
      $scope.blockdatataskdiv = true;
      console.log($scope.currentDataTask);

      var data_params = {
        'taskstate':'1',
        'taskfunction':'1',
        'label': $scope.currentDataTask.label,
        'description': $scope.currentDataTask.description,
        'owner':'root',
        'repeats': $scope.currentDataTask.repeats,
        'data_value': $scope.currentDataTask.max_value,
        'device_mac': '11:11:11:11'
      }

      console.log(data_params);
      var url_task = url_server + "/tasks/datatasks/create";

      $http({
          method:'POST',
          url: url_task,
          data: $.param(data_params),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response.data);
          Notifier.simpleSuccess('Tarea guardada','Su tarea ' + $scope.currentDataTask.label + 'ha sido guardada con exito');
          $scope.clearCurrendDataTask();
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('Error al guardar','Su tarea ' + $scope.currentDataTask.label + 'no ha sido guardada por problemas de conexión');
          $scope.blockdatataskdiv = false;
      });
    };

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

    // borrar la datatask
    $scope.removeDataTask = function(index,id) {

      $bootbox.confirm('¿Segundo querés borrar?', function(result) {
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
            Notifier.simpleSuccess('Tarea borrada','Su tarea ha sido borrada con exito');
        }, function(response){
            console.log("problemas de conexion");
            Notifier.simpleError('Error al borrar','Su tarea no se pudo borrar por problemas de conexión');
        });
      });

    };

    // open box dialog
    $scope.addBoxDataTask = function() {
      $scope.blockdatataskdiv = false;
    };

    // close dialog
    $scope.closeBoxDataTask = function() {
      $scope.blockdatataskdiv = true;
    };


    ////////////////////

    //  Date time tasks

    ////////////////////

    // open box dialog
    $scope.addBoxDateTimeTask = function() {
      $scope.blockdatetimetaskdiv = false;
    };

    // add data task to server
    $scope.addDateTimeTask = function() {
      $scope.blockdatetimetaskdiv = true;
    };

    // close dialog
    $scope.closeBoxDateTimeTask = function() {
      $scope.blockdatetimetaskdiv = true;
    };

    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.mytime = new Date();

    ////////////

    // Data time tasks
    $scope.editDateTimeTask = function(data,id) {

      console.log($scope.datetimetasks_server[$scope.datetimetasks_server.length - 1]);
      console.log(id);
      if ($scope.datetimetasks_server[$scope.datetimetasks_server.length - 1].id != id) {

          var data3 = {'taskstate':'1', 'taskfunction':'1', 'label': data.label, 'description':'taks is done', 'owner':'root', 'datetime': data.data_value, 'device_mac':'11:11:11:11'}
          console.log(data3);
          //var data2 = {'taskstate':1, 'taskfunction':1, 'label': data.label, 'description': '', 'owner':'root', 'data_value': data.data_value, 'device_mac': 'fe:12:52:12:92'};
          var url_task = url_server + "/tasks/datetimetasks/" + id + "/update";

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
          var url_task = url_server + "/tasks/datetimetasks/create";

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

    // borra datetimetasks
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


  }]);
