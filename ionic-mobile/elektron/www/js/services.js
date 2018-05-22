angular.module('starter.services', ['ngResource', 'satellizer'])

.factory('LoginService', function($rootScope,$auth) {
    //var admin = 'admin';
    //var pass = 'pass';
    // 192.168.0.25
    var isAuthenticated = false;
    // Guardar en la base de datos

    return {
      login : function(username, password) {

        $http({
            method:'GET',
            url:'http://158.69.223.78:8000/devices/'
        }).then(function(response){

        }, function(response){

        });

        return isAuthenticated;
      },
      logout : function() {
        isAuthenticated = false;
      },
      isAuthenticated : function() {
        return isAuthenticated;
      }
    };
});
