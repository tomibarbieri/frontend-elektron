angular.module('starter.controllers', ['angular-websocket'])

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

.controller('LoginCtrl', function($scope, $location, $http, $websocket) {

    var dataStream = $websocket('ws://192.168.43.125:8888/websocket');
    console.log("Dale pepe");

    $scope.login = function(user) {

      dataStream.onMessage(function(message) {

        console.log("puto000000");
        console.log(message.data);
        if (message.data == "piola"){
          $location.path('/app/dashboard');
          //$scope.showAlert('Logueado.');
        }else{
          console.log("So malisimooooo");
        };

        /*
        json = JSON.parse(message.data);

        $scope.line.data[0].shift();
        $scope.line.data[0].push(json.potencia);

        $scope.line.data[1].shift();
        $scope.line.data[1].push(json.corriente);

        var date = new Date(json.timestamp*1000);
        date = date.toTimeString().split(' ')[0];
        //$scope.line.labels.shift();
        //$scope.line.labels.push(date);

        console.log(json);*/
        //collection.push(JSON.parse(message.data));
      });

      dataStream.send({username:user.username, password:user.password});

      console.log("Press Login");
      console.log(user);
      if(typeof(user)=='undefined'){
      	$scope.showAlert('Completá el usuario y contraseña, por favor.');
      	return false;
        }
      //Ajax al servidor para validar usuario y contraseña
      /*data = { username:'Evita', password:'Montonera'};
      $http({
        method: 'POST',
        url: 'http://192.168.43.125:5000/login',
        params: data
      }).then(function successCallback(response) {
          // this callback will be called asynchronously
          // when the response is available
          console.log(response.status);
          console.log("todo bien");
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log(response.status);
          console.log("todo mal");
        });

        $http.post('http://192.168.43.125:5000/login', data).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(response.status);
            console.log("todo bien");
          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response.status);
            console.log("todo mal");
          });*/

      /*$http.post("http://192.168.43.125:5000/login").success( function(response) {
        console.log(response);
        console.log("Entré, eameo.");
      });*/

      /*if(user.username=='tomson' && user.password=='tomson'){
 			  $location.path('/app/dashboard');
      }else{
        console.log("Failed in password or username");
 			  $scope.showAlert('Error de Usuario o contraseña.');
 		  }*/

    };
})

//
.controller('RegisterCtrl', function($scope, $location) {
      // hacer la funcion que valida el registro de usuarios
})

.controller('ComponentsCtrl', function($scope) {

    $scope.components = "Todos los componentes";

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
