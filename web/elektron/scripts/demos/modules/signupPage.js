angular
  .module('theme.demos.signup_page', [
    'theme.core.services'
  ])
  .controller('SignupPageController', ['$scope', '$theme', 'LoginService', '$route', '$location', '$cookies', function($scope, $theme, LoginService, $route, $location,$cookies) {
    'use strict';

    $scope.error = '';

    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    $scope.formSubmit = function() {
      LoginService.login($scope.username, $scope.password);
      setTimeout(function(){
        console.log("setTimeout");
        if(LoginService.isAuthenticated()) {
          console.log($cookies);
          $location.path('/index');
          $route.reload();
        } else {
          $scope.error = 'usuario o contraseña incorrecta';
          console.log("Incorrect username/password !");
        }
      },3000);
    };

  }]);
