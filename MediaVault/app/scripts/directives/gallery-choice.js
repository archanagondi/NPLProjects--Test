'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialog
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('gallerychoice', function () {
        return {
            templateUrl: 'views/gallery-choice.html',
            restrict: 'E'

        };
    });