'use strict';

angular.module('MediaVault').directive('footer', function () {
    return {
        restrict: 'E',
        priority: 100,
        templateUrl: 'views/partials/footer.html'
    };
});

