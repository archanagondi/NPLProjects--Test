'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialogue
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('deletedialogue', function () {
        return {
            templateUrl: 'views/delete-dialogue.html',
            restrict: 'E'

        };
    });