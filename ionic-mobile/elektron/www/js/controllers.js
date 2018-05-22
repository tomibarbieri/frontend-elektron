angular.module('starter.controllers', ['angular-websocket','chart.js','ion-datetime-picker','ionic-toast','ionic','satellizer'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout, $location, $ionicPopup, $auth ) {

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
		 template: msg ,
     buttons: [{
       text: 'Cancel',
       type: 'button-dark'
      }]
	   });
	 };
})

.controller('LoginCtrl', function($state,$scope, $location, $http, $websocket, LoginService, $auth) {

    $scope.login = function(user) {

      var credentials = {
        email: user.username,
        password: user.password
      }

      // Use Satellizer's $auth service to login
			$auth.login(credentials).then(function(data) {
				// If login is successful, redirect to the users state
				$state.go('app.dashboard');
			}, function(error) {
        $scope.showAlert('Error de Usuario o contraseña.');
				console.log(error);
			});

    };
})

.controller('LogoutCtrl', function($scope, ionicToast, $state, $auth, $timeout) {
    $auth.removeToken();
    console.log("Logout");
    $timeout( function(){
            $state.go('app.login');
            ionicToast.show('Sesión cerrada con éxito', 'bottom', false, 8000);
        }, 4000 );
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

.controller('DashCtrl', function($scope, $filter, $websocket, $http, $rootScope, $window, ionicToast) {

      var ip_server = '158.69.223.78';
      var url_server = 'http://158.69.223.78:8000';
      var url_cape = 'http://163.10.33.173:8000';

      $scope.websocketStatus = false;       // estado de la conexion de websocket
      $scope.chart;                         // variable para tener guardado el grafico y refrescarlos
      $scope.current_component;             // componente que filtra los websockets
      $scope.websocket;
      $scope.spinner = true;
      $scope.spinnerdash = true;
      $scope.websocketplay = true;
      $scope.last_value = undefined;
      $scope.dasherror = false;

      // Muestra los primeros 4 componentes de la lista
      $scope.quantity = 4;

      $scope.refreshConnection = function() {
        $scope.spinnerdash = true;
        if ($rootScope.ws) {
          $rootScope.ws.close();
        }
        $scope.websocketStatus = false;
        $rootScope.ws = undefined;
        console.log("refresh");
        $scope.openWebsocketConnection();
      }

      // Grafico en tiempo real

      // Funcion para asociar la creacion del chart y guardar la variable
      $scope.$on('chart-create', function (evt, chart) {
        $scope.chart = chart;
        console.log('chart create');
      });

      $scope.changeCurrentComponent = function(component) {
        $scope.last_value = undefined;
        $scope.spinner = true;
        $scope.current_component = component;
        // carga los datos del nuevo componente
        $scope.changeComponentWS();
      };

      // una vez seleccionado cambia los datos
      $scope.changeComponentWS = function(){
        if ($scope.websocketStatus == false) {
          $scope.openWebsocketConnection();
        }
        $scope.reloadData();
      }

      // Graficar
      $scope.reloadData = function(){
        $http({
              method:'GET',
              url: url_server + '/devices/' + $scope.current_component.id + '/lastdata/10/'
          }).then(function(response){

              console.log(response.data.data);
              $scope.spinner = false;

              if (response.data.data.length > 0) {
                $scope.graficate(response.data.data);
              } else {
                ionicToast.show('No hay datos. No hay datos para el componente seleccionado', 'bottom', false, 8000);
              }

          }, function(response){
              $scope.spinner = false;
              console.log("problemas de conexion");
              ionicToast.show('Error de conexión con el servidor. Se ha detectado un error de la conexion al buscar la información', 'bottom', false, 8000);
        });
      };

      $scope.pauseWebsocket = function () {
        $scope.websocketplay = false;
      }

      $scope.playWebsocket = function () {
        $scope.websocketplay = true;
      }

      $scope.reloadpage = function () {
        $window.location.reload();
      }

      // Obtiene los componentes del servidor
      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/devices/'
      }).then(function(response){

          console.log(response.data);
          $scope.components_server = response.data.devices;
          $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { ready: false }, true);
          $scope.components_server_enabled = $filter('filter')($scope.components_server, { ready: true }, true);

          if ($scope.components_server_enabled.length > 0) {
            $scope.current_component = $scope.components_server_enabled[0];
            $scope.loadInitialData();
            $scope.openWebsocketConnection();
          }
          else {
            ionicToast.show('No hay componentes habilitados para mostrar datos en tiempo real.', 'bottom', false, 3000);
            $scope.dasherror = true;
            $scope.errormessage = "No hay componentes habilitados para mostrar datos en tiempo real";
            $scope.spinner = false;
            $scope.spinnerdash = false;
          }

      }, function(response){
          ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 3000);
          $scope.dasherror = true;
          $scope.errormessage = "No se pudieron traer los componentes";
          $scope.spinner = false;
          $scope.spinnerdash = false;
      });

      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/data/totalwattstaxco2'
      }).then(function(response){
          console.log(response.data);
          $scope.general_data = response.data;
      }, function(response){
          ionicToast.show('Error de conexión al traer datos totales de consumo y contaminacion.', 'bottom', false, 5000);
          //show an appropriate message
      });

      // function para cargar la informacion del 1er componente
      $scope.loadInitialData = function() {
        $http({
              method:'GET',
              url: url_server + '/devices/' + $scope.current_component.id + '/lastdata/10/'
          }).then(function(response){

              console.log(response.data.data);
              $scope.spinner = false;

              if (response.data.data.length > 0) {
                $scope.graficate(response.data.data);
              } else {
                ionicToast.show('No hay datos. No hay datos para el componente seleccionado', 'bottom', false, 8000);
              }

          }, function(response){
              $scope.spinner = false;
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

          var label = '' + hora;
          var data = data_sense[i].data_value;

          $scope.line.labels.push(label);
          $scope.line.data[0].push(data);
        }
      }

      $scope.openWebsocketConnection = function() {

        if ($rootScope.ws == undefined) {
          $rootScope.ws = $websocket('ws://' + ip_server +':8888/websocket');
          console.log("nuevo ws");
        }
        else {
          console.log("recuperando ws");
        }
        $scope.websocket = $rootScope.ws;

        console.log($rootScope.ws);

        var collection = [];

        $rootScope.ws.onError(function functionName() {
          $scope.spinnerdash = false;
          ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
        });

        $rootScope.ws.onOpen(function() {
          console.log("on open");
          $scope.spinnerdash = false;
          ionicToast.show('Conexion en tiempo real iniciada', 'bottom', false, 8000);
          $scope.websocketStatus = true;
          $scope.$apply();
        });

        $rootScope.ws.onMessage(function(message) {

          if ($scope.websocketStatus == false) {
            $scope.websocketStatus = true;
            $scope.$apply();
          }

          json = JSON.parse(message.data);
          console.log(json);

          if ($scope.current_component && $scope.websocketplay == true) {

            if (json.device_mac == $scope.current_component.device_mac) {

              var hora = $filter('date')(new Date(json.data_datetime), "HH:mm");
              var label = '' + hora;
              $scope.last_value = json.data_value;
              $scope.last_date = label;

              var labels = Array.from($scope.chart.config.data.labels);
              var datas = Array.from($scope.chart.config.data.datasets[0].data);

              labels.splice(0,1);
              labels.push(label);
              datas.splice(0,1);
              datas.push(json.data_value.toString());

              if ($scope.chart) {
                $scope.chart.config.data.datasets[0].data = datas;
                $scope.chart.config.data.labels = labels;
                $scope.chart.update();
              }

            }
          }
        })
      };


})

