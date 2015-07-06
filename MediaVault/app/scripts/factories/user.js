'use strict';

/**
 * @ngdoc service
 * @name MediaVault.factory: User
 * @description
 * The factory that generates User objects.
 */

angular.module('MediaVault').factory('User', function () {
    var User = function (id, name, isTest, token, adGroups) {
        this.id = id;
        this.name = name;
        this.isTest = isTest;
        this.token = token;
        this.adGroups = adGroups;
    };

    return User;

});
