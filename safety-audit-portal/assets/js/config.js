'use strict';

/**
 * @ngdoc service
 * @name npl.service:Config
 * @description
 *
 * Provides the main configuration interface and information for the app.
 *
 * Environment, in this context, means the server endpoint as well as endpoints behind the server that will be used (SAP, SQL db's, etc.)
 */

angular.module('npl')
.service('config', function () {

  /**
   * @ngdoc
   * @propertyOf npl.service:Config
   * @name npl.service:Config#environments
   * @description
   * A list of all the environments that can be accessed
   */

  var environments = this.environments = {
    prd: {
      text: 'Production',
      server: 'https://api2.gonpl.com',
      dataServer : 'https://api.gonpl.com/v1'
    },
    dev: {
      text: 'Development',
      server: 'https://api-dev2.gonpl.com',
      dataServer : 'https://api-dev.gonpl.com/v1'
    },
    localhost: {
      text: 'Localhost',
      server: 'http://localhost.gonpl.com:8080',
      dataServer : 'https://localhost.gonpl.com/v1'
    }
  };

  /**
   * @ngdoc
   * @propertyOf npl.service:Config
   * @name npl.service:Config#currentEnvironment
   * @description Gives access to the current environment for the app.
   */
  /**
   * @ngdoc
   * @propertyOf npl.service:Config
   * @name npl.service:Config#defaultEnvironment
   * @description Gives access to what the default environment was for this app version.
   */

  var currentEnvironment = this.currentEnvironment = this.defaultEnvironment = environments.dev;

  if(this.defaultEnvironment.text !== 'Production') {
    delete environments.prd;
  }

  /**
   * @ngdoc
   * @propertyOf npl.service:Config
   * @name npl.service:Config#version
   * @description Shows the current version number of the app.
   *
   * #This is automatically changed by the build script.
   */
  this.version = '1.1.0' //!!version!!

  /**
   * @ngdoc
   * @methodOf npl.service:Config
   * @name npl.service:Config#chooseEnvironment
   * @param {string} key The key of the environment to choose.
   * @description Allows the user to pick which environment they'd like to communicate with.
   */

  this.chooseEnvironment =  function(name) {
    currentEnvironment = environments[name];
    return currentEnvironment;
  };
  
  this.service_path = {
         log_api          : this.defaultEnvironment.server,
         login_api        : this.defaultEnvironment.dataServer + '/token',
         audit_list_api   : this.defaultEnvironment.server+'/auditList',
         auditMaster      : this.defaultEnvironment.dataServer + '/data/employeeMaster',
         employee_list_api: this.defaultEnvironment.dataServer + '/data/employeeMaster',
         vendor_list_api  : this.defaultEnvironment.server,
         area_master_api  : this.defaultEnvironment.server,
         job_number_api   : this.defaultEnvironment.server,
         supervisor_api   : this.defaultEnvironment.server,
         foreman_api      : this.defaultEnvironment.server,
         categories_api   : this.defaultEnvironment.server+'/categoryList',
         subCategories_api: this.defaultEnvironment.server+'/subcategoryList',
         questions_api    : this.defaultEnvironment.server+'/questionList'
  };
  
});