.controller('MonitorCtrl', function($scope, $filter, $websocket, $window, $rootScope, $http, ionicToast) {

      console.log("Loading monitor...");

      var ip_server = '158.69.223.78';
      var url_server = 'http://158.69.223.78:8000';
      var url_cape = 'http://163.10.33.173:8000';

      $scope.websocketStatus = false;       // estado de la conexion de websocket
      $scope.current_component;             // componente que filtra los websockets
      $scope.websocket;
      $scope.spinner = true;
      $scope.spinnermonitor = true;
      $scope.websocketplay = true;
      $scope.last_value = undefined;
      $scope.monitorerror = false;
      $scope.components_charts = {};
      $scope.charts = [];

      $scope.reloadpage = function () {
        $window.location.reload();
      }

      $scope.pauseWebsocket = function () {
        $scope.websocketplay = false;
      }

      $scope.playWebsocket = function () {
        $scope.websocketplay = true;
      }

      // Obtiene los componentes del servidor
      $http({
          method:'GET',
          url:'http://158.69.223.78:8000/devices/'
        }).then(function(response){
            console.log(response.data);
            $scope.components_server = response.data.devices;
            $scope.components_server_not_enabled = $filter('filter')($scope.components_server, { ready: false }, true);
            $scope.components_server_enabled = $filter('filter')($scope.components_server, { ready: true }, true);
            $scope.spinner = false;

            $scope.line = {}

            if ($scope.components_server_enabled.length > 0) {

              for (var component in $scope.components_server_enabled) {
                var labels = [];
                var data = [[]];
                if ($scope.components_server_enabled[component].lastdata.length >= 10) {
                  var last = ($scope.components_server_enabled[component].lastdata.length > 10)? 10 : $scope.components_server_enabled[component].lastdata.length;
                  for (var i = 0; i < last; i++) {
                    labels.push($filter('date')($scope.components_server_enabled[component].lastdata[i].date, "HH:mm"));
                    data[0].push($scope.components_server_enabled[component].lastdata[i].data_value);
                  }
                }
                else {
                  labels.push(0,1,2,3,4,5,6,7,8,9);
                  data[0].push(0,0,0,0,0,0,0,0,0,0);
                }

                $scope.components_charts[$scope.components_server_enabled[component].device_mac] = {};
                $scope.line[$scope.components_server_enabled[component].device_mac] = {
                                                                              'series': ['Potencia en Watts'],
                                                                              'labels': labels,
                                                                              'data': data,
                                                                              'status': false
                                                                            };
              }

              $scope.loadWebsocket();

            } else {
              $scope.spinner = false;
              $scope.monitorerror = true;
              $scope.errormessage = "No hay componentes habilitados para mostrar datos en tiempo real";
              $scope.spinnermonitor = false;
              ionicToast.show('No hay componentes habilitados para mostrar datos en tiempo real.', 'bottom', false, 5000);
            }

        }, function(response){
          $scope.spinner = false;
          $scope.monitorerror = true;
          $scope.errormessage = "Error al traer los componentes";
          $scope.spinnermonitor = false;
          ionicToast.show('Error de conexión al traer componentes.', 'bottom', false, 5000);
      });

      $scope.refreshConnection = function() {
        if ($rootScope.ws) {
          $rootScope.ws.close();
        }
        $scope.websocketStatus = false;
        $rootScope.ws = undefined;
        console.log("refresh");
        $scope.loadWebsocket();
      }

      $scope.$on('chart-create', function (evt, chart) {
        $scope.charts.push(chart);
        console.log($scope.charts);
        console.log($scope.components_charts);

        $scope.components_charts[chart.chart.canvas.id].chart = chart;
        $scope.components_charts[chart.chart.canvas.id].status = false;


      });

      $scope.loadWebsocket = function() {

        if ($rootScope.ws == undefined) {
          $rootScope.ws = $websocket('ws://' + ip_server +':8888/websocket');
          console.log("nuevo ws");
        } else {
          console.log("recuperando ws");
        }

        $scope.websocket = $rootScope.ws;

        console.log($rootScope.ws);

        $rootScope.ws.onError(function functionName() {
          ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 8000);
          $scope.spinnermonitor = false;
        });

        $rootScope.ws.onOpen(function() {
          console.log("on open");
          $scope.websocketStatus = true;
          ionicToast.show('Conexion en tiempo real iniciada', 'top', false, 3000);
          $scope.spinnermonitor = false;
          $scope.$apply();
        });

        $rootScope.ws.onMessage(function(message) {

            if ($scope.websocketStatus == false) {
              $scope.websocketStatus = true;
              $scope.$apply();
            }

            json = JSON.parse(message.data);
            console.log(json);

            if (json != undefined && $scope.websocketplay == true) {
              var current_mac = json.device_mac;

              var date = new Date(json.data_datetime);
              var label = $filter('date')(date, "HH:mm")

              $scope.components_charts[current_mac].status = true;

              var labels = Array.from($scope.components_charts[current_mac].chart.chart.config.data.labels);
              var datas = Array.from($scope.components_charts[current_mac].chart.config.data.datasets[0].data);

              labels.splice(0,1);
              labels.push(label);

              datas.splice(0,1);
              datas.push(json.data_value.toString());

              if ($scope.components_charts[current_mac].chart) {
                $scope.components_charts[current_mac].chart.config.data.datasets[0].data = datas;
                $scope.components_charts[current_mac].chart.config.data.labels = labels;
                $scope.components_charts[current_mac].chart.update();
              }
              $scope.last_value = json.data_value;
              $scope.last_date = label;
              $scope.current_component = json.device_label;
            }
        });
      }
})

