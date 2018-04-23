// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers' , 'starter.services'])

.run(function($ionicPlatform , $http, $rootScope, $timeout, $location, $window, $state, $websocket, LoginService) {
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

  //$rootScope.authStatus = LoginService.isAuthenticated() || false;

  var ip_server = '158.69.223.78';
  var url_server = 'http://158.69.223.78:8000';
  $rootScope.ws = undefined;//$websocket('ws://' + ip_server +':8888/websocket');

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    console.log($rootScope.ws);
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

  // CORS
  //$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

  //console.log("Is Authenticated: "+ LoginService.isAuthenticated());

  /*
  if(LoginService.isAuthenticated()) {
    $location.path('/app/dashboard');
  } else {
    $location.path('/app/login');
  };*/

  //stateChange event
  /*
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    $rootScope.authStatus = toState.authStatus;
    if($rootScope.authStatus){}
  });

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
		console.log("URL : "+toState.url);
    console.log("Is Authenticated: "+ LoginService.isAuthenticated());
    if(toState.url=='/dashboard'){
			console.log("match : "+toState.url);
			$timeout(function(){
				angular.element(document.querySelector('#leftMenu' )).removeClass("hide");
			},1000);
		}
	});
  */

})


.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

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

  .state('app.signup', {
    url: '/signup',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-signup.html',
        controller: 'RegisterCtrl'
      }
    },
    authStatus: false,
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

  .state('app.profiles', {
    url: '/profiles',
    views: {
      'menuContent': {
        templateUrl: 'templates/profiles.html',
        controller: 'ProfilesCtrl'
      }
    },
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
  })

  .state('app.profile', {
    url: '/profile/:profileId',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile-detail.html',
        controller: 'ProfileCtrl'
      }
    },
    cache: false
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');

});
