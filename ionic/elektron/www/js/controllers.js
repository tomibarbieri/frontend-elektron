angular.module('starter.controllers', ['angular-websocket','chart.js'])

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

    //var dataStream = $websocket('ws://localhost:8888/websocket');
    console.log("Log");

    $scope.login = function(user) {

      /*dataStream.onMessage(function(message) {

        console.log("puto000000");
        console.log(message.data);
        if (message.data == "piola"){
          $location.path('/app/dashboard');
          //$scope.showAlert('Logueado.');
        }else{
          console.log("So malisimooooo");
        };
        */

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
      //});

      //dataStream.send({username:user.username, password:user.password});

      console.log("Press Login");
      console.log(user);
      if(typeof(user)=='undefined'){
      	$scope.showAlert('Completá el usuario y contraseña, por favor.');
      	return false;
      };
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

      // Hace una validacion hardcodeada del usuario y contraseña
      if(user.username=='tomson' && user.password=='tomson'){
 			  $location.path('/app/dashboard');
      }else{
        console.log("Failed in password or username");
 			  $scope.showAlert('Error de Usuario o contraseña.');
 		  };

    };
})

//
.controller('RegisterCtrl', function($scope, $location) {
      // hacer la funcion que valida el registro de usuarios
})

.controller('ComponentsCtrl', function($scope) {

    $scope.components = [{
      id: 1,
      label: "Heladera",
      ip: "192.168.0.1",
      data: 34
    },{
      id: 2,
      label: "Lavarropas",
      ip: "192.168.0.2",
      data: 66
    },{
      id: 3,
      label: "Microondas",
      ip: "192.168.0.3",
      data: 43
    },{
      id: 4,
      label: "Computadora",
      ip: "192.168.0.4",
      data: 56
    },{
      id: 5,
      label: "Termotanque",
      ip: "192.168.0.5",
      data: 99
    },{
      id: 6,
      label: "Luces",
      ip: "192.168.0.6",
      data: 134
    }];

})

.controller('ComponentCtrl', function($scope, $stateParams, $websocket) {

    var dataStream = $websocket('ws://localhost:8888/websocket'); // cambiar ip a la del servior por ejemplo 192.168.0.20
    console.log(dataStream);
    var collection = [];
    $scope.data = 0;

    dataStream.onMessage(function(message) {
      //console.log("puto")
      //console.log(message.data)
      json = JSON.parse(message.data);

      console.log(json.data);

      $scope.line.data[0].shift();
      $scope.line.data[0].push(json.data);
      $scope.data = json.data;


    });
    var components = [{
      id: 1,
      label: "Heladera",
      ip: "192.168.0.1",
      data: 34
    },{
      id: 2,
      label: "Lavarropas",
      ip: "192.168.0.2",
      data: 66
    },{
      id: 3,
      label: "Microondas",
      ip: "192.168.0.3",
      data: 43
    },{
      id: 4,
      label: "Computadora",
      ip: "192.168.0.4",
      data: 56
    },{
      id: 5,
      label: "Termotanque",
      ip: "192.168.0.5",
      data: 99
    },{
      id: 6,
      label: "Luces",
      ip: "192.168.0.6",
      data: 134
    }];
    $scope.line = {};
    $scope.line.labels = ["E", "L", "E", "K", "T", "R", "O", "N", "0", "7"];
    $scope.line.series = ['Potencia'];//, 'Corriente'];
    $scope.line.data = [
      [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
      //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
    ];

    $scope.componentId = $stateParams.componentId;
    $scope.component = components[$scope.componentId-1];


})

.controller('ProfilesCtrl', function($scope) {
    //$scope.profiles = Profiles.all();
    /*Sensado.all().then(function(response){
        $scope.sensado = response;
    });*/
    //$scope.sensado = Sensado.all();
    //console.log($scope.sensado);
    //console.log("hola");

    //$scope.sensores = Sensores.all()
    //console.log($scope.sensado);

})

.controller('ProfileCtrl', function($scope, $stateParams , Profiles) {
	$scope.profile = Profiles.get($stateParams.profileId);
})

.controller('DashCtrl', function($scope, $websocket) {
	//$scope.profiles = Profiles.all();

      var dataStream = $websocket('ws://localhost:8888/websocket'); // cambiar ip a la del servior por ejemplo 192.168.0.20
      console.log(dataStream);
      var collection = [];
      $scope.heladera = 33;
      $scope.lavarropas = 0;
      $scope.aire = 146;

      dataStream.onMessage(function(message) {
        //console.log("puto")
        //console.log(message.data)
        json = JSON.parse(message.data);

        console.log(json.data);

        $scope.line.data[0].shift();
        $scope.line.data[0].push(json.data);
        $scope.heladera = json.data;
        $scope.lavarropas = json.data;
        $scope.aire = json.data;

        //$scope.line.data[1].shift();
        //$scope.line.data[1].push(json.corriente);

        //var date = new Date(json.timestamp*1000);
        //date = date.toTimeString().split(' ')[0];
        //$scope.line.labels.shift();
        //$scope.line.labels.push(date);

        //console.log(json);
        //collection.push(JSON.parse(message.data));
      });

      // Aca los datos para el grafico lineal

     /*  $scope.bar = {};
      $scope.bar.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
      $scope.bar.series = ['Series A', 'Series B'];

      $scope.bar.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];*/

      // Aca los datos para el grafico lineal

      $scope.line = {};
      $scope.line.labels = ["E", "L", "E", "K", "T", "R", "O", "N", "0", "7"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];
})

.controller('StaticsCtrl', function($scope, $websocket) {
	//$scope.profiles = Profiles.all();

  /*
      var dataStream = $websocket('ws://localhost:8888/websocket'); // cambiar ip a la del servior por ejemplo 192.168.0.20
      console.log(dataStream);
      var collection = [];


      dataStream.onMessage(function(message) {
        //console.log("puto")
        //console.log(message.data)
        json = JSON.parse(message.data);

        console.log(json.data);

        $scope.line.data[0].shift();
        $scope.line.data[0].push(json.data);

      });
      */

      $scope.line = {};
      $scope.line.labels = ["E", "L", "E", "K", "T", "R", "O", "N", "0", "7"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 40, 45, 45, 50, 60, 60, 55, 44, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];
})

.controller("ExampleController", function($scope) {

/*    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
*/
});
