angular.module('starter.controllers', ['angular-websocket','chart.js','ion-datetime-picker','ionic-toast'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout,  $location, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  $scope.logout = function() {   $location.path('/app/login');   };

   // An alert dialog
	 $scope.showAlert = function(msg) {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Aviso',
		 template: msg
	   });
	 };
})

.controller('LoginCtrl', function($scope, $location, $http, $websocket, LoginService) {
    $scope.login = function(user) {
      if(typeof(user)=='undefined'){
        $scope.showAlert('Completá el usuario y contraseña, por favor.');
        return false;
      };
      if(LoginService.login(user.username, user.password)){
        $location.path('/app/dashboard');
      } else {
        console.log("Failed in password or username");
        $scope.showAlert('Error de Usuario o contraseña.');
      }
    };
})

.controller('LogoutCtrl', function($scope, LoginService, $location) {
    LoginService.logout();
    console.log("entro");
    setTimeout(function(){ $location.path('/app/login'); }, 1500);
})

.controller('RegisterCtrl', function($scope) {
  $scope.register = function(user) {
    if(typeof(user)=='undefined'){
      $scope.showAlert('Completá los campos, por favor.');
      return false;
    }else {
      if (user.password != user.password2) {
        $scope.showAlert('Las contraseñas no coinciden.');
      }
      else {
        console.log(user);
      }
    }
  };
})

.controller('DashCtrl', function($scope, $websocket, ionicToast) {

      var dataStream = $websocket('ws://localhost:8888/websocket');

      /*
      $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
              console.log("The toast was shown");
          }, function (error) {
              console.log("The toast was not shown due to " + error);
        });
      }
      */

      // cambiar ip a la del servior por ejemplo 192.168.0.20
      console.log(dataStream);
      var collection = [];
      $scope.heladera = 33;
      $scope.lavarropas = 0;
      $scope.aire = 146;

      dataStream.onError(function functionName() {
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
      });

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
      $scope.line.labels = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];
})

.controller('TaskCtrl', function($scope, $location) {

})

.controller('TasksCtrl', function($scope, $location) {
  $scope.tasks = [
    {
      id: 1,
      label: "Apagar heladera",
      component: "Heladera",
      date: new Date(),
      data: 34
    },
    {
      id: 1,
      label: "Endender Microondas",
      component: "Microondas",
      date: new Date(),
      data: 35
    }
  ];
})

.controller('ComponentsCtrl', function($scope, $websocket) {
    // aca va la consulta ajax al servidor para traer los datos de los componentes
    var dataStream = $websocket('ws://localhost:8888/websocket'); // cambiar ip a la del servior por ejemplo 192.168.0.20
    console.log(dataStream);
    var collection = [];
    $scope.data = 0;

    dataStream.onMessage(function(message) {
      //console.log(message.data)
      json = JSON.parse(message.data);
      console.log(json.data);
      $scope.data = json.data;
    });

    // Pedir con ajax la lista de componentes
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

.controller('ComponentCtrl', function($scope, $stateParams) {

    // Pedir con ajax el componente que viene por parametro
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

.controller('ConfigurationCtrl', function($scope) {

})

.controller('StatisticsCtrl', function($scope) {

    // aca va la consulta ajax al servidor para traer los datos de los componentes (ids y labels)

})

.controller('GraphicStatisticsCtrl', function($scope, $stateParams) {

    $scope.componentId = $stateParams.componentId;
    $scope.dateFrom = new Date($stateParams.dateFrom);
    $scope.timeFrom = new Date($stateParams.timeFrom);
    $scope.dateTo = new Date($stateParams.dateTo);
    $scope.timeTo = new Date($stateParams.timeTo);

    // aca va la consulta ajax al servidor por el consumo de ese periodo

    console.log($scope.componentId);
    console.log($scope.dateFrom);
    console.log($scope.timeFrom);
    console.log($scope.dateTo);
    console.log($scope.timeTo);

    $scope.line = {};
    $scope.line.labels = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"];
    $scope.line.series = ['Potencia'];//, 'Corriente'];
    $scope.line.data = [
      [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
      //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
    ];
});
