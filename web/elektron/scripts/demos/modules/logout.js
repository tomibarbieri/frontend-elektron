angular
  .module('theme.demos.logout', [
    'theme.core.services'
  ])

  .controller('LogoutController', ['$scope', '$theme', '$location', '$auth', '$timeout', function($scope, $theme, $location, $auth, $timeout) {
    'use strict';

    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    $auth.removeToken();

    $timeout( function(){
            $location.path('/login');
        }, 4000 );

  }]);
