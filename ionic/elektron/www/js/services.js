angular.module('starter.services', ["ngResource"])

.factory('Profiles', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var profiles = [{
    id: 0,
    name: 'Aire acondicionado',
    deseg: 'Prioridad maxima',
    face: 'img/150x165/anoop-kumar.png'
  }, {
    id: 1,
    name: 'Lavarropas',
    deseg: 'Prioridad media',
    face: 'img/150x165/vijay-kumar.png'
  }, {
    id: 2,
	name: 'Ventiladores',
	deseg: 'Prioridad minima',
    face: 'img/150x165/durgesh-soni.png'
  }];
  return {
    all: function() {
      return profiles;
    },
    remove: function(id) {
      profiles.splice(profiles.indexOf(id), 1);
    },
    get: function(profileId) {
      for (var i = 0; i < profiles.length; i++) {
        if (profiles[i].id === parseInt(profileId)) {
          return profiles[i];
        }
      }
      return null;
    }
  };
})

.factory('Sensado', function($resource) {

  sensados = $resource("http://163.10.33.156:9292/sensor/a911/get/status");
  //sensados = $resource("http://192.168.0.3:9292/documents");
  return {
    all: function() {
      return sensados.get();
    }
  }
    /*return $http.get("http://192.168.0.3:9292/tom").then(function(response) {
          //...
          return response;
    });*/
  })

  .factory('Sensores', function($resource) {
    sensores = $resource("http://163.10.33.156:9292/sensors");
    //sensados = $resource("http://192.168.0.3:9292/documents");
    return {
      all: function() {
        return sensores.query();
      }
    }
});
