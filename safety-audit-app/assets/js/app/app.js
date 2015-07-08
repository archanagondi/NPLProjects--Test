'use strict';

/* Application */

/*
 * Angular js Application starts here
 * Contains view binding and
 * angular controller function
 */
	// create the module and name it npl
	angular.module('npl', ['ngRoute' , 'ng-breadcrumbs' , 'ngAnimate',  'ngSanitize', 'mgcrea.ngStrap','angular-websql'])
        
	// configure our routes
	.config(function($routeProvider, $locationProvider) {
		
		//Application User roles for route access management
		var USER_ROLES = { auditor: 'Safety Auditors', manager: 'SafetyManagers' };
		
		$routeProvider
                
                  // route for the login page
                  .when('/login', { templateUrl : 'pages/auditor/login.html', controller  : 'loginController' , label : 'Login' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] } })
                  
                  //route for  home Page
                  .when('/', { templateUrl : 'pages/auditor/home.html', controller  : 'mainController' , label : 'Home' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
                  //route for new audit Page
                 .when('/new_audit', { templateUrl : 'pages/auditor/new_audit.html', controller  : 'addAuditController' , label : 'Job Phase' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
		  //route for new categories Page
                  .when('/new_audit/categories', { templateUrl : 'pages/auditor/categories.html', controller  : 'categoryController' , label : 'Categories' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
                  //route for new sub_categories Page
                  .when('/new_audit/categories/sub_categories', { templateUrl : 'pages/auditor/sub_categories.html', controller  : 'subCategoryController' , label : 'Sub Categories' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
                  // route for the photos
                  .when('/photo', { templateUrl : 'pages/auditor/photo.html', controller  : 'photoController' , label : 'Photos' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] }})
		  
		  // route for the photos
                  .when('/deficiency_photo/:defID/:quesID', { templateUrl : 'pages/auditor/deficiency_photo.html', controller  : 'deficiencyPhotoController' , label : 'Photos' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] }})
                  
                  // route for the photos
                  .when('/summary', { templateUrl : 'pages/auditor/audit_summary.html', controller  : 'reviewController' , label : 'Summary' , data: { authorizedRoles: [USER_ROLES.auditor] }})
                  
                  // route for the admin
                  .when('/manage_audit', { templateUrl : 'pages/manager/audit_management.html', controller  : 'manageAuditController' , label : 'Audit Management' , data: { authorizedRoles: [USER_ROLES.manager] }})
                 
		 //route for edit audit Page
                  .when('/edit_audit', { templateUrl : 'pages/manager/edit_audit.html', controller  : 'editAuditController' , label : 'Job Phase' , data: { authorizedRoles: [USER_ROLES.manager] }})
				  
                  //route for edit categories Page
                  .when('/edit_audit/categories', { templateUrl : 'pages/manager/edit_categories.html', controller  : 'editCategoryController' , label : 'Categories' , data: { authorizedRoles: [USER_ROLES.manager] }})
				  
                  //route for edit sub_categories Page
                  .when('/edit_audit/categories/sub_categories', { templateUrl : 'pages/manager/edit_sub_categories.html', controller  : 'editSubCategoryController' , label : 'Sub Categories' , data: { authorizedRoles: [USER_ROLES.manager] }})                
		   
		  // route for the summary
		  .when('/edit_summary/:auditId', { templateUrl : 'pages/manager/edit_audit_summary.html', controller  : 'editReviewController' , label : 'Summary' , data: { authorizedRoles: [USER_ROLES.manager] }}) 
		   
		  // route for the summary
                 .when('/audit_summary/:auditId', { templateUrl : 'pages/manager/edit_audit_summary.html', controller  : 'auditSummaryController' , label : 'Summary' , data: { authorizedRoles: [USER_ROLES.manager, USER_ROLES.auditor] }})
		  
		  // route for the photos
                 .when('/audit_photo/:auditId', { templateUrl : 'pages/auditor/photo.html', controller  : 'auditPhotoController' , label : 'Photos' , data: { authorizedRoles: [USER_ROLES.manager] }})
		  
                  // route for the setting page
                  //.when('/settings', { templateUrl : 'pages/auditor/settings.html', controller  : 'settingsController' , label : 'Settings' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] }})
                  
                  //route logout
                  .when('/logout', { templateUrl : 'pages/auditor/login.html', controller  : 'logoutController' , label : 'Logout' , data: { authorizedRoles: [USER_ROLES.auditor,USER_ROLES.manager] }})
                  
		  //For all other url
                  .otherwise({ redirectTo: '/' });
	})

        // Bind functon once application starts for global access
	.run(function ($rootScope,AuthService, $location,breadcrumbs,serviceAudit,$interval,serviceData,$route,globalVarFactory,$window,Session){
           
	   var development = false;
           var authEvents =  AuthService.AUTH_EVENTS;
	       $rootScope.global_success = $rootScope.global_error = $rootScope.global_process = $rootScope.showConfirm =  '';
	       $rootScope.isIOS7 = 0;
	       $rootScope.syncData = 0;
               $rootScope.breadcrumbs = breadcrumbs;
	       $rootScope.lastAccessedURL;
               
               //Custom debugger for development & production mode
		$rootScope.logData = function(data){
		   if (development === true) {
		      //console.log(data)
		   }
		};
        	
		//Check whether user is looged in and allowed to access requested url
		$rootScope.$on('$routeChangeStart', function(event, next, prevRoute){
		   if (!AuthService.isAuthorized()) {
			event.preventDefault();
		     if (AuthService.isAuthenticated()) {
		       // user is not allowed
		       $rootScope.logData(authEvents.notAuthorized);
		       $location.path("/");
		       
		     } else {
		       // user is not logged in
		       $rootScope.logData(authEvents.notAuthenticated);
		       $location.path("/login");
		     }
		   }
		});
		
		//Manage last accessed url
		$rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
		   if(AuthService.isAuthenticated()) {
		      $rootScope.lastAccessedURL = absOldUrl;
		   }
		});
		
		//Sync data in local sqlite database
		$rootScope.synchronizeData = function(){
			var d = new Date();
			var hour = d.getHours();
			var minute = d.getMinutes();
			var ap = 'AM';
			
			if (hour   > 11) { 
				ap = 'PM';             
			}

			if (hour > 12) {
			    hour -= 12;
			} else if (hour === 0) {
			   hour = 12;
			}

			if (minute < 10) { 
				minute = '0' + minute; 
			}

			var loginDateTime = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + hour + ':' + minute + ap;

			localStorage.setItem('lastRefresh', loginDateTime);

			$rootScope.lastRefresh = loginDateTime;

			$rootScope.global_error = '';	
			if (serviceAudit.haveConnection()) {
         
				setTimeout(function() { $rootScope.global_process = 'Synchronization in progress...' ; }, 1);		
        			$rootScope.syncData = 1;
				$rootScope.logData('synchronization starts');
				serviceAudit.updateLists().then(function(data){
					$rootScope.logData(data);
					if(( data.auditMaster.errorCode != undefined) || ( data.employeeMaster.errorCode != undefined)){
						$location.path('/logout');
						$rootScope.global_error = 'An error occurred. May be Invalid Token OR Server Error.';
						
					}
					$rootScope.logData('synchronization Success');
					$rootScope.syncData = 0;
					$rootScope.global_process = '' ;
					var path = $location.path();
					if (path == '/new_audit' || path == '/edit_audit' || path == '/summary' || path == '/edit_audit/categories/sub_categories' || path == '/new_audit/categories/sub_categories') {
						$location.path($location.path(),true);
					}else{
						$route.reload();	
					}
				},function(err){
					$rootScope.logData('synchronization Error' + err.message);
					if (err.errorCode !== undefined && err.errorCode === 401) {
						$location.path('/logout');	
					}else{
						$rootScope.global_error = err.message;
					}
				});	
			}else{
				$rootScope.global_error = 'No Internet Connection.';
			}
		};
		
		//hide messages
		$rootScope.hideMessage = function(messageVar){
			messageVar == 'global_success' ? $rootScope.global_success = '' : $rootScope.global_error = '';
			$rootScope.global_error = '';
		}
		
		//Css setting for IOS7
		$rootScope.isFocus = 0;
		if (navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i)){ $rootScope.isIOS7 = 1; }
		     
		//Sync local saved audits and photos on server. Check Internet in every 7 sec and sync data if found
		function syncQueue(){if($rootScope.syncData == 0){ serviceData.ProcessAuditQueue(); } }
		window.setInterval(syncQueue, 2000);
		
		// confirmation before change route from breadcrumb     
		$rootScope.goToBreadcrumb = function(path){
		   if(globalVarFactory.audit_form_data == '' && $location.path() == '/new_audit'){
			
			navigator.notification.confirm('Are you sure you want to leave this page ?',
				function(buttonIndex){
					if(buttonIndex == 1){$location.path(path);$rootScope.$digest();}
				} , 'Warning');
		   }else{
		       $location.path(path);
		   }
		}
		
		var userGroups = JSON.parse(decodeURIComponent(localStorage.getItem('userGroups')));
		$rootScope.showAccountSwitching = 0;
		$rootScope.switchTo = 'Other';
		Session.group = localStorage.getItem('group');
		if (angular.isArray(userGroups) && userGroups.length > 1 && userGroups.indexOf('SafetyManagers') != -1 && userGroups.indexOf('Safety Auditors') != -1) {
			
			if(Session.group == 'SafetyManagers'){
				$rootScope.switchTo = 'Auditor';
				
			}else if(Session.group == 'Safety Auditors' ){
				$rootScope.switchTo = 'Manager';
			}
			$rootScope.showAccountSwitching = 1;
         }
			$rootScope.switchUserAccount = function(){
				
				globalVarFactory.filterOption = '';
				if(Session.group == 'Safety Auditors' ){
				    $rootScope.switchTo = 'Auditor';	
				    Session.group = 'SafetyManagers';
				    localStorage.setItem("group" , 'SafetyManagers');
				    globalVarFactory.reset();
				    globalVarFactory.refresh = 1;
				    $location.path('/manage_audit',true);
				}
				else if(Session.group == 'SafetyManagers'){
				    $rootScope.switchTo = 'Manager';
				    Session.group = 'Safety Auditors';
				    localStorage.setItem("group" , 'Safety Auditors');
				    globalVarFactory.reset();
				    globalVarFactory.refresh = 1;
				    $location.path('/',true);
				}
			};	
		
         
         });	
/* Application Ends */