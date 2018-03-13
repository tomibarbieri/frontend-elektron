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
      };
    }
  };
})

.controller('DashCtrl', function($scope, $filter, $websocket, $http, ionicToast) {

      var ip_server = '158.69.223.78';
      var url_server = 'http://158.69.223.78:8000';
      var url_cape = 'http://163.10.33.173:8000';

      $scope.websocketStatus = false;       // estado de la conexion de websocket
      $scope.chart;                         // variable para tener guardado el grafico y refrescarlos
      $scope.current_component;             // componente que filtra los websockets

      // Grafico en tiempo real
      $scope.line = {};
      $scope.line.labels = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];

      $scope.openWebsocketConnection = function() {

        var dataStream = $websocket('ws://' + ip_server +':8888/websocket');

        // 158.69.223.78
        // cambiar ip a la del servior por ejemplo 192.168.0.20
        console.log(dataStream);

        var collection = [];

        dataStream.onError(function functionName() {
          ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
        });

        dataStream.onopen = function() {
          console.log("on open");
          $scope.websocketStatus = true;
          $scope.$apply();
        };

        dataStream.onMessage(function(message) {

          if ($scope.websocketStatus == false) {
            $scope.websocketStatus = true;
            $scope.$apply();
          }

          json = JSON.parse(message.data);

          if ($scope.current_component) {

            console.log("data value mac -> " + json.device_mac);
            console.log("current_component mac -> " + $scope.current_component.device_mac);

            if (json.device_mac == $scope.current_component.device_mac) {
              $scope.line.data[0].shift();
              $scope.line.data[0].push(json.data_value);
            }
          }
        })
      };


      // Obtiene los componentes del servidor
      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/devices/'
      }).then(function(response){
          console.log(response.data);
          $scope.components_server = response.data.devices;
          $scope.components_server_enabled = $filter('filter')($scope.components_server, { enabled: true }, true);
          $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { enabled: false }, true);
          $scope.current_component = $scope.components_server_enabled[0];
          $scope.openWebsocketConnection();
      }, function(response){
          ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
          //show an appropriate message
      });

      // Muestra los primeros 4 componentes de la lista
      $scope.quantity = 4;

      $scope.changeCurrentComponent = function(component) {
        $scope.current_component = component;
      };

      $scope.refreshConnection = function() {
        console.log("refresh");
      }

})

.controller('MonitorCtrl', function($scope, $filter, $websocket, $http, ionicToast) {

      var ip_server = '158.69.223.78';
      var url_server = 'http://158.69.223.78:8000';
      var url_cape = 'http://163.10.33.173:8000';

      $scope.websocketStatus = false;       // estado de la conexion de websocket
      $scope.chart;                         // variable para tener guardado el grafico y refrescarlos
      $scope.current_component;             // componente que filtra los websockets

      // Grafico en tiempo real
      $scope.line = {};
      $scope.line.labels = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];

      var dataStream = $websocket('ws://' + ip_server +':8888/websocket');

      // 158.69.223.78
      // cambiar ip a la del servior por ejemplo 192.168.0.20
      console.log(dataStream);
      var collection = [];

      dataStream.onError(function functionName() {
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
      });

      dataStream.onopen = function() {
        console.log("on open");
        $scope.websocketStatus = true;
        $scope.$apply();
      };

      dataStream.onMessage(function(message) {

        if ($scope.websocketStatus == false) {
          $scope.websocketStatus = true;
          $scope.$apply();
        }

        json = JSON.parse(message.data);
        console.log("data value mac -> " + json.device_mac);
        console.log("current_component mac -> " + $scope.current_component.device_mac);

        if (json.device_mac == $scope.current_component.device_mac) {
          $scope.line.data[0].shift();
          $scope.line.data[0].push(json.data_value);
        }

      });


      // Obtiene los componentes del servidor
      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/devices/'
      }).then(function(response){
          console.log(response.data);
          $scope.components_server = response.data.devices;
          $scope.components_server_enabled = $filter('filter')($scope.components_server, { enabled: true }, true);
          $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { enabled: false }, true);
          $scope.current_component = $scope.components_server_enabled[0];
          console.log($scope.components_server[0].label);
      }, function(response){
          ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
          //show an appropriate message
      });

      // Muestra los primeros 4 componentes de la lista
      $scope.quantity = 4;

      $scope.changeCurrentComponent = function(component) {
        $scope.current_component = component;
      };

      $scope.refreshConnection = function() {
        console.log("refresh");
      }

})

.controller('TaskCtrl', function($scope, $location) {

})

