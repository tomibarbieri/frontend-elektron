angular
  .module('theme.demos.signup_page', [
    'theme.core.services'
  ])
  .controller('SignupPageController', ['$scope', '$theme', 'LoginService', '$route', '$location', '$auth', function($scope, $theme, LoginService, $route, $location, $auth) {
    'use strict';

    $scope.alerts = [];

    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.userPassError = {
      type: 'danger',
      msg: '<strong>¡Error!</strong> Confundiste el usuario y/o contraseña.'
    };

    $scope.conexionError = {
      type: 'warning',
      msg: '<strong>¡Problemas!</strong> Error de conexión con el servidor.'
    };

    $scope.formSubmit = function() {

      var credentials = {
        email: $scope.username,
        password: $scope.password
      }

      // Use Satellizer's $auth service to login
      $auth.login(credentials).then(function(data) {
        // If login is successful, redirect to the users state
        $location.path('/index');
      }, function(error) {
        $scope.alerts.push($scope.userPassError);
        console.log(error);
      });

      $scope.$apply();

    };

  }]);
