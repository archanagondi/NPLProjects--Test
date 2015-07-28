'use strict';
/**
 * @ngdoc overview
 * @name API
 * @description
 * # API
 *
 * The module of the application that handles all http calls to the {@link http://gitlab.gonpl.com/bnorthey/api-v2-php/wikis/home API v2}.
 *
 */
angular.module('api', ['config']);

angular.module('api').service('nplApi', function (ENV, ENDPOINTS, ERRORS, $http, $rootScope, $state, localRecord, promiseUtil) {
    var api = this;

    var apiURL;

    // if we are in dev, set the API url dynamically
    if (ENV) {
        apiURL = ENV.server;
    }
    // else we are on production
    else {
        apiURL = ENV.server;
    }

	
	
	
	
	//testing core services locally 
function post1(endpoint, body) {
        var user = localRecord.get('user');
        var headers = {};
         if (endpoint != ENDPOINTS.signin) {
            if (!user || !user.token) 
			{
                var error = {status: 401, message: ERRORS.login.missingId};
                return promiseUtil.emptyPromise(null, error);
            }

            headers = 
			{   
                'X-Access-Token': user.token,
            };
        } 
			console.log("endpoint----->"+endpoint);
        return $http({
            method: 'POST',
            url: 'http://52.26.121.92/api-v3/MediaVault/' + endpoint,
            headers: headers,
            data: body
        }).success(function (data, status, headers, config) {
			console.log(data);
                if (endpoint == ENDPOINTS.signin) {
                     if (!dasta || !data.token) { //This should never happen
                        var error = {status: 401, message: ERRORS.login.missingId};
                        return promiseUtil.emptyPromise(null, error);
                    } 
                }
                return;
            }).
            error(function (data, status, headers, config) {
                if (status === 401 && user) {
                    user.token = null;
                    localRecord.save('user', user);
                }
                return;
            }).
            finally(function () {
                return;
            });
    }

    function get1(endpoint, params) {
        var user = localRecord.get('user');

        if (!params) {
            params = {};
        }

        if (!user || !user.token) {
            var error = {status: 401, message: ERRORS.login.missingId};
            return promiseUtil.emptyPromise(null, error);
        }

        var headers = {
			
            'X-Access-Token': user.token,
        };

        //must add an extra param to work around IE caching get calls
        params.rnd = +new Date().getTime();

        return $http({
            method: 'GET',
            url: 'http://52.26.121.92/api-v3/MediaVault/' + endpoint,
            headers: headers,
            params: params
        }).
            error(function (data, status, headers, config) {
                if (status === 401 && user) {
                    user.token = null;
                    localRecord.save('user', user);
                }
                return;
            });
    }
	
	//============================================================	
	// append the version to the API URL

    function post(endpoint, body) {
        var user = localRecord.get('user');
        var headers = {};
        if (endpoint != ENDPOINTS.signin) {
            if (!user || !user.token) {
                var error = {status: 401, message: ERRORS.login.missingId};
                return promiseUtil.emptyPromise(null, error);
            }

            headers = {
                'X-Access-Token': user.token,
            };
        }

        return $http({
            method: 'POST',
            url: apiURL + endpoint,
            headers: headers,
            data: body
        }).
            success(function (data, status, headers, config) {
                if (endpoint == ENDPOINTS.signin) {
                    if (!data || !data.token) { //This should never happen
                        var error = {status: 401, message: ERRORS.login.missingId};
                        return promiseUtil.emptyPromise(null, error);
                    }
                }
                return;
            }).
            error(function (data, status, headers, config) {
                if (status === 401 && user) {
                    user.token = null;
                    localRecord.save('user', user);
                }
                return;
            }).
            finally(function () {
                return;
            });
    }

    function get(endpoint, params) {
        var user = localRecord.get('user');

        if (!params) {
            params = {};
        }

        if (!user || !user.token) {
            var error = {status: 401, message: ERRORS.login.missingId};
            return promiseUtil.emptyPromise(null, error);
        }

        var headers = {
            'X-Access-Token': user.token
        };

        //must add an extra param to work around IE caching get calls
        params.rnd = +new Date().getTime();

        return $http({
            method: 'GET',
            url: apiURL + endpoint,
            headers: headers,
            params: params
        }).
            error(function (data, status, headers, config) {
                if (status === 401 && user) {
                    user.token = null;
                    localRecord.save('user', user);
                }
                return;
            });
    }

    function put(endpoint, body) {
        var user = localRecord.get('user');
        if (!user || !user.token) {
            var error = {status: 401, message: ERRORS.login.missingId};
            return promiseUtil.emptyPromise(null, error);
        }

        var headers = {
            'X-Access-Token': user.token,
        };
        return $http({
            method: 'PUT',
            url: apiURL + endpoint,
            headers: headers,
            data: body
        }).
            error(function (data, status, headers, config) {
                if (status === 401 && user) {
                    user.token = null;
                    localRecord.save('user', user);
                }
                return;
            });
    }

    return {
        get: get,
        post: post,
		get1: get1,
        post1: post1,
        put: put
    }
});