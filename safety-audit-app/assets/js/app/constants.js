'use strict';
/**
 * @ngdoc Constant
 * @name npl.Constant:USER_ROLES
 * @description
 *
 * Provides the User Roles information, to manage application functionality.
 */

angular.module('npl')
   
   .constant('USER_ROLES', {
      auditor: 'Safety Auditors',
      manager: 'SafetyManagers'
   });