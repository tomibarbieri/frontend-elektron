
angular.module('elektron', ['ionic', 'elektron.controllers', 'satellizer', 'ui.router'])

.run(function($ionicPlatform , $http, $rootScope, $timeout, $location, $window, $state, $websocket, $auth) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });


  var ip_server = '158.69.223.78';
  var url_server = 'http://158.69.223.78:8000';
  $rootScope.ws = undefined;//$websocket('ws://' + ip_server +':8888/websocket');

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    //console.log($rootScope.ws);
    try {
      if ($rootScope.ws != undefined) {
        $rootScope.ws.close();
        $rootScope.ws = undefined;
        //console.log("closing ws");
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

  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    //$rootScope.authStatus = toState.authStatus;

    console.log(toState);
    if(!$auth.isAuthenticated()){
      if(toState.name === 'app.login') return;
      $state.go('app.login');
      event.preventDefault();
    }
    else {
      if(toState.name === 'app.dashboard') {
        $timeout(function(){
          angular.element(document.querySelector('#leftMenu' )).removeClass("hide");
        },1000);
      };
      if(toState.name === 'app.login') {
        $state.go('app.dashboard');
        event.preventDefault();
      };
    }
  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $authProvider) {

  $httpProvider.defaults.useXDomain = true;
  //$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  //$httpProvider.defaults.useXDomain = true;
  //delete $httpProvider.defaults.headers.common['X-Requested-With'];
  //$httpProvider.defaults.withCredentials = true;
  //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  $authProvider.loginUrl = 'http://158.69.223.78:8000/elektronusers/login';

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
    //cache: false
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-signin.html',
        controller: 'LoginCtrl'
      }
    },
  	authStatus: false,
    cache: false
  })

  .state('app.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
      }
    },
    cache: false
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashCtrl'
      }
    },
    authStatus: true,
    cache: false
  })

  .state('app.monitor', {
    url: '/monitor',
    views: {
      'menuContent': {
        templateUrl: 'templates/monitor.html',
        controller: 'MonitorCtrl'
      }
    },
    authStatus: true,
    cache: false
  })


  .state('app.components', {
    url: '/components',
    views: {
      'menuContent': {
        templateUrl: 'templates/components.html',
        controller: 'ComponentsCtrl'
      }
    },
    cache: false
  })

  .state('app.component', {
    url: '/component/:componentId',
    views: {
      'menuContent': {
        templateUrl: 'templates/component.html',
        controller: 'ComponentCtrl'
      }
    },
    cache: false
  })

  .state('app.statistics', {
    url: '/statistics',
    views: {
      'menuContent': {
        templateUrl: 'templates/statistics.html',
        controller: 'StatisticsCtrl'
      }
    },
    cache: false
  })

  .state('app.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    },
    cache: false
  })

  .state('app.configuration', {
    url: '/configuration',
    views: {
      'menuContent': {
        templateUrl: 'templates/configuration.html',
        controller: 'ConfigurationCtrl'
      }
    },
    cache: false
  })

  .state('app.graphic-history', {
    url: '/graphic-history/{componentId}?dateFrom&timeFrom$dateTo&timeTo&precision',
    views: {
      'menuContent': {
        templateUrl: 'templates/graphic-history.html',
        controller: 'GraphicHistoryCtrl'
      }
    },
    cache: false
  })

  .state('app.tasks', {
    url: '/tasks',
    views: {
      'menuContent': {
        templateUrl: 'templates/tasks.html',
        controller: 'TasksCtrl'
      }
    },
    cache: false
  })

  .state('app.datatask', {
    url: '/datatask?task',
    views: {
      'menuContent': {
        templateUrl: 'templates/datatask.html',
        controller: 'DatataskCtrl'
      }
    },
    cache: false
  })

  .state('app.datetimetask', {
    url: '/datetimetask?task',
    views: {
      'menuContent': {
        templateUrl: 'templates/datetimetask.html',
        controller: 'DatetimetaskCtrl'
      }
    },
    cache: false
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');

});
