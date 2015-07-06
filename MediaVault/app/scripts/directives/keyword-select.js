'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:upload
 * @description
 * # upload
 */
angular.module('MediaVault')
    .directive('keywordselect', function () {
        return {
            templateUrl: 'views/keyword-select.html',
            restrict: 'E'

        };
    });