angular
  .module('theme.core.services', [])
  .factory('progressLoader', function() {
    'use strict';
    return {
      start: function() {
        angular.element.skylo('start');
      },
      set: function(position) {
        angular.element.skylo('set', position);
      },
      end: function() {
        angular.element.skylo('end');
      },
      get: function() {
        return angular.element.skylo('get');
      },
      inch: function(amount) {
        angular.element.skylo('show', function() {
          angular.element(document).skylo('inch', amount);
        });
      }
    };
  })
  .factory('EnquireService', ['$window', function($window) {
    'use strict';
    return $window.enquire;
  }])

  .factory('pinesNotifications', ['$window', function ($window) {
    'use strict';
    return {
      notify: function (args) {
        args.mouse_reset = false;
        var notification = new $window.PNotify(args);
        notification.notify = notification.update;
        return notification;
      },
    };
  }])


  .factory('LoginService', function($cookies, $http) {
      'use strict';
      var admin = 'root';
      var pass = 'q1w2e3r4';
      var isAuthenticated = false;
      var token;

      return {
        login : function(username, password) {
          var responsestatus = false;
          var user = {'username':username, 'password':password};
          $http({
              method:'POST',
              url:'http://158.69.223.78:8000/elektronusers/login',
              //url:'http://163.10.33.155:8000/elektronusers/login',
              data: $.param(user),
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
          }).then(function(response){
              console.log("todo piola");
              console.log(response);
              console.log($cookies);
              isAuthenticated = (response.status == 200);
          }, function(response){
              console.log("no tamo piola");
              console.log(response);
              isAuthenticated = (response.status == 200);
              console.log("problemas de conexion");
          });
        },
        isAuthenticated : function() {
          return isAuthenticated;
        },
        checkToken : function() {
          return token;
        },
        logout : function() {
          isAuthenticated = false;
        }
      };
    })

    .service('Notifier',['pinesNotifications', function (pinesNotifications) {

      this.simpleInfo = function(title,text) {
        console.log("notificando");
        pinesNotifications.notify({
          title: title,
          text: text,
          type: 'info'
        });
      };

      this.simpleSuccess = function(title,text) {
        pinesNotifications.notify({
          title: title,
          text: text,
          type: 'success'
        });
      };

      this.simpleError = function(title,text) {
        pinesNotifications.notify({
          title: title,
          text: text,
          type: 'error'
        });
      };

      // this notifications are permanent (can be close with the 'X')

      this.stickyInfo = function() {
        pinesNotifications.notify({
          title: 'Sticky Info',
          text: 'Sticky info, you know, like a newspaper covered in honey.',
          type: 'info',
          hide: false
        });
      };

      this.stickySuccess = function() {
        pinesNotifications.notify({
          title: 'Sticky Success',
          text: 'Sticky success... I\'m not even gonna make a joke.',
          type: 'success',
          hide: false
        });
      };

      this.stickyError = function() {
        pinesNotifications.notify({
          title: 'Uh Oh!',
          text: 'Something really terrible happened. You really need to read this, so I won\'t close automatically.',
          type: 'error',
          hide: false
        });
      };

      this.showDynamic = function() {
        var percent = 0;
        var notice = pinesNotifications.notify({
          title: 'Cargando datos..',
          type: 'info',
          icon: 'fa fa-spin fa-refresh',
          hide: false,
          closer: false,
          sticker: false,
          opacity: 0.75,
          shadow: false,
          width: '200px'
        });

        setTimeout(function() {
          notice.notify({
            title: false
          });
          var interval = setInterval(function() {
            percent += 5;
            var options = {
              text: percent + '% completado.'
            };
            if (percent === 80) {
              options.title = 'Ya casi';
            }
            if (percent >= 100) {
              window.clearInterval(interval);
              options.title = 'Listo!';
              options.type = 'success';
              options.hide = true;
              options.closer = true;
              options.sticker = true;
              options.icon = 'fa fa-check';
              options.opacity = 1;
              options.shadow = true;
            }
            notice.notify(options);
          }, 60);
        }, 2000);
      };

    }])






  .factory('$bootbox', ['$modal', '$window', function($modal, $window) {
    'use strict';
    // NOTE: this is a workaround to make BootboxJS somewhat compatible with
    // Angular UI Bootstrap in the absence of regular bootstrap.js
    if (angular.element.fn.modal === undefined) {
      angular.element.fn.modal = function(directive) {
        var that = this;
        if (directive === 'hide') {
          if (this.data('bs.modal')) {
            this.data('bs.modal').close();
            angular.element(that).remove();
          }
          return;
        } else if (directive === 'show') {
          return;
        }

        var modalInstance = $modal.open({
          template: angular.element(this).find('.modal-content').html()
        });
        this.data('bs.modal', modalInstance);
        setTimeout(function() {
          angular.element('.modal.ng-isolate-scope').remove();
          angular.element(that).css({
            opacity: 1,
            display: 'block'
          }).addClass('in');
        }, 100);
      };
    }

    return $window.bootbox;
  }])
  .service('lazyLoad', ['$q', '$timeout', function($q, $t) {
    'use strict';
    var deferred = $q.defer();
    var promise = deferred.promise;
    this.load = function(files) {
      angular.forEach(files, function(file) {
        if (file.indexOf('.js') > -1) { // script
          (function(d, script) {
            var fDeferred = $q.defer();
            script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.onload = function() {
              $t(function() {
                fDeferred.resolve();
              });
            };
            script.onerror = function() {
              $t(function() {
                fDeferred.reject();
              });
            };

            promise = promise.then(function() {
              script.src = file;
              d.getElementsByTagName('head')[0].appendChild(script);
              return fDeferred.promise;
            });
          }(document));
        }
      });

      deferred.resolve();

      return promise;
    };
  }])
  .filter('safe_html', ['$sce', function($sce) {
    'use strict';
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  }]);