.controller('TasksCtrl', function($scope, $http) {

  $scope.datatasks_server = [];
  $scope.datetimetasks_server = [];
  $scope.porconsumo = true;

  var url_server = 'http://158.69.223.78:8000';
  //var url_server = 'http://192.168.0.21:8000';

  $scope.getDataTasks = function() {
    $http({
        method:'GET',
        url: url_server + '/tasks/datatasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datatasks_server = response.data.datatasks;
        console.log($scope.datatasks_server);
    }, function(response){
        console.log("problemas de conexion");
        Notifier.simpleError("Error de conexión","No se pudo traer la informacion de las tareas del servidor");

    });
  }

  $scope.getDateTimeTasks = function() {
    $http({
        method:'GET',
        url: url_server + '/tasks/datetimetasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datetimetasks_server = response.data.datetimetasks;
        console.log($scope.datetimetasks_server);
    }, function(response){
        console.log("problemas de conexion");
    });
  }

  $scope.changeToDate = function() {
    $scope.porconsumo = false;
  }

  $scope.changeToConsume = function() {
    $scope.porconsumo = true;
  }

  $scope.getDataTasks();
  $scope.getDateTimeTasks();

})

.controller('ComponentsCtrl', function($scope, $websocket, $http, ionicToast) {

    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        console.log($scope.components_server[0].label);
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });


})

