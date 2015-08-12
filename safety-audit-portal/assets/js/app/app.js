'use strict';

/* Application */

/*
 * Angular js Application starts here
 * Contains view binding and
 * angular controller function
 */
	// create the module and name it npl
	angular.module('npl', ['ngRoute' , 'ng-breadcrumbs' , 'ngAnimate',  'mgcrea.ngStrap', 'ngSanitize', 'ui.bootstrap'])
        
	// configure our routes
	.config(function($routeProvider, $locationProvider) {
		
		var USER_ROLES = { auditor: 'Safety Auditors', manager: 'SafetyManagers' };
		
		$routeProvider
                
                  // route for the login page
                  .when('/login', { templateUrl : 'pages/login.html', controller  : 'loginController' , label : 'Login' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] } })
                  
                  // route for audit list Page
                  .when('/', { templateUrl : 'pages/audit_management.html', controller  : 'manageAuditController' , label : 'Audit Management' , data: { authorizedRoles: [USER_ROLES.manager] }})
                  
                  // route for audit photo
                  .when('/photo', { templateUrl : 'pages/audit_photo.html', controller  : 'auditPhotoController' , label : 'Photos' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
                  // route for audit summary with route param
                  .when('/audit_summary', { templateUrl : 'pages/audit_summary.html', controller  : 'auditSummaryController' , label : 'Summary' , data: { authorizedRoles: [USER_ROLES.auditor, USER_ROLES.manager] }})
                                    
                  // route logout
                  .when('/logout', { templateUrl : 'pages/login.html', controller  : 'logoutController' , label : 'Logout' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] }})
                  
                  // For all other url
                  .otherwise({ redirectTo: '/' });
	})
        
        
        // Bind functon to rootscope for global access
	.run(function ($rootScope,AuthService, $location,breadcrumbs,serviceAudit){
               var development = true;
               var authEvents =  AuthService.AUTH_EVENTS;
	       $rootScope.global_success = '';
               $rootScope.breadcrumbs = breadcrumbs;
	       		$rootScope.lastAccessedURL;
               
	       
               //Custom debugger for development & production mode
               $rootScope.logData = function(data){
                  if (development === true) {
                  }
               };
               
               $rootScope.$on('$routeChangeStart', function(event, next, prevRoute){
                  if (!AuthService.isAuthorized()) {
                       event.preventDefault();
                    if (!AuthService.isAuthenticated()) {
                      // user is not logged in
                      $rootScope.logData(authEvents.notAuthenticated);
                      $location.path("/login");
                    }
                  }
              });
               
               $rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
                  if(AuthService.isAuthenticated()) {
                     $rootScope.lastAccessedURL = absOldUrl;
                  }
               });
         });

	
/* Application Ends */