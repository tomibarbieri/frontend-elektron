angular
  .module('theme.demos.signup_page', [
    'theme.core.services'
  ])
/*  .factory('LoginService', function() {

      var admin = 'admin';
      var pass = 'pass';
      var isAuthenticated = false;

      return {
        login : function(username, password) {
          console.log('re dale guacho');
          console.log(username, password);
          //isAuthenticated = username === admin && password === pass;
          return isAuthenticated;
        },
        isAuthenticated : function() {
          return isAuthenticated;
        }
      };

    })*/
  .controller('SignupPageController', ['$scope', '$theme', 'LoginService', '$location', function($scope, $theme, LoginService, $location) {
    'use strict';

    $scope.error = '';

    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    $scope.formSubmit = function() {
      if(LoginService.login($scope.username, $scope.password)) {
        $location.path('/index');
      } else {
        $scope.error = 'usuario o contraseña incorrecta';
        console.log("Incorrect username/password !");
      }
    };

  }]);
