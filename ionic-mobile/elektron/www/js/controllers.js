angular.module('starter.controllers', ['angular-websocket','chart.js','ion-datetime-picker','ionic-toast','ionic'])

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
      $scope.websocket;

      // Muestra los primeros 4 componentes de la lista
      $scope.quantity = 4;

      $scope.refreshConnection = function() {
        console.log("refresh");
        if ($scope.websocketStatus == false) {
          $scope.websocket.close();
        }
        $scope.openWebsocketConnection();
      }

      // Grafico en tiempo real

      // Funcion para asociar la creacion del chart y guardar la variable
      $scope.$on('chart-create', function (evt, chart) {
        $scope.chart = chart;
      });

      $scope.line = {};
      $scope.line.labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      $scope.line.series = ['Potencia'];//, 'Corriente'];
      $scope.line.data = [
        [40, 50, 30, 70, 0, 30, 40, 30, 50, 40]//,
        //[28, 48, 40, 19, 86, 27, 90, 45, 24, 87]
      ];

      $scope.changeCurrentComponent = function(component) {
        $scope.current_component = component;
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

          $scope.loadInitialData();
          $scope.openWebsocketConnection();

      }, function(response){
          ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
          //show an appropriate message
      });

      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/data/totalwattstaxco2'
      }).then(function(response){
          console.log(response.data);
          $scope.general_data = response.data;
      }, function(response){
          //show an appropriate message
      });

      // function para cargar la informacion del 1er componente
      $scope.loadInitialData = function() {
        $http({
              method:'GET',
              url: url_server + '/devices/' + $scope.current_component.id + '/lastdata/10/'
          }).then(function(response){

              console.log(response.data.data);

              if (response.data.data.length > 0) {
                //ionicToast.show('Datos cargados. Los datos para el componente '+ $scope.current_component.label + ' fueron cargados con exito', 'bottom', false, 8000);
                $scope.graficate(response.data.data);
              } else {
                ionicToast.show('No hay datos. No hay datos para el componente seleccionado', 'bottom', false, 8000);
              }

          }, function(response){
              console.log("problemas de conexion");
              ionicToast.show('Error de conexión con el servidor. Se ha detectado un error de la conexion al buscar la información', 'bottom', false, 8000);
        });
      }

      $scope.graficate = function(data) {
        $scope.line = {};

        var data_sense = data;
        var inicio = (data_sense.length >= 10) ? (data_sense.length - 10) : (0);
        var fin = data_sense.length;

        console.log(inicio,fin);

        $scope.line.series = ['Potencia'];

        $scope.line.labels = [];
        $scope.line.data = [[]];

        for (var i = inicio; i < fin; i++) {

          var hora = $filter('date')(data_sense[i].date, "HH:mm");
          var dia = $filter('date')(data_sense[i].date, 'dd');
          var mes = $filter('date')(data_sense[i].date, 'MM');

          //var label = '(' + dia + '/' + mes + ') ' + hora;
          var label = '' + hora;
          var data = data_sense[i].data_value;

          $scope.line.labels.push(label);
          $scope.line.data[0].push(data);
        }
      }

      $scope.openWebsocketConnection = function() {

        $scope.websocket = $websocket('ws://' + ip_server +':8888/websocket');

        console.log($scope.websocket);

        var collection = [];

        $scope.websocket.onError(function functionName() {
          ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
        });

        $scope.websocket.onopen = function() {
          console.log("on open");
          ionicToast.show('Conexion en tiempo real iniciada', 'bottom', false, 8000);
          $scope.websocketStatus = true;
          $scope.$apply();
        };

        $scope.websocket.onMessage(function(message) {

          if ($scope.websocketStatus == false) {
            $scope.websocketStatus = true;
            $scope.$apply();
          }

          json = JSON.parse(message.data);
          console.log(json);

          if ($scope.current_component) {

            console.log("data value mac -> " + json.device_mac);
            console.log("current_component mac -> " + $scope.current_component.device_mac);

            if (json.device_mac == $scope.current_component.device_mac) {

              var hora = $filter('date')(json.date, "HH:mm");
              var label = '' + hora;
              $scope.line.labels.shift();
              $scope.line.labels.push(label);

              $scope.line.data[0].shift();
              $scope.line.data[0].push(json.data_value);
            }
          }
        })
      };


})