.controller('DatataskCtrl', function($scope, $location, $filter, $http, $state, $stateParams, $httpParamSerializerJQLike, ionicToast) {

  var url_server = 'http://158.69.223.78:8000';

  $scope.spinner = true;

  $scope.loadParams = function () {

    $scope.task = {};
    $scope.editButton = false;
    $scope.datatasktitle = "Agregar tarea";

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
        $scope.datatasktitle = "Editar tarea";
      }
    }

    $scope.spinner = false;

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
        $state.go( "app.tasks", { reload: true, inherit: true, notify: true });
        ionicToast.show('Se agrego la tarea exitosamente.', 'bottom', false, 5000);
    }, function(response){
        console.log("problemas de conexion");
        ionicToast.show('Hubo un error al agregar la tarea.', 'bottom', false, 5000);
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
        $state.go( "app.tasks", { reload: true, inherit: true, notify: true } );
        ionicToast.show('Se editó la tarea exitosamente.', 'bottom', false, 5000);
    }, function(response){
        console.log("problemas de conexion");
        ionicToast.show('Hubo un error al editar la tarea.', 'bottom', false, 5000);
    });
  }

})

.controller('DatetimetaskCtrl', function($scope, $location, $filter, $http, $state, $stateParams, ionicToast, $httpParamSerializerJQLike) {

  var url_server = 'http://158.69.223.78:8000';
  $scope.spinner = true;

  $scope.loadParams = function () {

    $scope.task = {};
    $scope.editButton = false;
    $scope.datatasktitle = "Agregar tarea";

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
        $scope.editButton = true;
        $scope.datatasktitle = "Editar tarea";

      }
    }
    $scope.spinner = false
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
        $state.go( "app.tasks", { 'update' : true, 'task':'datetimetask'} );
        ionicToast.show('Se agrego la tarea exitosamente.', 'bottom', false, 5000);
    }, function(response){
        console.log("problemas de conexion");
        ionicToast.show('Hubo un error al agregar la tarea.', 'bottom', false, 5000);
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
      'datetime': new Date(task.date).toUTCString(),
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
        $state.go( "app.tasks", { 'update' : true, 'task':'datetimetask'} );
        ionicToast.show('Se editó la tarea exitosamente.', 'bottom', false, 5000);
  }, function(response){
        console.log("problemas de conexion");
        ionicToast.show('Hubo un error al editar la tarea.', 'bottom', false, 5000);
    });
  }

})

