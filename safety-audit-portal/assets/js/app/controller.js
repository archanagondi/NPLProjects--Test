'use strict';

/* Controller */
	
angular.module('npl')
	/**
	 * @function login
	 * for url '/login'
	 * check user session in sessionStorage 
	 * redirects on login / home page
	 * depends on @function isAuthenticated
	 * @return view
	 */
	.controller('loginController', ['$scope','$location', 'AuthService', 'Session', function($scope, $location, AuthService, Session){
		$scope.global_process = '';
		$scope.global_error = '';
		$scope.global_success = '';
		if (AuthService.isAuthenticated() == false) {
			$scope.credentials = {username: '',password: ''};
			$scope.login = function (credentials) {
				$scope.login_message = "";
				if(credentials.username != "" && credentials.password != ""){
					$scope.global_process = 'Please wait...';
				       AuthService.login(credentials.username,credentials.password).then(function () {
					        $location.path("/");
					     }, function (err) {
						
						$scope.global_process = '';
						if (err.data != undefined && !angular.isArray(err.data)) {
							$scope.login_message = err.data;	
						}else{
							$scope.login_message = 'Bad Credentials';	
						}
						
						
					     });
				}else{
					$scope.global_process = '';
					$scope.login_message = "An error has occurred";
				}
			};
		}else{
			$location.path("/");
		}
	}])
	
		
	/**
	 * @function manageAudits of auditors
	 * Show summary of audits
	 * 
	 */
