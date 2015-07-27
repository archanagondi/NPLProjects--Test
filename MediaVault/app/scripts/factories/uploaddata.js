'use strict';

/**
 * @ngdoc service
 * @name MediaVault.factory: User
 * @description
 * The factory that generates User objects.
 */

angular.module('MediaVault').factory('Uploaddata', function () {
    var Uploaddata = function (area) {
        this.area = area;
    };

    return Uploaddata;

});