.controller('ComponentCtrl', function($scope, $stateParams, $http, ionicToast) {

    $scope.line = {};
    $scope.line.labels = ["E", "L", "E", "K", "T", "R", "O", "N", "0", "7"];
    $scope.line.series = ['Potencia'];//, 'Corriente'];
    $scope.line.data = [
      [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
      //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
    ];

    $scope.componentId = $stateParams.componentId;

    var url_data = 'http://158.69.223.78:8000/devices/' + $scope.componentId + '/data';

    $http({
        method:'GET',
        url: url_data
    }).then(function(response){
        console.log(response.data);
        $scope.component_data = response.data.data;
        if ($scope.component_data.length != 0) {
          $scope.last_data = $scope.component_data[$scope.component_data.length - 1].data_value;
        } else {
          $scope.last_data = 0;
        }
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });

    var url_device = 'http://158.69.223.78:8000/devices/' + $scope.componentId + '/'

    $http({
        method:'GET',
        url: url_device
    }).then(function(response){
        console.log(response.data);
        $scope.component_server = response.data.device;
        if ($scope.component_server.length != 0) {
          $scope.component_status = ($scope.component_server.devicestate.name == 'on')
        }
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });

    $scope.changeStatus = function() {
      $scope.component_status = !$scope.component_status;
    }


})

.controller('ConfigurationCtrl', function($scope) {

})

.controller('StatisticsCtrl', function($scope, $http, $filter, ionicToast) {

  $scope.listado = true;
  var url_server = 'http://158.69.223.78:8000';

  $http({
      method:'GET',
      url: url_server + '/devices/statistics'
  }).then(function(response){
      console.log(response.data);
      $scope.components_server = response.data.devices;
      $scope.createDoughnutChart();
      $scope.createBarChart();
      console.log($scope.components_server[0].device.label);
  }, function(response){
      ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
      //show an appropriate message
  })

  $http({
      method:'GET',
      url: url_server + '/devices/'
  }).then(function(response){
      console.log(response.data);
      $scope.components_totales = response.data.devices;
  }, function(response){
      ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
      //show an appropriate message
  })

  $scope.changeToCharts = function() {
    $scope.listado = false;
  }

  $scope.changeToList = function() {
    $scope.listado = true;
  }


  $scope.doughnut;
  $scope.bar;
  $scope.barOptions = {};

  $scope.$on('chart-create', function (evt, chart) {
    console.log(chart);
    console.log(chart.config.type);
    console.log(chart.config.data);
    if (chart.config.type == 'doughnut') {
      $scope.doughnut = chart;
    }
    else {
      $scope.bar = chart;
    }
  });

  $scope.doughnutlabels = [];
  $scope.doughnutdata = [];

  $scope.barlabels = [];
  $scope.barseries = [];
  $scope.bardata = [[],[]];

  $scope.barPrecision = [{
    'id': 0,
    'label': 'Por día',
    'url': 'perday'
  }, {
    'id': 1,
    'label': 'Por hora',
    'url': 'perhour'
  }, {
    'id': 2,
    'label': 'Cada 5 seg',
    'url': 'normal'
  }];

  $scope.currentPrecision = {
    'id': 0,
    'label': 'Por día',
    'url': 'perday'
  };

  $scope.createDoughnutChart = function() {
    for (var i = 0; i < $scope.components_server.length; i++) {
      $scope.doughnutlabels.push($scope.components_server[i].device.label);
      $scope.doughnutdata.push(Math.floor((Math.random() * 100) + 1));
    }
  }

  $scope.changeCriteria = function() {
    //var selected = $filter('filter')($scope.barPrecision, {id: id_selected});
    //var selectedPrecision = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';

    console.log($scope.barOptions.precisionSelected);

    //$scope.currentPrecision = selectedPrecision;

    //$scope.barlabels = [];

    //$scope.getComponentData('left',$scope.currentBarLeft);
    //$scope.getComponentData('right',$scope.currentBarRigth);

  }

  $scope.changeBarComponents = function(){
    console.log($scope.barOptions.componentLeft);
    console.log($scope.barOptions.componentRight);
    console.log($scope.barOptions.precisionSelected);
  }

  $scope.changeLeftBarComponent = function() {
    console.log($scope.barOptions.componentLeft);
    //$scope.changeBarComponent(id,'left');
  }

  $scope.changeRigthBarComponent = function() {
    console.log($scope.barOptions.componentLeft);
    //$scope.changeBarComponent(id,'right');
  }

  $scope.changeBarComponent = function(id_selected, side) {
    var selected = $filter('filter')($scope.components_server, {id: id_selected});
    var selectedComponent = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';

    $scope.getComponentData(side,selectedComponent);

    if (side == 'left') {
      $scope.currentBarLeft = selectedComponent;
      $scope.barseries[0] = $scope.currentBarLeft.label;
    }
    else {
      $scope.currentBarRigth = selectedComponent;
      $scope.barseries[1] = $scope.currentBarRigth.label;
    }
    console.log($scope.barseries);
  }

  $scope.getComponentData = function(side, component) {

    var c = component;

    $http({
        method:'GET',
        url: url_server + '/devices/' + c.id + '/data/' + $scope.currentPrecision.url // modificar la URL /devices/id/data/perhour
    }).then(function(response){
        console.log(response.data.data);
        //$scope.components_server = response.data.devices;
        //Notifier.simpleSuccess('Tabla comparativa','Datos cargados con exito para el componente');
        $scope.graficateComponentBar(response.data.data, side);

    }, function(response){
        console.log("problemas de conexion");
        //Notifier.simpleError("Tabla comparativa - Error","No se pudo traer la informacion del componente por problemas de conexión");
    });
  }

  $scope.graficateComponentBar = function(data, side) {

    if ($scope.barlabels.length == 0) {
      console.log('preparando footer');
      for (var i = 6; i > 0; i--) {
        var time;
        if ($scope.currentPrecision.url == 'perday') {
          time = $filter('date')(data[i].date, 'shortDate');
        } else {
          if ($scope.currentPrecision.url == 'perhour') {
            time = $filter('date')(data[i].date, 'shortTime')
          } else {
            console.log('chicharitoo');
          }
        }
        $scope.barlabels.push(time);
      }
    }

    if (side == 'left') {
      console.log('izquierda');
      $scope.bardata[0] = [];
      for (var i = 6; i > 0; i--) {
        if (data[i].data_value == null) {
          $scope.bardata[0].push(0);
        } else {
          $scope.bardata[0].push(data[i].data_value);
        }
      }
    } else {
      console.log('derecha');
      $scope.bardata[1] = [];

      for (var i = 6; i > 0; i--) {
        if (data[i].data_value == null) {
          $scope.bardata[1].push(0);
        } else {
          $scope.bardata[1].push(data[i].data_value);
        }
      }
    }

  }

  $scope.createBarChart = function() {
    $scope.currentBarLeft = $scope.components_server[0].device;
    $scope.currentBarRigth = $scope.components_server[0].device;

    $scope.barseries = [$scope.currentBarLeft.label, $scope.currentBarRigth.label];

    $scope.getComponentData('left',$scope.currentBarLeft)
    $scope.getComponentData('rigth',$scope.currentBarRigth)

  }




})

.controller('HistoryCtrl', function($scope, $http) {

  $http({
      method:'GET',
      url:'http://158.69.223.78:8000/devices/'
  }).then(function(response){
      console.log(response.data);
      $scope.components_server = response.data.devices;
      console.log($scope.components_server[0].label);
  }, function(response){
      ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
      //show an appropriate message
  });

})

.controller('GraphicStatisticsCtrl', function($scope, $stateParams, $http, $filter, ionicToast) {

    console.log($stateParams.componentId);
    $scope.componentId = $stateParams.componentId;
    $scope.dateFrom = new Date($stateParams.dateFrom);
    $scope.timeFrom = new Date($stateParams.timeFrom);
    $scope.dateTo = new Date($stateParams.dateTo);
    $scope.timeTo = new Date($stateParams.timeTo);

    // aca va la consulta ajax al servidor por el consumo de ese periodo

    // armando la url
    var id = $scope.componentId;
    var from = $filter('date')($scope.dateFrom, 'ddMMyy');
    var to = $filter('date')($scope.dateTo, 'ddMMyy');

    var date = $filter('date')($scope.dateFrom, 'shortDate');

    console.log("formateddate");
    console.log(date);

    // Otra forma de armar el date
    var dateObj = $scope.dateFrom;

    var month = '0'+ (dateObj.getUTCMonth() + 1); //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    var dateF = day + "/" + month + "/" + year;

    var dateObj = $scope.dateTo;

    var month = '0'+ (dateObj.getUTCMonth() + 1); //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    var dateT = day + "/" + month + "/" + year;


    var url = 'http://158.69.223.78:8000/devices/' + 9 + '/data/' + dateF + '/' + dateT;

    console.log(url);

    $http({
        method:'GET',
        url: url
    }).then(function(response){
        console.log(response.data);
        $scope.statistic = response.data;
    }, function(response){
        console.log("problemas");
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });

    // Fin de consulta

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