.controller('MonitorCtrl', function($scope, $filter, $websocket, $http, ionicToast) {

      var ip_server = '158.69.223.78';
      var url_server = 'http://158.69.223.78:8000';
      var url_cape = 'http://163.10.33.173:8000';

      $scope.websocketStatus = false;       // estado de la conexion de websocket
      $scope.current_component;             // componente que filtra los websockets
      $scope.websocket;

      $scope.charts = [];

      // Obtiene los componentes del servidor
      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/devices/'
        }).then(function(response){
            console.log(response.data);
            $scope.components_server = response.data.devices;
            $scope.components_server_enabled = $filter('filter')($scope.components_server, { enabled: true }, true);
            $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { enabled: false }, true);

            var label = $filter('date')(new Date(), "HH:mm");
            $scope.line = {}
            for (var component in $scope.components_server_enabled) {
              $scope.line[$scope.components_server_enabled[component].device_mac] = {
                                                                            'series': ['Potencia'],
                                                                            'labels': [label, label, label, label, label, label, label, label, label, label],
                                                                            'data': [[0,0,0,0,0,0,0,0,0,0]],
                                                                            'status': false
                                                                          };
            }

            $scope.loadWebsocket();

        }, function(response){
            ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
      });

      $scope.refreshConnection = function() {
        console.log("refresh");
      }

      $scope.$on('chart-create', function (evt, chart) {
        if ($scope.components_server_enabled) {
          if ($scope.charts.length < $scope.components_server_enabled.length) {
            $scope.charts.push(chart);
            console.log('nuevo chart');
            console.log(chart);
            console.log($scope.charts);
            console.log($scope.charts.length);
            console.log($scope.components_server_enabled.length);
          }
        } else {
          console.log("no llegaron los components_server_enabled");
          //$scope.charts.push(chart);
        }
      });

      $scope.loadWebsocket = function() {

        $scope.websocket = $websocket('ws://' + ip_server +':8888/websocket');
        console.log($scope.websocket);

        $scope.websocket.onError(function functionName() {
          ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
        });

        $scope.websocket.onopen = function() {
          console.log("on open");
          $scope.websocketStatus = true;
          $scope.$apply();
        };

        $scope.websocket.onMessage(function(message) {

          if ($scope.websocketStatus == false) {
            $scope.websocketStatus = true;
            $scope.$apply();
          }

          json = JSON.parse(message.data);
          console.log(json);

          var current_mac = json.device_mac;

          $scope.line[current_mac].data[0].splice(0,1);
          $scope.line[current_mac].data[0].push(json.data_value);

          $scope.line[current_mac].status = true;

          $scope.line[current_mac].labels.splice(0,1);
          var date = new Date(json.data_datetime);
          console.log(date);
          $scope.line[current_mac].labels.push($filter('date')(date, "HH:mm"));

          if ($scope.charts) {
              for (var i = 0; i < $scope.charts.length; i++) {
                console.log('antes update');
                $scope.charts[i].update();
                console.log('despues update');
              }
              console.log('antes apply');
              $scope.$apply();
              console.log('despues apply');
          };
        });
      }
})

