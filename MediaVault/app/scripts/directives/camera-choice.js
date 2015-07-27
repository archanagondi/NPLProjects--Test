'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialog
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('capturechoice', function () {
        return {
            templateUrl: 'views/camera-choice.html',
            restrict: 'E'

        };
    });