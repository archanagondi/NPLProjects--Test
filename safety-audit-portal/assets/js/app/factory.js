'use strict';

/* Factory */

angular.module('npl')

        
       
        
        /* AuthService for Login Auth
         * @method login check username / password
         * @method isAuthenticated check user session
         * @method isAuthorized to check user role
         * 
         */
        
        
	.factory('AuthService', ['$http','config','$rootScope','$location', '$route', 'Session', 'serviceData', '$q', '$timeout', function ($http,config,$rootScope,$location, $route, Session, serviceData,$q, $timeout){
               
		return {
				
				AUTH_EVENTS : {
					loginSuccess: 'auth-login-success',
					loginFailed: 'Bad Credentials',
					logoutSuccess: 'auth-logout-success',
					sessionTimeout: 'auth-session-timeout',
					notAuthenticated: 'auth-not-authenticated',
					notAuthorized: 'auth-not-authorized'
				},
				login: function (username,password) {
					var deferred = $q.defer();
					var promise = deferred.promise;
					$timeout(function() {
						if(!username || !password) {
							return deferred.reject({data: 'Please enter a username and password.'});
						}
						var data = {username: username, password: password};
						$http.post(config.defaultEnvironment.dataServer + '/token', {'username':username,'password':password,'app_name' : 'safetyauditportal'}).then(
						function(res) {
							var validCredential = false;;
							// check user role is Safety Superintendent
							for (var i=0; i < res.data.groups.length; i++){
									if(res.data.groups[i] == 'Safety Superintendent')
									{
										var validCredential = true;	
									}
									
							}
							
							if(validCredential){
								var response_data = res.data;
								var response_headers = res.headers();
								if(response_headers['x-auth-token'] != null){
									var token = response_headers['x-auth-token'];
								}else{
									var token = res.data.token;
								}
								if(token != undefined){
									var area = response_data.empInfo != undefined ? response_data.empInfo.area : '';
									if (response_data.employeeID != "" && response_data.employeeID != 0) {
										Session.create(response_data.displayName, response_data.employeeID, response_data.sAMAccountName,response_data.groups[0], token, area, 1);
									}
								}
								deferred.resolve(res);
							}else{
								res.data = 'Invalid user!.';
								deferred.reject(res);
							}
						},
						function(resp) {
							if (resp && !resp.data) {
								resp.data = 'An error has occurred, but we\'re not quite sure what\'s wrong. ' +
								'Try checking your Internet connection and restarting Mobile Time.';
							}
							deferred.reject(resp);
						});
					});
					return promise;
				},
				autoLogin : function(){
				  if (sessionStorage.getItem('employeeID') != "")
						Session.setSession(sessionStorage.getItem('displayName'),sessionStorage.getItem('employeeID'),sessionStorage.getItem('sAMAccountName'),sessionStorage.getItem('group'),sessionStorage.getItem('token'), sessionStorage.getItem('area'));
				},
				isAuthenticated: function () {
				  return !!Session.employeeID;
				},
				getAuthorizedRoles : function(){
						 
						var path = $location.path(),
							authorizedRoles = '';
						angular.forEach($route.routes, function (value, key) {
							if(key === path && value.data !== undefined) authorizedRoles = value.data.authorizedRoles;
						});
						return authorizedRoles;        
				},
				isAuthorized: function () {
						this.autoLogin();
						var authorizedRoles = this.getAuthorizedRoles();
						if (!angular.isArray(authorizedRoles)) {
						  authorizedRoles = [authorizedRoles];
						}
						return (this.isAuthenticated() && authorizedRoles.indexOf(Session.group) !== -1);
				}
				
			};
       }])
	
	 /*globalVarFactory to store temp data */
        
        .factory('globalVarFactory', function ($http, Session, config,serviceData,$q) {
          
                return{
					auditid : [],
					searchparam : []
					};
                
        });
        
