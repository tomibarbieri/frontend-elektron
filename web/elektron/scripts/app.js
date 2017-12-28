angular
  .module('themesApp', [
    'theme',
    'theme.demos',
    'ngWebSocket',
    'ui.bootstrap',
  ])

  // For sessions

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
      /*.when('/', {
        templateUrl: 'views/index.html',
        resolve: {
          loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'bower_components/fullcalendar/fullcalendar.js',
            ]);
          }]
        }
      })*/
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
        redirectTo: '/#/index'
      });
  }]);
