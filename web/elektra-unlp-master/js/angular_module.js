// Retrieve
//Web Socket Communication with Python Server for data retrieval (PyMongo and Tornado Web Socket)
var motas = [];
var mota_id = 0;
var aula = 0;
var temp = 0;
var hume = 0;
var estado = 0;
var consumo = 0;
var hora = 0;

var app = angular.module("elektra", ['ngWebSocket']);

/*app.config(function ($routeProvider, $locationProvider) {
        // configure the routing rules here
        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {
            controller: 'mota_ctrl',
            templateUrl: '/views/mota.html'
        });
        $routeProvider.when("/pepe", {
            redirectTo: '/views/mota.html'
        })
        .otherwise({
            controller: 'mota_ctrl',
            redirectTo: '/views/mota.html'
        });

});

    .factory('Data', function($websocket){

        // Open a WebSocket connection
        var dataStream = $websocket('ws://localhost:8888/websocket');

        var collection = [];

        dataStream.onMessage(function(message) {
            collection.push(JSON.parse(message.data));
            console.log(collection);


            /*mota_id = json.mota_id;
            aula = json.aula;
            temp = json.temperatura;
            hume = json.humedad;
            estado = json.estado;
            consumo = json.consumo;
            hora = json.hora;*/

            /*collection.forEach(function(element) {
                mota_aux = {}
                mota_aux["mota_id"] = element["mota_id"];
                console.log(mota_aux);
                motas = [ {"mota_id": 1, "data": 1}, {"mota_id": 2, "data": 2}, {"mota_id": 3, "data": 3} ];
                console.log(motas);
            }, this);

            //motas = collection;
        });

        var methods = {
            collection: collection,
            get: function() {
                dataStream.send(JSON.stringify({ action: 'get' }));
            }
        };

        return methods;
    
        })*/ 
/*app.controller("MotasController", function($scope, Data) {
    console.log("DATA ES " + Data);
    $scope.Data = Data;    
});

app.directive("myInclude", function() {
return {
    restrict: "E",
    templateUrl: "/views/caja_aula.html"
    }
});

app.controller("mota_ctrl", function($scope, $routeParams) {
    console.log("HOLAAAAAA");
    $scope.mota_id = $routeParams.mota_id;
});*/

