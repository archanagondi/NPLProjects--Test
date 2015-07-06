'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:upload
 * @description
 * # upload
 */
angular.module('MediaVault')
    .directive('upload', function () {
        return {
            templateUrl: 'views/upload.html',
            restrict: 'E'

        };
    });
