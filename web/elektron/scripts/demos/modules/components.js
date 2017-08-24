angular
  .module('theme.demos.components', [])
  .controller('ComponentsController', ['$scope', '$filter', function($scope, $filter) {
    'use strict';

    $scope.components = [{
      id: 1,
      name: 'Heladera',
      ip: "192.168.0.1",
      last: "39"
    }, {
      id: 2,
      name: 'Microondas',
      ip: "192.168.0.2",
      last: "54"
    }, {
      id: 3,
      name: 'Luces',
      ip: "192.168.0.3",
      last: "34"
    }];


    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      // return $http.post('/saveUser', data);
    };

    // remove component
    $scope.removeComponent = function(index) {
      $scope.components.splice(index, 1);
    };

    // add user
    $scope.addComponent = function() {
      $scope.inserted = {
        id: $scope.components.length + 1,
        name: '',
        ip: '',
        last: '',
      };
      $scope.components.push($scope.inserted);
    };
  }]);