.controller('DatataskCtrl', function($scope, $location, $filter, $http, $state, $stateParams, $httpParamSerializerJQLike) {

  var url_server = 'http://158.69.223.78:8000';

  $scope.loadParams = function () {
    if ($stateParams.task) {
      if ($stateParams.task != "") {
        console.log($stateParams.task);
        var task = angular.fromJson($stateParams.task);
        //console.log("editar");

        //$scope.task = task;
        $scope.task = {
            'state': task.taskstate.id + '',
            'function': task.taskfunction.id + '',
            'label': task.label,
            'description': task.description,
            'owner':'root',
            'repeats': task.repeats,
            'data_value': task.data_value,
            'comparator': task.comparator,
            'device_mac': task.device.device_mac
          }

        $scope.editDataTaskId = task.id;

        console.log($scope.task);

        $scope.editButton = true;
        $scope.datatasktitle = "Editar tarea por consumo";
      }
      else {
        console.log("nuevo");
        $scope.task = {};
        $scope.editButton = false;
        $scope.datatasktitle = "Agregar tarea por consumo";
      }
    }
  }


  $http({
      method:'GET',
      url:'http://158.69.223.78:8000/devices/'
  }).then(function(response){
      console.log(response.data);
      $scope.components_server = response.data.devices;
      $scope.loadParams();
  }, function(response){
      ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
      //show an appropriate message
  });

  $scope.editDataTask = function (task) {
    console.log(task);
  }

  $scope.addDataTask = function(task) {
    console.log(task);

    var data_params = {
      'taskstate': task.state,
      'taskfunction': task.function,
      'label': task.label,
      'description': task.description,
      'owner':'root',
      'repeats': task.repeats,
      'data_value': task.data_value,
      'comparator': task.comparator,
      'device_mac': task.device_mac
    }

    console.log(data_params);
    var url_task = url_server + "/tasks/datatasks/create";

    $http({
        method:'POST',
        url: url_task,
        data: $httpParamSerializerJQLike(data_params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response.data);
        $state.go( "app.tasks" );
    }, function(response){
        console.log("problemas de conexion");
    });
  }

  $scope.editDataTask = function(task) {

    var data_params = {
      'taskstate': task.state,
      'taskfunction': task.function,
      'label': task.label,
      'description': task.description,
      'owner':'root',
      'repeats': task.repeats,
      'data_value': task.data_value,
      'comparator': task.comparator,
      'device_mac': task.device_mac
    }

    var url_task = url_server + "/tasks/datatasks/" + $scope.editDataTaskId + "/update";
    console.log(url_task);
    console.log(data_params);

    $http({
        method:'POST',
        url: url_task,
        data: $httpParamSerializerJQLike(data_params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response.data);
    }, function(response){
        console.log("problemas de conexion");
    });
  }

})

.controller('DatetimetaskCtrl', function($scope, $location, $filter, $http, $state, $stateParams, ionicToast, $httpParamSerializerJQLike) {

  var url_server = 'http://158.69.223.78:8000';

  $scope.loadParams = function () {
    if ($stateParams.task) {
      if ($stateParams.task != "") {
        //console.log($stateParams.task);
        var task = angular.fromJson($stateParams.task);
        console.log(task);

        //$scope.task = task;
        $scope.task = {
            'state': task.taskstate.id,
            'function': task.taskfunction.id,
            'label': task.label,
            'description': task.description,
            'owner':'root',
            'repeats': task.repeats,
            'date': task.datetime,
            'criteria': task.repeat_criteria,
            'device_mac': task.device.device_mac
          }

        $scope.editDateTimeTaskId = task.id;

        console.log($scope.task);

        $scope.editButton = true;
        $scope.datatasktitle = "Editar tarea por fecha y hora";
      }
      else {
        console.log("nuevo");
        $scope.task = {};
        $scope.editButton = false;
        $scope.datatasktitle = "Agregar tarea por fecha y hora";
      }
    }else {
      console.log("nuevo");
      $scope.task = {};
      $scope.editButton = false;
      $scope.datatasktitle = "Agregar tarea por fecha y hora";
    }
  }

  $http({
      method:'GET',
      url:'http://158.69.223.78:8000/devices/'
  }).then(function(response){
      console.log(response.data);
      $scope.components_server = response.data.devices;
      $scope.loadParams();
      console.log($scope.components_server[0].label);
  }, function(response){
      ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
  });

  $scope.addDateTimeTask = function (task) {

    console.log(task);

    var data_params = {
      'taskstate': task.state,
      'taskfunction': task.function,
      'label': task.label,
      'description': task.description,
      'owner':'root',
      'repeats': task.repeats,
      'repeat_criteria': task.criteria,
      'datetime': task.date.toUTCString(),
      'device_mac': task.device_mac
    }

    var url_task = url_server + "/tasks/datetimetasks/create";

    $http({
        method:'POST',
        url: url_task,
        data: $httpParamSerializerJQLike(data_params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response.data);
    }, function(response){
        console.log("problemas de conexion");
    });
  }

  $scope.editDateTimeTask = function(task) {

    var data_params = {
      'taskstate': task.state,
      'taskfunction': task.function,
      'label': task.label,
      'description': task.description,
      'owner':'root',
      'repeats': task.repeats,
      'datetime': task.date.toUTCString(),
      'repeat_criteria': task.criteria,
      'device_mac': task.device_mac
    }

    var url_task = url_server + "/tasks/datetimetasks/" + $scope.editDateTimeTaskId + "/update";
    console.log(url_task);
    console.log(data_params);

    $http({
        method:'POST',
        url: url_task,
        data: $httpParamSerializerJQLike(data_params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response.data);
    }, function(response){
        console.log("problemas de conexion");
    });
  }

})

