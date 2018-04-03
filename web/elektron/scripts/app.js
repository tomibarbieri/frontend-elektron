angular
  .module('themesApp', [
    'theme',
    'theme.demos',
    'ngWebSocket',
    'ui.bootstrap',
  ])

  // For sessions


  .run(['$rootScope', '$window', '$location', 'LoginService', function ($rootScope, $window, $location, LoginService) {

    var ip_server = '158.69.223.78';
    var url_server = 'http://158.69.223.78:8000';
    $rootScope.ws = undefined;//$websocket('ws://' + ip_server +':8888/websocket');

    $rootScope.$on('$routeChangeStart', function($event, next, current) {
      console.log("statechange");
      console.log(next.params.templateFile);
      console.log($rootScope.ws);
      if ($rootScope.ws != undefined && (next.params.templateFile == "monitor" || next.params.templateFile == "index")) {
        $rootScope.ws.close();
        $rootScope.ws = undefined;
        console.log("closing ws");
      }
      else {
        console.log("reloading");
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
              $location.path('/index');
            }
        }
    });
  }])*/

  .config(['$provide', '$routeProvider', function($provide, $routeProvider) {
    'use strict';
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        resolve: {
          loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'bower_components/fullcalendar/fullcalendar.js',
            ]);
          }]
        }
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
        redirectTo: '/'
      });
  }]);