.controller('TasksCtrl', function($scope, $http, $state, $window, $stateParams, $ionicPopup, ionicToast) {

  $scope.reloadpage = function () {
    $window.location.reload();
  }

  $scope.datatasks_server = [];
  $scope.datetimetasks_server = [];
  $scope.porconsumo = true;
  $scope.spinner = true;
  $scope.datataskerror = false;
  $scope.datetimetaskerror = false;

  var url_server = 'http://158.69.223.78:8000';
  //var url_server = 'http://192.168.0.21:8000';

  $scope.getDataTasks = function() {
    $http({
        method:'GET',
        url: url_server + '/tasks/datatasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datatasks_server = response.data.datatasks;
        $scope.spinner = false;

    }, function(response){
        ionicToast.show('Error al traer las tareas por consumo', 'bottom', false, 5000);
        $scope.spinner = false;
        $scope.datataskerror = true;
        $scope.datataskerrormessage = "No se pudieron traer las tareas por consumo";
    });
  }

  $scope.getDateTimeTasks = function() {
    $http({
        method:'GET',
        url: url_server + '/tasks/datetimetasks'
    }).then(function(response){
        console.log(response.data);
        $scope.datetimetasks_server = response.data.datetimetasks;
        $scope.spinner = false;

    }, function(response){
        $scope.spinner = false;
        ionicToast.show('Error de conexión al traer tareas por fecha y hora', 'bottom', false, 5000);
        $scope.datetimetaskerror = true;
        $scope.datetimetaskerrormessage = "No se pudieron traer las tareas por fecha y hora";
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
             ionicToast.show('Tarea borrada con exito.', 'bottom', false, 3000);
             $scope.getDataTasks();
             $scope.getDateTimeTasks();
         }, function(response){
            ionicToast.show('Error al borrar tarea.', 'bottom', false, 3000);
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

.controller('ComponentsCtrl', function($scope, $window, $http, ionicToast) {

    $scope.componentserror = false;

    $scope.reloadpage = function () {
      $window.location.reload();
    }

    $scope.spinner = true;
    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/devices/'
    }).then(function(response){
        console.log(response.data);
        $scope.components_server = response.data.devices;
        $scope.spinner = false;
        console.log($scope.components_server[0].label);
    }, function(response){
        ionicToast.show('Error al traer los componentes.', 'bottom', false, 5000);
        $scope.errormessage = "Error al traer los componentes";
        $scope.componentserror = true;
        $scope.spinner = false;
    });
})

.controller('ComponentCtrl', function($scope, $stateParams, $http, $filter, $window, $ionicModal, $httpParamSerializerJQLike, ionicToast) {

    $scope.componentId = $stateParams.componentId;
    $scope.component_activate;
    $scope.currentLabel = 'Por defecto';
    $scope.spinner = true;
    $scope.componenterror = false;
    $scope.datamessage = false;

    var url_server = 'http://158.69.223.78:8000';

    $scope.reloadpage = function () {
      $window.location.reload();
    }

    $scope.createChart = function() {
      $scope.line = {};
      $scope.line.series = ['Potencia'];
      $scope.line.data = [[]];
      $scope.line.labels = [];

      console.log($scope.component_data);
      var length = $scope.component_data.length - 11;

      if ($scope.component_data.length >=10) {
        for (var i = length; i >= 0; i--) {
          $scope.line.data[0].push($scope.component_data[i].data_value);
          $scope.line.labels.push($filter('date')($scope.component_data[i].date, "HH:mm"));
        }
      }
      else {
        $scope.datamessage = true;
      }

    }

    var url_device = 'http://158.69.223.78:8000/devices/' + $scope.componentId + '/';

    $http({
        method:'GET',
        url: url_device
    }).then(function(response){
        console.log(response.data);
        $scope.component_server = response.data.device;
        $scope.spinner = false;
        if ($scope.component_server.length != 0) {

          $scope.component_status = ($scope.component_server.devicestate.name == 'on')
          $scope.component_activate  = $scope.component_server.enabled;
          $scope.currentLabel = $scope.component_server.label;

          $scope.component_data = response.data.device.lastdata;

          if ($scope.component_data.length != 0) {
            $scope.last_data = $scope.component_data[$scope.component_data.length - 1].data_value;
          } else {
            $scope.last_data = 0;
          }

          $scope.createChart();

        }
    }, function(response){
        ionicToast.show('Error al traer los datos del componente', 'bottom', false, 5000);
        $scope.componenterror = true;
        $scope.errormessage = "Error al traer los datos del componente";
        $scope.spinner = false;
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

.controller('ConfigurationCtrl', function($scope) {})

.controller('StatisticsCtrl', function($scope, $http, $filter, $window, $timeout, ionicToast) {

  $scope.listado = true;
  $scope.spinner = true;
  $scope.spinnerbar = false;
  $scope.barselected = false;
  $scope.statisticserror = false;

  // Variables para el paginado
  $scope.nextbutton = true;
  $scope.indexbutton = true;
  $scope.previousbutton = false;
  $scope.lastbutton = false;

  $scope.inLastPage = false;
  $scope.inFirstPage = true;
  $scope.number_pages;

  var url_server = 'http://158.69.223.78:8000';

  $scope.reloadpage = function () {
    $window.location.reload();
  }

  $http({
      method:'GET',
      url: url_server + '/devices/statistics'
  }).then(function(response){
      console.log(response.data);
      $scope.components_statistics = response.data.devices;
      $scope.spinner = false;
      $scope.createDoughnutChart();
      //$scope.createBarChart();
      console.log($scope.components_statistics[0].device.label);
  }, function(response){
      ionicToast.show('Error de conexión al traer las estadísticas.', 'bottom', false, 5000);
      $scope.spinner = false;
      $scope.statisticserror = true;
      $scope.statisticserrormessage = "Error al traer las estadísticas del servidor";
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
    }];

  $scope.createDoughnutChart = function() {
    for (var i = 0; i < $scope.components_statistics.length; i++) {
      var percent = ($scope.components_statistics[i].device_percent) ? $filter('number')($scope.components_statistics[i].device_percent, 2) : 0;
      var total = $filter('number')($scope.components_statistics[i].device_data_sum/1000, 1);
      var label = $scope.components_statistics[i].device.label + ' (' + total + 'Kw)';
      $scope.doughnutlabels.push(label);
      $scope.doughnutdata.push(percent);
    }
  }

  $scope.calculatePages = function () {

    if ($scope.number_pages == undefined) {
      $scope.number_pages = [];
      for (var i = 1; i <= $scope.pagesdata.pages; i++) {
        $scope.number_pages.push(i);
      }
    };
    if ($scope.pagesdata.pages < $scope.number_pages.length) {
      $scope.number_pages = [];
      for (var i = 1; i <= $scope.pagesdata.pages; i++) {
        $scope.number_pages.push(i);
      }
    }
    $scope.current_page = 1;
    if ($scope.number_pages.length <= 1) {
      $scope.previousbutton = true;
      $scope.lastbutton = true;
    }
  }

  $scope.loadPage = function (page_id) {
    $scope.spinnerbar = true;
    $scope.bardatalength = 0;
    ionicToast.show('Cargando pagina ' + page_id, 'bottom', false, 4000);
    console.log(page_id);
    // procesa la ultima pagina
    if (page_id == 'last') {
      if ($scope.current_page != $scope.pagesdata.pages) {
        var offset = '' + (($scope.pagesdata.pages -1) * 5 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
        console.log(offset);
        $scope.loadDataPage('left',$scope.barOptions.componentLeft,offset,true,false,$scope.pagesdata.pages);
        $scope.loadDataPage('right',$scope.barOptions.componentRight,offset,true,false,$scope.pagesdata.pages);
      }
    }
    // procesa la primer pagina
    else if (page_id == 1) {
      if ($scope.current_page != 1) {
        var offset = '1/5/1/';
        console.log(offset);
        $scope.loadDataPage('left',$scope.barOptions.componentLeft,offset,false,true,page_id);
        $scope.loadDataPage('right',$scope.barOptions.componentRight,offset,false,true,page_id);
      }
    }
    // procesa todos los demas casos
    else {
      var offset = '';
      // para el caso que la pagina sea la final
      if (page_id == $scope.pagesdata.pages) {
        console.log('ultima pagina');
        offset = '' + (($scope.pagesdata.pages -1) * 5 + 1) + '/' + ($scope.pagesdata.total_data) + '/1/' ;
        console.log(offset);
        $scope.loadDataPage('left',$scope.barOptions.componentLeft,offset,true,false,page_id);
        $scope.loadDataPage('right',$scope.barOptions.componentRight,offset,true,false,page_id);
      }
      // para el resto de los casos
      else {
        offset = '' + ((page_id -1) * 5 + 1) + '/' + (page_id * 5) + '/1/';
        console.log(offset);
        $scope.loadDataPage('left',$scope.barOptions.componentLeft,offset,false,false,page_id);
        $scope.loadDataPage('right',$scope.barOptions.componentRight,offset,false,false,page_id);
      }
    }
  }

  $scope.loadDataPage = function(side,component,offset,previousbutton,nextbutton,page_id) {

    console.log('loadDataPage');
    console.log(component);
    console.log(page_id);

    var selected = $filter('filter')($scope.components_server, {id: component});
    var selectedComponent = (component.toString() && selected.length) ? selected[0] : 'Not set';

    var month_to = $filter('date')(new Date(), 'MM');
    var day_to = $filter('date')(new Date(), 'dd');
    var year_to = $filter('date')(new Date(), 'yyyy');
    var hour_to = $filter('date')(new Date(), 'hh');

    var date_to = '' + day_to + '/' + month_to + '/' + year_to + '/' + hour_to + '/';

    var month_from = $filter('date')(new Date(selectedComponent.created), 'MM');
    var day_from = $filter('date')(new Date(selectedComponent.created), 'dd');
    var year_from = $filter('date')(new Date(selectedComponent.created), 'yyyy');
    var hour_from = $filter('date')(new Date(selectedComponent.created), 'hh');

    var date_from = '' + day_from + '/' + month_from + '/' + year_from + '/' + hour_from + '/';

    var url_ = url_server + '/devices/' + component + '/data/' + date_from + date_to + $scope.barOptions.precisionSelected + '/' + offset;

    $http({
        method:'GET',
        url: url_,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        console.log(response);
        $scope.data = response.data.data;
        if ($scope.data.length > 0) {
          $scope.previousbutton = previousbutton;
          $scope.lastbutton = previousbutton;
          $scope.nextbutton = nextbutton;
          $scope.indexbutton = nextbutton;
          $scope.current_page = page_id;

          console.log($scope.current_page);
          $scope.barlabels = [];
          $scope.graficateComponentBar(response.data.data, side);
        }
        else {
          $scope.barlabels = [];
          $scope.graficateComponentBar([{'data_value':0},{'data_value':0},{'data_value':0},{'data_value':0},{'data_value':0}], side);
          ionicToast.show('El componente de la ' + side + ' no tiene datos.', 'top', false, 5000);
          $scope.spinnerbar = false;
        }
    }, function(response){
        console.log("problemas");
        $scope.spinnerbar = false;
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
    });
  }

  $scope.changeBarComponents = function(){
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

    $scope.getComponentData(side,id_selected,selectedComponent);

    console.log(selectedComponent);
    if (side == 'left') {
      $scope.currentBarLeft = selectedComponent;
      $scope.barseries[0] = selectedComponent.label;
    }
    else {
      $scope.currentBarRigth = selectedComponent;
      $scope.barseries[1] = selectedComponent.label;
    }
  }

  $scope.getComponentData = function(side, component, selectedComponent) {

    var offset = '/1/5/1/';

    var month_to = $filter('date')(new Date(), 'MM');
    var day_to = $filter('date')(new Date(), 'dd');
    var year_to = $filter('date')(new Date(), 'yyyy');
    var hour_to = $filter('date')(new Date(), 'HH');

    var date_to = '' + day_to + '/' + month_to + '/' + year_to + '/' + hour_to + '/';

    var month_from = $filter('date')(new Date(selectedComponent.created), 'MM');
    var day_from = $filter('date')(new Date(selectedComponent.created), 'dd');
    var year_from = $filter('date')(new Date(selectedComponent.created), 'yyyy');
    var hour_from = $filter('date')(new Date(selectedComponent.created), 'HH');

    var date_from = '' + day_from + '/' + month_from + '/' + year_from + '/' + hour_from + '/';

    $http({
        method:'GET',
        url: url_server + '/devices/' + component + '/data/' + date_from + date_to + $scope.barOptions.precisionSelected + offset
    }).then(function(response){
        console.log(response.data);
        $scope.pagesdata = response.data;
        $scope.graficateComponentBar(response.data.data, side);
        $scope.calculatePages();

    }, function(response){
        $scope.spinnerbar = false;
        console.log("problemas de conexion");
    });
  }

  $scope.graficateComponentBar = function(data, side) {

    console.log($scope.bardatalength);
    console.log(data);
    if ($scope.bardatalength == 0) {
      $scope.bardatalength = (data.length >= 5) ? 5 : data.length;
    }

    $scope.spinnerbar = false;
    $scope.barselected = true;

    if ($scope.barlabels.length == 0) {
      console.log('preparando footer');
      for (var i = $scope.bardatalength-1; i >= 0; i--) {
        var time;
        if ($scope.barOptions.precisionSelected == 'perday') {
          time = $filter('date')(data[i].date, 'dd/MM');
        } else {
          if ($scope.barOptions.precisionSelected == 'perhour') {
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
      for (var i = 0; i < $scope.bardatalength; i++) {
        if (data[i] != undefined) {
          console.log(data[i]);
          if (data[i].data_value == null) {
            $scope.bardata[0].unshift(0);
          } else {
            $scope.bardata[0].unshift(data[i].data_value);
          }
        }
        else {
          $scope.bardata[0].unshift(0);
        }
      }
    } else {
      console.log('derecha');
      $scope.bardata[1] = [];
      for (var i = 0; i < $scope.bardatalength; i++) {
        if (data[i] != undefined) {
          console.log(data[i]);
          if (data[i].data_value == null) {
            $scope.bardata[1].unshift(0);
          } else {
            $scope.bardata[1].unshift(data[i].data_value);
          }
        }
        else {
          $scope.bardata[1].unshift(0);
        }
      }
    }

  }

  $scope.createBarChart = function() {
    $scope.spinnerbar = true;
    $scope.barselected = false;
    $scope.bardatalength = 0;
    $scope.bar;
    $scope.barlabels = [];
    $scope.barseries = [];
    $scope.bardata = [[],[]];

    ionicToast.show('Cargando tabla comparativa.', 'bottom', false, 3000);
    $scope.changeBarComponents();
  }

})

.controller('HistoryCtrl', function($scope, $http, ionicToast) {

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

.controller('GraphicHistoryCtrl', function($scope, $window, $stateParams, $http, $filter, ionicToast) {

  var url_server = 'http://158.69.223.78:8000';

  $scope.spinner = true;

  console.log($stateParams);
  $scope.componentId = $stateParams.componentId;
  $scope.dateFrom = new Date($stateParams.dateFrom);
  $scope.timeFrom = new Date($stateParams.timeFrom);
  $scope.dateTo = new Date($stateParams.dateTo);
  $scope.timeTo = new Date($stateParams.timeTo);
  $scope.precision = $stateParams.precision;

  $scope.showiconloading = false;

  // Variables para el paginado
  $scope.lastbutton = false;
  $scope.previousbutton = false;
  $scope.nextbutton = true;
  $scope.indexbutton = true;

  $scope.inLastPage = false;
  $scope.inFirstPage = true;

  $scope.historyerror = false;

  $scope.reloadpage = function () {
    $window.location.reload();
  }

  $scope.calculatePages = function () {
    $scope.number_pages = [];
    $scope.current_page = 1;
    for (var i = 1; i <= $scope.pagesdata.pages; i++) {
      $scope.number_pages.push(i);
    }
    if ($scope.number_pages.length <= 1) {
      $scope.previousbutton = true;
      $scope.lastbutton = true;
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
          $scope.lastbutton = previousbutton;
          $scope.nextbutton = nextbutton;
          $scope.indexbutton = nextbutton;
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
        $scope.total_data = response.data.total_data;
        $scope.pagesdata = response.data;
        $scope.total_watts = response.data.data_sum_period;
        $scope.spinner = false;
        if ($scope.data.length > 0) {
          $scope.calculatePages();
          $scope.loadChart();
        }
        else {
          ionicToast.show('No hay datos para ese período seleccionado.', 'top', false, 5000);
        }
    }, function(response){
        console.log("problemas");
        $scope.spinner = false;
        $scope.historyerror = true;
        $scope.historyerrormessage = "Error al traer los datos historicos del componente";
        ionicToast.show('Error al traer los datos historicos del componente', 'bottom', false, 5000);
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
      $scope.line.data[0].push($scope.data[i].data_value/1000)

    }
  }

  $scope.loadComponent = function () {
    $http({
        method:'GET',
        url:'http://158.69.223.78:8000/devices/' + $scope.componentId + '/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    }).then(function(response){
        $scope.component_details = response.data.device;
        console.log($scope.component_details);
    }, function(response){
        ionicToast.show('Error de conexión con el servidor.', 'bottom', false, 5000);
    });
  };

  $scope.loadComponent();
  $scope.loadUrl();
  $scope.loadData();

});
