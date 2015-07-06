'use strict';

/**
 * @ngdoc service
 * @name MediaVault.service: navigation
 * @description
 * The service that provides methods for side menu navigation.
 */
angular.module('MediaVault').service('navigation', function () {
    var navigation = this;

    // by default, make the navigation hidden
    navigation.active = false;

    // function to handle opening the navigation
    navigation.open = function () {
        this.active = true;
    };

    // function to handle closing the navigation
    navigation.close = function () {
        this.active = false;
    };
});

    