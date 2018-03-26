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
    //var url_server = 'http://192.168.0.21:8000';

    $http({
        method:'GET',
        url: url_server + '/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
    }, function(response){
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la informacion de los componentes del servidor");
    });

    $scope.getDataTasks = function() {
      $http({
          method:'GET',
          url: url_server + '/tasks/datatasks'
      }).then(function(response){
          console.log(response.data);
          $scope.datatasks_server = response.data.datatasks;
          console.log($scope.datatasks_server);
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError("Error de conexión","No se pudo traer la informacion de las tareas del servidor");

      });
    }

    $scope.getDateTimeTasks = function() {
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
    }

    $scope.getDataTasks();
    $scope.getDateTimeTasks();


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

    $scope.clearCurrendDataTask = function() {
        $scope.currentDataTask = {};
        $scope.currentDataTask = {
          'id': null,
          'label': null,
          'description': null,
          'component': null,
          'device_mac': null,
          'max_value': null,
          'action': null,
          'state': null,
          'repeats': null,
          'comparator': null
        };
    }

    $scope.clearCurrendDataTask();

    // add data task to server
    $scope.createDataTask = function() {
      $scope.blockdatataskdiv = true;
      console.log($scope.currentDataTask);

      var selected = $filter('filter')($scope.components_server, {id: $scope.currentDataTask.component});
      var selectedComponent = ($scope.currentDataTask.component && selected.length) ? selected[0] : 'Not set';

      var data_params = {
        'taskstate': $scope.currentDataTask.state,
        'taskfunction': $scope.currentDataTask.function,
        'label': $scope.currentDataTask.label,
        'description': $scope.currentDataTask.description,
        'owner':'root',
        'repeats': $scope.currentDataTask.repeats,
        'data_value': $scope.currentDataTask.max_value,
        'comparator': $scope.currentDataTask.comparator,
        'device_mac': selectedComponent.device_mac
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
          Notifier.simpleSuccess('Tarea creada','Su tarea ' + $scope.currentDataTask.label + ' ha sido creada con exito');
          $scope.clearCurrendDataTask();
          $scope.getDataTasks();
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('Error al crear','Su tarea ' + $scope.currentDataTask.label + ' no ha sido creada por problemas de conexión');
          $scope.blockdatataskdiv = false;
      });
    };

    $scope.editDataTask = function() {

      $scope.blockdatataskdiv = true;

      var data_params = {
        'taskstate': $scope.currentDataTask.state,
        'taskfunction': $scope.currentDataTask.function,
        'label': $scope.currentDataTask.label,
        'description': $scope.currentDataTask.description,
        'owner':'root',
        'repeats': $scope.currentDataTask.repeats,
        'comparator': $scope.currentDataTask.comparator,
        'data_value': $scope.currentDataTask.max_value,
        'device_mac': $scope.currentDataTask.device_mac
      }

      //var data2 = {'taskstate':1, 'taskfunction':1, 'label': data.label, 'description': '', 'owner':'root', 'data_value': data.data_value, 'device_mac': 'fe:12:52:12:92'};
      var url_task = url_server + "/tasks/datatasks/" + $scope.currentDataTask.id + "/update";
      console.log(url_task);
      console.log(data_params);

      $http({
          method:'POST',
          url: url_task,
          data: $.param(data_params),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response.data);
          Notifier.simpleSuccess('Tarea guardada','Su tarea ' + $scope.currentDataTask.label + ' ha sido guardada con exito');
          $scope.clearCurrendDataTask();
          $scope.getDataTasks();
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('Error al guardar','Su tarea ' + $scope.currentDataTask.label + ' no ha sido guardada por problemas de conexión');
          $scope.blockdatataskdiv = false;
      });

    };

    // borrar la datatask
    $scope.removeDataTask = function(index,id) {

      $bootbox.confirm('¿Segundo querés borrar?', function(result) {
        if (result) {
          $scope.datatasks_server.splice(index, 1);
          console.log(index);
          console.log(id);
          var url_task = url_server + "/tasks/datatasks/" + id + "/remove";
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
        }
      });

    };

    $scope.openEditDataTask = function($index) {

      //cargar los campos con los datos

      var selectedDataTask = $scope.datatasks_server[$index];

      console.log(selectedDataTask);

      $scope.currentDataTask = {
        'id': selectedDataTask.id,
        'label': selectedDataTask.label,
        'description': selectedDataTask.description,
        'component': selectedDataTask.device.id,
        'device_mac': selectedDataTask.device.device_mac,
        'max_value': parseInt(selectedDataTask.data_value),
        'action': selectedDataTask.taskfunction.name,
        'state': selectedDataTask.taskstate.name,
        'repeats': selectedDataTask.repeats,
        'comparator': selectedDataTask.comparator
      }

      $scope.editDataTaskButton = true;
      $scope.createDataTaskButton = false;
      $scope.dataTaskDiv = "Editar tarea por consumo";

      $scope.blockdatataskdiv = false;

    }

    // open box dialog
    $scope.addBoxDataTask = function() {
      $scope.blockdatataskdiv = false;
      $scope.createDataTaskButton = true;
      $scope.dataTaskDiv = "Agregar tarea por consumo";
      $scope.editDataTaskButton = false;
      $scope.clearCurrendDataTask();
    };

    // close dialog
    $scope.closeBoxDataTask = function() {
      $scope.clearCurrendDataTask();
      $scope.blockdatataskdiv = true;
    };


    ////////////////////

    //  Date time tasks

    ////////////////////

    // Data tasks

    $scope.clearCurrendDateTimeTask = function() {
      $scope.currentDateTimeTask = {};
      $scope.currentDateTimeTask = {
        'id': null,
        'label': null,
        'description': null,
        'component': null,
        'device_mac': null,
        'date': null,
        'action': null,
        'repeats': null,
        'criteria': null
      }
    }

    $scope.clearCurrendDateTimeTask();

    $scope.createDateTimeTask = function() {

      $scope.blockdatetimetaskdiv = true;
      console.log($scope.currentDateTimeTask);

      var selected = $filter('filter')($scope.components_server, {id: $scope.currentDateTimeTask.component});
      var selectedComponent = ($scope.currentDateTimeTask.component && selected.length) ? selected[0] : 'Not set';

      var data_params = {
        'taskstate': $scope.currentDateTimeTask.state,
        'taskfunction': $scope.currentDateTimeTask.function,
        'label': $scope.currentDateTimeTask.label,
        'description': $scope.currentDateTimeTask.description,
        'owner':'root',
        'repeats': $scope.currentDateTimeTask.repeats,
        'repeat_criteria': $scope.currentDateTimeTask.criteria,
        'datetime': $scope.currentDateTimeTask.date.toUTCString(),
        'device_mac': selectedComponent.device_mac
      }

      console.log(data_params);
      var url_task = url_server + "/tasks/datetimetasks/create";

      $http({
          method:'POST',
          url: url_task,
          data: $.param(data_params),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response.data);
          $scope.clearCurrendDateTimeTask();
          Notifier.simpleSuccess('Tarea creada','Su tarea ' + $scope.currentDateTimeTask.label + ' ha sido creada con exito');
          $scope.getDateTimeTasks();

      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('Error al crear','Su tarea ' + $scope.currentDateTimeTask.label + ' no ha sido creada por problemas de conexión');
          $scope.blockdatetimetaskdiv = false;
      });

    }

    // Data time tasks
    $scope.editDateTimeTask = function() {

      $scope.blockdatetimetaskdiv = true;

      var data_params = {
        'taskstate': $scope.currentDateTimeTask.state,
        'taskfunction': $scope.currentDateTimeTask.function,
        'label': $scope.currentDateTimeTask.label,
        'description': $scope.currentDateTimeTask.description,
        'owner':'root',
        'repeats': $scope.currentDateTimeTask.repeats,
        'repeat_criteria': $scope.currentDateTimeTask.criteria,
        'datetime': $scope.currentDateTimeTask.date.toUTCString(),
        'device_mac': $scope.currentDateTimeTask.device_mac
      }

      var url_task = url_server + "/tasks/datetimetasks/" + $scope.currentDateTimeTask.id + "/update";

      $http({
          method:'POST',
          url: url_task,
          data: $.param(data_params),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
      }).then(function(response){
          console.log(response.data);
          Notifier.simpleSuccess('Tarea editada','Su tarea ' + $scope.currentDateTimeTask.label + ' ha sido editada con exito');
          $scope.clearCurrendDateTimeTask();
          $scope.getDateTimeTasks();
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('Error al editar','Su tarea ' + $scope.currentDateTimeTask.label + ' no ha sido editada por problemas de conexión');
          $scope.blockdatetimetaskdiv = false;
      });
    };

    // borra datetimetasks
    $scope.removeDateTimeTask = function(index,id) {

      $bootbox.confirm('¿Seguro querés borrar?', function(result) {
        if (result) {
          var url_task = "http://158.69.223.78:8000/tasks/datetimetasks/" + id + "/remove";
          $http({
              method:'GET',
              url: url_task
          }).then(function(response){
              console.log(response.data);
              Notifier.simpleSuccess('Tarea borrada','Su tarea ha sido borrada con exito');
              $scope.datetimetasks_server.splice(index, 1);
          }, function(response){
              console.log("problemas de conexion");
              Notifier.simpleError('Error al borrar','Su tarea no se pudo borrar por problemas de conexión');
          });
        }
      });
    };

    // open box dialog
    $scope.addBoxDateTimeTask = function() {
      $scope.blockdatetimetaskdiv = false;
      $scope.createDateTimeTaskButton = true;
      $scope.dateTimeTaskDiv = "Agregar tarea por fecha y hora";
      $scope.editDateTimeTaskButton = false;
      $scope.clearCurrendDateTimeTask();
    };

    $scope.openEditDateTimeTask = function($index) {

      var selectedDateTimeTask = $scope.datetimetasks_server[$index];

      console.log(selectedDateTimeTask);

      $scope.currentDateTimeTask = {
        'id': selectedDateTimeTask.id,
        'label': selectedDateTimeTask.label,
        'description': selectedDateTimeTask.description,
        'component': selectedDateTimeTask.device.id,
        'device_mac': selectedDateTimeTask.device.device_mac,
        'date': selectedDateTimeTask.datetime,
        'action': selectedDateTimeTask.taskfunction.name,
        'state': selectedDateTimeTask.taskstate.name,
        'repeats': selectedDateTimeTask.repeats,
        'criteria': selectedDateTimeTask.repeat_criteria
      }

      $scope.editDateTimeTaskButton = true;
      $scope.createDateTimeTaskButton = false;
      $scope.dateTimeTaskDiv = "Editar tarea por consumo";

      $scope.blockdatetimetaskdiv = false;
    }

    $scope.addDateTimeTask = function() {
      $scope.blockdatetimetaskdiv = true;
    };

    $scope.closeBoxDateTimeTask = function() {
      $scope.clearCurrendDateTimeTask();
      $scope.blockdatetimetaskdiv = true;
    };

  }]);
