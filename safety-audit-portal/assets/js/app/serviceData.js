'use strict';


/**
 *
 * @ngdoc service
 * @name npl.service:serviceData
 * @description Data service to provide caching and offline save functionality.
 */

angular.module('npl')
.provider('serviceData', function () {
  //Private objects
  var mostRecentTimeouts = {};
  var defaultTtl = 60;

  var config = {};

  /**
   * @ngdoc
   * @methodOf npl.service:serviceData
   * @name npl.service:serviceData#setConfig
   * @description This allows you to set up at app startup whether certain `{string} endpoints` contain critical data that
   * should not be returned if invalid through the `{bool} returnExpiredData` key.  You are also able to set the `{int} ttl` property
   * which is specified in minutes.
   *
   * #Configurable properties
   * `{Number} ttl` The time to live in for this endpoint.
   * `{String} cachedAt` The location to store returns for this endpoint. i.e. Consequent gets to the `cachedAt` endpoint will include the results from any queries to this endpoint.
   */

  this.setConfig = function(endpoint, newConfig) {
    if(config[endpoint]) {
      console.error('serviceData endpoint already configured! Check the config of the module.');
    }

    config[endpoint] = newConfig;
  };

  this.setTtl = function(ttl) {
    defaultTtl = ttl || defaultTtl;
    return defaultTtl;
  };


  this.$get = ['$http', '$timeout', '$q', '$cacheFactory', 'config', function($http, $timeout, $q, $cacheFactory, config) {
    var dataCache = $cacheFactory('dataCache');
    var offlineQueue = [];

    var rootUrl = function() {
      return config.currentEnvironment.server;
    };

    var dataServerUrl = function () {
      return config.currentEnvironment.dataServer + '/';
    };
    
    var dataUrl = function () {
      return config.currentEnvironment.dataServer + '/data/';
    };
    



    /**
     * @ngdoc
     * @methodOf npl.service:serviceData
     * @name npl.service:serviceData#getData
     * @public
     * @param {string} key The key off the data to retrieve
     * @param {map} query A map of key-value pairs with which to filter data
     * @param {object} options The options for getting the data
     *
     * #Allowable options:
     *
     * now: Sends the query immediately.
     *
     * extend: Adds anything returned to the current cache rather than replacing it.
     * In the case of extend, the promise will be passed a second parameter that includes all of the data.
     *
     * @description
     *
     * Gets an optionally filtered dataset.
     *
     * @returns {Promise} $q promise
     */

    var getData = function getData(key, query, options) {
      var data;
      options = options || {};
      var deferred = $q.defer();
      var promise = deferred.promise;
          var url =  options.root ? rootUrl() + '/' + key : dataUrl() + key;
          if(options.otherAction !== undefined && options.otherAction != ""){
              url = dataServerUrl() + key;
          } 
          var requestConfig = {
            method: 'GET',
            url: url,
            headers : options.headers
          };

          if(query) {
            requestConfig.params = query;
          }

          $http(requestConfig).success(function(data) {
            deferred.resolve(data);
          }).error(function(data, status){});
      return promise;
    };

    

    return {
      get: getData
    };
  }];
});
