angular
  .module('theme.demos.signup_page', [
    'theme.core.services'
  ])
  .controller('SignupPageController', ['$scope', '$theme', 'LoginService', '$route', '$location', '$cookies', function($scope, $theme, LoginService, $route, $location,$cookies) {
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
      LoginService.login($scope.username, $scope.password);
      setTimeout(function(){
        console.log("setTimeout");
        if(LoginService.isAuthenticated()) {
          console.log($cookies);
          $location.path('/index');
          $route.reload();
        } else {
          $scope.alerts.push($scope.userPassError);
          $scope.$apply();
          //$scope.error = 'usuario o contraseña incorrecta';
          console.log("Incorrect username/password !");
        }
      },3000);
    };

  }]);
