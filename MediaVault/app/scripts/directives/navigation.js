'use strict';

angular.module('MediaVault').directive('navigation', function (ENV) {
    return {
        templateUrl: 'views/partials/navigation.html',
        restrict: 'E',
        link: function postLink(scope) {
            scope.development = false;

            // if we are not on production
            if (ENV.name !== 'production') {
                scope.development = true;
            }
        }
    };
});