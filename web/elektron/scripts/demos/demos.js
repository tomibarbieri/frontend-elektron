angular
  .module('theme.demos', [
    'oc.lazyLoad',
    'ngWebSocket',
    //'theme.demos.nvd3_charts',
    //'theme.demos.canvas_charts', // este sirve para los graficos
    //'theme.demos.flot_charts', // este sirve para los graficos
    //'theme.demos.morris_charts',
    //'theme.demos.sparkline_charts',
    //'theme.demos.boxed_layout',
    //'theme.demos.horizontal_layout',
    'theme.demos.dashboard',
    'theme.demos.components',
    'theme.demos.history',
    'theme.demos.statistics',
    'theme.demos.monitor',
    'theme.demos.panels',
    'theme.demos.registration_page',
    'theme.demos.signup_page',
    'theme.demos.logout',
    'theme.demos.not_found',
    'theme.demos.error_page',
    'theme.demos.tasks',
  ])
  .directive('img', ['$timeout', function ($t) {
      // NOTE: this affects all <img> tags
      // Remove this directive for production
    'use strict';
      return {
      restrict: 'E',
      link: function (scope, element) {
        $t ( function () {
            var src = element.attr('src') || element.attr('ng-src');
          if (src.match(/assets\/demo/)) {
            element.attr('src', 'http://placehold.it/400&text=Placeholder');
          }
        }, 10);
      }
      };
  }]);
