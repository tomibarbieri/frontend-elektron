angular.module('starter.services', ["ngResource"])

.factory('LoginService', function($rootScope) {
    var admin = 'admin';
    var pass = 'pass';
    var isAuthenticated = false;

    return {
      login : function(username, password) {
        isAuthenticated = username === admin && password === pass;
        // aca va un ajax
        return isAuthenticated;
      },
      logout : function() {
        isAuthenticated = false;
      },
      isAuthenticated : function() {
        return isAuthenticated;
      }
    };
})

.factory('Resource', function($resource) {

  sensados = $resource("http://163.10.33.156:9292/sensor/a911/get/status");
  return {
    all: function() {
      return sensados.get();
    }
  }

});
