'use strict';

/* Factory */

angular.module('npl')

         /**
         * Application Logging Service to give us a way of logging 
         * error / debug statements from the client to the server.
         */
        .factory( "applicationLoggingService", ["$log","$window","$http","config",function($log, $window,$http,config){
                
                return({
                    error: function(message){
                        // preserve default behaviour
                        $log.error.apply($log, arguments);
                        // send server side
                        $http.post('', { url: $window.location.href, message: message, type: "error" }, {'Content-Type': 'application/x-www-form-urlencoded'} );
                    },
                    debug: function(message){
                        $log.log.apply($log, arguments);
                        $http.post('' ,{url: $window.location.href,message: message, type: "debug" }, {'Content-Type': 'application/x-www-form-urlencoded'} );
                    }
                });
            }]
        )
/*

        .factory('$exceptionHandler', function () {
                return function (exception, cause) {
                  exception.message += ' (caused by "' + cause + '")';
                  throw exception;
                };
        })

*/      /* AuthService for Login Auth
         * @method login check username / password
         * @method isAuthenticated check user session
         * @method isAuthorized to check user role
         * 
         */
        
        
        .factory('AuthService', ['$http','config','$rootScope','$location', '$route', 'Session', 'serviceData', '$q', '$timeout', function ($http,config,$rootScope,$location, $route, Session, serviceData,$q, $timeout){
               
               return {
			haveConnection : function(){
				 return !navigator.connection || navigator.connection.type !== Connection.NONE;
				 
    			},
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
					//console.log(navigator.connection);
					if(!serviceData.haveConnection() || !navigator.onLine) {
					  return deferred.reject({data: 'No Internet connection available. Please connect to the Internet and try again.'});
					}
					var data = {username: username, password: password};
					$http.post(config.defaultEnvironment.dataServer + '/Api.php?endpoint=token&rnd=' + new Date().getTime(), {'username':username,'password':password,'app_name':'safetyauditapp'}).then(
					  function(res) {
						localStorage.setItem("lastUsername" , username);
						var response_data = res.data;
						var response_headers = res.headers();
						var group = '';
						if (response_data.employeeID != "" && response_data.employeeID != 0) {
							
							var area = response_data.empInfo != undefined ? response_data.empInfo.area : '';
							if (response_data.groups != undefined && angular.isArray(response_data.groups)) {
								for (var i=0; i < response_data.groups.length; i++){
									//console.log(JSON.stringify(response_data.groups[i]));
									if( (response_data.groups[i] == 'Safety Auditors' || response_data.groups[i] == 'SafetyManagers' ) && group == ''){
										group = response_data.groups[i];
									}
								}

								Session.create(response_data.displayName, response_data.employeeID, response_data.sAMAccountName,group, response_data['token'],area, encodeURIComponent(JSON.stringify(response_data.groups)));
								if (angular.isArray(response_data.groups) && response_data.groups.length > 1 && response_data.groups.indexOf('SafetyManagers') != -1 && response_data.groups.indexOf('Safety Auditors') != -1) {
									if(Session.group == 'SafetyManagers'){
									    $rootScope.switchTo = 'Auditor';
																		
									}else if(Session.group == 'Safety Auditors' ){
									    $rootScope.switchTo = 'Manager';
									}
									$rootScope.showAccountSwitching = 1;
								}
							}else{
								Session.create(response_data.displayName, response_data.employeeID, response_data.sAMAccountName,response_data.groups, response_data['token'],area, encodeURIComponent(JSON.stringify([response_data.groups])));        
							}
							deferred.resolve(res);
						}else{
							deferred.reject(res);
						}
						 //serviceData.setUser(response_data.displayName);
					},
					function(resp) {
						console.log(resp);
						if (resp && !resp.data) {
							resp.data = 'An error has occurred, but we\'re not quite sure what\'s wrong. ' +
							'Try checking your Internet connection and restarting Mobile Time.';
						}
						deferred.reject(resp);
					});
					//Session.create('test', '10000818', 'test','Safety Auditors', 'PwclwsaJl4Fg2cCOd8FSSjVZvvvNFCvq');
					//deferred.resolve('Test');
					
				});
				return promise;
			},
                        autoLogin : function(){
                          if (localStorage.getItem('employeeID') != "")
                                Session.setSession(localStorage.getItem('employeeName'),localStorage.getItem('employeeID'),localStorage.getItem('sAMAccountName'),localStorage.getItem('group'),localStorage.getItem('token'),localStorage.getItem('area'),localStorage.getItem('userGroups'));
                                
                                // Used in Case of One Time Login and token expired
                                //this.login({'username':localStorage.getItem('username'), 'password' : localStorage.getItem('password')});      
                        },
                        isAuthenticated: function () {
                          return !!Session.employeeID;
                        },
                        getAuthorizedRoles : function(){
                                 
                                var path = $location.path(),
                                authorizedRoles = '';
                                 //$rootScope.logData($location.path());   
                                angular.forEach($route.routes, function (value, key) {
                                        
					if (key != '' && value.data != undefined) {
						//$rootScope.logData(value.data.authorizedRoles);
						if(key == path && value.data != undefined) {
							authorizedRoles = value.data.authorizedRoles;
						}else if (path.substring(0,14) == '/audit_summary' || path.substring(0,12) == '/audit_photo' || path.substring(0,13) == '/edit_summary' || path.substring(0,17) == '/deficiency_photo') {
							authorizedRoles = value.data.authorizedRoles;
						}	
					}
					
					
                                });
                                return authorizedRoles;        
                        },
                        isAuthorized: function () {
                                this.autoLogin();
                                var authorizedRoles = this.getAuthorizedRoles();
                                if (!angular.isArray(authorizedRoles)) {
                                  authorizedRoles = [authorizedRoles];
                                }
				//console.log(JSON.stringify(Session.group)); 
                                return (this.isAuthenticated() && authorizedRoles.indexOf(Session.group) !== -1);
                        }
                        
               };
       }])
        
        
        /* To check index of a Json in parent json
         * @return int index
         * 
         */
        
        .factory('checkCategoryIndex', function () {
          
                return{
                      getCategoryIndex : function(category_obj, categories){
                        
                        var category_json_obj = {
                                                        "PKAuditCategoryID":category_obj.PKAuditCategoryID,
                                                        "RequirementNotation": category_obj.RequirementNotation,
                                                        "Description": category_obj.Description,
                                                        "CategoryType":category_obj.CategoryType,
                                                        "StartDateTime":category_obj.StartDateTime,
                                                        "EndDateTime":category_obj.EndDateTime,
                                                        "FKCustomerID":category_obj.FKCustomerID,
                                                        "DisplaySortValue":category_obj.DisplaySortValue,
                                                        "ReportSortValue":category_obj.ReportSortValue
                                                };
                        
                        //var category_json_obj = {"id" : category_obj.id , "name" :category_obj.name};
                        
			var objStr = JSON.stringify(category_json_obj);
			
			for(var i=0;i<categories.length; i++)
			{
			    if(JSON.stringify(categories[i]) == objStr)
			    {
                                return i;
                            }
			}
			return -1;
                        
                      }
                      
                };
                
        })
	
	.factory('confirmAlert',['$rootScope', function ($rootScope) {
	
		return function(msg){
			var onConfirm = function(buttonIndex){
				if (buttonIndex == 1) {
					return true;
				}
				return false;	
				
			};
			if(navigator.notification.confirm != undefined) {
				navigator.notification.confirm(
					msg,  // message
					onConfirm,              // callback to invoke with index of button pressed
					'Warning'            // title
				);
			} else {
				if (confirm(msg)) {
					return true;
				}else{
					return false;
				}
			}
			
		}
		
	}])
        
         /*globalVarFactory to lock Audit Form data
         * Between different steps of Audit 
         */
        
        .factory('globalVarFactory', function ($http, Session, config,serviceData,$q) {
          
                return{
                      
		      reset : function(){
		      	this.audit_date = "",
				this.audit_form_data = "",  
				this.assigned_employee  = [],
				this.latitude = '',
				this.longitude = '',
				this.available_employee = [],
				this.categoryMaster = [],
				this.audit_categories = [],
				this.audit_selected_category = [],
				this.audit_selected_subCategory = [],
				this.categoryStatus = [],
				this.Customers = [],
				this.safetyManagers = [],
				this.job_numbers = [],
				this.phase_numbers = [],
				this.supervisors = [],
				this.foremans = [],
				this.vendors = [],
				this.questionDetails = {},
				this.naSubCategories = [],
				this.jobsitePhotos = [],
				this.deficiencyPhotos  = [],
				this.latLongPermission = '',
				this.inProgressAuditID = 0,
				this.edit_audit_form_data = "",
				this.edit_employee_data = "",
				this.edit_auditID = "",
				this.edit_deficiency_data = [],
				this.deletedDeficiency = [],
				this.deletedPhotos = [],
				this.jobSitePhotoID = [],
				this.edit_in_progress = 0;
		      },
                      audit_form_data : "",  
                      assigned_employee  : [],
		      latitude : 0.00,
		      longitude : 0.00,
                      available_employee : [],
		      categoryMaster : [],
                      audit_categories : [],
		      audit_selected_category : [],
		      audit_selected_subCategory : [],
		      categoryStatus : [],
		      Customers : [],
		      safetyManagers : [],
		      job_numbers : [],
		      phase_numbers : [],
		      supervisors : [],
		      foremans : [],
		      jobTitles : [],
		      vendors : [],
		      questionDetails : {},
		      naSubCategories : [],
		      Questions : [],
		      jobsitePhotos : [],
		      deficiencyPhotos : [],
		      latLongPermission : '',
		      inProgressAuditID : 0,
		      edit_audit_form_data : "",
		      edit_employee_data : "",
		      edit_auditID : "",
		      edit_deficiency_data : [],
		      deficiencyData : '',
		      deletedDeficiency : [],
		      deletedPhotos : [],
		      jobSitePhotoID : [],
		      edit_in_progress : 0,
		      refresh : 0,
		      vendorList : [],
		      filterOption : '',
		      getQuestionData : function(){
			
				var mainCategories = [];
				var subCategories = []
				var questionData = [];
				var allDeficiency = [];
				var naSubCategories = []
				var defPhotoCount = 0;
				//console.log("Audit:===="+JSON.stringify(this.audit_categories));
				
				var AllVendors = this.vendorList;
				var audit_categories = this.audit_categories;
				var categoryMaster = this.categoryMaster;
				//console.log(JSON.stringify(response));
				//console.log('AllVendors + ' + JSON.stringify(AllVendors));
				angular.forEach(audit_categories,function(mainCategory,mainCategoryID){
					mainCategories.push(mainCategoryID);
					
					angular.forEach(mainCategory, function(subCategory, subCategoryID){
						subCategories.push(subCategoryID);
						if (subCategory != 'isNA') {
							
							angular.forEach(subCategory, function(question, questionID){								
								if (question != "isComplaint" && question != "isNA" && angular.isArray(question)){
									
									questionData.push({question_id : questionID, compliance_type : 0, deficiency_data : question});	
									for(var i = 0; i < question.length; i++ )
									{
										var VendorName = '';
										//console.log(JSON.stringify(question[i]));
										if ( question[i].employee_name == '' || question[i].employee_name == undefined || question[i].employee_id == '') {
											question[i].employee_name = '';
											if(question[i].vendor_name  != '' && question[i].vendor_name != undefined){
											    VendorName = question[i].vendor_name;
											
											}else{
											    var Vendor  = _.where(AllVendors, {VendorNum : question[i].vendor_id.trim()});
											    VendorName = Vendor != '' ? Vendor[0].VendorName : '';
											}
											if (VendorName != '') {
											    VendorName = ' (' + VendorName + ' ) ';
											}
										}
										
										if ( (question[i].question == '' || question[i].question == undefined ) && categoryMaster.Question != undefined) {
											
											var QuestionData = _.where(categoryMaster.Question, {PKAuditQuestionID : parseInt(questionID)});
											question[i].question = QuestionData[0] != undefined && QuestionData[0].Question != undefined ? QuestionData[0].Question : '';
										}
										
										var SubcategoryData = _.where(categoryMaster.SubCategory, {PKAuditSubCategoryID : parseInt(subCategoryID)});
										var subCatname = SubcategoryData[0] != undefined && SubcategoryData[0].Description != undefined ? SubcategoryData[0].Description : '';
										
										var MaincategoryData = _.where(categoryMaster.Category, {PKAuditCategoryID : parseInt(mainCategoryID)});
										var mainCatname = MaincategoryData[0] != undefined && MaincategoryData[0].Description != undefined ? MaincategoryData[0].Description : '';
										
										var employeeName  = question[i].employee_name != '' ? question[i].employee_name : question[i].vendor_emp+' '+VendorName;
										defPhotoCount = defPhotoCount + question[i].photo_data.length;

										allDeficiency.push({refNum : question[i].ref_num, defEmplyeeID : parseInt(question[i].employee_id), employee : employeeName, question : question[i].question, photos : question[i].photo_data, questionID : questionID, deficiencyID : i, subCategoryID : subCategoryID, subCatname : subCatname, mainCategoryID : mainCategoryID, mainCatname : mainCatname,  defPhotoCount : question[i].photo_data.length, vendor_id : question[i].vendor_id});
										
									}
									
								}else if (question == 'isComplaint') {
									
									questionData.push({question_id : questionID, compliance_type : 1, deficiency_data : ''});
									
								}else if (question == 'isNA') {
									
									questionData.push({question_id : questionID, compliance_type : 2, deficiency_data : ''});	
								}
							});	
						}else{
							naSubCategories.push({subcat_id: subCategoryID, is_na : true});
						}
						
						
					});
					
				});
				
				return JSON.stringify({mainCategories : mainCategories, subCategories : subCategories , questionData : questionData, allDeficiency : allDeficiency, naSubCategories : naSubCategories, defPhotoCount : defPhotoCount});
				
			}
		      
                };
                
        });
