angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout,  $location, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  //--------------------------------------------
   $scope.login = function($scope, user) {

		if(typeof(user)=='undefined'){
			$scope.showAlert('Completá el usuario y contraseña, por favor.');
			return false;
		}

		if(user.username=='tomson' && user.password=='tomson'){
			$location.path('/app/dashboard');


		}else{
			$scope.showAlert('Error de Usuario o contraseña.');
		}

	};
  //--------------------------------------------
  $scope.logout = function() {   $location.path('/app/login');   };
  //--------------------------------------------
   // An alert dialog
	 $scope.showAlert = function(msg) {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Aviso',
		 template: msg
	   });
	 };
  //--------------------------------------------
})

.controller('ProfilesCtrl', function($scope , Profiles, Sensado, Sensores) {
    $scope.profiles = Profiles.all();
    /*Sensado.all().then(function(response){
        $scope.sensado = response;
    });*/
    $scope.sensado = Sensado.all();
    console.log($scope.sensado);
    console.log("hola");

    $scope.sensores = Sensores.all()
    //console.log($scope.sensado);
})

.controller('ProfileCtrl', function($scope, $stateParams , Profiles) {
	$scope.profile = Profiles.get($stateParams.profileId);
})

.controller('DashCtrl', function($scope, $stateParams , Profiles) {
	$scope.profiles = Profiles.all();
})

.controller("ExampleController", function($scope) {

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

});
