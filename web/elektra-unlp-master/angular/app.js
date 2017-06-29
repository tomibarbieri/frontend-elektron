'use strict';

angular.module('inicioElektra', ['angular-websocket'])

.factory('MyData', function($websocket) {
      // Open a WebSocket connection
      var dataStream = $websocket('ws://localhost:8888/websocket');

      var collection = [];

      dataStream.onMessage(function(message) {
        console.log("puto")
        json = JSON.parse(message.data);
        console.log(json);
        //collection.push(JSON.parse(message.data));
      });

      var methods = {
        collection: collection,
        get: function() {
          dataStream.send(JSON.stringify({ action: 'get' }));
        }
      };

      return methods;
})

.controller('IndexCtrl', function ($scope, MyData) {
      $scope.MyData = MyData;
      $scope.mi_variable = "Dale Capo";
});
