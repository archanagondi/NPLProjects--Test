'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialog
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('delete', function () {
        return {
            templateUrl: 'views/delete-dialog.html',
            restrict: 'E'

        };
    });