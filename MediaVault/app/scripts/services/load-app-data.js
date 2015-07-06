'use strict';

/**
 * @ngdoc service
 * @name MediaVault.service: loadAppData
 * @description
 This service is used to get the data from the web for the first time
 and save in the local storage
 */
angular.module('MediaVault').service('loadAppData', function (ENV, ENDPOINTS, ERRORS, MESSAGES, $state, nplApi) {
    var service = {};
    service.getAreas = function () {
        return nplApi.get(ENDPOINTS.areas, {version: ENV.version});
    };
    service.getJobsAndPhases = function () {
        return nplApi.get(ENDPOINTS.jobsandphases, {version: ENV.version});
    };
	service.getCategorie = function () 
	{
		
        return nplApi.get1(ENDPOINTS.getcategories, {version: ENV.version});
        //return nplApi.get(ENDPOINTS.getcategories, {version: ENV.version});
    };
	
	service.getKeywords = function () 
	{
        return nplApi.get1(ENDPOINTS.getkeywords, {version: ENV.version});
    };
	
	
    return service;
});