.controller('TasksCtrl', function($scope, $http, $state, $ionicPopup) {

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
        //console.log(response.data);
        $scope.datatasks_server = response.data.datatasks;
        //console.log($scope.datatasks_server);
    }, function(response){
        //console.log("problemas de conexion");
    });
  }

  $scope.getDateTimeTasks = function() {
    $http({
        method:'GET',
        url: url_server + '/tasks/datetimetasks'
    }).then(function(response){
        //console.log(response.data);
        $scope.datetimetasks_server = response.data.datetimetasks;
        //console.log($scope.datetimetasks_server);
    }, function(response){
        //console.log("problemas de conexion");
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

  // A confirm dialog
  $scope.deleteTask = function(id,type) {
    console.log(id);
    var confirmPopup = $ionicPopup.confirm({
      title: 'Borrar tarea',
      template: '¿Estas seguro de borrar la tarea?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        var url_task = url_server + "/tasks/" + type + "/" + id + "/remove";
        //console.log(url_task);
        $http({
           method:'GET',
           url: url_task
         }).then(function(response){
             //console.log(response.data);
             $scope.getDataTasks();
             $scope.getDateTimeTasks();
         }, function(response){
             console.log("problemas de conexion");
         });
      } else {
        console.log('cancelado');
      }
    });
  };

  $scope.editDataTask = function(tasky) {
    console.log(tasky);
    var t = angular.toJson(tasky);
    $state.go("app.datatask", { 'task' : t});
  }

  $scope.editDateTimeTask = function(tasky) {
    console.log(tasky);
    var t = angular.toJson(tasky);
    $state.go("app.datetimetask", { 'task' : t});
  }

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

.controller('ComponentCtrl', function($scope, $stateParams, $http, $filter, $ionicModal, $httpParamSerializerJQLike, ionicToast) {

    $scope.componentId = $stateParams.componentId;
    $scope.component_activate;
    $scope.currentLabel = 'Por defecto';

    var url_data = 'http://158.69.223.78:8000/devices/' + $scope.componentId + '/lastdata/10/';

    $http({
        method:'GET',
        url: url_data
    }).then(function(response){
        console.log(response.data);
        $scope.component_data = response.data.data;

        $scope.createChart();

        if ($scope.component_data.length != 0) {
          $scope.last_data = $scope.component_data[$scope.component_data.length - 1].data_value;
        } else {
          $scope.last_data = 0;
        }
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });

    $scope.createChart = function() {
      $scope.line = {};
      $scope.line.series = ['Potencia'];
      $scope.line.data = [[]];
      $scope.line.labels = [];

      console.log($scope.component_data);
      var length = $scope.component_data.length - 1;

      for (var i = length; i >= 0; i--) {
        $scope.line.data[0].push($scope.component_data[i].data_value);
        $scope.line.labels.push($filter('date')($scope.component_data[i].date, "HH:mm"));
      }
    }

    var url_device = 'http://158.69.223.78:8000/devices/' + $scope.componentId + '/';
    var url_server = 'http://158.69.223.78:8000';

    $http({
        method:'GET',
        url: url_device
    }).then(function(response){
        console.log(response.data);
        $scope.component_server = response.data.device;
        if ($scope.component_server.length != 0) {

          $scope.component_status = ($scope.component_server.devicestate.name == 'on')
          $scope.component_activate  = $scope.component_server.enabled;
          $scope.currentLabel = $scope.component_server.label;
        }
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });

    $scope.changeStatus = function() {
      console.log($scope.component_status);
      if ($scope.component_status == true) {
        console.log("apagando");
        $scope.turnOffComponent($scope.componentId);
      }
      else {
        console.log("prendiendo");
        $scope.turnOnComponent($scope.componentId);
      }
    }

    $scope.turnOnComponent = function(id) {
      var url = url_server + '/devices/' + id + '/turnon';
      var send = $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.component_status = !$scope.component_status;
          ionicToast.show('Componente encendido con éxito.', 'bottom', false, 5000);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.turnOffComponent = function(id) {
      var url = url_server + '/devices/' + id + '/shutdown';
      var send = $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.component_status = !$scope.component_status;
          ionicToast.show('Componente apagado con éxito.', 'bottom', false, 5000);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.activateComponent = function() {
      console.log($scope.component_activate);
      if ($scope.component_activate != true) {
        console.log("activar");
        $scope.enableComponent($scope.componentId);
      }
      else {
        console.log("desactivar");
        $scope.disableComponent($scope.componentId);
      }
    }

    $scope.enableComponent = function(id) {
      var url = url_server + '/devices/' + id + '/enable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          $scope.component_activate = true;
          ionicToast.show('Componente activado con éxito.', 'bottom', false, 5000);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $scope.disableComponent = function(id) {
      var url = url_server + '/devices/' + id + '/disable';
      var send = $http({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      send.then(
        function(response){
          $scope.component_activate = false;
          ionicToast.show('Componente desactivado con éxito.', 'bottom', false, 5000);
      }, function(response){
          console.log("problemas de conexion");
      });
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.saveLabel = function(label) {
      if (label !== $scope.currentLabel) {
        console.log("guardando");

        var parametros = $httpParamSerializerJQLike({'label': label});
        var url = url_server + '/devices/'+ $scope.componentId +'/updatelabel';

        var send = $http({
          method: 'POST',
          url: url,
          data: parametros,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log(send);
        send.then(
          function(response){
            console.log(response);
            ionicToast.show('Nombre del componente modificado con éxito.', 'bottom', false, 5000);
            $scope.currentLabel = label;
        }, function(response){
            console.log("problemas de conexion");
            ionicToast.show('No se pudo modificar el nombre del componente.', 'bottom', false, 5000);
        });
      }
      $scope.modal.hide();
    };

    $scope.saveComponent = function(data, id) {
      //$scope.user not updated yet
      angular.extend(data, {
        id: id
      });
      console.log(data);

      var data2 = {'label': data.name};

      var url = url_server + '/devices/'+ id +'/updatelabel';

      var serializedData = $.param(data2);
      console.log(serializedData);

      var send = $http({
        method: 'POST',
        url: url,
        data: serializedData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      console.log(send);
      send.then(
        function(response){
          console.log(response);
          Notifier.simpleSuccess('Componente guardado','El nombre del componente se ha editado con éxito');
      }, function(response){
          console.log("problemas de conexion");
          Notifier.simpleError('No se pudo guardar','Por problemas de conexión no se pudo guardar');
      });
    };


})

.controller('ConfigurationCtrl', function($scope) {

})

.controller('StatisticsCtrl', function($scope, $http, $filter, $timeout, ionicToast) {

  $scope.listado = true;
  var url_server = 'http://158.69.223.78:8000';

  ionicToast.show('Cargando estadisticas.', 'top', false, 8000);

  $http({
      method:'GET',
      url: url_server + '/devices/statistics'
  }).then(function(response){
      console.log(response.data);
      $scope.components_statistics = response.data.devices;
      $scope.createDoughnutChart();
      //$scope.createBarChart();
      console.log($scope.components_statistics[0].device.label);
  }, function(response){
      ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
  })

  $http({
      method:'GET',
      url: url_server + '/devices/'
  }).then(function(response){
      console.log(response.data);
      $scope.components_server = response.data.devices;
  }, function(response){
      ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
  })

  $scope.calculateDatesFromtoLastPeriod = function () {

  }

  $scope.changeToCharts = function() {
    $scope.listado = false;
    $timeout(function() { $scope.$apply(); }, 2000);
  }

  $scope.changeToList = function() {
    $scope.listado = true;
  }

  $scope.doughnut;

  $scope.$on('chart-create', function (evt, chart) {
    if (chart.config.type == 'doughnut') {
      $scope.doughnut = chart;
    }
    else {
      $scope.bar = chart;
    }
  });

  $scope.doughnutlabels = [];
  $scope.doughnutdata = [];
  $scope.barOptions = {};

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
    for (var i = 0; i < $scope.components_statistics.length; i++) {
      var percent = ($scope.components_statistics[i].device_percent) ? $filter('number')($scope.components_statistics[i].device_percent, 2) : 0;
      var label = $scope.components_statistics[i].device.label + ' (' + percent + '%)';
      $scope.doughnutlabels.push(label);
      $scope.doughnutdata.push(percent);
    }
  }

  $scope.changeBarComponents = function(){
    console.log($scope.barOptions.componentLeft);
    console.log($scope.barOptions.componentRight);
    console.log($scope.barOptions.precisionSelected);

    $scope.changeLeftBarComponent($scope.barOptions.componentLeft);
    $scope.changeRigthBarComponent($scope.barOptions.componentRight);
  }

  $scope.changeLeftBarComponent = function(id) {
    $scope.changeBarComponent(id,'left');
  }

  $scope.changeRigthBarComponent = function(id) {
    $scope.changeBarComponent(id,'right');
  }

  $scope.changeBarComponent = function(id_selected, side) {

    var selected = $filter('filter')($scope.components_server, {id: id_selected});
    var selectedComponent = (id_selected.toString() && selected.length) ? selected[0] : 'Not set';

    $scope.getComponentData(side,id_selected);

    if (side == 'left') {
      $scope.currentBarLeft = selectedComponent;
      $scope.barseries[0] = $scope.barOptions.componentLeft.label;
    }
    else {
      $scope.currentBarRigth = selectedComponent;
      $scope.barseries[1] = $scope.barOptions.componentRight.label;
    }
  }

  $scope.getComponentData = function(side, component) {

    $http({
        method:'GET',
        url: url_server + '/devices/' + component + '/data/' + $scope.barOptions.precisionSelected // modificar la URL /devices/id/data/perhour
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

    console.log($scope.barlabels.length);

    var length = (data.length >= 6) ? 6 : data.length;
    console.log(length);


    if ($scope.barlabels.length == 0) {
      console.log('preparando footer');
      for (var i = length-1; i > 0; i--) {
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
      for (var i = length-1; i > 0; i--) {
        if (data[i].data_value == null) {
          $scope.bardata[0].push(0);
        } else {
          $scope.bardata[0].push(data[i].data_value);
        }
      }
    } else {
      console.log('derecha');
      $scope.bardata[1] = [];
      for (var i = length-1; i > 0; i--) {
        if (data[i].data_value == null) {
          $scope.bardata[1].push(0);
        } else {
          $scope.bardata[1].push(data[i].data_value);
        }
      }
    }

  }

  $scope.createBarChart = function() {
    if ($scope.bar == undefined) {
      $scope.bar;
      $scope.barlabels = [];
      $scope.barseries = [];
      $scope.bardata = [[],[]];
    }
    ionicToast.show('Cargando tabla comparativa.', 'bottom', false, 3000);
    $scope.changeBarComponents();
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
      ionicToast.show('Error de conexión con el servidor al traer los componentes.', 'bottom', false, 5000);
  });

})

.controller('GraphicHistoryCtrl', function($scope, $stateParams, $http, $filter, ionicToast) {

  var url_server = 'http://158.69.223.78:8000';

  console.log($stateParams);
  $scope.componentId = $stateParams.componentId;
  $scope.dateFrom = new Date($stateParams.dateFrom);
  $scope.timeFrom = new Date($stateParams.timeFrom);
  $scope.dateTo = new Date($stateParams.dateTo);
  $scope.timeTo = new Date($stateParams.timeTo);
  $scope.precision = $stateParams.precision;

  // Variables para el paginado
  $scope.nextbutton = true;
  $scope.previousbutton = false;
  $scope.inLastPage = false;
  $scope.inFirstPage = true;
  $scope.showiconloading = false;

  $scope.calculatePages = function () {

    $scope.number_pages = [];
    $scope.current_page = 1;
    for (var i = 1; i <= $scope.pagesdata.pages; i++) {
      $scope.number_pages.push(i);
    }
  }

  $scope.loadPage = function (page_id) {
    $scope.showiconloading = true;
    console.log(page_id);
    console.log(typeof page_id);
    // procesa la ultima pagina
    console.log($scope.pagesdata);
    if (page_id == 'last') {
      if ($scope.current_page != $scope.pagesdata.pages) {
        var offset = '' + (($scope.pagesdata.pages -1) * 10 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
        console.log(offset);
        $scope.loadDataPage(offset,true,false,$scope.pagesdata.pages);
      }
    }
    // procesa la primer pagina
    else if (page_id == 1) {
      if ($scope.current_page != 1) {
        var offset = '1/10/1/';
        console.log(offset);
        $scope.loadDataPage(offset,false,true,page_id);
      }
    }
    // procesa todos los demas casos
    else {
      var offset = '';
      // para el caso que la pagina sea la final
      if (page_id == $scope.pagesdata.pages) {
        console.log('ultima pagina');
        offset = '' + (($scope.pagesdata.pages -1) * 10 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
        console.log(offset);
        $scope.loadDataPage(offset,true,false,page_id);
      }
      // para el resto de los casos
      else {
        offset = '' + ((page_id -1) * 10 + 1) + '/' + (page_id * 10) + '/1/';
        console.log(offset);
        $scope.loadDataPage(offset,false,false,page_id);
      }
    }
  }

  $scope.loadDataPage = function(offset,previousbutton,nextbutton,page_id) {
    $http({
        method:'GET',
        url: $scope.url + offset,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response);
        $scope.data = response.data.data;
        if ($scope.data.length > 0) {
          $scope.loadChart();
          $scope.previousbutton = previousbutton;
          $scope.nextbutton = nextbutton;
          $scope.current_page = page_id;

          console.log($scope.current_page);
        }
        else {
          ionicToast.show('No hay datos para ese período seleccionado.', 'top', false, 5000);
          $scope.showiconloading = false;
        }
    }, function(response){
        console.log("problemas");
        $scope.showiconloading = false;
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
    });
  }

  $scope.loadUrl = function () {
    // armando la url
    $scope.showiconloading = true;

    var id = $scope.componentId;
    var from = $filter('date')($scope.dateFrom, 'ddMMyy');
    var to = $filter('date')($scope.dateTo, 'ddMMyy');

    var hourfrom = $filter('date')($scope.timeFrom, 'HH');
    var minutesfrom = $filter('date')($scope.timeFrom, 'mm');
    var hourto = $filter('date')($scope.timeTo, 'HH');
    var minutesto = $filter('date')($scope.timeTo, 'mm');

    console.log(hourfrom,minutesfrom,hourto,minutesto);

    var date = $filter('date')($scope.dateFrom, 'shortDate');

    console.log("formateddate");
    console.log(date);

    // Otra forma de armar el date
    var dateObj = $scope.dateFrom;

    var month = $filter('date')($scope.dateFrom, 'MM');//'0'+ (dateObj.getUTCMonth() + 1); //months from 1-12
    var day = $filter('date')($scope.dateFrom, 'dd');//dateObj.getUTCDate();
    var year = $filter('date')($scope.dateFrom, 'yyyy');//dateObj.getUTCFullYear();

    var dateF = day + "/" + month + "/" + year + '/' + hourfrom;

    var dateObj = $scope.dateTo;

    var month = $filter('date')($scope.dateTo, 'MM');//'0'+ (dateObj.getUTCMonth() + 1); //months from 1-12
    var day = $filter('date')($scope.dateTo, 'dd');//dateObj.getUTCDate();
    var year = $filter('date')($scope.dateTo, 'yyyy');//dateObj.getUTCFullYear();

    var dateT = day + "/" + month + "/" + year + '/' + hourto;

    if ($scope.precision == 'normal') {
      var precision = '';
    }
    else {
      var precision = $scope.precision + '/';
    }

    $scope.offset = '1/10/1/';

    $scope.url = url_server + '/devices/' + $scope.componentId + '/data/' + dateF + '/' + dateT + '/' + precision;
    console.log($scope.url);
  }

  $scope.loadData = function() {
    $http({
        method:'GET',
        url: $scope.url + $scope.offset,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response);
        $scope.data = response.data.data;
        $scope.pagesdata = response.data;
        if ($scope.data.length > 0) {
          $scope.loadChart();
          $scope.calculatePages();
        }
        else {
          ionicToast.show('No hay datos para ese período seleccionado.', 'top', false, 5000);
        }
    }, function(response){
        console.log("problemas");
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });
  }

  $scope.loadChart = function () {

    $scope.showiconloading = false;

    console.log('loadChart');

    $scope.line = {};
    $scope.line.series = ['Potencia'];
    $scope.line.labels = [];
    $scope.line.data = [[]];

    for (var i = $scope.data.length-1; i >= 0; i--) {

      if ($scope.precision == 'perday') {
        var label = '' + $filter('date')($scope.data[i].date, 'dd') + '/' + $filter('date')($scope.data[i].date, 'MM');
      }
      else {
        var label = '' + $filter('date')($scope.data[i].date, "HH:mm");
      }
      $scope.line.labels.push(label)
      $scope.line.data[0].push($scope.data[i].data_value)

    }
  }

  $scope.loadComponent = function () {
    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/devices/' + $scope.componentId + '/'
    }).then(function(response){
        $scope.component_details = response.data.device;
        console.log($scope.component_details);
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
        //show an appropriate message
    });
  };

  $scope.loadUrl();
  $scope.loadData();
  $scope.loadComponent();

});
