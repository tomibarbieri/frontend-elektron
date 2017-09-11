angular.module('theme.demos.tasks', [])
  .controller('TasksController', ['$scope', function($scope) {
    'use strict';
    $scope.newTaskTitle = '';
    $scope.newTaskLabelText = '';
    $scope.showTasksTab = true;
    $scope.showCompletedTab = false;

    $scope.tasks = [{
      title: 'Notificar por heladera',
      label: 'Due tomorrow',
      color: 'success'
    }, {
      title: 'Apagar microondas',
      label: 'Today',
      color: 'danger'
    }, {
      title: 'Avisar consumo aire acondicionado',
      label: '6 days',
      color: 'primary'
    }, {
      title: 'Activar modo ahorro si se superan los 300w/h',
      label: 'Tomorrow',
      color: 'warning'
    }, {
      title: 'Cerrar porton a las 10hs',
      label: 'Today',
      color: 'danger'
    }, {
      title: 'Prender sistema de riego a las 6:00',
      label: 'Any day',
      color: 'inverse'
    }, {
      title: 'Prender sistema de riego a las 18:00',
      label: '5 days from now',
      color: 'success'
    }];

    $scope.tasksComplete = [{
      title: 'Encender luces patio 19:30hs',
      label: 'Due tomorrow',
      color: 'success'
    }, {
      title: 'Activar modo alerta',
      label: 'Any day',
      color: 'inverse'
    }, {
      title: 'Apagar equipo musica',
      label: '5 days from now',
      color: 'success'
    }];

    $scope.selectedItem = {};

    $scope.options = {};

    $scope.remove = function(scope) {
      $scope.tasks.splice(scope.index(), 1);
    };

    $scope.complete = function(scope, item) {
      $scope.tasksComplete.push(item);
      $scope.tasks.splice(scope.index(), 1);
    };

    $scope.incomplete = function(item, index) {
      $scope.tasks.push(item);
      $scope.tasksComplete.splice(index, 1);
    };

    $scope.newItem = function(title, label, color) {
      if (this.newTaskTitle === '') {
        return;
      }
      $scope.tasks.push({
        title: title,
        label: label,
        color: color
      });
      this.newTaskTitle = '';
      this.newTaskLabelText = '';
      this.showForm = false;
    };

    $scope.edit = function(item) {
      item.editing = true;
      item.titlePrev = item.title;
      item.labelPrev = item.label;
      item.colorPrev = item.color;
    };

    $scope.cancelEdit = function($event, item) {
      if ($event.keyCode !== 27) {
        return;
      }
      item.title = item.titlePrev;
      item.label = item.labelPrev;
      item.color = item.colorPrev;
      item.editing = false;
    };

    $scope.cancelAdd = function($event) {
      if ($event.keyCode !== 27) {
        return;
      }
      this.newTaskTitle = '';
      this.newTaskLabelText = '';
      this.showForm = false;
    };

    $scope.doneEditing = function(item) {
      item.editing = false;
    };
  }]);
