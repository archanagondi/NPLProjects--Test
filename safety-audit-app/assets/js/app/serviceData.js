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
  var updateInterval = 10;
  var prefix = {
    main: 'serviceData_',
    user: ''
  };
  
  var localStoragePrefix = function() {
    return prefix.main + prefix.user;
  };

  var defaultReturnExpiredData = true;
  var config = {};
  var queueProcessing = false;
  var photoProcessing = false;
  
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
      //console.error('serviceData endpoint already configured! Check the config of the module.');
    }

    config[endpoint] = newConfig;
  };

  this.setTtl = function(ttl) {
    defaultTtl = ttl || defaultTtl;
    return defaultTtl;
  };

  this.interval = function(interval) {
    updateInterval = interval || updateInterval;
    return updateInterval;
  };

  this.prefix = function(pre) {
    prefix.main = pre || prefix.main;
    return localStoragePrefix();
  };

  this.$get = ['$http', '$timeout', '$q', '$cacheFactory', 'config','$webSql', function($http, $timeout, $q, $cacheFactory, config,$webSql) {
    // Sqlite database and tables created if not exists
    var db = $webSql.openDatabase('NPL_DB', '1.0', 'Test DB', 2 * 1024 * 1024);
    db.createTable('localStorage', {
                                       "id":{
                                        "type": "INTEGER",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                        "primary": true, // primary
                                        "auto_increment": true // auto increment
                                      },
                                      "key":{
                                        "type": "Text",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                      },
                                      "data":{
                                        "type": "Text",
                                        "null": "NOT NULL",
                                      }
                                  });
    db.createTable('auditDataStorage', {
                                      "id":{
                                        "type": "INTEGER",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                        "primary": true, // primary
                                        "auto_increment": true // auto increment
                                      },
                                      "auditData":{
                                        "type": "Text",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                      },
                                      "status":{
                                        "type": "TEXT",
                                      },
                                  });
    
    db.createTable('inProgressAudits', {
                                      "id":{
                                        "type": "INTEGER",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                        "primary": true, // primary
                                        "auto_increment": true // auto increment
                                      },
                                      "auditData":{
                                        "type": "Text",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                      },
                                      "employeeID":{
                                        "type": "INTEGER",
                                      },
                                      "step":{
                                        "type": "Text",
                                      },
                                      "status":{
                                        "type": "INTEGER",
                                      },
                                      "TotalDef":{
                                        "type": "INTEGER",
                                      },
				      "TotalDefPhoto":{
                                        "type": "INTEGER",
                                      }
                                  });
    
    db.createTable('photoDataStorage', {
                                      "id":{
                                        "type": "INTEGER",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                        "primary": true, // primary
                                        "auto_increment": true // auto increment
                                      },
                                      "photoData":{
                                        "type": "Text",
                                        "null": "NOT NULL", // default is "NULL" (if not defined)
                                      },
                                      "auditID":{
                                        "type": "Text",
                                      },
                                      "status":{
                                        "type": "TEXT",
                                      },
                                  });
    
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
    
    //What to do for errors.
    var parseError = function(response, sendObject) {
      var deferral = $q.defer();
               var oldPromise = 0;
      if (sendObject.deferral != undefined && sendObject.deferral.notify != undefined && sendObject.deferral.resolve != undefined && sendObject.deferral.reject != undefined){
        deferral = sendObject.deferral;
               oldPromise = 1;
      }
      if(response.status != undefined && Math.floor(Number(response.status) / 100) === 5) {
        deferral.reject('Offline save connected but received a server error in response: ' + response.message);
               if(oldPromise == 0){return deferral.promise;}
               return true;
      } else {
        deferral.reject(response);
         if(oldPromise == 0){return deferral.promise;}
        /*var index = offlineQueue.indexOf(sendObject);
        if (index > -1) {
          offlineQueue.splice(index, 1);
        }*/
        return false;
      }
    };
    
    // Function to update localstorage data
    function updateLocal(name, newData) {
      var cachedAt = config[name] && config[name].cachedAt || name;
      var localDataStore = getLocalData(cachedAt);
      //console.log(localDataStore);
      if (localDataStore != false) {
        var id = config && config[cachedAt] && config[cachedAt]._id || '_id';
        var currentCacheHash = _.indexBy(localDataStore.data, id);
        newData = angular.isArray(newData) ? newData : [newData];
  
        //Now for each response
        angular.forEach(newData, function(record) {
          var hash;
          if(angular.isFunction(id)) {
            //If there's a hash function apply it.
            hash = id(record);
          } else {
            hash = record[id];
          }
  
          //Extend or replace
          if(currentCacheHash[hash]) {
            
            _.extend(currentCacheHash[hash], record);
          } else {
            currentCacheHash[hash] = record;
          }
        });
        //Now put the data back to the cache.
        var dataToRecache = _.map(currentCacheHash, function(val) {
          return val;
        });
        setData(cachedAt, dataToRecache);
        return dataToRecache;  
      }else{
        setData(name, newData);
        return newData;
      }
      
    }

    /**
     * @ngdoc
     * @name npl.service:serviceData#sendData
     * @methodOf npl.service:serviceData
     * @private
     * @param {SendObject} sendObject Object to send. Should be constructed via SendObject.
     * @description Sends an object of type SendObject. Internal only.
     */

    function sendData (sendObject) {
      var deferred = $q.defer();
      
      if (sendObject.deferral != undefined && sendObject.deferral.notify != undefined && sendObject.deferral.resolve != undefined && sendObject.deferral.reject != undefined){
        //console.log('Here is sendobj deferral');
        deferred = sendObject.deferral;  
      }
      
      deferred.notify('OfflineQueue processed with a connection.');

      var endpoint = sendObject.endpoint;
      var verb;

      if(sendObject.options.method) {
        verb = sendObject.options.method;
      } else if(sendObject.data._id) {
        verb = 'put';
        endpoint += '/' + sendObject.data._id;
      } else {
        verb = 'post';
      }
      var headers = sendObject.options.headers != "" ? sendObject.options.headers : '';
     
      var sendConfig = {
        method : verb,
        url: endpoint,
        data: sendObject.data,
        headers : headers
      };
      
      if(sendConfig.url.indexOf('https://') === 0) {
        /*sendConfig.headers = {
          'Authorization': 'Basic ' + window.btoa(config.currentEnvironment.user + ':' + config.currentEnvironment.key)
        };*/
      }

      $http(sendConfig).then(function(response) {
        var name = sendObject.name;
        //updateLocal(name, response.data);
        deferred.resolve(response.data);
        //Handle items coming from queue.
      }, function(response) {
        parseError(response, sendObject);
        //deferred.reject('Try Later');
      }, function(message) {
        deferred.notify(message);
      });
      

      return deferred.promise;
    }

    /**
     * @ngdoc
     * @name npl.service:serviceData#haveConnection
     * @methodOf npl.service:serviceData
     * @private
     * @description
     *
     * Runs through the offline save queue to save forms to the server
     *
     */

    function haveConnection() {
      return !navigator.connection || navigator.connection.type !== Connection.NONE;
    }
    
    // Process queue function to process localstorage data(*Not in use now)
    var processQueue = function processQueue() {
      //console.log('Processing Queue..');

      $timeout.cancel(mostRecentTimeouts.send);

      //Process the queue
      getLocalData('offlineQueue').then(function(res){
            offlineQueue = res;
            if(offlineQueue != '' && angular.isArray(offlineQueue) && offlineQueue.length > 0) {
             if(haveConnection()) {
               _.each(offlineQueue, function(queueItem) {
                 sendData(queueItem).then(function() {
                   //success
                   var index = offlineQueue.indexOf(queueItem);
                   if (index > -1) {
                     offlineQueue.splice(index, 1);
                   }
                 });
               });
               setData('offlineQueue', offlineQueue);
             } else {
               _.each(offlineQueue, function(queueItem) {
                 queueItem.deferral.notify('OfflineQueue processed but no connection was available.');
               });
               mostRecentTimeouts.send = $timeout(processQueue, updateInterval * 60 * 1000);
             }
           }
      });
    };

    /**
     * @ngdoc
     * @name npl.service:serviceData#setData()
     * @methodOf npl.service:serviceData
     * @public
     * @param {String} key The key used to retrieve this data.
     * @param {Object} value The value to store at specified key
     * @param {Number} ttl Optional time to live for the data. 0 does not get stored and -1 is stored indefinitely.
     *
     * @returns {Object} The data as it has been stored
     *
     * @description Sets a local copy of data to be retrieved at this endpoint in the future
     *
     */

    var setData = function setData(key, value, options) {
      if (key != 'auditMaster' && key != 'employeeMaster' && key != 'auditMaster.json') {
        options = options || {};
        var ttl = options.ttl;
  
        if(!ttl) {
          ttl =(config[key] && _.isNumber(config[key].ttl)) ? config[key].ttl : defaultTtl;
        }
  
        var data = {
          data: value,
          dateStamp: new Date(),
          ttl: ttl
        };
  
        dataCache.put(localStoragePrefix() + key, data);
        //localStorage.setItem(localStoragePrefix() + key, JSON.stringify(data));
        db.del('localStorage', {'key' : localStoragePrefix() + key}, function(res){
            db.insert('localStorage', {'key' : localStoragePrefix() + key, 'data' : encodeURIComponent(JSON.stringify(data))});  
        });  
      }
      return value;
    };
    
    
    /**
    * @ngdoc
    * @methodOf npl.service:serviceData
    * @name npl.service:serviceData#storeAuditLocally()
    * @param {value} data The data object to save.
    *@param  {option object}
    * @description
    *
    * Save audit data locally due to poor internet connection and sent it on server when got internet connection.
    */
    
    function storeAuditLocally(value, options)
    {
      options = options || {status:1};
      var data = {
        auditData: encodeURIComponent(JSON.stringify(value)),
        status: options.status
      };
      db.insert('auditDataStorage', data,function(res){
	//console.log(JSON.stringify(res));
      });  
      return value;
    }
    
    /**
    * @ngdoc
    * @methodOf npl.service:serviceData
    * @name npl.service:serviceData#saveAuditprogress()
    * @param {value} data The data object to save.
    * @param  {saveType}
    * @description
    *
    * Save audit data locally and allow user to complete it later.
    */
    
    function saveAuditprogress(value,options)
    {
      //saveType == 1 ? Insert : Update;
      options = options || {type: 1};
      var defer = $q.defer();
	 
	  //Count photo and deficiency for selected Audit
	  var defCount=0;	 
	  var defPhotoCount = 0;
	  //console.log("Audit:===="+JSON.stringify(value.audit_categories));
	  	angular.forEach(value.audit_categories,function(mainCategory,mainCategoryID){					
			angular.forEach(mainCategory, function(subCategory, subCategoryID){						
				if (subCategory != 'isNA') {
					angular.forEach(subCategory, function(question, questionID){								
						if (question != "isComplaint" && question != "isNA" && angular.isArray(question)){						
							for(var i = 0; i < question.length; i++ )
							{										
								defPhotoCount = defPhotoCount + question[i].photo_data.length;
								defCount = defCount + 1;										
							}									
						}
					});				
			}
		});
	});
	
      //End count
		
      var data = {
          auditData: encodeURIComponent(JSON.stringify(value)),
          employeeID : options.employeeID,
          step : options.page,
          status: 1,
		  TotalDef: defCount,
		  TotalDefPhoto:defPhotoCount		  
        };
        
      if (options.type == 1) {		
        db.insert('inProgressAudits', data, function(response){
          defer.resolve(response);  
        });    
      }else{
        db.update('inProgressAudits', { auditData: encodeURIComponent(JSON.stringify(value))}, {"id" : options.id}, function(response){
           db.update('inProgressAudits', { TotalDef: defCount}, {"id" : options.id}, function(response){
         	 defer.resolve(response);  
        	});
        });
		
        
      }
      
      return defer.promise;
    }

    /**
     * @ngdoc
     * @methodOf npl.service:serviceData
     * @name npl.service:serviceData#dataIsValid()
     * @private
     * @param {Object} data The data object to send. Instance of private class DataObject
     *
     * @description
     *
     * Returns true if the data object is still valid, based on the time to live in minutes and the date stamp.
     */

    var dataIsValid = function dataIsValid(data) {

      if(data.ttl < 0) {
        return true;
      }
      if(data.ttl === 0) {
        return false;
      }

      var now = new Date().getTime();
      var timeStamp = new Date(data.dateStamp).getTime();

      var expirationDate = timeStamp + (60 * 1000 * data.ttl);

      if(now < expirationDate) {
        return true;
      } else {
        return false;
      }
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
      var localData;
      options = options || {};
      var deferred = $q.defer();
      var promise = deferred.promise;

      /**
       * @ngdoc
       * @name npl.service:serviceData#handleExpiredData
       * @methodOf npl.service:serviceData
       * @private
       *
       * @description
       *
       * Handles errors based on availability of localData, the expiration of that data, and criticality of that data.
       */

      function handleExpiredData(errorCode) {
        var errorStatus = '';
        if (errorCode) {
          errorStatus = errorCode;
        }
        
        //If we have local data and either there's no config, or we're allowed to return expired data
        if((localData && localData.data != undefined && !config[key] && defaultReturnExpiredData) || (config[key] && config[key].returnExpiredData)) {
          deferred.reject({data: localData.data, message: 'TTL Expired', errorCode : errorStatus});
        } else {
          deferred.reject({message: 'TTL Expired and no data could be returned ', errorCode : errorStatus});
        }
      }
      
      var localProcess = getLocalData(key).then(function(res){
          localData = res;
          return res;
      },function(err){
        return err;
      });
      
      $q.all([localProcess]).then(function(result){
          //If we have the data locally,
      if(!options.now && (localData && dataIsValid(localData))) {
        //data = localData.data;
        data = localData.data;
        //Resolve the promise with our data.
        deferred.resolve(data);
        
      } else {
        
        if(haveConnection()) {
          var url =  options.root ? rootUrl() + '/' + key : config.currentEnvironment.dataServer + '/' + key;

          if(options.otherAction !== undefined && options.otherAction != ""){
              url = dataServerUrl() + key;
          }           
          
          if(url.indexOf('2') < 0){
        	  if(!query){ query = {}; }
        	  if(!options.headers){ options.headers = {}; }
        	  query.rnd = new Date().getTime();        		  
        	  options.headers.Pragma = 'no-cache';
          }       
          
          var requestConfig = {
            method: 'GET',
            url: url,
            headers : options.headers
          };

          if(url.indexOf('https://') === 0) {
           /* requestConfig.headers = {
              'Authorization': 'Basic ' + window.btoa(config.currentEnvironment.user + ':' + config.currentEnvironment.key)
            };*/
          }

          if(query) {
            requestConfig.params = query;
          }
          
          $http(requestConfig).success(function(data) {
            
            if(options.extend) {
              updateLocal(key, data);
            } else {
              setData(key, data, options);
            }
            //console.log(data);
             deferred.resolve(data);
          }).error(function(data, status){handleExpiredData(status)});
        } else {
          
          if(!options.now && localData) {
            handleExpiredData();
          } else {
            deferred.reject({data:localData,message: 'Data was not cached, and no connection was available', errorCode : 106});
          }
        }
      }
      });
      
      return promise;
      
      
    };

    /**
     * @ngdoc
     * @name npl.service:serviceData#getLocalData
     * @methodOf npl.service:serviceData
     * @private
     * @param {string} key the key to check for data
     * @return {DataObject} The object from cache or localStorage or false if nothing was stored.
     *
     * @description Checks for a local copy of the data and returns it if found.
     */

    //Check if we have the data locally.
    function getLocalData (key) {
      var localData;
      var localKey = localStoragePrefix() + key;
      var defer = $q.defer();
      db.select('localStorage' , {'key' : {'value' : localKey , 'operator' : '='} }, function(res){
        
       for(var i=0; i < res.rows.length; i++){
        defer.resolve(JSON.parse(decodeURIComponent(res.rows.item(i).data)));
       }
       if (res.rows.length == 0) {
        defer.reject({data: '', message: 'No record found', errorCode : 404});
       }
      },function(err){
        defer.reject({data: '', message: 'No record found', errorCode : 404});
      });
      return defer.promise;
      
      /*if(dataCache.get(localKey)) {
        return(dataCache.get(localKey));
      } else if (localStorage.getItem(localKey)) {
        localData = JSON.parse(localStorage.getItem(localKey));
        dataCache.put(localKey, localData);
        return localData;
      } else {
        return false;
      }*/
    }

    var SendObject = function(endpoint, data, options) {       
    	this.deferral = $q.defer();
    	this.endpoint = endpoint;
    	this.name = endpoint.split('/').pop();
    	this.data = data;
    	this.options = options;
    };

    //Save functionality

    /**
     * @ngdoc
     * @name npl.service:serviceData#send
     * @methodOf npl.service:serviceData
     * @public
     * @param {string} endpoint The name of the table/collection to save the document under.
     * @param {object} data The data to send.
     * @param {options} options The optional options object.
     * @returns {$q.promise} The promise that will be resolved upon completion.
     *
     * @description Sends data to an endpoint in an offline-friendly way
     */

    var send = function send(endpoint, data, options) {
      if(!endpoint) {
        throw 'Must use an endpoint to send.';
      }
      options = options || {};

      //Handle the root & otherAction option.
       if(options.otherAction !== undefined && options.otherAction != ""){
         endpoint = dataServerUrl() + endpoint;
      }else{
        endpoint = options.root ? rootUrl() + '/' + endpoint : dataUrl() + endpoint;
      }  
             
      var sendObject = new SendObject(endpoint, data, options);
      
      //Handle the 'now' option.
      if(options.now) {

        if(haveConnection()) {
          sendData(sendObject);
        
        } else {
          storeAuditLocally(sendObject);
          sendObject.deferral.reject('No Internet connection available. Please connect to the Internet and try again.');
        }
      } else {
          storeAuditLocally(sendObject);
      }

      return sendObject.deferral.promise;
    };

    /**
     * @ngdoc
     * @name npl.service:serviceData#clear
     * @methodOf npl.service:serviceData
     * @param {string} name The optional name of the cache location to clear.
     *
     * @description
     *
     * Clears data stored by the data service. Can either clear everything with no param or a named storage location when param `name` is set.
     *
     */
    var clearData = function(name) {
      if(name) {
        dataCache.remove(localStoragePrefix() + name);
        //localStorage.removeItem(localStoragePrefix() + name);
        db.del('localStorage', {'key' : localStoragePrefix() + name})
      } else {
        dataCache.removeAll();
        db.del('localStorage', {'key' : {value : 'IS NOT NULL'} })
        //localStorage.clear();
      }
    };

    /**
     * @ngdoc
     * @name npl.service:serviceData#setuser
     * @methodOf npl.service:serviceData
     * @param {string} name The name of the user
     *
     * @description
     *
     * Sets the prefix to use a username. This allows separating 'namespaces' and not deleting data.
     *
     */

    var setUser = function(name) {
      prefix.user = name+"_";
    };

    
    /**
     * @ngdoc
     * @methodOf npl.service:serviceData
     * @name npl.service:serviceData#dropDatabase
     * @public
     * @param cb is the callbak function
     * Drop all database tables forcefully, normally used during testing and called at the time of logout
     */
    
    var dropDatabase = function(cb){
      
      db.dropTable('auditDataStorage');
      db.dropTable('inProgressAudits');
      db.dropTable('photoDataStorage');
      db.dropTable('localStorage', cb);
      
    };
    
    /**
     * @ngdoc
     * @methodOf npl.service:serviceData
     * @name npl.service:serviceData#deleteRow
     * @public
     * @param table {string} database table name
     * @param key {string} database table column name
     * @param value {string} database table column value
     * @param cb {callback function}
     * Delete a particular row from a particular database table
     */
    
    function deleteRow(table,key,value,cb){
      db.del(table, {id : parseInt(value)},cb );
    }
    
    /**
     * @ngdoc
     * @methodOf npl.service:serviceData
     * @name npl.service:serviceData#uploadPhoto
     * @public
     * @param imageURI {string} Photo path from where photo have to upload on server
     * @param auditID {string} Audit PK to which uploaded photo belongs
     * Upload single photo at a time on server along with Audit ID as param
     */
    
    function uploadPhoto(imageURI, auditID) {
          var defer = $q.defer();
          var options = new FileUploadOptions();
          options.fileKey="fileUpload";
          options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
          options.mimeType="image/jpeg";

          var params = new Object();
          params.auditId = auditID;
          params.fileName = imageURI;

          options.params = params;
          options.chunkedMode = false;
          var ft = new FileTransfer();
          ft.upload('file://'+imageURI, rootUrl() + "/uploadPhoto" , function(win){
        	  //console.log(JSON.stringify(win));
        	  defer.resolve(win);
        	  }, function(fail){
        		 // console.log(JSON.stringify(fail));
        		  defer.resolve(fail);
        	}, options);
          return defer.promise;
    }
    
    
     /**
     * @ngdoc
     * @name npl.service:serviceData#ProcessAuditQueue
     * @methodOf npl.service:serviceData
     * @description
     *
     * This function is responsible for whole offline processing.
     * In case of poor connection audit will be save to sqlite (in auditDataStorage table) and sync on server when connection available.
     * All photo attached with audits are stored in sqlite (in photoDataStorage table) and uploaded on server one by one when connection available.
     * This function called in every 7 sec and executed if there is no ongoing queue (queueProcessing & photoProcessing manage ongoing processing).
     *
     */
    
    var ProcessAuditQueue = function() {
       
      if (haveConnection() && queueProcessing == false) {
        db.selectAll("auditDataStorage", function(results) {
          if (results.rows != undefined) {
            for(var i=0; i < results.rows.length; i++){
              (function(i){
                queueProcessing = true;
                  //console.log('Processing Queue..');  
                  var auditPrimaryKey = results.rows.item(i).id;
                  var sendObject = JSON.parse(decodeURIComponent(results.rows.item(i).auditData));
                  var auditJSONData = JSON.parse(decodeURIComponent(sendObject.data).replace('audit_json_data=',''));
                  
                  var jobSitePhotos = auditJSONData.audit_data.photo_data;
                  var questionData = auditJSONData.question_data;
                  var finalPhotoData = [];
               
                  sendData(sendObject).then(function(res) { 
                      angular.forEach(jobSitePhotos, function(value,key){
                          finalPhotoData.push(value);
                      });
                      
                      angular.forEach(questionData,function(value,key){
                        
                        if (value.deficiency_data != '' && angular.isArray(value.deficiency_data) && value.deficiency_data.length > 0 )
                        {
                            for(var i = 0; i < value.deficiency_data.length; i++)
                            {
                              var deficiency = value.deficiency_data;
                              for(var D = 0; D < deficiency.length; D++){
                              
                                if (deficiency[D].photo_data != undefined  && angular.isArray(deficiency[D].photo_data) && deficiency[D].photo_data.length > 0)
                                {
                                    var photoData = deficiency[D].photo_data;
                                    
                                    for(var p =0; p < photoData.length; p++){
                                        finalPhotoData.push(photoData[p].src);
                                    }
                                }                                      
                              }
                            }
                        }  
                      });
                      if (finalPhotoData.length > 0) {
                            db.insert('photoDataStorage', {'photoData' : encodeURIComponent(JSON.stringify(finalPhotoData)), 'auditID' : res.audit_id, 'status' : 0 });
                      }
                      db.del("auditDataStorage", {"id": auditPrimaryKey},function(){
                        //console.log('Audit Deleted -- ' + auditPrimaryKey + '--- Photo Data Length ' + finalPhotoData.length);
                        queueProcessing = false;
                      });
                  },function(err){
                      //console.log(err);
                      queueProcessing = false;
                  });
                  
              })(i);
            } 
        }else{
          queueProcessing = false;
        }
        });
      }
      
      if (haveConnection() && photoProcessing == false) {
               
          db.selectAll("photoDataStorage", function(results) {
          if (results.rows != undefined) {
            for(var i=0; i < results.rows.length; i++){
                (function(i){
                  photoProcessing = true;
                  //console.log('Processing Photos..');
                  var photoDataPK = results.rows.item(i).id;
                  var photoData  = JSON.parse(decodeURIComponent(results.rows.item(i).photoData));
                  var auditID = results.rows.item(i).auditID;
                 
                  var manageDB = function(photoData, photoDataPK){
                     if (photoData.length > 0) {
                      db.update('photoDataStorage', {'photoData' : encodeURIComponent(JSON.stringify(photoData))}, {"id" : photoDataPK}, function(response){
                        //console.log('UPDATED '+ JSON.stringify(photoData), photoDataPK);
                      });  
                    }else{
                      photoProcessing = false;
                      db.del('photoDataStorage', {"id" : photoDataPK}, function(res){
                        //console.log('Deleted'+ JSON.stringify(photoData), photoDataPK);
                      });
                    }
                  };
                  
                  var upload = function(p, photoData, auditID, photoDataPK){
                        if (photoData[p] != undefined) {
                          photoProcessing = true;
                          var photoSrc = photoData[p].src != undefined ? photoData[p].src : photoData[p];
                          uploadPhoto(photoSrc,auditID).then(function(photoRes){
                                photoData.splice(p,1);
                                manageDB(photoData, photoDataPK);
                                upload(p++, photoData, auditID,photoDataPK);
                          },function(photoErr){
                                  manageDB(photoData, photoDataPK);
                                  upload(p++, photoData, auditID,photoDataPK);
                          });  
                        }else{
                          photoProcessing = false;
                        }
                  }
                  upload(0, photoData, auditID, photoDataPK);
                })(i);
            }
	  }else{
	   photoProcessing = false;
	  }
        });
      }
    }
    
    return {
      send: send,
      get: getData,
      set: setData,
      clear: clearData,
      setUser: setUser,
      getLocalData : getLocalData,
      haveConnection : haveConnection,
      dropDatabase : dropDatabase,
      uploadPhoto : uploadPhoto,
      ProcessAuditQueue : ProcessAuditQueue,
      saveAuditprogress : saveAuditprogress,
      deleteRow : deleteRow,
      db : db
    };
  }];
});
