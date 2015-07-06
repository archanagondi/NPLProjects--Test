'use strict';

angular.module('MediaVault').directive('loading', function () {
    return {
        templateUrl: 'views/partials/loading.html',
        restrict: 'E',
        scope: {
            label: '='
        }
    };
});