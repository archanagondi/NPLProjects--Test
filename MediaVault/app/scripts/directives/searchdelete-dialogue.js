'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:delete-dialogue
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('searchdeletedialogue', function () {
        return {
            templateUrl: 'views/searchdelete-dialogue.html',
            restrict: 'E'

        };
    });