angular
  .module('theme.demos.logout', [
    'theme.core.services'
  ])

  .controller('LogoutController', ['$scope', '$theme', 'LoginService', '$route', function($scope, $theme, LoginService, $route) {
    'use strict';

    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    setTimeout(function(){
      LoginService.logout();
      console.log("logout");
      $route.reload();
    },1000);

  }]);
