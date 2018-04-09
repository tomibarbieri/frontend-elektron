angular
  .module('themesApp', [
    'theme',
    'theme.demos',
    'ngWebSocket',
    'ui.bootstrap',
    'ngCookies'
  ])

  // For sessions

  /*
  .provider('myCSRF',[function(){
    var headerName = 'X-CSRFToken';
    var cookieName = 'csrftoken';
    var allowedMethods = ['GET'];

    this.setHeaderName = function(n) {
      headerName = n;
    }
    this.setCookieName = function(n) {
      cookieName = n;
    }
    this.setAllowedMethods = function(n) {
      allowedMethods = n;
    }
    this.$get = ['$cookies', function($cookies){
      return {
        'request': function(config) {
          if(allowedMethods.indexOf(config.method) === -1) {
            // do something on success
            config.headers[headerName] = $cookies[cookieName];
          }
          return config;
        }
      }
    }];
  }])*/


  .run(['$http', '$rootScope', '$window', '$location', '$cookies', 'LoginService', function ($http, $rootScope, $window, $location, $cookies, LoginService) {

    //$http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    $rootScope.ws = undefined;//$websocket('ws://' + ip_server +':8888/websocket');

    $rootScope.$on('$routeChangeStart', function($event, next, current) {

      /*if (!LoginService.isAuthenticated()) {
          console.log('Acceso no autorizado');
          $location.path('/login');
      }
      else {
          console.log('Todo ok');
          if (next.params.templateFile == undefined){
            $location.path('/');
          }
      }*/

      console.log("statechange");
      console.log(next.params.templateFile);
      console.log($rootScope.ws);

      if ($rootScope.ws != undefined) {
        $rootScope.ws.close();
        $rootScope.ws = undefined;
        console.log("closing ws");
      }

      if ($rootScope.ws != undefined && (next.params.templateFile == "monitor" || next.params.templateFile == "index")) {
        $window.location.reload();
      }
    });

  }])
  /*.run(['$rootScope', '$location', 'LoginService', function ($rootScope, $location, LoginService) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
        if (!LoginService.isAuthenticated()) {
            console.log('Acceso no autorizado');
            $location.path('/login');
        }
        else {
            console.log('Todo ok');
            if (next.params.templateFile == undefined){
              $location.path('/');
            }
        }
    });
  }])*/

  .config(['$provide', '$httpProvider', '$routeProvider', function($provide, $httpProvider, $routeProvider) {
    'use strict';
    //$httpProvider.defaults.withCredentials = true;
    //$httpProvider.interceptors.push('myCSRF');
    //$httpProvider.defaults.xsrfCookieName = 'csrftoken';
    //$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
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
        //templateUrl: 'views/index.html',
        //controller: 'DashboardController'
      })
      .otherwise({
        redirectTo: '/index'
      });
  }]);
