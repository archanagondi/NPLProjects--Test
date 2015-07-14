'use strict';

/**
 * @ngdoc service
 * @name MediaVault.service: localRecord
 * @description
 * Provides methods for handling data including:
 * * Parsing API query results
 * * Retrieving records from localStorage and turning the data into consumable factory objects
 * * Saving factory objects data in localStorage.
 *
 * This service will return consumable factory objects for the following data types:
 * * User
 **/
angular.module('MediaVault').service('localRecord', function (localResources, stringUtil, User) {

    /**
     * @ngdoc
     * @name MediaVault.service:localRecord#updateStorage
     * @methodOf MediaVault.service: localRecord
     * @private
     * @description Checks if the user is on the current version of localStorage.
     * If not, updates the user to the current version.
     */
    function updateStorage() {
        var key = localResources.getResourcePropertyKey('storage', 'version');
        var version = localStorage.getItem(key);
        if (version) {
            if (version !== localResources.version) {
                /*
                 * Add code here to update to new version.
                 * For multiple versions check which version
                 * they are upgrading from first
                 */
            }
        } else {
            localStorage.setItem(key, localResources.version);
        }
    }

    updateStorage();

    /*
     * The properties of data objects coming form the api are defined below.
     * These values can change and need to be declared in one place to easily
     * accommodate name changes.
     */
    var apiAttributes = {
        user: {
            employeeId: 'employeeid',
            username: 'username',
            displayName: 'display_name',
            token: 'token',
            adGroups: 'groups'
        }
    };

    function parse(type, data, args) {
        switch (type) {
            case 'user':
                return parseUsers(data, args);
        }
        return;
    }

    function save(type, data) {
        switch (type) {
            case 'login':
                saveLoginData(data);
                break;
            case 'user':
                saveUsers(data);
                break;
            case 'area':
                saveArea(data);
                break;
            case 'phase':
                savePhase(data);
                break;
            case 'categories':
                saveCategories(data);
                break;
            case 'keywords':
                savekeywords(data);
                break;

            case 'geodata':
                savegeodata(data);
                break;

        }
    }

    function get(type) {
        var results;
        switch (type) {
            case 'login':
                results = getLoginData();
                break;
            case 'user':
                results = getUser();
                break;
            case 'phase':
                results = getPhase();
                break;
            case 'area':
                results = getArea();
                break;
            case 'categories':
                results = getCategories();
                break;
            case 'keywords':
                results = getkeywords();
                break;
            case 'geodata':
                results = getgeodata();
                break;


        }
        return results;
    }

    function remove(type) {
        switch (type) {
            case 'login':
                removeRecord('login');
                break;
            case 'user':
                removeRecord('user');
                break;
            case 'geodata':
                removeRecord('geodata');
                break;
        }
    }

    //Parse functions
    function parseUsers(data, args) {
        if (!data.user) {
            return;
        }

        var token;
        var isTest = false;
        if (args) {
            if (args.token) {
                token = args.token;
            }
        }
        var user;
        if (data && data.user && data.user[apiAttributes.user.employeeId]) {
            var displayName = data.user[apiAttributes.user.displayName];
            if (displayName.indexOf('Test_') === 0) {
                isTest = true;
            }
            var adGroups = data.user[apiAttributes.user.adGroups];
            if (!adGroups || _.isEmpty(adGroups)) {
                adGroups = [];
            }

            user = new User(data.user[apiAttributes.user.employeeId],
                displayName,
                isTest,
                data[apiAttributes.user.token],
                adGroups);
        }
        return user;
    }

    //Save functions
    function addRecord(resource, values) {
        if (!values) {
            return;
        }
        var properties = localResources.getResourceProperties(resource);

        for (var i = 0, j = properties.length; i < j; i++) {
            var property = properties[i];
            var key = localResources.getResourcePropertyKey(resource, property);
            var propertyName = stringUtil.toCamelCase(property);
            if (key && !stringUtil.isEmptyOrNull(values[propertyName])) {
                if (moment.isMoment(values[propertyName])) {
                    values[propertyName] = values[propertyName].format('YYYY-MM-DD HH:mm:ss.SSS');
                }
                localStorage.setItem(key, values[propertyName]);
            } else if (key) {
                localStorage.removeItem(key);
            }
        }
    }

    function saveLoginData(data) {
        if (data) {
            var values = {
                lastUser: data.username
            };
            addRecord('login', values);
        }
    }


    function saveArea(data) {
        if (data) {
            var values = {
                areaCode: data
            };
            addRecord('area', values);
        }
    }


    function savePhase(data) {
        if (data) {
            var values = {
                phaseCode: data
            };
            addRecord('phase', values);
        }
    }

    function saveCategories(data) {
        if (data) {
            var values =
            {
                categoriesCode: data
            };
            addRecord('categories', values);
        }
    }

    function savekeywords(data) {
        if (data) {
            var values =
            {
                keywordsCode: data
            };
            addRecord('keywords', values);
        }
    }

    function savegeodata(data) {
        if (data) {
            var values =
            {
                geodataCode: data
            };
            addRecord('geodata', values);
        }
    }


    function saveUsers(data) {
        if (data) {
            var groups = [];
            if (data.adGroups && !_.isEmpty(data.adGroups)) {
                groups = data.adGroups.join(',');
            }

            var values = {
                id: data.id,
                name: data.name,
                isTest: data.isTest,
                token: data.token,
                adGroups: groups
            };
            addRecord('user', values);
        }
    }

    //Get functions
    function getRecords(type) {
        if (!localResources.isResource(type)) {
            return;
        }
        var items = {};
        var keysData = localResources.getResourceKeysByProperty(type);
        for (var i = 0, j = keysData.length; i < j; i++) {
            var keyData = keysData[i];
            if (!keyData) {
                continue;
            }
            keyData.property = stringUtil.toCamelCase(keyData.property);
            items[keyData.property] = localStorage.getItem(keyData.key);
        }
        return items;
    }

    function getUser() {
        var userData = getRecords('user');
        if (userData) {
            var groups = userData.adGroups;
            if (groups && groups.length > 0) {
                groups = groups.split(',');
            } else {
                groups = [];
            }
            var user = new User(userData.id, userData.name, userData.isTest, userData.token, groups);
            return user;
        }
        return;
    }

    function getLoginData() {
        var loginData = getRecords('login');
        if (loginData) {
            return loginData;
        }
        return;
    }


    function getArea() {
        var areaData = getRecords('area');
        if (areaData) {
            return areaData;
        }
        return;
    }

    function getCategories() {
        var categoriesData = getRecords('categories');
        if (categoriesData) {
            return categoriesData;
        }
        return;
    }

    function getkeywords() {
        var keywordsData = getRecords('keywords');
        if (keywordsData) {
            return keywordsData;
        }
        return;
    }

    function getgeodata() {
        var geodataData = getRecords('geodata');
        if (geodataData) {
            return geodataData;
        }
        return;
    }


    function getPhase() {
        var phaseData = getRecords('phase');
        if (phaseData) {
            return phaseData;
        }
        return;
    }


    //Remove function
    function removeRecord(resource) {
        var keysData = localResources.getResourceKeysByProperty(resource);
        for (var i = 0, j = keysData.length; i < j; i++) {
            var keyData = keysData[i];
            localStorage.removeItem(keyData.key);
        }
    }

    return {
        parse: parse,
        save: save,
        get: get,
        remove: remove
    };
});    