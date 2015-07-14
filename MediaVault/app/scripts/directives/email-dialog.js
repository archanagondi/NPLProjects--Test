'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialog
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('email', function () {
        return {
            templateUrl: 'views/email-dialog.html',
            restrict: 'E'

        };
    });