.controller('manageAuditController',['$scope','$location','serviceAudit','serviceData','Session', '$http', 'config', '$timeout', 'globalVarFactory', function($scope, $location, serviceAudit, serviceData, Session, $http, config, $timeout, globalVarFactory)
{
	
		$scope.global_process = '';
		$scope.global_error = '';
		$scope.global_success = '';
		if (Session.group === 'Safety Auditors')
			$location.path('/');
		
		var param = {};	
		if(globalVarFactory.searchparam != ''){
			if(globalVarFactory.searchparam.period != undefined){
				$scope.filter_period =  globalVarFactory.searchparam.period; param.period = globalVarFactory.searchparam.period;
			}
			
			if(globalVarFactory.searchparam.type!= undefined){ $scope.filter_type = globalVarFactory.searchparam.type; param.type = globalVarFactory.searchparam.type;}else if(globalVarFactory.searchparam.type != undefined){ delete globalVarFactory.searchparam.type;}
			if(globalVarFactory.searchparam.foreman != undefined) {param.foreman = globalVarFactory.searchparam.foreman;}else if(globalVarFactory.searchparam.foreman != undefined){ delete globalVarFactory.searchparam.foreman;}
		
			if(globalVarFactory.searchparam.status != undefined) {$scope.filter_status = globalVarFactory.searchparam.status; param.status = globalVarFactory.searchparam.status;}else if(globalVarFactory.searchparam.status != undefined){ delete globalVarFactory.searchparam.status;}
		}
		if(Object.keys(param).length === 0 && globalVarFactory.auditid.length == 0){
			$scope.filter_status = param.status = 3;
		}else{
			if(globalVarFactory.searchparam.status != undefined){
				$scope.filter_status  = globalVarFactory.searchparam.status;
			}else{
				$scope.filter_status = '';
			}
		}
		if(globalVarFactory.searchparam.period == ''){
			$scope.filter_period = param.period = 30;
		}
		if(sessionStorage.getItem("area") != undefined){
			param.area_id = sessionStorage.getItem("area"); 
		}
		serviceAudit.getAuditList(param).then(function(data){
			$scope.global_process = 'Please wait...';
			var auditListaData = [];
			var foremanListaData = [];
			var objAuditListData = '';
			var httpRequestCount = 0;
			// loop for add employee name in employeeDataObject
			var auditListCount = data.length;
			if(auditListCount == 0){$scope.global_process = '';}
			angular.forEach(data, function(objAuditListData) {
				
				// get forman employee name by passing formanEmployeeId
				var formanEmployeeId = objAuditListData.FKForemanID;
				serviceAudit.getEmployeeName(formanEmployeeId)
					.then(function(data){
						
						httpRequestCount = httpRequestCount + 1;
						if (httpRequestCount == auditListCount) {
							if(globalVarFactory.searchparam.foreman != undefined) {$scope.filter_foreman = globalVarFactory.searchparam.foreman; }
							$scope.forman_list = _.sortBy(uniqueForemanList, function(obj){return obj.formanEmployeeName;});
							$scope.global_process = '';
						}
						if (typeof(data) != 'undefined') {
							if (typeof(data.LastName) != 'undefined') {
								objAuditListData.formanEmployeeName = data.FirstName+' '+data.LastName;
							}else{
								objAuditListData.formanEmployeeName = '';
							}
						}else{							
							objAuditListData.formanEmployeeName = '';
						}
					},function(error){
						httpRequestCount = httpRequestCount + 1;
						if (httpRequestCount == auditListCount) {

							$scope.global_process = '';
						}
						// add employee name in objEmployeeData
						objAuditListData.formanEmployeeName = '';
					});
				// get customer name by passing customerId
				var customerId = objAuditListData.FKCustomerID;
				var caustomerData = serviceAudit.getCustomerName(customerId);
					caustomerData.then(function(data){
						if (typeof(data) != 'undefined') {
							objAuditListData.customerName = data.CustomerName;
						}else{
							objAuditListData.customerName = '';	
						}
					},function(error){
						// add employee name in objEmployeeData
						objAuditListData.customerName = '';
					});
				objAuditListData.DefCount = (objAuditListData.DefCount) ? objAuditListData.DefCount : 0;
				auditListaData.push(objAuditListData);
				foremanListaData.push(objAuditListData);
				
			});
			var uniqueForemanList = _.uniq(foremanListaData, function(item, key, FKForemanID) { 
				return item.FKForemanID;
			});
			$scope.audit_list = auditListaData;
			$scope.forman_list = uniqueForemanList;
			
			$scope.hideProcessMessage = function(messageVar){
				messageVar == 'global_process' ? $scope.global_process = '' : $scope.global_error = '';
			}
			
			
			
			
			$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
				$scope.global_process = '';
			});
			$scope.predicate = 'PKAuditID';
				
		});
		
		$scope.abortRequest = function() {
			return( requestForFriends && requestForFriends.abort() );
		};
		
		$scope.filter_audit_list = function(){ 
				if(this.filter_period != ''){ param.period = this.filter_period;}else if(param.period != undefined){ delete param.period;}
				if(this.filter_type != ''){ param.type = this.filter_type;}else if(param.type != undefined){ delete param.type;}
				if(this.filter_foreman != '') {param.foreman = this.filter_foreman;}else if(param.foreman != undefined){delete param.foreman;}
				if(this.filter_status != '') {param.status = this.filter_status;}else if(param.status != undefined){ delete param.status;}
				globalVarFactory.searchparam = param;
				var auditListaData = [];
				var foremanListaData = [];
				var objAuditListData = '';
				var httpRequestCount = 0;
				$scope.global_process = 'Please wait...';
				serviceAudit.getAuditList(param).then(function(data){
						var auditListCount = data.length;
						if(auditListCount == 0){$scope.global_process = '';}
						angular.forEach(data, function(objAuditListData) {
							// get forman employee name by passing formanEmployeeId
							var formanEmployeeId = objAuditListData.FKForemanID;
							serviceAudit.getEmployeeName(formanEmployeeId)
								.then(function(data){
									httpRequestCount = httpRequestCount + 1;
									if (httpRequestCount == auditListCount) {
										$scope.forman_list = _.sortBy(uniqueForemanList, function(obj){return obj.formanEmployeeName;});
										$scope.global_process = '';
									}
									if (typeof(data) != 'undefined') {
											objAuditListData.formanEmployeeName = data.FirstName+' '+data.LastName;
									}else{	
										httpRequestCount = httpRequestCount + 1;
										if (httpRequestCount == auditListCount) {
											$scope.global_process = '';
										}
										objAuditListData.formanEmployeeName = '';
									}
								},function(error){
									// add employee name in objEmployeeData
									objAuditListData.formanEmployeeName = '';
								});
							// get customer name by passing customerId
							var customerId = objAuditListData.FKCustomerID;
							serviceAudit.getCustomerName(customerId)
							.then(function(data){
								if (typeof(data) != 'undefined') {
									objAuditListData.customerName = data.CustomerName;
								}else{
									objAuditListData.customerName = '';	
								}
							},function(error){
								// add employee name in objEmployeeData
								objAuditListData.customerName = '';
							});
							objAuditListData.DefCount = (objAuditListData.DefCount) ? objAuditListData.DefCount : 0;
							auditListaData.push(objAuditListData);
							foremanListaData.push(objAuditListData);
						});
						var uniqueForemanList = _.uniq(foremanListaData, function(item, key, FKForemanID) { 
							return item.FKForemanID;
						});
					$scope.audit_list = auditListaData;	
					$scope.forman_list = uniqueForemanList;
					
				});	
		};
			
		$scope.auditDetail = function(auditId, auditStatus){
				globalVarFactory.auditid = auditId;
				$location.path('/audit_summary');
		}
		
		$scope.back_page = $scope.lastAccessedURL;
	}])
	
	
	
	/**
	 * @function review
	 * Show audit detail
	 * 
	 */
	.controller('auditSummaryController',[ '$scope', 'serviceAudit', 'Session', 'AuthService','config','$http','$q', '$timeout', '$route', '$location', 'globalVarFactory', function($scope, serviceAudit, Session, AuthService,config , $http ,$q, $timeout, $route, $location, globalVarFactory) {
		$scope.global_error = '';
		$scope.global_success = '';
		$scope.global_process = '';
		$scope.showEnlargePhoto = '';
		var param = {};		
		if(globalVarFactory.auditid == ''){
			$location.path('/');	
		}
		param.audit_id = globalVarFactory.auditid;
		$scope.isDesktop = true;
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			$scope.isDesktop = false;
		}
		// geting single audit detail.
		$scope.global_process = 'Please wait...';
		param.time = new Date().getTime();
		$scope.showLargeImage = function(imageSrc){
			if (imageSrc != '') {
				$scope.LargeImage = imageSrc;
				$scope.showEnlargePhoto = 'true';
			}
			
		};
		$scope.hideLargeImage = function(){
			$scope.showEnlargePhoto = '';
			$scope.LargeImage = '';
		};
		serviceAudit.getAuditDetail(param).then(function(data){
			// Job site photo slider
			$scope.auditStatusId = data.auditData.FKAuditStatusID;
			$scope.postAudit = (data.auditData.IsPostAudit) ? 'Yes' : 'No';
			$scope.one_call_ticket = data.auditData.one_call_ticket;
			
			var response = data.jobSitePhotoData;
			var imgArr = [];
			$scope.myInterval = 5000;							
			for(var c = 0; c < response.length; c++) {
				var rec = response[c];
				imgArr.push({image: rec.FileName});
			}		
			$scope.slides = imgArr;
			
			$scope.$watch('slides', function(values) {
				var i, a = [], b = {};
				for (i = 0; i < $scope.slides.length; i++) {
				  	b = { image1: $scope.slides[i] };
					for(var k = 2; k < 10; k++ ){
					if ($scope.slides[i++] != undefined)
			  			b['image' + k] = $scope.slides[i];
					}
					a.push(b); 
				}
				$scope.groupedSlides = a;
			}, true);
			
			// Deficiency photo slider
			var groupedDeficiencySlides = [];
			$scope.defSlideCollection = function(defId){
				var response = data.deficiencyPhotoData;
				var imgArr = [];
				$scope.myInterval = 5000;							
				for(var c = 0; c < response.length; c++) {
					var rec = response[c];
					if(rec.FKAuditReqCategoryDeficientID == defId){
						imgArr.push({image: rec.FileName});
					}
				}
				$scope.defSlides = imgArr;			
				$scope.$watch('slides', function(values) {
					var i, a = [], b = {};
					for (i = 0; i < $scope.defSlides.length; i++) {
						b = { image1: $scope.defSlides[i] };
						for(var k = 2; k < 10; k++ ){
						if ($scope.defSlides[i++] != undefined)
							b['image' + k] = $scope.defSlides[i];
						}
						a.push(b); 
					}
					$scope.groupedDeficiencySlides = a;
				}, true);
			}
			
			$scope.totalPhotosCount = data.jobSitePhotoData.length + data.deficiencyPhotoData.length;
			
			$scope.goToBack = function(isAuditSummaryTab){
				$scope.isAuditSummaryTab = 1;
				$scope.isDeficienciesTab = 0;
				$scope.showEnlargePhoto = '';
				$scope.LargeImage = '';
				
			}
														 
			$scope.audit_detail = data;
			$scope.enableCompleteButton = false;
			
			var defIDS = []
			var correctiveActionAdded = 0
			angular.forEach(data.deficiencyData, function(value,key){
				correctiveActionAdded = _.where(data.correctiveActionData, {deficiency_id : value.PKAuditReqCategoryDeficientID}).length > 0 ? correctiveActionAdded + 1 : correctiveActionAdded;	
				
			});
			
			if (data.deficiencyData.length == correctiveActionAdded && data.auditData.FKAuditStatusID == 3) {
				$scope.enableCompleteButton = true;
			}else{
				$scope.enableCompleteButton = false;
			}
			
			var employeeDataObject = data.employeeData;
			
			// get customer name by passing customerId
			var customerId = data.auditData.FKCustomerID;
			serviceAudit.getCustomerName(customerId)
			.then(function(data){
				if (data != undefined) {
					$scope.global_process  = '';
					$scope.customerName = data.CustomerName;
				}else{
					$scope.global_process  = '';
					$scope.customerName = '';
				}
			},function(error){
				// add employee name in objEmployeeData
				$scope.global_process  = '';
				$scope.customerName = '';
			});
						
			// get employee name by passing employeeId and add employee name in employeeDataObject
			var empObjData = [];
			// loop for add employee name in employeeDataObject
			angular.forEach(employeeDataObject, function(objEmployeeData, key) {
				// get employee name by passing auditEmpId
				var auditEmpId = objEmployeeData.FKEmployeeID;
				if (auditEmpId) {
					serviceAudit.getEmployeeName(auditEmpId)
					.then(function(data){
						if (data.MiddleName != 'undefined') {
							objEmployeeData.empName = data.FirstName+' '+data.MiddleName+' '+data.LastName;
						}else{
							objEmployeeData.empName = ''
						}
					},function(error){
						// add employee name in objEmployeeData
						objEmployeeData.empName = '';
					});
				}
				// push objEmployeeData data in empObjData 
				empObjData.push(objEmployeeData);
			});
			// assign empObjData in $scope.empDataWithName
			$scope.empDataWithName = empObjData;
			
			
			// get auditor name by passing auditorId
			var auditorId = data.auditData.FKAuditorEmployeeID;
			if (auditorId) {
				serviceAudit.getEmployeeName(auditorId)
					.then(function(data){
						if (data != undefined) {
								if(data.LastName != undefined){
									$scope.auditorName = data.FirstName+' '+data.LastName;
								}else{
									$scope.auditorName = data.FirstName;	
								}
						}else{
							$scope.auditorName = '';
						}
					},function(error){
						$scope.auditorName = '';
					});
			}
			
			// get supervisor name by passing supervisorId
			var supervisorId = data.auditData.FKSupervisorID;
			if(!isNaN(parseInt(supervisorId)) && angular.isNumber(parseInt(supervisorId))){
				serviceAudit.getEmployeeName(supervisorId)
					.then(function(data){
						if (data.MiddleName != undefined) {
							$scope.supervisorName = data.FirstName+' '+data.MiddleName+' '+data.LastName;
						}else{
							$scope.supervisorName = '';
						}
					},function(error){
						$scope.supervisorName = '';
					});
			}else{
				$scope.supervisorName = '';
			}
			
			// get forman name by passing formanId
			var formanId = data.auditData.FKForemanID;
			if(!isNaN(parseInt(formanId)) && angular.isNumber(parseInt(formanId))){
				serviceAudit.getEmployeeName(formanId)
					.then(function(data){
						if (data != undefined) {
								if(data.LastName != undefined){
									$scope.formanName = data.FirstName+' '+data.LastName;
								}else{
									$scope.formanName = data.FirstName;	
								}
						}else{
							$scope.formanName = '';
						}
					},function(error){
						$scope.formanName = '';
					});
			}else{
				$scope.formanName = '';
			}
			
			
			var safetyManagerId = data.auditData.FKSafetyManagerEmployeeID;
			if(!isNaN(parseInt(safetyManagerId)) && angular.isNumber(parseInt(safetyManagerId))){
				serviceAudit.getEmployeeName(safetyManagerId)
					.then(function(data){
						if (data != undefined) {
								if(data.LastName != undefined){
									$scope.safetyManagerName = data.FirstName+' '+data.LastName;
								}else{
									$scope.safetyManagerName = data.FirstName;	
								}
						}else{
							$scope.safetyManagerName = '';
						}
					},function(error){
						$scope.safetyManagerName = '';
					});
			}else{
				$scope.safetyManagerName = '';
			}
			
			
			
			var locationStateId = data.auditData.LocationState;
				serviceAudit.getLocationStateName(locationStateId)
						.then(function(data){
							$scope.stateName = data[0].StateName;
						},function(error){
							$scope.stateName = '';
						});
			
			$scope.hideMessage = function(messageVar){
				messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
			}
				
			$scope.isAuditSummaryTab = true;
			$scope.isCorrectiveActionTab = false;
			$scope.isDeficienciesTab = false;
			$scope.currentDeficiency = 1;
			
		});
		
		// set completed audit status by passing auditId, statusId and api_key.
		$scope.setAuditCompleteStatus = function (auditId){
			param.audit_id = auditId;
			param.status_id = 4;
			var testHeaders = {'Content-Type':'application/x-www-form-urlencoded'};
			var auditJsonData = 'audit_status='+JSON.stringify(param);
			$http({method: "POST", url :config.currentEnvironment.server+ '/auditStatusUpdate', data: auditJsonData,  headers: testHeaders})
				.then(function(res){
					if (res.data.code == 'S0101') {
						$scope.audit_detail.auditData.FKAuditStatusID = '4';
						$scope.global_success = 'Response send to server.';
						$timeout(function() { $location.path('#/');$scope.hideMessage('global_success');}, 1000)
					}else{
						$timeout(function() {$scope.hideMessage('global_error');}, 1000)
						 $scope.global_error = 'Server not respond!';
					}
				},function(error){
					$timeout(function() {$scope.hideMessage('global_error');}, 1000)
					 $scope.global_error = 'Server not respond!';
				});
		}
		
		// get deficiency employee name by passing deficiencyEmployeeId
		$scope.getDeficiencyEmployeeName = function(employeeId){
				serviceAudit.getEmployeeName(employeeId)
				.then(function(data){
					if (typeof(data.MiddleName) != 'undefined') {
						$scope.deficiencyEmployeeName = data.FirstName+' '+data.LastName;
					}else{
						$scope.deficiencyEmployeeName = '';
					}
				},function(error){
					// add employee name in objEmployeeData
					$scope.deficiencyEmployeeName = '';
				});
		}
		
		
		// view audit deficiency.
		$scope.showDeficiencies = function(deficienciesCount){
			if(deficienciesCount != 0) {
				$scope.isDeficienciesTab = true;
				$scope.isAuditSummaryTab = false;
				$scope.isCorrectiveActionTab = false;
				$scope.showEnlargePhoto = '';
				$scope.LargeImage = ''
			}
		}
		
		// view audit corrective action.
		$scope.showCorrectiveAction = function(deficiencyId){
			$scope.isCorrectiveActionTab = true;
			$scope.isDeficienciesTab = false;
			$scope.isAuditSummaryTab = false;
			$scope.deficiencyId = deficiencyId;
			$scope.showEnlargePhoto = '';
			$scope.LargeImage = '';
		}
		
		// view next audit deficiency.
		$scope.nextDeficiency = function(currentDeficiency, totalDeficiency){
			if (totalDeficiency > currentDeficiency) {
				currentDeficiency = currentDeficiency + 1;
				if(totalDeficiency >= currentDeficiency) $scope.currentDeficiency = currentDeficiency;
			}
		}
		
		// view previous audit deficiency.
		$scope.preDeficiency = function(currentDeficiency){
			if (currentDeficiency > 1) {
				$scope.currentDeficiency = currentDeficiency - 1;
			}
		}
		
		// insert corrective actions .
		$scope.submitCorrectiveAction = function (correctiveActionData) {
			//$scope.isClicked = true;
			var correctiveActionParam = {};
			var correctiveActions = [];
			var correctiveActionJsonData = '';
			correctiveActionParam.audit_id = param.audit_id;
			if(correctiveActionData != undefined && correctiveActionData.other == 5) {
				correctiveActionParam.is_other_selected = 1;
			}else{
				correctiveActionParam.is_other_selected = 0	
			}
			if(correctiveActionData != undefined && correctiveActionData.note != ''){
				correctiveActionParam.note = correctiveActionData.note;
			}
			correctiveActionParam.audit_deficiency_id = $scope.deficiencyId;
			correctiveActionParam.manager_employee_id = Session.employeeID;
			angular.forEach(correctiveActionData, function(value, key) {
				if(key != 'note' && value != 0){
					correctiveActions.push({'def_reps_type_id' : value});
				}
			});
			if(correctiveActionData != undefined && correctiveActionData.other != undefined && correctiveActionData.other == 5 && (correctiveActionData.note =='' || correctiveActionData.note == undefined)){
				$scope.isClicked = false;
				$scope.global_error = 'Please enter a note for "Other" corrective action option!';
				$timeout(function() {$scope.hideMessage('global_error');}, 3000);
			}else if(correctiveActions.length > 0){
				correctiveActionParam.def_reps_type = correctiveActions;
				correctiveActionJsonData = 'audit_def_resp='+JSON.stringify(correctiveActionParam);
				$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
				$http({method: "POST",url : config.currentEnvironment.server + '/auditDeficiencyResponse', data: correctiveActionJsonData})
					.then(function(data){
						if(data.status == 200){
							param.time = new Date().getTime();
							serviceAudit.getAuditDetail(param).then(function(data){
								$scope.audit_detail = data;
								var defIDS = []
								var correctiveActionAdded = 0
								angular.forEach(data.deficiencyData, function(value,key){
									correctiveActionAdded = _.where(data.correctiveActionData, {deficiency_id : value.PKAuditReqCategoryDeficientID}).length > 0 ? correctiveActionAdded + 1 : correctiveActionAdded;	
									
								});
								
								if (data.deficiencyData.length == correctiveActionAdded && data.auditData.FKAuditStatusID == 3) {
									$scope.enableCompleteButton = true;
								}else{
									$scope.enableCompleteButton = false;
								}
								$scope.showDeficiencies(1);
							});
							$scope.isClicked = false;
							$scope.global_success = 'Response send to server.';
							$timeout(function() {$scope.hideMessage('global_success');}, 1000)
						}else{
							$scope.isClicked = false;
							$scope.global_error = 'Unable to set corrective action for this deficiency!';
							$timeout(function() {$scope.hideMessage('global_error');}, 3000)
						}
					},function(error){
						$scope.isClicked = false;
						$scope.global_error = 'Server not responding!';
						$timeout(function() {$scope.hideMessage('global_error');}, 1000)
					});
			}else{
				$scope.isClicked = false;
				$scope.global_error = 'Please select at least one corrective action option!';
				$timeout(function() {$scope.hideMessage('global_error');}, 3000);
			}	
		};
		
		//  Tabs on audit summary page
		$scope.tabs = [{
		    title: 'Comments:',
		    url: 'one.tpl.html'
		}, {
		    title: 'Employees:',
		    url: 'two.tpl.html'
		}, {
		    title: 'Photos:',
		    url: 'three.tpl.html'
		}];
		
		$scope.currentTab = 'one.tpl.html';
		
		$scope.onClickTab = function (tab) {
			$scope.currentTab = tab.url;
		}
		$scope.isActiveTab = function(tabUrl) {
			return tabUrl == $scope.currentTab;
		}
	}])	
	

	
	// Logout User Session
	.controller('logoutController',['Session', '$location','serviceData', function(Session, $location,serviceData){
		Session.destroy();
		$location.path('/login');
	}]);
	