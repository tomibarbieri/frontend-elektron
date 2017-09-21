// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers' , 'starter.services'])

.run(function($ionicPlatform , $rootScope, $timeout, $location, $state, LoginService) {
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

  $rootScope.authStatus = LoginService.isAuthenticated() || false;

  //console.log("Is Authenticated: "+ LoginService.isAuthenticated());

  /*
  if(LoginService.isAuthenticated()) {
    $location.path('/app/dashboard');
  } else {
    $location.path('/app/login');
  };*/

  //stateChange event
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

})


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-signin.html',
        controller: 'LoginCtrl'
      }
    },
	authStatus: false
  })

  .state('app.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
      }
    },
  })

  .state('app.signup', {
    url: '/signup',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-signup.html',
        controller: 'RegisterCtrl'
      }
    },
    authStatus: false
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashCtrl'
      }
    },
    authStatus: true
  })

  .state('app.profiles', {
    url: '/profiles',
    views: {
      'menuContent': {
        templateUrl: 'templates/profiles.html',
        controller: 'ProfilesCtrl'
      }
    }
  })

  .state('app.components', {
    url: '/components',
    views: {
      'menuContent': {
        templateUrl: 'templates/components.html',
        controller: 'ComponentsCtrl'
      }
    }
  })

  .state('app.component', {
    url: '/component/:componentId',
    views: {
      'menuContent': {
        templateUrl: 'templates/component.html',
        controller: 'ComponentCtrl'
      }
    }
  })

  .state('app.statistics', {
    url: '/statistics',
    views: {
      'menuContent': {
        templateUrl: 'templates/statistics.html',
        controller: 'StatisticsCtrl'
      }
    }
  })

  .state('app.configuration', {
    url: '/configuration',
    views: {
      'menuContent': {
        templateUrl: 'templates/configuration.html',
        controller: 'ConfigurationCtrl'
      }
    }
  })

  .state('app.graphic-statistics', {
    url: '/graphic-statistics/{componentId}?dateFrom&timeFrom$dateTo&timeTo',
    views: {
      'menuContent': {
        templateUrl: 'templates/graphic-statistics.html',
        controller: 'GraphicStatisticsCtrl'
      }
    }
  })

  .state('app.task', {
    url: '/task',
    views: {
      'menuContent': {
        templateUrl: 'templates/task.html',
        controller: 'TaskCtrl'
      }
    }
  })

  .state('app.tasks', {
    url: '/tasks',
    views: {
      'menuContent': {
        templateUrl: 'templates/tasks.html',
        controller: 'TasksCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile/:profileId',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile-detail.html',
        controller: 'ProfileCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');

});