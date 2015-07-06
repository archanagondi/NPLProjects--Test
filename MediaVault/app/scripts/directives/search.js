'use strict';

/**
 * @ngdoc directive
 * @name mediaVaultApp.directive:search
 * @description
 * # search
 */
angular.module('MediaVault')
    .directive('search', function () {
        return {
            templateUrl: 'views/search.html',
            restrict: 'E'
        };
    });
