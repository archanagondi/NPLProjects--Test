'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:email-dialogue
 * @description
 * 
 */
angular.module('MediaVault')
    .directive('emaildialogue', function () {
        return {
            templateUrl: 'views/email-dialogue.html',
            restrict: 'E'

        };
    });