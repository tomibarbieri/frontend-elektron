angular
  .module('themesApp', [
    'theme',
    'theme.demos',
    'ngWebSocket',
    'ui.bootstrap',
    'ngCookies',
    'satellizer',
    'ui.router'

  ])

  .run(['$http', '$rootScope', '$window', '$location', '$cookies', 'LoginService', '$auth', function ($http, $rootScope, $window, $location, $cookies, LoginService, $auth) {

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';

    $rootScope.ws = undefined;

    $rootScope.$on('$routeChangeSuccess', function(event, next, current) {

    console.log('$stateChangeSuccess');

      try {
        if ($rootScope.ws != undefined) {
          $rootScope.ws.close();
          $rootScope.ws = undefined;
          console.log("closing ws");
        }
      }
      catch(err) {
        console.log("No fue establecida la conexion antes de querer cerrarla.");
        $rootScope.ws = undefined;
      }

      if ($rootScope.ws != undefined && (next.params.templateFile == "monitor" || next.params.templateFile == "index")) {
        $window.location.reload();
      }
    });

    $rootScope.$on("$routeChangeStart", function(event, next, current){
      //$rootScope.authStatus = toState.authStatus;
      console.log('$stateChangeStart');
      console.log(next);
      if(!$auth.isAuthenticated()){
        if(next.params.templateFile === 'login') return;
        console.log('yendo al login porque no esta logueado');
        $location.path('/login');
      }
      else {
        if(next.params.templateFile === 'app.login') {
          $location.path('/dashboard');
        };
      }
    });

  }])

  .config(['$provide', '$httpProvider', '$routeProvider', '$authProvider', function($provide, $httpProvider, $routeProvider, $authProvider) {
    'use strict';

    $authProvider.loginUrl = 'http://158.69.223.78:8000/elektronusers/login';

    $routeProvider
      .when('/', {
        redirectTo: '/index'
      })
      .when('/:templateFile', {
        templateUrl: function(param) {
          return 'views/' + param.templateFile + '.html';
        },
        requireLogin: true
      })
      .when('#', {
        redirectTo: '/#/index'
      })
      .otherwise({
        redirectTo: '/index'
      });
  }]);
