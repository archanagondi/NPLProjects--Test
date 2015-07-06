'use strict';

angular.module('MediaVault').directive('header', function (navigation, ENV) {
    return {
        templateUrl: 'views/partials/header.html',
        transclude: true,
        restrict: 'E',
        link: function postLink(scope) {
            scope.openNavigation = function () {
                navigation.open();
            };

            scope.development = false;

            // if we are not on production
            if (ENV.name !== 'production') {
                scope.development = true;
            }
        }
    };
});

