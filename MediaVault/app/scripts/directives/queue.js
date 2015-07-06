'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:queue
 * @description
 * # queue
 */
angular.module('MediaVault')
    .directive('queue', function () {
        return {
            templateUrl: 'views/queue.html',
            restrict: 'E'
        };
    });
