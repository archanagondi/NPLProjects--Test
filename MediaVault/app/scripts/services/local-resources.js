'use strict';

/**
 * @ngdoc service
 * @name MediaVault.service: localResources
 * @description
 * Provides methods for defining local resources for localStorage. An essential part of the current version of localStorage
 * key-value data structure, this service builds the keys for resources. Multiple records are stored as JSON strings per user.
 *
 **/
angular.module('MediaVault').service('localResources', function (ENV, stringUtil) {
    var localResources = this;
    localResources.version = '1.0';

    localResources.resources = {
        login: {
            id: 'login',
            properties: ['last-user'],
            prefixUser: false
        },
        storage: {
            id: 'storage',
            properties: ['version'],
            prefixUser: false
        },
        user: {
            id: 'user',
            properties: ['id', 'name', 'is-test', 'token', 'ad-groups'],
            prefixUser: false
        },
        area: {
            id: 'area',
            properties: ['area-code'],
            prefixUser: false
        },
        phase: {
            id: 'phase',
            properties: ['phase-code'],
            prefixUser: false
        },
        categories: {
            id: 'categories',
            properties: ['categories-code'],
            prefixUser: false
        },
        keywords: {
            id: 'keywords',
            properties: ['keywords-code'],
            prefixUser: false
        },
        geodata: {
            id: 'geodata',
            properties: ['geodata-code'],
            prefixUser: false
        },
    };

    localResources.getUserId = function () {
        var properties;
        if (localResources.resources.user) {
            properties = localResources.resources.user.properties;
        } else {
            return;
        }
        if (_.contains(properties, 'id')) {
            var key = ENV.appName + '_' + localResources.resources.user.id + '-id';
            return localStorage.getItem(key);
        }
        return;
    };

    var getEmployeeId = function (employeeId) {
        if (employeeId) {
            return employeeId;
        }
        var user = localResources.getUserId();
        if (user) {
            return user;
        }
        return;
    };

    localResources.isResource = function (resource) {
        if (localResources.resources[resource]) {
            return true;
        } else {
            return false;
        }
    };

    localResources.isValidProperty = function (resource, property) {
        property = stringUtil.toSinalCase(property);
        if (localResources.resources[resource] && _.contains(localResources.resources[resource].properties, property)) {
            return true;
        } else {
            return false;
        }
    };

    localResources.getResourceProperties = function (resource) {
        if (localResources.resources[resource]) {
            return localResources.resources[resource].properties;
        }
        return;
    };

    localResources.getResourcePropertyKey = function (resource, property, employeeId) {
        if (!resource || !localResources.resources[resource]) {
            return;
        }
        if (!getEmployeeId(employeeId) && localResources.resources[resource].prefixUser) {
            return;
        }

        property = stringUtil.toSinalCase(property);

        if (!localResources.isValidProperty(resource, property)) {
            if (localResources.resources[resource]) {
                throw new Error('Incorrect Property ' + property + '. For ' + resource + ' use ' + localResources.resources[resource].properties.join(', '));
            } else {
                throw new Error('Incorrect Resource : ' + resource);
            }
        }

        var empid = '';

        if (localResources.resources[resource].prefixUser) {
            if (getEmployeeId(employeeId)) {
                empid = getEmployeeId(employeeId);
            } else {
                return;
            }
        }
        return ENV.appName + '_' + empid + '_' + localResources.resources[resource].id + '-' + property;
    };

    localResources.getResourceKeysByProperty = function (resource, employeeId) {
        if (!resource || !localResources.resources[resource]) {
            return;
        }
        if (!getEmployeeId(employeeId) && localResources.resources[resource].prefixUser) {
            return;
        }

        var properties = localResources.resources[resource].properties;
        var keysData = [];
        for (var i = 0, j = properties.length; i < j; i++) {
            var key = localResources.getResourcePropertyKey(resource, properties[i], employeeId);
            if (key) {
                keysData.push({property: properties[i], key: key});
            }
        }

        return keysData;
    };

    return localResources;
});
