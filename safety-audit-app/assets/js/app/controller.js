'use strict';

/**
 * @ngdoc Controller
 * @name npl.Controller:loginController,mainController,addAuditController,photoController,categoryController,reviewController
 * @description
 * Provides the Constructor controllers & set up the initial state of a scope.
 */

angular.module('npl')

/**
 * @ngdoc
 * @name npl.Controller:loginController
 * @description
 * Provides access to application after checking validity of credentials.
 */

.controller('loginController', ['$scope','$location', 'AuthService','$route', function($scope, $location, AuthService,$route){
	$scope.loginLoader = '';
	if (AuthService.isAuthenticated() == false) {
		$scope.credentials = {username: localStorage.getItem('lastUsername'),password: ''};
		$scope.login = function (credentials) {
			if (AuthService.haveConnection()) {
				$scope.loginLoader = 'Loading...';
				$scope.login_message = "";
				if(credentials.username != "" && credentials.password != ""){
					AuthService.login(credentials.username,credentials.password).then(function (data) {
						window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
						$scope.loginLoader = '';

						$location.path("/");
					}, function (err) {

						$scope.loginLoader = '';
						if (err.data != undefined && !angular.isArray(err.data)) {
							$scope.login_message = err.data;
						}else{
							$scope.login_message = 'Bad Credentials';	
						}

					});
				}else{
					$scope.loginLoader = '';
					$scope.login_message = "An error has occurred";
				}
			}else{
				$scope.loginLoader = '';
				$scope.login_message = "No Internet Connection";
			}

		};
	}else{
		$location.path("/");
	}
}])

/**
 * @ngdoc
 * @name npl.Controller:mainController
 * @description
 * Provides a list of all audits created by lodded in Auditor. Application offline synchronization intiates here.
 */
.controller('mainController', ['$rootScope','$scope','$location','serviceAudit','serviceData','Session','globalVarFactory','$q', function($rootScope,$scope, $location,serviceAudit,serviceData,Session,globalVarFactory,$q) {

	if (Session.group === 'SafetyManagers')
		$location.path('/manage_audit');


	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	globalVarFactory.inProgressAuditID = 0;
	var allAuditList;
	//check synchronization status 
	var synchronizationStatus = localStorage.getItem('synchronizationStatus');
	var now = false;
	if (globalVarFactory.refresh == 1) {
		now = true;
	}
	if (globalVarFactory.filterOption != '') {
		$scope.filter_options = globalVarFactory.filterOption;
	}else{
		$scope.filter_options ='In Progress';
	}
	if(synchronizationStatus == 1)
	{
		$rootScope.global_process = 'Loading audit list..';
	}

	//get all audit list for logged in auditor
	var auditListProcess = serviceAudit.getAuditList(now).then(function(result){
		allAuditList = result;
		$scope.audit_list = _.where(allAuditList, {'AuditStatus' : $scope.filter_options});
		globalVarFactory.refresh = 0;
		if(synchronizationStatus == 1)
		{
			$rootScope.global_process = '';
		}
	},function(err){

		if (err.data != undefined && err.data != '' && angular.isArray(err.data)) {
			$scope.audit_list = err.data;
			allAuditList = err.data;
		}else{
			navigator.notification.alert(err.data);
		}
		globalVarFactory.refresh = 0;
		if(synchronizationStatus == 1)
		{
			$rootScope.global_process = '';
		}

	});

	//Filter audit list 
	$scope.filter_audit_list = function(){
		//$scope.logData(allAuditList);
		globalVarFactory.filterOption = this.filter_options;
		if (this.filter_options == '') {
			$scope.audit_list = allAuditList;
		}else{
			$scope.audit_list = _.where(allAuditList, {'AuditStatus' : this.filter_options});
		}
	};

	// Synchronize data locally
	if ( (synchronizationStatus == null || synchronizationStatus == 0) && serviceData.haveConnection()) {
		$scope.synchronizeData();

		$scope.lastRefresh = localStorage.getItem('lastRefresh');
	}

	// Start new audit after reseting previous audit data
	$scope.addAudit = function(){
		globalVarFactory.reset();
		$location.path("/new_audit");	
	}

	// hide particular processing and error message
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	}

	// Allow auditor to edit saved audit
	$scope.editInprogressAudit = function(auditID, auditStatus, auditData, step){
		if (auditStatus != '' && auditStatus == 'In Progress' && auditStatus != undefined && auditStatus == 'In Progress' && auditData != '' && auditData != undefined) {
			var savedAudit =  JSON.parse(decodeURIComponent(auditData));

			//Manage Global factory to populate seletecd audit data
			globalVarFactory.audit_form_data = savedAudit.audit_form_data;
			if(globalVarFactory.audit_form_data.customer != undefined)globalVarFactory.audit_form_data.customer = {label : globalVarFactory.audit_form_data.customer.label, value :  globalVarFactory.audit_form_data.customer.value};
			if(globalVarFactory.audit_form_data.supervisor != undefined)globalVarFactory.audit_form_data.supervisor = {label : globalVarFactory.audit_form_data.supervisor.label, value :  globalVarFactory.audit_form_data.supervisor.value};
			if(globalVarFactory.audit_form_data.foreman != undefined)globalVarFactory.audit_form_data.foreman = {label : globalVarFactory.audit_form_data.foreman.label, value :  globalVarFactory.audit_form_data.foreman.value};
			if(globalVarFactory.audit_form_data.job_number != undefined)globalVarFactory.audit_form_data.job_number = globalVarFactory.audit_form_data.job_number;
			if(savedAudit.assigned_employee != undefined)globalVarFactory.assigned_employee  = savedAudit.assigned_employee;
			if(savedAudit.latitude != undefined)globalVarFactory.latitude = savedAudit.latitude;
			if(savedAudit.longitude != undefined)globalVarFactory.longitude = savedAudit.longitude;
			if(savedAudit.available_employee != undefined)globalVarFactory.available_employee = savedAudit.available_employee;
			if(savedAudit.audit_categories != undefined)globalVarFactory.audit_categories = savedAudit.audit_categories;
			if(savedAudit.audit_selected_category != undefined)globalVarFactory.audit_selected_category = savedAudit.audit_selected_category;
			if(savedAudit.audit_selected_subCategory != undefined)globalVarFactory.audit_selected_subCategory = savedAudit.audit_selected_subCategory;
			if(savedAudit.categoryStatus != undefined)globalVarFactory.categoryStatus = savedAudit.categoryStatus;
			if(savedAudit.Customers != undefined)globalVarFactory.Customers = savedAudit.Customers;
			if(savedAudit.safetyManagers != undefined)globalVarFactory.safetyManagers = savedAudit.safetyManagers;
			if(savedAudit.phase_numbers != undefined)globalVarFactory.phase_numbers = savedAudit.phase_numbers;


			if(savedAudit.supervisors != undefined)globalVarFactory.supervisors = savedAudit.supervisors;
			if(savedAudit.foremans != undefined)globalVarFactory.foremans = savedAudit.foremans;
			if(savedAudit.jobTitles != undefined)globalVarFactory.jobTitles = savedAudit.jobTitles;
			if(savedAudit.vendors != undefined)globalVarFactory.vendors = savedAudit.vendors;
			if(savedAudit.questionDetails != undefined)globalVarFactory.questionDetails = savedAudit.questionDetails;
			if(savedAudit.naSubCategories != undefined)globalVarFactory.naSubCategories = savedAudit.naSubCategories;
			if(savedAudit.Questions != undefined)globalVarFactory.Questions = savedAudit.Questions;
			if(savedAudit.jobsitePhotos != undefined)globalVarFactory.jobsitePhotos = savedAudit.jobsitePhotos;
			if(savedAudit.deficiencyPhotos != undefined)globalVarFactory.deficiencyPhotos = savedAudit.deficiencyPhotos;
			if(savedAudit.latLongPermission != undefined)globalVarFactory.latLongPermission = savedAudit.latLongPermission;
			globalVarFactory.inProgressAuditID = auditID;
			if (step != undefined && step != '') {
				$location.path(step);	
			}else{
				$location.path('/new_audit');
			}

		}else{
			$scope.readOnly = 'true';
			$location.path("/audit_summary/"+auditID);
		}

	};
}])

/**
 * @ngdoc
 * @name npl.Controller:addAuditController
 * @description
 * Provides the main configuration interface and information for new Audit.
 */

.controller('addAuditController', ['serviceAudit','serviceData', '$scope','config','$location','globalVarFactory','Session','$q', function(serviceAudit,serviceData,$scope,config,$location, globalVarFactory, Session, $q) {

	$scope.lastRefresh = localStorage.getItem('lastRefresh');
	$scope.dt = new Date();

	var month = parseInt($scope.dt.getMonth()) + 1;
	var day = parseInt($scope.dt.getDate());

	// View data binding	
	$scope.employeeButtonText = 'Select Employee';
	$scope.date = new Date();
	$scope.takePhoto = '';
	$scope.available_employee = globalVarFactory.available_employee; 
	$scope.job_numbers = globalVarFactory.job_numbers;
	$scope.phase_numbers = globalVarFactory.phase_numbers;
	$scope.supervisors = globalVarFactory.supervisors;
	$scope.foremans = globalVarFactory.foremans;
	$scope.customers = globalVarFactory.Customers;
	$scope.safetyManagers = globalVarFactory.safetyManagers
	$scope.assigned_employee = globalVarFactory.assigned_employee != "" ? globalVarFactory.assigned_employee : [];

	var catData =JSON.parse(globalVarFactory.getQuestionData());
	$scope.totaljobSitePhotos = (globalVarFactory.jobsitePhotos.length + catData.defPhotoCount);

	$scope.InProgressAuditID =  globalVarFactory.inProgressAuditID;
	$scope.hideTakePhoto = function(){
		$scope.takePhoto = '';
	};

	// hide particular (messageVar) processing and error message
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	// Get lat / long data
	serviceAudit.getPosition().then(function(result){
		$scope.logData(result);
		$scope.Lat  = globalVarFactory.latitude = result.coords.latitude;
		$scope.Long = globalVarFactory.longitude = result.coords.longitude;
	},function(error){
		if (globalVarFactory.latLongPermission == '') {
			globalVarFactory.latLongPermission = 'set';
			if (error.message != undefined) {
				$scope.global_error = error.message;	
			}else{
				$scope.global_error = error;	
			}
		}

		$scope.logData(error);
		globalVarFactory.latitude = globalVarFactory.longitude = '';

	});

	// Collect all details from local storage need to create an audit
	var employeeAllList = JSON.parse(localStorage.getItem('storageEmpList'));

	//Area wise AuditJob Data
	var areaWiseData = serviceData.getLocalData('areaWiseData').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	//Area Details
	var AllAreas = serviceData.getLocalData('AllAreas').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	//Job Title Details
	var AllJobTitles = serviceData.getLocalData('AllJobTitles').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// State Details
	var AllStates = serviceData.getLocalData('AllStates').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// Job Number as per phase number
	var phaseWiseJob = serviceData.getLocalData('phaseWiseJob').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// Super,Foreman,Customer as per job number
	var jobWiseData = serviceData.getLocalData('jobWiseData').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// Function called after getting all required details
	$q.all([areaWiseData,AllAreas,AllJobTitles,AllStates,phaseWiseJob,jobWiseData]).then(function(finalResult){
		$scope.InProgressAuditID =  globalVarFactory.inProgressAuditID;
		var areaWiseData = finalResult[0];
		$scope.areaMaster = finalResult[1];
		$scope.stateData = finalResult[3];
		var jobWiseData = finalResult[5];

		var inputs = document.getElementsByTagName('input');
		var areas = document.getElementsByTagName('textarea');

		function doThisOnBlur(){
			$scope.isFocus = 0;
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
		}
		for (var i = 0; i < inputs.length; i++) { if(inputs[i].type === 'text'){inputs[i].onblur = doThisOnBlur;} }
		for (var i = 0; i < areas.length; i++) { areas[i].onblur = doThisOnBlur; }

		var jobTitlesObj = [];
		var jobTitles = [];
		angular.forEach(finalResult[2], function(key, value){
			jobTitles[key.JobTitleId] = key.JobTitle;
			jobTitlesObj.push({JobTitleId : key.JobTitleId , name : key.JobTitle});
		});
		globalVarFactory.jobTitles = jobTitles;
		$scope.jobTitle = jobTitlesObj;


		if (globalVarFactory.audit_form_data == "") {
			$scope.audit_data = { audit_type: 'GAS', post_audit: '', area_master: parseInt(Session.area), phase_number : '',job_number : '', supervisor: '', foreman : '',
					selected_employee: 0, customer:'',one_call_ticket : '', job_location:'', city:'', state:'', zip:'', comments:'', date : $scope.date };
		}else{
			$scope.audit_data = globalVarFactory.audit_form_data;
		}

		$scope.audit_data.audit_date = $scope.dt.getFullYear() + '-' + month + '-' + day;

		$scope.updatejobNumber = function(){

			if ($scope.phase_numbers.indexOf(this.audit_data.phase_number) != -1) {
				var JobNum = finalResult[4];
				if (JobNum.length > 0 && JobNum[this.audit_data.area_master] != undefined && JobNum[this.audit_data.area_master][parseInt(this.audit_data.phase_number)] != undefined) {
					$scope.job_numbers = globalVarFactory.job_numbers = JobNum[this.audit_data.area_master][parseInt(this.audit_data.phase_number)];
				}
			}else{
				this.audit_data.phase_number = '';
			}
			//$scope.onUpdateJobnumber();

		};

		//Reset category data on update of Audit type (gas,Electric& traffic)
		$scope.onTypeUpdate = function(){
			globalVarFactory.audit_categories = [];	

		};

		//Update area dependent list
		$scope.onAreaUpdate = function(){
			var areaId = this.audit_data.area_master != undefined && this.audit_data.area_master.AreaNum != undefined ? this.audit_data.area_master.AreaNum : this.audit_data.area_master;
			var selectedArea = areaId;
			if (areaWiseData[selectedArea] != undefined) {
				$scope.available_employee = globalVarFactory.available_employee = areaWiseData[selectedArea].employess;this.audit_data.employee_area_master = selectedArea;
				$scope.job_numbers = globalVarFactory.job_numbers = areaWiseData[selectedArea].JobNum;
				$scope.phase_numbers = globalVarFactory.phase_numbers = areaWiseData[selectedArea].PhaseNum;

				if(areaWiseData[selectedArea].Super.length > 0){$scope.supervisors = globalVarFactory.supervisors = areaWiseData[selectedArea].Super; this.audit_data.supervisor_area_master = this.audit_data.area_master;}
				if(areaWiseData[selectedArea].Foremen.length > 0){$scope.foremans = globalVarFactory.foremans = areaWiseData[selectedArea].Foremen; this.audit_data.foreman_area_master = this.audit_data.area_master;}
				if(areaWiseData[selectedArea].Customer.length > 0){$scope.customers = globalVarFactory.Customers = areaWiseData[selectedArea].Customer;}

				for (var x in employeeAllList) {
					var jobTitleID = employeeAllList[x]['JobTitleId'];

					// if the user is in the area and an Apprentice, Apprentice Lineman 6-TECC, Breakout Operator, Cement Mason, Crew Leader, Electric Equip. Oper-TECC, Flagger, Fuser, Groundman 1-TECC, Groundman 2-TECC, Journeyman Lineman-TECC, Journeyman Tech, Laborer, Leadman, Operator, Technician, Traffic Control
					if (employeeAllList[x]['Area'] === selectedArea && (jobTitleID === 5005 || jobTitleID === 5071 || jobTitleID === 5009 || jobTitleID === 5010 || jobTitleID === 5091 || jobTitleID === 5077 || jobTitleID === 5026 || jobTitleID === 5025 || jobTitleID === 5076 || jobTitleID === 5075 || jobTitleID === 5074 || jobTitleID === 5033 || jobTitleID === 5034 || jobTitleID === 5089 || jobTitleID === 5037 || jobTitleID === 5052 || jobTitleID === 5053)) {
						var employeeFound = false;

						// loop over all employees
						for (var y in areaWiseData[selectedArea].Foremen) {
							if (+areaWiseData[selectedArea].Foremen[y].value === +employeeAllList[x]['EmpNum']) {
								employeeFound = true;

								break;
							}
						}

						if (!employeeFound) {
							var newEmployee = {};

							newEmployee.value = employeeAllList[x]['EmpNum'];
							newEmployee.label = employeeAllList[x]['FirstName'] + ' ' + employeeAllList[x]['LastName'];

							areaWiseData[selectedArea].Foremen.push(newEmployee);
						}
					}		
				}

				$scope.safetyManagers = globalVarFactory.safetyManagers = _.where(areaWiseData[selectedArea].allAreaEmp, {JobTitleId : jobTitles.indexOf('Safety/Quality Director')});
				if ($scope.safetyManagers.length == 0) {
					$scope.safetyManagers = globalVarFactory.safetyManagers = _.where(employeeAllList, {JobTitleId : jobTitles.indexOf('Safety/Quality Director')});
				}
				if ($scope.safetyManagers.length == 1) {
					$scope.audit_data.safetyManagers =  $scope.safetyManagers[0];
				}

				this.audit_data.employee_area_master = selectedArea;	
			}

			//$scope.assigned_employee = [];
		}

		//update data as per job number
		$scope.onUpdateJobnumber = function(jobVal){
			if (jobVal != undefined && jobVal != '') {
				this.audit_data.job_number = jobVal;
			}
			if ($scope.job_numbers.indexOf(this.audit_data.job_number) != -1) {

				var selectedArea = this.audit_data.area_master;
				//var phaseNum = parseInt(this.audit_data.phase_number);
				var jobNum = this.audit_data.job_number;

				if (jobWiseData[selectedArea] != '' && jobWiseData[selectedArea] != undefined  && jobWiseData[selectedArea][jobNum] != undefined) {

					var areaSuper	= jobWiseData[selectedArea][jobNum].supervisor;
					var areaForeman	= jobWiseData[selectedArea][jobNum].foreman;
					var areaCustomer = jobWiseData[selectedArea][jobNum].CustomerDetails;

					if (areaSuper.length == 1) {
						$scope.audit_data.supervisor = areaSuper[0];
					}
					if(areaForeman.length > 0){
						$scope.foremans = globalVarFactory.foremans = areaForeman;
					}
					if (areaForeman.length == 1) {
						$scope.audit_data.foreman = areaForeman[0];
					}

					if(areaCustomer.length > 0){
						$scope.customers = globalVarFactory.Customers = areaCustomer;
					}
					if (areaCustomer.length == 1) {
						$scope.audit_data.customer = areaCustomer[0];
					}        
				}

			}else if($scope.job_numbers != '' && angular.isArray($scope.job_numbers) && $scope.job_numbers.length > 0){
				this.audit_data.job_number = '';
			}
		}

		if($scope.audit_data.area_master != ''){$scope.onAreaUpdate();}

		//Update employee list as per selected area        
		$scope.onEmployeeAreaUpdate = function(){
			var selectedArea = this.audit_data.employee_area_master;
			$scope.available_employee = globalVarFactory.available_employee = areaWiseData[selectedArea].employess;
			$scope.changePage('first');

		}

		//Update super list as per selected area        
		$scope.onSupervisorAreaUpdate = function(){
			var selectedArea = this.audit_data.supervisor_area_master;
			var jobNum = this.audit_data.job_number;
			var areaSuper = areaWiseData[selectedArea] != undefined ? areaWiseData[selectedArea].Super : [];
			//var phaseNum = parseInt(this.audit_data.phase_number);
			//$scope.audit_data.supervisor = '';

			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined){
				//$scope.supervisors = globalVarFactory.supervisors = _.where(areaSuper, {JobNum : parseInt(this.audit_data.job_number)});

				$scope.supervisors = globalVarFactory.supervisors = jobWiseData[selectedArea][jobNum].supervisor;
				if ($scope.supervisors.length == 0) {
					$scope.supervisors = globalVarFactory.supervisors = areaSuper;
				}
			}else{
				$scope.supervisors = globalVarFactory.supervisors = areaSuper;
			}

			if ($scope.supervisors.length == 1) {
				$scope.audit_data.supervisor = $scope.supervisors[0];
			}
		}

		$scope.filterSupervisor = function(){
			var text = this.searchText.toUpperCase();

			var selectedArea = this.audit_data.supervisor_area_master;
			var jobNum = this.audit_data.job_number;
			var areaSuper = areaWiseData[selectedArea] != undefined ? areaWiseData[selectedArea].Super : [];

			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined) {     
				$scope.supervisors = globalVarFactory.supervisors = jobWiseData[selectedArea][jobNum].supervisor;

				if ($scope.supervisors.length == 0) {
					$scope.supervisors = globalVarFactory.supervisors = areaSuper;
				}
			} else {
				$scope.supervisors = globalVarFactory.supervisors = areaSuper;
			}

			$scope.curPage = 0;

			if (this.searchText == undefined || this.searchText == '' ) {
			} else {
				$scope.supervisors = globalVarFactory.supervisors = _.filter($scope.supervisors, function(obj){ if(obj.label.search(text) != -1){return true; } });
			}

			$scope.numberOfPages();
		};

		//Update foreman list as per selected area
		$scope.onForemanAreaUpdate = function(){
			var selectedArea = this.audit_data.foreman_area_master;
			var areaForeman = areaWiseData[selectedArea] != undefined ? areaWiseData[selectedArea].Foremen : [];
			var jobNum = this.audit_data.job_number;
			//var phaseNum = parseInt(this.audit_data.phase_number);
			//$scope.audit_data.foreman = '';

			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined){
				//$scope.foremans = globalVarFactory.foremans = _.where(areaForeman, {JobNum : parseInt(this.audit_data.job_number)});

				$scope.foremans = globalVarFactory.foremans  = jobWiseData[selectedArea][jobNum].foreman;

				$scope.foremans = angular.copy($scope.foremans);

				for (var x in employeeAllList) {
					var jobTitleID = employeeAllList[x]['JobTitleId'];

					// if the user is in the area and an Apprentice, Apprentice Lineman 6-TECC, Breakout Operator, Cement Mason, Crew Leader, Electric Equip. Oper-TECC, Flagger, Fuser, Groundman 1-TECC, Groundman 2-TECC, Journeyman Lineman-TECC, Journeyman Tech, Laborer, Leadman, Operator, Technician, Traffic Control
					if (employeeAllList[x]['Area'] === selectedArea && (jobTitleID === 5005 || jobTitleID === 5071 || jobTitleID === 5009 || jobTitleID === 5010 || jobTitleID === 5091 || jobTitleID === 5077 || jobTitleID === 5026 || jobTitleID === 5025 || jobTitleID === 5076 || jobTitleID === 5075 || jobTitleID === 5074 || jobTitleID === 5033 || jobTitleID === 5034 || jobTitleID === 5089 || jobTitleID === 5037 || jobTitleID === 5052 || jobTitleID === 5053)) {
						var employeeFound = false;

						// loop over all employees
						for (var y in $scope.foremans) {
							if (+$scope.foremans[y].value === +employeeAllList[x]['EmpNum']) {
								employeeFound = true;

								break;
							}
						}

						if (!employeeFound) {
							var newEmployee = {};

							newEmployee.value = employeeAllList[x]['EmpNum'];
							newEmployee.label = employeeAllList[x]['FirstName'] + ' ' + employeeAllList[x]['LastName'];

							$scope.foremans.push(newEmployee);
						}
					}		
				}

				if ($scope.foremans.length == 0 || jobNum == '') {
					$scope.foremans = globalVarFactory.foremans = areaForeman;
				}
			}else{
				$scope.foremans = globalVarFactory.foremans = areaForeman;

				$scope.foremans = angular.copy($scope.foremans);

				for (var x in employeeAllList) {
					var jobTitleID = employeeAllList[x]['JobTitleId'];

					// if the user is in the area and an Apprentice, Apprentice Lineman 6-TECC, Breakout Operator, Cement Mason, Crew Leader, Electric Equip. Oper-TECC, Flagger, Fuser, Groundman 1-TECC, Groundman 2-TECC, Journeyman Lineman-TECC, Journeyman Tech, Laborer, Leadman, Operator, Technician, Traffic Control
					if (employeeAllList[x]['Area'] === selectedArea && (jobTitleID === 5005 || jobTitleID === 5071 || jobTitleID === 5009 || jobTitleID === 5010 || jobTitleID === 5091 || jobTitleID === 5077 || jobTitleID === 5026 || jobTitleID === 5025 || jobTitleID === 5076 || jobTitleID === 5075 || jobTitleID === 5074 || jobTitleID === 5033 || jobTitleID === 5034 || jobTitleID === 5089 || jobTitleID === 5037 || jobTitleID === 5052 || jobTitleID === 5053)) {
						var employeeFound = false;

						// loop over all employees
						for (var y in $scope.foremans) {
							if (+$scope.foremans[y].value === +employeeAllList[x]['EmpNum']) {
								employeeFound = true;

								break;
							}
						}

						if (!employeeFound) {
							var newEmployee = {};

							newEmployee.value = employeeAllList[x]['EmpNum'];
							newEmployee.label = employeeAllList[x]['FirstName'] + ' ' + employeeAllList[x]['LastName'];

							$scope.foremans.push(newEmployee);
						}
					}		
				}
			}

			if ($scope.foremans.length == 1) {
				$scope.audit_data.foreman = $scope.foremans[0];
			} 	
		}

		$scope.filterForeman = function(){
			var text = this.searchText.toUpperCase();

			var selectedArea = this.audit_data.foreman_area_master;
			var areaForeman = areaWiseData[selectedArea] != undefined ? areaWiseData[selectedArea].Foremen : [];
			var jobNum = this.audit_data.job_number;

			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined) {
				$scope.foremans = globalVarFactory.foremans = jobWiseData[selectedArea][jobNum].foreman;

				if ($scope.foremans.length == 0 || jobNum == '') {
					$scope.foremans = globalVarFactory.foremans = areaForeman;
				}
			} else {
				$scope.foremans = globalVarFactory.foremans = areaForeman;
			}

			$scope.curPage = 0;

			$scope.foremans = angular.copy($scope.foremans);

			for (var x in employeeAllList) {
				var jobTitleID = employeeAllList[x]['JobTitleId'];

				// if the user is in the area and an Apprentice, Apprentice Lineman 6-TECC, Breakout Operator, Cement Mason, Crew Leader, Electric Equip. Oper-TECC, Flagger, Fuser, Groundman 1-TECC, Groundman 2-TECC, Journeyman Lineman-TECC, Journeyman Tech, Laborer, Leadman, Operator, Technician, Traffic Control
				if (employeeAllList[x]['Area'] === selectedArea && (jobTitleID === 5005 || jobTitleID === 5071 || jobTitleID === 5009 || jobTitleID === 5010 || jobTitleID === 5091 || jobTitleID === 5077 || jobTitleID === 5026 || jobTitleID === 5025 || jobTitleID === 5076 || jobTitleID === 5075 || jobTitleID === 5074 || jobTitleID === 5033 || jobTitleID === 5034 || jobTitleID === 5089 || jobTitleID === 5037 || jobTitleID === 5052 || jobTitleID === 5053)) {
					var employeeFound = false;

					// loop over all employees
					for (var y in $scope.foremans) {
						if (+$scope.foremans[y].value === +employeeAllList[x]['EmpNum']) {
							employeeFound = true;

							break;
						}
					}

					if (!employeeFound) {
						var newEmployee = {};

						newEmployee.value = employeeAllList[x]['EmpNum'];
						newEmployee.label = employeeAllList[x]['FirstName'] + ' ' + employeeAllList[x]['LastName'];

						$scope.foremans.push(newEmployee);
					}
				}   
			} 

			if (this.searchText == undefined || this.searchText == '' ) {
			} else {
				$scope.foremans = globalVarFactory.foremans = _.filter($scope.foremans, function(obj){ if(obj.label.search(text) != -1){return true; } });
			}

			$scope.numberOfPages();
		};

		//Display aside/Flyouts for employee, supervisor and foreman        
		$scope.triggerAside = function(backParam,trigger){

			if(trigger == 'triggerEmployeeAside' && backParam != 'back'){
				$scope.employeeButtonText = 'Loading..';
			}
			$scope.global_process = 'Loading...';
			$scope.global_error = '';

			if(backParam != '' && backParam != undefined && backParam == 'back'){
				$scope.global_process = '';
				setTimeout(function() {
					window.scrollTo(document.body.scrollLeft, document.body.scrollTop); 
					var employeeTrigger = document.getElementById(trigger);
					angular.element(employeeTrigger).triggerHandler('click');
				}, 2);
			}else{
				setTimeout(function() {
					var employeeTrigger = document.getElementById(trigger);
					angular.element(employeeTrigger).triggerHandler('click');
					$scope.global_process = '';
					$scope.process = '';
					$scope.employeeButtonText = 'Select Employee';
				}, 1);
			}
		};
		// pagination
		$scope.curPage = 0;
		$scope.pageSize = 40;
		//console.log($scope.pageSize);
		$scope.scrollWindow = function(){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 2);
		}
		$scope.numberOfPages = function() 
		{
			return Math.ceil($scope.available_employee.length / $scope.pageSize);
		};
		$scope.changePage = function(a){

			switch (a) {
			case 'first':
				$scope.curPage = 0;
				break;
			case 'last':
				$scope.curPage = $scope.numberOfPages()-1;
				break;
			case 'prev':
				$scope.curPage = $scope.curPage - 1;
				break;
			case 'next':
				$scope.curPage = $scope.curPage + 1;
				break;
			}
		}
		$scope.changePageSize = function(){
			var text = this.searchText.toUpperCase();
			if (this.searchText == undefined || this.searchText == '' ) {
				$scope.available_employee = globalVarFactory.available_employee = areaWiseData[this.audit_data.employee_area_master].employess;
				$scope.curPage = 0;

			}else {
				$scope.available_employee = globalVarFactory.available_employee = _.filter(areaWiseData[this.audit_data.employee_area_master].employess, function(obj){ if(obj.name.search(text) != -1){return true; } });
				$scope.curPage = 0;
			}
			$scope.numberOfPages();

		}

		// Employee Picker and Emplyee Remover function  
		$scope.move = function(employee, move_from, move_to, action){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);	
			if (action == 'remove') {
				var isDefExist = _.where(catData.allDeficiency, {defEmplyeeID : parseInt(employee.EmpNum)});
				if(isDefExist != undefined &&  angular.isArray(isDefExist) && isDefExist.length > 0){
					navigator.notification.alert('Deficiency must be deleted before the employee can be removed from the "picked" list.');
				}else{
					navigator.notification.confirm('Are you sure want to delete ? ',
							function(buttonIndex){
						removeEmployee(buttonIndex,employee, move_from, move_to, action);
					} , 'Warning');	
				}

				var removeEmployee = function(buttonIndex,employee, move_from, move_to, action){
					if (buttonIndex == 1) {
						var index = move_from.indexOf(employee);
						var addedIndex = move_to.indexOf(employee);
						var checkExistence =  _.where(move_to, {EmpNum : employee.EmpNum});

						if(index != -1 && addedIndex == -1 && checkExistence.length == 0){
							move_to.push(employee);  
							move_from.splice(index,1);
						}else{
							move_from.splice(index,1);
						}

						$scope.assigned_employee = move_from;
						$scope.available_employee = move_to;
						$scope.$apply();
					}

				}


			}else{

				var index = move_from.indexOf(employee);
				var addedIndex = move_to.indexOf(employee);
				var checkExistence =  _.where(move_to, {EmpNum : employee.EmpNum});

				if(index != -1 && addedIndex == -1 && checkExistence.length == 0){
					move_to.push(employee);  
					move_from.splice(index,1);
				}else{
					move_from.splice(index,1);
				}

				$scope.assigned_employee = move_to;
				$scope.available_employee = move_from;


			}
		}

		//Change job title in employee picker
		$scope.modifyJobTitle = function(){
			this.employee.jobTitle = this.employee.selectedJobTitile.name;
			this.employee.JobTitleId = this.employee.selectedJobTitile.JobTitleId;

		};

		//SuperVisor Picker
		$scope.SelectSupervisor = function(){
			$scope.audit_data.supervisor = this.supervisor;
			var employeeTrigger = document.getElementById('triggerSuperAside');
			angular.element(employeeTrigger).triggerHandler('click');
		}
		//Foreman Picker
		$scope.SelectForeman = function(){
			$scope.audit_data.foreman = this.foremanObj;
			var employeeTrigger = document.getElementById('triggerForemanAside');
			angular.element(employeeTrigger).triggerHandler('click');
		}

		//Take Photo Options
		$scope.showPhotoOption = function(){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
			$scope.takePhoto = 'show';
			globalVarFactory.audit_form_data = $scope.audit_data;
			globalVarFactory.assigned_employee = $scope.assigned_employee;
			globalVarFactory.available_employee = $scope.available_employee;
		};

		//View Added Photos
		$scope.viewPhotoPage = function(){
			globalVarFactory.audit_form_data = $scope.audit_data;
			globalVarFactory.assigned_employee = $scope.assigned_employee;
			globalVarFactory.available_employee = $scope.available_employee;
			$location.path("/photo");
		}

		//Take Photo
		$scope.takeJobSitePhoto = function(type){
			$scope.takePhoto = '';
			serviceAudit.capturePhoto(type).then(function(image){
				globalVarFactory.jobsitePhotos.push(image);
				//$scope.totaljobSitePhotos = globalVarFactory.jobsitePhotos.length;
				var catData =JSON.parse(globalVarFactory.getQuestionData());
				$scope.totaljobSitePhotos = (globalVarFactory.jobsitePhotos.length + catData.defPhotoCount);
				angular.element(document.getElementById('AutoHideBox')).triggerHandler('click');
				//navigator.notification.alert('Image Added');
			},function(message){
				navigator.notification.alert(message);
			});
		}

		$scope.checkZip = function(){
			var reg = /^[0-9]{5}$/;
			if (!reg.test(this.audit_data.zip)) {
				$scope.audit_data.zip = '';
			}
		}

		//Lock added data and Move to next step
		$scope.create_audit = function(audit_data)
		{
			var error = 0;
			var reg = /^[0-9]{5}$/;
			$scope.global_error = '';
			if($scope.audit_data.phase_number == '' || $scope.phase_numbers.indexOf($scope.audit_data.phase_number) == -1){$scope.audit_data.phase_number = ''; error = 1;};
			if($scope.audit_data.job_number == '' || $scope.job_numbers.indexOf($scope.audit_data.job_number) == -1 ){$scope.audit_data.job_number = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.supervisor) || Object.keys($scope.audit_data.supervisor).length == 0){$scope.audit_data.supervisor = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.customer) || Object.keys($scope.audit_data.customer).length == 0 || $scope.audit_data.customer.value == undefined ||  $scope.audit_data.customer.value == ''){$scope.audit_data.customer = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.foreman) || Object.keys($scope.audit_data.foreman).length == 0){$scope.audit_data.foreman = ''; error = 1;};

			if($scope.assigned_employee == "") {
				$scope.global_error = "Please select employees"; error = 1;
			};

			if (error == 0) {
				//Lock data in global data factory
				globalVarFactory.audit_form_data = $scope.audit_data;
				globalVarFactory.assigned_employee = $scope.assigned_employee;
				globalVarFactory.available_employee = $scope.available_employee;
				$location.path('/new_audit/categories');
			}
		}

		//Save audit progress in local storage for future editing
		$scope.saveProgress = function(){
			if(globalVarFactory.inProgressAuditID == 0){
				serviceData.saveAuditprogress(globalVarFactory,{type : 1, employeeID : Session.employeeID,page : '/new_audit'}).then(function(res){
					if(res.insertId != undefined){
						globalVarFactory.inProgressAuditID = res.insertId;
						//navigator.notification.alert('Progress Saved');	
					};

				});
			}else{
				serviceData.saveAuditprogress(globalVarFactory,{type: 0, employeeID : Session.employeeID, id : globalVarFactory.inProgressAuditID,page : '/new_audit'}).then(function(res){

					if (res.rowsAffected > 0 ) {
						//navigator.notification.alert('Progress Saved');	
					}
				});
			}	
		};
		$scope.backToHome = function(){
			/*globalVarFactory.audit_form_data = $scope.audit_data;
				globalVarFactory.assigned_employee = $scope.assigned_employee;
				globalVarFactory.available_employee = $scope.available_employee;	
				$scope.saveProgress();*/
			if (globalVarFactory.inProgressAuditID == 0 || globalVarFactory.inProgressAuditID == '') {
				navigator.notification.confirm('Are you sure you want to cancel? Audit data will not be saved.',
						function(buttonIndex){
					if (buttonIndex == 1) {
						$location.path("/");
						$scope.$apply();
					}
				} , 'Warning');


			}else{
				$location.path("/");	
			}


		}


	},function(err){
		$location.path('#/new_audit');
	});


}])

/**
 * @ngdoc
 * @name npl.Controller:photoController
 * @description
 * Provide information of photo added for a corresponding Audit
 */

.controller('photoController', ['$scope','globalVarFactory','$location','Session','$route', function($scope,globalVarFactory,$location,Session,$route){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');
	$scope.showEnlargePhoto = '';
	$scope.isManager = 0;

	//check whether page load as popup or not
	if($location.path() == '/photo'){
		$scope.showPhotoPage = '';
		$scope.showPhotoPageDef = '';
		$scope.editDeficiencyIndex = -1;
		$scope.currentDefPhotos = 0;
	}

	$scope.back_page = $scope.lastAccessedURL;

	//check whether photo is stored locally 
	$scope.showLocalFile = function(source){
		var httpCheck = source.substring(0, 7);
		var httpsCheck = source.substring(0, 8);
		if (httpCheck != "http://" && httpsCheck != "https://")
		{
			return true;
		}
		return false;
	}

	//check whether photo is stored on server
	$scope.showLiveFile = function(source){
		var httpCheck = source.substring(0, 7);
		var httpsCheck = source.substring(0, 8);
		if (httpCheck == "http://" || httpsCheck == "https://")
		{
			return true;
		}
		return false;
	}

	//Bind jobsite photos in view
	$scope.jobsitePhotos = globalVarFactory.jobsitePhotos;
	$scope.totaljobSitePhotos = globalVarFactory.jobsitePhotos.length;

	//Bind Deficiency photos in view
	if($scope.showPhotoPage == ''){
		var categoryData =JSON.parse(globalVarFactory.getQuestionData());
		$scope.deficiencyPhotos = categoryData.allDeficiency;
		//$scope.totalDeficiencyPhotos = categoryData.allDeficiency.length;
		$scope.totalDeficiencyPhotos = categoryData.defPhotoCount;

	}

	//Enlarge particular image	    
	$scope.enLargeImage = function(source){

		$scope.LargeImage = source;
		if ($scope.showPhotoPage != '') {
			$scope.showEnlargePhoto = 'show';
		}else{
			angular.element(document.getElementById('triggerImage')).triggerHandler('click');	
		}


	};

	//Hide enlarged image
	$scope.hideEnlargePhoto = function(){
		$scope.showEnlargePhoto = '';
	}

	//delete particular jobsite or deficiency photo from global JSON	    
	$scope.deletePhoto = function(path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex){

		navigator.notification.confirm('Are you sure want to delete ? ',
				function(buttonIndex){
			removePhoto(buttonIndex,path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex);
		} , 'Warning');

		var removePhoto = function(buttonIndex,path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex){
			if (buttonIndex == 1) {
				var isJobSitePhoto = globalVarFactory.jobsitePhotos.indexOf(path);
				if(isJobSitePhoto == -1){
					var defPhoto = globalVarFactory.audit_categories[mainCatIndex][subCatIndex][quesIndex][defIndex].photo_data;
					//var photoIndex = defPhoto.indexOf({src : path, photoID : photoID});
					for(var P = 0; P < defPhoto.length; P++){
						if(defPhoto[P].src == path){
							defPhoto.splice(P,1);
							if (photoID != '') {
								globalVarFactory.deletedPhotos.push(photoID);
							}
							break;
						}
					}

					globalVarFactory.audit_categories[mainCatIndex][subCatIndex][quesIndex][defIndex].photo_data = defPhoto;
					$scope.totaldeficiencyPhotos = defPhoto.length;
					document.getElementById("photo_"+mainCatIndex+"_"+subCatIndex+"_"+quesIndex+"_"+defIndex+"_"+boxIndex).remove();
				}else{
					globalVarFactory.jobsitePhotos.splice(isJobSitePhoto, 1);
					if (globalVarFactory.jobSitePhotoID[isJobSitePhoto] != undefined) {

						globalVarFactory.deletedPhotos.push(globalVarFactory.jobSitePhotoID[isJobSitePhoto]);
						globalVarFactory.jobSitePhotoID.splice(isJobSitePhoto,1);
					}

				}

				var categoryData =JSON.parse(globalVarFactory.getQuestionData());
				$scope.deficiencyPhotos = categoryData.allDeficiency;
				//$scope.totalDeficiencyPhotos = categoryData.allDeficiency.length;
				$scope.totalDeficiencyPhotos = categoryData.defPhotoCount;
				$scope.totaljobSitePhotos = globalVarFactory.jobsitePhotos.length;
				$scope.$apply();
				//console.log(globalVarFactory.deletedPhotos);
			}	
		};
	}
}])

/**
 * @ngdoc
 * @name npl.Controller:photoController
 * @description
 * Provide information of photo added for a corresponding deficiency added on a particular question
 */

.controller('deficiencyPhotoController', ['$scope','globalVarFactory','$location','Session','$route','$routeParams', function($scope,globalVarFactory,$location,Session,$route,$routeParams){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	$scope.showEnlargePhoto = '';
	$scope.isManager = 0;
	$scope.showPhotoPage = '';
	if($scope.lastAccessedURL.split('#/')[1] != undefined && $scope.lastAccessedURL.split('#/')[1].split('/')[0] != undefined && $scope.lastAccessedURL.split('#/')[1].split('/')[0]  == 'audit_summary'){
		$scope.isApprove = true;
	}

	$scope.editDeficiencyIndex = -1;
	$scope.currentDefPhotos = 0;
	$scope.back_page = $scope.lastAccessedURL;

	$scope.showLocalFile = function(source){
		var httpCheck = source.substring(0, 7);
		var httpsCheck = source.substring(0, 8);
		if (httpCheck != "http://" && httpsCheck != "https://")
		{
			return true;
		}
		return false;
	}

	$scope.showLiveFile = function(source){
		var httpCheck = source.substring(0, 7);
		var httpsCheck = source.substring(0, 8);
		if (httpCheck == "http://" || httpsCheck == "https://")
		{
			return true;
		}
		return false;
	}

	var defID = $routeParams.defID;
	var quesID = $routeParams.quesID;

	if (defID != '' && defID != undefined && quesID != 'queID') {
		$scope.showPhotoPage = '';
		$scope.showPhotoPageDef = '';
		var categoryData =JSON.parse(globalVarFactory.getQuestionData());
		var photoData = _.where(categoryData.allDeficiency, {deficiencyID : parseInt(defID), questionID : parseInt(quesID)});
		if (photoData == undefined || photoData.length == 0) {
			//console.log({deficiencyID : defID, questionID : quesID});
			var photoData = _.where(categoryData.allDeficiency, {deficiencyID : parseInt(defID), questionID : quesID.trim()});
		}
		$scope.deficiencyPhotos = photoData;
		$scope.DeficiencyPhotoCount = photoData[0].photos.length;

	}else if(defID != '' && defID != undefined){
		$scope.showPhotoPage = '';
		$scope.showPhotoPageDef = '';
		var photos = [];
		var value = {};
		var photoData = _.where(globalVarFactory.deficiencyPhotos, {FKAuditReqCategoryDeficientID : defID.trim()});

		if(photoData != ''){
			for(var i=0; i < photoData.length; i++){
				photos.push({'src':photoData[i].FileName});
			}
		}
		var defData = _.where(globalVarFactory.deficiencyData, {PKAuditReqCategoryDeficientID : defID.trim()});

		value.photos = photos;
		value.employee = defData[0].employee + defData[0].VendorEmployeeName;
		value.refNum = defData[0].refNum;
		//console.log(globalVarFactory.deficiencyData);
		$scope.deficiencyPhotos = [value];
		$scope.DeficiencyPhotoCount = photos.length;
	}

	$scope.enLargeImage = function(source){

		$scope.LargeImage = source;
		if ($scope.showPhotoPage != '' || $scope.showPhotoPageDef != '') {
			$scope.showEnlargePhoto = 'show';
		}else{
			angular.element(document.getElementById('triggerImage')).triggerHandler('click');	
		}


	};
	$scope.hideEnlargePhoto = function(){
		$scope.showEnlargePhoto = '';
	}

	$scope.deletePhoto = function(path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex){
		//console.log(path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID);
		navigator.notification.confirm('Are you sure want to delete ? ',
				function(buttonIndex){
			removePhoto(buttonIndex, path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex);
		} , 'Warning');

		var removePhoto = function(buttonIndex, path, quesIndex, defIndex, subCatIndex, mainCatIndex, photoID,boxIndex){
			if (buttonIndex == 1) {
				var isJobSitePhoto = globalVarFactory.jobsitePhotos.indexOf(path);
				if(isJobSitePhoto == -1){
					var defPhoto = globalVarFactory.audit_categories[mainCatIndex][subCatIndex][quesIndex][defIndex].photo_data;
					//var photoIndex = defPhoto.indexOf({src : path, photoID : photoID});
					for(var P = 0; P < defPhoto.length; P++){
						if(defPhoto[P].src == path){
							//console.log(defPhoto[P].src);

							defPhoto.splice(P,1);
							if (photoID != '') {
								globalVarFactory.deletedPhotos.push(photoID);
							}
							break;
						}
					}
					globalVarFactory.audit_categories[mainCatIndex][subCatIndex][quesIndex][defIndex].photo_data = defPhoto;
					document.getElementById("photo_"+mainCatIndex+"_"+subCatIndex+"_"+quesIndex+"_"+defIndex+"_"+boxIndex).remove();
				}else{
					globalVarFactory.jobsitePhotos.splice(isJobSitePhoto, 1);
					if (globalVarFactory.jobSitePhotoID[isJobSitePhoto] != undefined) {
						globalVarFactory.deletedPhotos.push(globalVarFactory.jobSitePhotoID[isJobSitePhoto]);
						globalVarFactory.jobSitePhotoID.splice(isJobSitePhoto,1);
					}

				}
				$scope.$apply();
			}

		}

	}


}])

/**
 * @ngdoc
 * @name npl.Controller:categoryController
 * @description
 * Display list of all Categories available for audit as per Audit type selected.
 */

.controller('categoryController', ['$scope','$location', 'config','globalVarFactory','checkCategoryIndex','serviceData','Session', function($scope, $location,config,globalVarFactory, checkCategoryIndex,serviceData,Session){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	//Check wheter previous step is completed or not
	if (globalVarFactory.audit_form_data == "") {
		$location.path("/new_audit");
	}

	$scope.global_process = 'Loading..';
	$scope.audit_type = globalVarFactory.audit_form_data.audit_type;

	// hide particular processing and error message
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	/*Get category data from local storage as per selected audit type
	 *
	 * To Lock various category data and make color code functional
	 * two things have to manage audit_categories & categoryStatus in global factory
	 * In below format
	 * audit_categories [MainCategoryPK][SubCategoryPK] = All Question data belongs to SubCategoryPK or isNA
	 * categoryStatus[MainCategoryPK] = {deficiencyIds : [array of SubCategoryPK have deficiency] ,NaIds : [array of SubCategoryPK marked as NA], inCompleteIds : [array of SubCategoryPK which are not completed yet]}
	 * 
	 */

	var categoryMasterProcess = serviceData.getLocalData('categoryMaster').then(function(res){
		globalVarFactory.categoryMaster = res.data; 
		var categoryMaster = res.data.Category;			
		var SubCategoryMaster = res.data.SubCategory;
		var questionMaster = res.data.Question;

		var categoryForNull = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": null});
		var categoryForID = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": String(globalVarFactory.audit_form_data.customer.value)});
		var mergedCategories = _.uniq(_.union(categoryForNull, categoryForID), false, function(item, key, a){ return item.PKAuditCategoryID; });
		//$scope.categories = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": String(globalVarFactory.audit_form_data.customer.value)});
		$scope.categories = mergedCategories;

		angular.forEach($scope.categories, function(value, key){
			if (globalVarFactory.audit_categories[value.PKAuditCategoryID] == undefined) {
				globalVarFactory.audit_categories[value.PKAuditCategoryID] = {};
				globalVarFactory.categoryStatus[value.PKAuditCategoryID] = {};			

				//Logic for set isNA if category & subcategories don't have questions
				var subCategoriesObj = _.where(SubCategoryMaster,{"CategoryType" : value.CategoryType, 'FKAuditCategoryID' : value.PKAuditCategoryID});
				globalVarFactory.categoryStatus[value.PKAuditCategoryID]={subCategoryCount : subCategoriesObj.length , deficiencyIds : [], NaIds : [], inCompleteIds :[] };
				angular.forEach(subCategoriesObj, function(scValue, scKey){
					var questions = _.where(questionMaster,{"CategoryType" : value.CategoryType, 'FKAuditCategoryID' : value.PKAuditCategoryID, 'FKAuditSubCategoryID' : scValue.PKAuditSubCategoryID});	
					if(questions.length==0){

						//console.log("Question==="+JSON.stringify(questions));
						globalVarFactory.audit_categories[value.PKAuditCategoryID][scValue.PKAuditSubCategoryID] = 'isNA';	
						globalVarFactory.categoryStatus[value.PKAuditCategoryID].NaIds.push(scValue.PKAuditSubCategoryID);
					}
				});		
				//End isNA logic
			}					
		});

		//Check Wheteher all categories are completed or not before move to summary	
		var completedMainCategories = 0;
		$scope.showSubmitButton = 0;
		//Function for color code
		$scope.getCategoryIndex = function(category_obj){

			if (globalVarFactory.audit_categories[category_obj.PKAuditCategoryID].length == 0) {
				return 'inComplete';	
			}else{
				if (globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].subCategoryCount != undefined && Object.keys(globalVarFactory.audit_categories[category_obj.PKAuditCategoryID]).length == parseInt(globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].subCategoryCount)) {
					if(  parseInt(globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].subCategoryCount) == parseInt(globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].NaIds.length) ){
						return '';
					}
					if (globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].inCompleteIds.length > 0) {
						return 'inComplete';
					}
					else if (globalVarFactory.categoryStatus[category_obj.PKAuditCategoryID].deficiencyIds.length > 0) {
						return 'inactive';
					}
					return 'active';
				}
				return 'inComplete';
			}
		}
		angular.forEach(globalVarFactory.audit_categories, function(value,key){
			if (globalVarFactory.categoryStatus[key] != null && globalVarFactory.categoryStatus[key].subCategoryCount != undefined && Object.keys(globalVarFactory.audit_categories[key]).length == parseInt(globalVarFactory.categoryStatus[key].subCategoryCount) && globalVarFactory.categoryStatus[key].inCompleteIds.length == 0) {

				completedMainCategories = completedMainCategories + 1;
			}
		});



		if(completedMainCategories == $scope.categories.length){
			$scope.showSubmitButton = 1;

		}else{
			$scope.showSubmitButton = 0;
		}

		$scope.moveToSummary = function(){
			if($scope.showSubmitButton == 1){
				$location.path('/summary');
			}
		}


		$scope.select_category = function(){
			globalVarFactory.audit_selected_category = '';
			globalVarFactory.audit_selected_category = this.category;
			$location.path("/new_audit/categories/sub_categories");
		};

		$scope.backToJobPhase = function(){

			$scope.saveProgress();
			$location.path("/new_audit");

		}

		//Completed category check ends here

		//Save audit progress in local storage for future editing
		$scope.saveProgress = function(){

			if(globalVarFactory.inProgressAuditID == 0){
				serviceData.saveAuditprogress(globalVarFactory,{type : 1, employeeID : Session.employeeID,page : '/new_audit/categories'}).then(function(res){
					if(res.insertId != undefined){
						globalVarFactory.inProgressAuditID = res.insertId;
						//navigator.notification.alert('Progress Saved');	
					};

				});
			}else{
				serviceData.saveAuditprogress(globalVarFactory,{type: 0, employeeID : Session.employeeID, id : globalVarFactory.inProgressAuditID,page : '/new_audit/categories'}).then(function(res){

					if (res.rowsAffected > 0 ) {
						//navigator.notification.alert('Progress Saved');	
					}
				});
			}	
		};

		$scope.global_process = '';
	});


}])


/**
 * @ngdoc
 * @name npl.Controller:subCategoryController
 * @description
 * Display list of all Sub-Categories available for audit as per Audit Type & Category selected.
 * Sub-Sub category and its deficiency are managed here.
 */

.controller('subCategoryController', ['$scope', '$http', '$location', 'checkCategoryIndex','$modal','$sce', 'globalVarFactory','serviceData','$q','serviceAudit','Session', function($scope, $http, $location,checkCategoryIndex, $modal,$sce,globalVarFactory,serviceData,$q,serviceAudit,Session){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	if (globalVarFactory.audit_selected_category == "" ) {
		$location.path("/new_audit/categories");
	}

	$scope.global_process = 'Loading..';
	$scope.audit_type = globalVarFactory.audit_form_data.audit_type;

	// Show take photo option in Deficiency Flyout
	$scope.takeDeficiencyPhoto = '';
	$scope.hideTakeDeficiencyPhoto = function(){
		$scope.takeDeficiencyPhoto = '';return false;

	};

	//hide particular error message
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	//Save audit progress in local storage for future editing
	$scope.saveProgress = function(){
		if(globalVarFactory.inProgressAuditID == 0){
			serviceData.saveAuditprogress(globalVarFactory,{type : 1, employeeID : Session.employeeID,page : '/new_audit/categories'}).then(function(res){
				if(res.insertId != undefined){
					globalVarFactory.inProgressAuditID = res.insertId;
					//navigator.notification.alert('Progress Saved');	
				};

			});
		}else{
			serviceData.saveAuditprogress(globalVarFactory,{type: 0, employeeID : Session.employeeID, id : globalVarFactory.inProgressAuditID,page : '/new_audit/categories'}).then(function(res){

				if (res.rowsAffected > 0 ) {
					//navigator.notification.alert('Progress Saved');	
				}
			});
		}	
	};
	$scope.backToCategory = function(){

		$scope.saveProgress();
		$location.path("/new_audit/categories");

	}

	var deficiencyPhotos = [];

	//deficency flyout  trigger
	var flyout_el = document.getElementById('trigger_dificiency_flyout');

	//question modal trigger
	var modal_el = document.getElementById('trigger_modal');


	//Get all category.subcategor, question and vendor details from local storage
	var CategoryMasterProcess = serviceData.getLocalData('categoryMaster').then(function(category){
		return category.data;
	},function(err){
		return err;
	});

	var AllVendors = serviceData.getLocalData('AllVendors').then(function(response){
		return response.data;
	},function(err){
		return err;
	});


	$q.all([CategoryMasterProcess,AllVendors]).then(function(processResults){

		var SubCategoryMaster = processResults[0].SubCategory;
		var questionMaster = processResults[0].Question;
		$scope.vendors = processResults[1];
		//$scope.logData(processResults);

		var question_details = {};
		var deficiencyArray = [];
		var currentQuestion;
		var category_id = globalVarFactory.audit_selected_category.PKAuditCategoryID;
		var questionDisplayed = 0;
		var editDeficiencyIndex = $scope.editDeficiencyIndex = -1;

		$scope.subCategory = globalVarFactory.audit_selected_category.Description;		
		$scope.subCategories = _.where(SubCategoryMaster,{"CategoryType" : $scope.audit_type, 'FKAuditCategoryID' : category_id});

		// Set category status in global factory if is undefined
		if (globalVarFactory.categoryStatus[category_id] != undefined)
		{
			globalVarFactory.categoryStatus[category_id].subCategoryCount = $scope.subCategories.length;

			if (globalVarFactory.categoryStatus[category_id].deficiencyIds == undefined) {
				globalVarFactory.categoryStatus[category_id].deficiencyIds = [];
				globalVarFactory.categoryStatus[category_id].NaIds = [];
				globalVarFactory.categoryStatus[category_id].inCompleteIds = [];
			}
		}

		//Function for color code, show color by comaparing selected category from global factory categoryStatus
		$scope.getCategoryIndex = function(category_obj){
			//globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID]
			if (globalVarFactory.categoryStatus[category_id].NaIds.indexOf(category_obj.PKAuditSubCategoryID) != -1) {
				return 'na';
			}else if (globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID] != undefined && angular.isObject(globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID]) &&  Object.keys(globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID]).length > 0) {
				if(globalVarFactory.categoryStatus[category_id].inCompleteIds.indexOf(category_obj.PKAuditSubCategoryID) != -1)
				{	return ''; }
				else if(globalVarFactory.categoryStatus[category_id].deficiencyIds.indexOf(category_obj.PKAuditSubCategoryID) == -1)
				{ return 'active'; }

				return 'inactive';	
			}
			else{
				return '';
			}				
		};

		//Mark subcategory as na if checked before
		$scope.isChecked = function(categoryObj){
			if (globalVarFactory.categoryStatus[category_id].NaIds.indexOf(this.category.PKAuditSubCategoryID) == -1) {
				return false;
			}
			return true;
		};

		//Make sub-category na onclick on checkbox and vice-versa
		$scope.naSubCategory = function(categoryObj){
			var indexVal = globalVarFactory.categoryStatus[category_id].NaIds.indexOf(this.category.PKAuditSubCategoryID);
			var me = this;
			if (indexVal == -1) {

				var markNA = function(){
					globalVarFactory.categoryStatus[category_id].NaIds.push(me.category.PKAuditSubCategoryID);
					globalVarFactory.audit_categories[category_id][me.category.PKAuditSubCategoryID] = 'isNA';

					var deficiencyIDS =  globalVarFactory.categoryStatus[category_id].deficiencyIds;
					var incompleteIDS =  globalVarFactory.categoryStatus[category_id].inCompleteIds;
					var currentSubCat =  me.category.PKAuditSubCategoryID;

					if (deficiencyIDS.indexOf(currentSubCat) != -1) {
						deficiencyIDS.splice(deficiencyIDS.indexOf(currentSubCat),1);
					}
					if (incompleteIDS.indexOf(currentSubCat) != -1) {
						incompleteIDS.splice(incompleteIDS.indexOf(currentSubCat),1);
					}

					globalVarFactory.categoryStatus[category_id].deficiencyIds = deficiencyIDS;
					globalVarFactory.categoryStatus[category_id].inCompleteIds = incompleteIDS;
				}

				var deficiencyIDS =  globalVarFactory.categoryStatus[category_id].deficiencyIds;
				if (deficiencyIDS.indexOf(this.category.PKAuditSubCategoryID) != -1) {

					navigator.notification.confirm('Are you sure you want to delete all deficiencies for this sub-category ?',
							function(buttonIndex){
						if (buttonIndex == 1) {
							markNA();
							$scope.$apply();
						}else{
							document.getElementById('box_'+ me.category.PKAuditSubCategoryID).checked = false;
							$scope.$apply();
						}
					} , 'Warning');

				}else{
					markNA();
				}
			}else{

				globalVarFactory.categoryStatus[category_id].NaIds.splice(indexVal, 1);
				globalVarFactory.audit_categories[category_id][this.category.PKAuditSubCategoryID] = {};
				var newCategoryData = {};

				angular.forEach(globalVarFactory.audit_categories[category_id], function(value, key){

					if ( angular.isObject(value) && Object.keys(value).length > 0) {
						newCategoryData[key] = value;
					}else if(value == 'isNA'){
						newCategoryData[key] = value;
					}
				});
				globalVarFactory.audit_categories[category_id] = newCategoryData;

			}
		};

		//Show deficiency form in deficiency flyout
		$scope.toggleState = true;
		$scope.toggleDeficiencyForm = function(){
			deficiencyPhotos = [];
			editDeficiencyIndex = -1;
			$scope.toggleState = false;
			$scope.disableVendor = $scope.disableEmployee = '';
			$scope.totaldeficiencyPhotos = 0;
			$scope.deficiency = { refNum : '', jobSiteCorrection : '', vendor : '', nplEmployee : {}, vendorEmployee : '', notes : '' };
		};

		//Make vendor related input disable if employee selected from dropdown
		$scope.makeVendorDisable = function(){

			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
			if(this.deficiency.nplEmployee != '' && this.deficiency.nplEmployee != {} && this.deficiency.nplEmployee != null){
				$scope.disableVendor = '1';
				this.deficiency.vendor = this.deficiency.vendorEmployee = '';
				document.getElementById('vendorEmployee').required = false;

			}else{
				$scope.disableVendor = $scope.disableEmployee = '';
			}

		};

		//Make employee dropdown disable if vendor selected from auto complete box
		$scope.makeEmployeeDisable = function(){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
			if(this.deficiency != undefined && this.deficiency.vendor != '' && angular.isObject(this.deficiency.vendor)){
				$scope.disableEmployee = '1';	
				this.deficiency.nplEmployee = {};
				document.getElementById('vendorEmployee').required = true;

			}else{
				$scope.disableEmployee = $scope.disableVendor = '';
				this.deficiency.vendor = '';
			}
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
		};


		$scope.questions = globalVarFactory.Questions;

		//Show Question Popup and populate answer for question if added
		$scope.showQuestion = function(){
			$scope.global_error = '';
			var category = this.category;
			if (globalVarFactory.categoryStatus[category_id].NaIds.indexOf(category.PKAuditSubCategoryID) === -1) {
				questionDisplayed = 1;
				question_details = {};	
				globalVarFactory.audit_selected_subCategory = category;

				if (globalVarFactory.audit_categories[category_id] != undefined && globalVarFactory.audit_categories[category_id][globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID] != undefined) {
					question_details = globalVarFactory.audit_categories[category_id][globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID];
				}

				$http.get('pages/auditor/question.html').then(function(response){

					$scope.questions = _.where(questionMaster,{"CategoryType" : $scope.audit_type, 'FKAuditCategoryID' : category_id, 'FKAuditSubCategoryID' : category.PKAuditSubCategoryID});
					for(var q = 0; q < $scope.questions.length; q++)
					{
						var questionId = $scope.questions[q].PKAuditQuestionID;
						$scope.logData(question_details[questionId]);
						if (question_details[questionId] != undefined && ( question_details[questionId] == 'isComplaint' || question_details[questionId] == 'isNA')) {
							$scope.questions[q].lastAnswer = question_details[questionId];
						}else if(angular.isArray(question_details[questionId]) && question_details[questionId].length > 0){
							$scope.questions[q].lastAnswer = 'deficiency';
						}else{
							$scope.questions[q].lastAnswer = 'Not Found';
						}
					}

					$scope.logData($scope.questions);
					$scope.logData(question_details);

					globalVarFactory.Questions = $scope.questions;
					$scope.logData($scope.questions.length);
					$scope.sub_category = category.Description;
					$scope.modal = {modal_content: $sce.trustAsHtml(response.data)};
					angular.element(modal_el).triggerHandler('click');
				});	
			}

		};
		// Hide deficiency aside/Flyout
		$scope.hideAside = function(){
			if (!angular.isArray(question_details[currentQuestion]) || question_details[currentQuestion].length == 0) {
				document.getElementById(currentQuestion+'_red').checked = false;
				delete question_details[currentQuestion];
			}
		}

		//Function to manage header footer variation due to IPAD keyboard
		$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
		$scope.showPhotoPage = '';
		$scope.showPhotoPageDef = '';
		//Show Deficiency flyout on click on deficency radio (action = show) or mark question as na/complaince (action = hide)
		$scope.add_deficiency = function (action, question_id, type){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);

			$scope.toggleState = true;
			if (action == 'show') {

				$scope.takeDeficiencyPhoto = $scope.disableVendor = $scope.disableEmployee = '';
				deficiencyPhotos = [];
				deficiencyArray = [];
				var nplEmployees = [];
				angular.forEach(globalVarFactory.assigned_employee, function(value,key){
					var emp = {name : value.name , EmpNum : value.EmpNum};
					if(nplEmployees.indexOf(emp) == -1){nplEmployees.push(emp);}
				});
				var auditForeman = globalVarFactory.audit_form_data.foreman;
				if(nplEmployees.indexOf({name : auditForeman.label, EmpNum : auditForeman.value}) == -1){nplEmployees.push({name : auditForeman.label, EmpNum : auditForeman.value});}

				currentQuestion = this.question.PKAuditQuestionID;
				$scope.questionName  = this.question.Question;
				$http.get('pages/auditor/deficiency.html').then(function(response){

					$scope.nplEmployeesData = nplEmployees;

					$scope.addedDeficiencyData = '';
					if (question_details[currentQuestion] != 'isComplaint' && question_details[currentQuestion] != 'isNA' && angular.isArray(question_details[currentQuestion])) {
						$scope.addedDeficiencyData = question_details[currentQuestion];
						deficiencyArray = question_details[currentQuestion];
					}
					$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
					$scope.aside = {aside_content: $sce.trustAsHtml(response.data)};
					angular.element(flyout_el).triggerHandler('click');
					$scope.deficiency = { refNum : '', jobSiteCorrection : '', vendor : '', nplEmployee : {}, vendorEmployee : '', notes : '' };
				});

			}else{
				if (question_details[this.question.PKAuditQuestionID] != undefined && angular.isArray(question_details[this.question.PKAuditQuestionID]) && question_details[this.question.PKAuditQuestionID].length > 0) {
					var $this = this;
					navigator.notification.confirm('Are you sure you want to delete all deficiencies for this sub-sub-category ?',
							function(buttonIndex){
						if (buttonIndex == 1) {
							question_details[$this.question.PKAuditQuestionID] = type;
						}else{
							document.getElementById($this.question.PKAuditQuestionID+"_green").checked=false;
							document.getElementById($this.question.PKAuditQuestionID+"_red").checked=true;
						}
						$scope.$apply();
					} , 'Warning');

				}else{
					question_details[this.question.PKAuditQuestionID] = type;	
				}

			}

		};

		//View photo page in another flyout called through view photo button in deficiency flyout.
		//In progress defeciency photo included

		$scope.PhotoPage = function(){

			$scope.InprogressPhoto = [];
			if (deficiencyPhotos.length > 0) {
				$scope.InprogressPhoto =  deficiencyPhotos;
			}
			$scope.DeficiencyPhotoCount = $scope.InprogressPhoto.length;
			$scope.showPhotoPageDef = 'show';
		}

		// Delete photo of current question deficiency
		$scope.deleteCurrentPhoto = function(source,questionId, index, photoID){
			var $this = this;
			navigator.notification.confirm('Are you sure want to delete ? ',
					function(buttonIndex){
				if (buttonIndex == 1) {
					var photoIndex = question_details[questionId][index].photo_data.indexOf({src : source, photoID : photoID});
					question_details[questionId][index].photo_data.splice(photoIndex,1);
					$this.PhotoPage();
					$scope.apply();

				}
			} , 'Warning');
		};

		// Delete photo from deficency which was in progress and not completed
		$scope.deleteInProgressPhoto = function(src,imageIndex){
			navigator.notification.confirm('Are you sure want to delete ? ',
					function(buttonIndex){
				if (buttonIndex == 1) {
					deficiencyPhotos.splice(deficiencyPhotos.indexOf(src),1);
					$scope.inProgressDeficiency = deficiencyPhotos;
					$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
					$scope.DeficiencyPhotoCount = deficiencyPhotos.length;
					document.getElementById('imageIP_'+imageIndex).remove();
					$scope.apply();
				}
			},'Warning');	
		};

		//Hide View photo flyout
		$scope.hidePhotoPage = function(){
			$scope.showPhotoPage = '';
			$scope.showPhotoPageDef = '';
			$scope.totaldeficiencyPhotos = deficiencyPhotos.length;                                         
		};

		//Show take photo options for deficency
		$scope.DeficiencyPhotoOption = function(){
			function setHeaderFooter(){setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);}

			if(this.deficiency.refNum != '' && (this.deficiency.nplEmployee != '' || this.deficiency.vendor != '') ){					
				$scope.takeDeficiencyPhoto = 'show';
			}else{
				navigator.notification.alert('Please fill above fields first',setHeaderFooter);
			}
		};

		// Take Deficency Photo
		$scope.takeDeficencyPhoto = function(type){
			$scope.takeDeficiencyPhoto = '';
			serviceAudit.capturePhoto(type).then(function(image){
				deficiencyPhotos.push(image);
				$scope.inProgressDeficiency = deficiencyPhotos;
				$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
				angular.element(document.getElementById('AutoHideBox')).triggerHandler('click');
				//navigator.notification.alert('Image Added');

			},function(message){
				navigator.notification.alert(message);
			});
		}

		// Save inprogress deficency
		$scope.deficiencyComplete = function(deficiencyData){

			var textRegex = /^[a-zA-Z ]*$/;
			//console.log(textRegex.test(deficiencyData.vendorEmployee));
			if ( deficiencyData != undefined && deficiencyData.refNum != '' && deficiencyData.refNum != undefined  &&
					( (deficiencyData.nplEmployee != '' && deficiencyData.nplEmployee != undefined && deficiencyData.nplEmployee.EmpNum != undefined && deficiencyData.nplEmployee.EmpNum != '' )
							|| (deficiencyData.vendor != '' && deficiencyData.vendor.VendorNum != undefined && deficiencyData.vendor.VendorNum != '' && deficiencyData.vendorEmployee != '') )
			) {
				var employeeId = '';
				var employeeName = '' ;
				var vendorNum = '';
				var vendorName = '';
				var vendorEmployee = '';
				var deficiencyOn = '';

				if (deficiencyData.nplEmployee != undefined && deficiencyData.nplEmployee != null && deficiencyData.nplEmployee.EmpNum != undefined) {
					employeeId = deficiencyData.nplEmployee.EmpNum ;
					employeeName = deficiencyData.nplEmployee.name ;
				}
				if (deficiencyData.vendor != undefined) {
					$scope.logData(deficiencyData.vendor);
					vendorNum = deficiencyData.vendor.VendorNum;
					vendorName = deficiencyData.vendor.VendorName;
					vendorEmployee = deficiencyData.vendorEmployee;
				}
				deficiencyOn = employeeName + vendorEmployee;
				var deficiencyPhotoNames = [];
				if(deficiencyPhotos.length > 0)
				{
					angular.forEach(deficiencyPhotos , function(value,key){
						deficiencyPhotoNames.push({src: value, photoID : ''});
					});
				}
				var deficiencyObject = {
						'employee_id' :  employeeId,
						'employee_name' : employeeName ,
						'vendor_name' : vendorName ,
						'vendor_emp' : vendorEmployee,
						'vendor_id' : vendorNum ,
						'ref_num' : deficiencyData.refNum ,
						'notes' : deficiencyData.notes,
						'is_job_site_correction' : deficiencyData.jobSiteCorrection,
						'question' : $scope.questionName,
						'photo_data' :   deficiencyPhotoNames
				};

				$scope.logData(editDeficiencyIndex);
				if (editDeficiencyIndex == -1 && editDeficiencyIndex != 0) {
					deficiencyArray[deficiencyArray.length] = deficiencyObject;
					question_details[currentQuestion] = deficiencyArray;
					$scope.addedDeficiencyData = question_details[currentQuestion];



				}else{
					navigator.notification.confirm('Are you sure want to overwrite ? ',
							function(buttonIndex){
						if (buttonIndex == 1) {
							$scope.logData(question_details[currentQuestion][editDeficiencyIndex]);
							question_details[currentQuestion][editDeficiencyIndex] = deficiencyObject
							editDeficiencyIndex = -1;
							$scope.apply();
						}
					} , 'Warning');
				}

				$scope.toggleState = true;
				$scope.inProgressDeficiency = deficiencyPhotos = [];
				$scope.totaldeficiencyPhotos = 0;
				this.deficiency.refNum = '';
				this.deficiency.jobSiteCorrection = '';
				this.deficiency.notes = '';
				this.deficiency.nplEmployee = {};
				this.deficiency.vendor = '';
				this.deficiency.vendorEmployee = '';

			}else{
				setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
				navigator.notification.alert('Invalid details');
			}

		};

		// Edit deficency
		$scope.editDeficiency = function(){

			editDeficiencyIndex = question_details[currentQuestion].indexOf(this.addedDeficiency);
			var currentDeficency = question_details[currentQuestion][editDeficiencyIndex];


			this.deficiency.refNum = currentDeficency.ref_num;
			this.deficiency.jobSiteCorrection = currentDeficency.is_job_site_correction;
			this.deficiency.notes = currentDeficency.notes;
			this.deficiency.nplEmployee = {JobTitleID: '',EmpNum : currentDeficency.employee_id,jobTitle: '',name: currentDeficency.employee_name};
			this.deficiency.vendor = {VendorNum : currentDeficency.vendor_id , VendorName : currentDeficency.vendor_name};
			//this.deficiency.vendor = currentDeficency.vendor_name;
			this.deficiency.vendorEmployee = currentDeficency.vendor_emp;
			deficiencyPhotos = [];
			angular.forEach(currentDeficency.photo_data , function(value,key){
				deficiencyPhotos.push(value.src);
			});
			$scope.totaldeficiencyPhotos = 0;
			$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
			$scope.toggleState = false;

		};

		// Delete deficency
		$scope.removeDeficiency = function(){
			var $this = this;

			navigator.notification.confirm('Are you sure want to delete ? ',
					function(buttonIndex){
				deleteDef(buttonIndex);
			} , 'Warning');

			var deleteDef = function(buttonIndex){
				if (buttonIndex == 1) {
					var removeDeficiencyIndex = question_details[currentQuestion].indexOf($this.addedDeficiency);
					if (removeDeficiencyIndex == editDeficiencyIndex) {
						editDeficiencyIndex = -1;
					}
					question_details[currentQuestion].splice(removeDeficiencyIndex,1);
					$scope.addedDeficiencyData = question_details[currentQuestion];
					if (angular.isArray(question_details[currentQuestion]) && question_details[currentQuestion].length == 0) {
						question_details[currentQuestion] = 'isComplaint';
					}
					$scope.apply();
				}
			};	
		};

		//Mark all question as complaince
		$scope.allComplaint = function(){
			var confirmBox  = 0;
			for( var i = 0; i < $scope.questions.length; i++ ){
				if (question_details[$scope.questions[i].PKAuditQuestionID] != undefined && angular.isArray(question_details[$scope.questions[i].PKAuditQuestionID])) {
					confirmBox = 1;
					break;
				}
			}

			if (confirmBox == 1) {
				navigator.notification.confirm('Mark all question as compliant ?',
						function(buttonIndex){
					markComp(buttonIndex);
				} , 'Warning');


				var markComp = function(buttonIndex){
					if (buttonIndex == 1) {
						for( var i = 0; i < $scope.questions.length; i++ ){
							question_details[$scope.questions[i].PKAuditQuestionID] = 'isComplaint';
							document.getElementById($scope.questions[i].PKAuditQuestionID+"_green").checked=true;
						}

						var deficiencyIDS = globalVarFactory.categoryStatus[category_id].deficiencyIds;
						if (deficiencyIDS.indexOf(globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID) != -1) {
							deficiencyIDS.splice(deficiencyIDS.indexOf(globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID),1);
						}

						globalVarFactory.categoryStatus[category_id].deficiencyIds = deficiencyIDS;
						$scope.apply();
					}
				}	
			}else{
				for( var i = 0; i < $scope.questions.length; i++ ){
					question_details[$scope.questions[i].PKAuditQuestionID] = 'isComplaint';
					document.getElementById($scope.questions[i].PKAuditQuestionID+"_green").checked=true;
				}

				var deficiencyIDS = globalVarFactory.categoryStatus[category_id].deficiencyIds;
				if (deficiencyIDS.indexOf(globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID) != -1) {
					deficiencyIDS.splice(deficiencyIDS.indexOf(globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID),1);	
				}

				globalVarFactory.categoryStatus[category_id].deficiencyIds = deficiencyIDS;
			}



		};

		// Lock all question data and close question popup
		$scope.doneQuestions = function(){
			//if(Object.keys(question_details).length === $scope.questions.length && questionDisplayed == 1){
			angular.element(modal_el).triggerHandler('click');
			globalVarFactory.audit_categories[category_id][globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID] = {};
			globalVarFactory.audit_categories[category_id][globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID] = question_details;
			//console.log(globalVarFactory.audit_categories);

			//}else{
			//navigator.notification.alert('Please answer all questions.');
			//}

			var deficiencyIDS =  globalVarFactory.categoryStatus[category_id].deficiencyIds;
			var incompleteIDS = globalVarFactory.categoryStatus[category_id].inCompleteIds;
			var currentSubCat = globalVarFactory.audit_selected_subCategory.PKAuditSubCategoryID;

			if (deficiencyIDS.indexOf(currentSubCat) != -1) {
				deficiencyIDS.splice(deficiencyIDS.indexOf(currentSubCat),1);
			}
			if (incompleteIDS.indexOf(currentSubCat) != -1) {
				incompleteIDS.splice(incompleteIDS.indexOf(currentSubCat),1);
			}

			var naQuestionCount = 0;
			angular.forEach(question_details, function(value, key){

				if (value != "isComplaint" && value != "isNA" && angular.isArray(value) && value.length > 0){
					if (deficiencyIDS.indexOf(currentSubCat) == -1) {
						deficiencyIDS.push(currentSubCat);
					}
				}else if(value == "isNA"){
					naQuestionCount++;

				}else if (value == null || value == '') {
					incompleteIDS.push(currentSubCat);
				}

			});
			if ($scope.questions.length == naQuestionCount) {
				globalVarFactory.categoryStatus[category_id].NaIds.push(currentSubCat);
			}

			globalVarFactory.categoryStatus[category_id].deficiencyIds = deficiencyIDS;
			if(Object.keys(question_details).length != $scope.questions.length) {
				if (incompleteIDS.indexOf(currentSubCat) == -1) {
					incompleteIDS.push(currentSubCat);
				}
			}
			globalVarFactory.categoryStatus[category_id].inCompleteIds = incompleteIDS;
		};
		$scope.global_process = '';
		question_details = {};
	});
}])

/**
 * @ngdoc
 * @name npl.Controller:reviewController
 * @description
 * Show summary of audit before submission
 */

.controller('reviewController',['$http', '$scope', 'serviceData','serviceAudit','globalVarFactory','Session','$location','$sce', function($http, $scope, serviceData,serviceAudit,globalVarFactory, Session,$location,$sce) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	var processing = 0;
	var auditFormData = globalVarFactory.audit_form_data;
	var employee_data = globalVarFactory.assigned_employee;
	var finalAuditData = {};
	finalAuditData.auth_key = Session.token;
	finalAuditData.api_key = "Disabled for now";
	var supervisor = auditFormData.supervisor.value != undefined ? auditFormData.supervisor.value : auditFormData.supervisor;
	var foreman = auditFormData.foreman.value != undefined ? auditFormData.foreman.value : auditFormData.foreman;
	var customer = auditFormData.customer.value != undefined ? auditFormData.customer.value : auditFormData.customer;
	var jobsitePhotoNames = [];

	//View data binding
	$scope.date =  globalVarFactory.audit_form_data.audit_date;
	$scope.jobNumber = globalVarFactory.audit_form_data.job_number;
	$scope.Area = globalVarFactory.audit_form_data.area_master;
	$scope.City = globalVarFactory.audit_form_data.city;
	$scope.State = globalVarFactory.audit_form_data.state;
	$scope.one_call_ticket = globalVarFactory.audit_form_data.one_call_ticket;

	$scope.Customer = globalVarFactory.audit_form_data.customer.label;
	$scope.Supervisor = globalVarFactory.audit_form_data.supervisor.label;
	$scope.Foreman = globalVarFactory.audit_form_data.foreman.label;
	$scope.EmployeeCount = globalVarFactory.assigned_employee.length;

	$scope.Comments = globalVarFactory.audit_form_data.comments;

	$scope.jobLocation = globalVarFactory.audit_form_data.job_location;
	var manager = globalVarFactory.audit_form_data.safetyManagers;
	$scope.manager = manager != undefined ? manager.FirstName +" "+ manager.MiddleName +" "+ manager.LastName : '';

	var employeeAllList= JSON.parse(localStorage.getItem('storageEmpList'));
	var employeeAuditorData = _.where(employeeAllList, {EmpNum : parseInt(Session.employeeID)});
	$scope.employeeName = (employeeAuditorData != '') ? employeeAuditorData[0].name : Session.employeeName;

	serviceAudit.getPosition().then(function(result){
		$scope.Lat  = globalVarFactory.latitude = result.coords.latitude;
		$scope.Long = globalVarFactory.longitude = result.coords.longitude;
		$scope.InProgressAuditID = globalVarFactory.inProgressAuditID;
	},function(error){
		if (globalVarFactory.latLongPermission == '') {
			globalVarFactory.latLongPermission = 'set';
		}
	});


	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	//Get Category data
	var categoryData = [];

	var deficiencyPhotos = [];
	var deficiency = {};
	var question_details = [];
	// Show take photo option in Deficiency Flyout
	$scope.takeDeficiencyPhoto = '';
	$scope.hideTakeDeficiencyPhoto = function(){
		$scope.takeDeficiencyPhoto = '';
		return false;
	};
	var allAuditEmployees = [];
	for(var i =0; i < globalVarFactory.assigned_employee.length; i++){
		allAuditEmployees[i] = {FirstName :globalVarFactory.assigned_employee[i].FirstName , LastName : globalVarFactory.assigned_employee[i].LastName};	
	}

	//check vendor list used in deficency details
	if (globalVarFactory.vendorList.length == 0 || globalVarFactory.vendorList == '' ) {
		var AllVendors = serviceData.getLocalData('AllVendors').then(function(response){
			globalVarFactory.vendorList = response.data;
			categoryData =JSON.parse(globalVarFactory.getQuestionData());
			$scope.deficiencyDetails = categoryData.allDeficiency;
			//$scope.photoCount = (globalVarFactory.jobsitePhotos.length + globalVarFactory.deficiencyPhotos.length);
			$scope.photoCount = (globalVarFactory.jobsitePhotos.length + categoryData.defPhotoCount);
			angular.forEach(categoryData.allDeficiency, function(value,key){
				if (value.vendor_id != undefined && value.vendor_id != '') {
					allAuditEmployees.push({FirstName :value.employee , LastName : ''});
				}

			});

		});        
	}else{
		var categoryData =JSON.parse(globalVarFactory.getQuestionData());
		$scope.deficiencyDetails = categoryData.allDeficiency;

		//$scope.photoCount = (globalVarFactory.jobsitePhotos.length + globalVarFactory.deficiencyPhotos.length);
		$scope.photoCount = (globalVarFactory.jobsitePhotos.length + categoryData.defPhotoCount);
		angular.forEach(categoryData.allDeficiency, function(value,key){
			if (value.vendor_id != undefined && value.vendor_id != '') {
				allAuditEmployees.push({FirstName :value.employee , LastName : ''});
			}

		});
	}

	$scope.employees = allAuditEmployees;


	//Make vendor related input disable if employee selected from dropdown
	$scope.makeVendorDisable = function(){

		setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
		if(this.deficiency.nplEmployee != '' && this.deficiency.nplEmployee != {} && this.deficiency.nplEmployee != null){
			$scope.disableVendor = '1';
			this.deficiency.vendor = this.deficiency.vendorEmployee = '';
			document.getElementById('vendorEmployee').required = false;

		}else{
			$scope.disableVendor = $scope.disableEmployee = '';
		}

	};

	//Make employee dropdown disable if vendor selected from auto complete box
	$scope.makeEmployeeDisable = function(){
		setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);

		if(this.deficiency != undefined && this.deficiency.vendor != '' && angular.isObject(this.deficiency.vendor)){
			$scope.disableEmployee = '1';	
			this.deficiency.nplEmployee = {};
			document.getElementById('vendorEmployee').required = true;

		}else{
			$scope.disableEmployee = $scope.disableVendor = '';
			this.deficiency.vendor = '';
		}
		setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
	};

	//View photo page in another flyout called through view photo button in deficiency flyout.
	//In progress defeciency photo included
	$scope.showPhotoPage = '';
	$scope.showPhotoPageDef = '';

	$scope.PhotoPage = function(defID,quesID){

		/*$scope.InprogressPhoto = [];
			categoryData =JSON.parse(globalVarFactory.getQuestionData());
			var photoData = _.where(categoryData.allDeficiency, {deficiencyID : parseInt(defID), questionID : parseInt(quesID)});
			if (photoData == undefined || photoData.length == 0) {
				//console.log({deficiencyID : defID, questionID : quesID});
				var photoData = _.where(categoryData.allDeficiency, {deficiencyID : parseInt(defID), questionID : quesID.trim()});
			}

			if (deficiencyPhotos.length != photoData[0].photos.length) {
				$scope.InprogressPhoto =  deficiencyPhotos;
			}

			$scope.deficiencyPhotos = photoData;
			$scope.DeficiencyPhotoCount = photoData[0].photos.length;

			$scope.showPhotoPageDef = 'show';*/

		$scope.deficiencyPhotos = [];
		$scope.InprogressPhoto = deficiencyPhotos;
		$scope.DeficiencyPhotoCount = deficiencyPhotos.length;
		$scope.showPhotoPageDef = 'show';
	}

	// Delete photo of current question deficiency
	$scope.deleteCurrentPhoto = function(source,questionId, index, photoID){
		var $this = this;
		navigator.notification.confirm('Are you sure want to delete ? ',
				function(buttonIndex){
			if (buttonIndex == 1) {
				var photoIndex = question_details[questionId][index].photo_data.indexOf({src : source, photoID : photoID});
				question_details[questionId][index].photo_data.splice(photoIndex,1);
				$this.PhotoPage();
				$scope.apply();
			}
		} , 'Warning');
	};

	// Delete photo from deficency which was in progress and not completed
	$scope.deleteInProgressPhoto = function(src,imageIndex){
		navigator.notification.confirm('Are you sure want to delete ? ',
				function(buttonIndex){
			if (buttonIndex == 1) {
				deficiencyPhotos.splice(deficiencyPhotos.indexOf(src),1);
				$scope.inProgressDeficiency = deficiencyPhotos;
				$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
				$scope.DeficiencyPhotoCount = deficiencyPhotos.length;
				document.getElementById('imageIP_'+imageIndex).remove();
				$scope.apply();
			}
		}, 'Warning');	
	};

	//Hide View photo flyout
	$scope.hidePhotoPage = function(){
		$scope.showPhotoPage = '';
		$scope.showPhotoPageDef = '';
		$scope.totaldeficiencyPhotos = deficiencyPhotos.length;                                         
	};

	//Show take photo options for deficency
	$scope.DeficiencyPhotoOption = function(){
		function setHeaderFooter(){setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);}

		if(this.deficiency.refNum != '' && (this.deficiency.nplEmployee != '' || this.deficiency.vendor != '') ){					
			$scope.takeDeficiencyPhoto = 'show';
		}else{
			navigator.notification.alert('Please fill above fields first',setHeaderFooter);
		}
	};

	// Take Deficency Photo
	$scope.takeDeficencyPhoto = function(type){
		$scope.takeDeficiencyPhoto = '';
		serviceAudit.capturePhoto(type).then(function(image){
			deficiencyPhotos.push(image);
			$scope.inProgressDeficiency = deficiencyPhotos;
			$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
			angular.element(document.getElementById('AutoHideBox')).triggerHandler('click');
			//navigator.notification.alert('Image Added');

		},function(message){
			navigator.notification.alert(message);
		});
	}

	// Save inprogress deficency
	$scope.deficiencyComplete = function(deficiencyData){

		var textRegex = /^[a-zA-Z ]*$/;
		//console.log(textRegex.test(deficiencyData.vendorEmployee));

		if ( deficiencyData != undefined && deficiencyData.refNum != '' && deficiencyData.refNum != undefined  &&
				( (deficiencyData.nplEmployee != '' && deficiencyData.nplEmployee != undefined && deficiencyData.nplEmployee.EmpNum != undefined && deficiencyData.nplEmployee.EmpNum != '' )
						|| (deficiencyData.vendor != '' && deficiencyData.vendor.VendorNum != undefined && deficiencyData.vendor.VendorNum != '' && deficiencyData.vendorEmployee != '') )
		) {
			var employeeId = '';
			var employeeName = '' ;
			var vendorNum = '';
			var vendorName = '';
			var vendorEmployee = '';
			var deficiencyOn = '';

			if (deficiencyData.nplEmployee != undefined && deficiencyData.nplEmployee != null && deficiencyData.nplEmployee.EmpNum != undefined) {
				employeeId = deficiencyData.nplEmployee.EmpNum ;
				employeeName = deficiencyData.nplEmployee.name ;
			}
			if (deficiencyData.vendor != undefined) {
				$scope.logData(deficiencyData.vendor);
				vendorNum = deficiencyData.vendor.VendorNum;
				vendorName = deficiencyData.vendor.VendorName;
				vendorEmployee = deficiencyData.vendorEmployee;
			}
			deficiencyOn = employeeName + vendorEmployee;
			var deficiencyPhotoNames = [];
			if(deficiencyPhotos.length > 0)
			{
				angular.forEach(deficiencyPhotos , function(value,key){
					deficiencyPhotoNames.push({src: value, photoID : ''});
				});
			}
			var deficiencyObject = {
					'employee_id' :  employeeId,
					'employee_name' : employeeName ,
					'vendor_name' : vendorName ,
					'vendor_emp' : vendorEmployee,
					'vendor_id' : vendorNum ,
					'ref_num' : deficiencyData.refNum ,
					'notes' : deficiencyData.notes,
					'is_job_site_correction' : deficiencyData.jobSiteCorrection,
					'question' : $scope.questionName,
					'photo_data' :   deficiencyPhotoNames

			};
			globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID][deficiency.questionID][deficiency.deficiencyID] = deficiencyObject;
			categoryData =JSON.parse(globalVarFactory.getQuestionData());
			$scope.deficiencyDetails = categoryData.allDeficiency;
			var allAuditEmployees = [];
			for(var i =0; i < globalVarFactory.assigned_employee.length; i++){
				allAuditEmployees[i] = {FirstName :globalVarFactory.assigned_employee[i].FirstName , LastName : globalVarFactory.assigned_employee[i].LastName};	
			}
			angular.forEach(categoryData.allDeficiency, function(value,key){
				if (value.vendor_id != undefined && value.vendor_id != '') {
					allAuditEmployees.push({FirstName :value.employee , LastName : ''});
				}

			});
			$scope.employees = allAuditEmployees;

			var flyout_el = document.getElementById('trigger_dificiency_flyout');			
			angular.element(flyout_el).triggerHandler('click');

		}else{
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
			navigator.notification.alert('Invalid details');
		}

	};

	$scope.editDeficiency = function(){

		//deficency flyout  trigger
		var flyout_el = document.getElementById('trigger_dificiency_flyout');
		$scope.vendors = globalVarFactory.vendorList;
		$scope.takeDeficiencyPhoto = $scope.disableVendor = $scope.disableEmployee = '';
		$scope.summaryPage = true;
		deficiency = this.deficiency;
		$scope.questionName = deficiency.question;
		question_details = globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID];
		var currentDeficency = globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID][deficiency.questionID][deficiency.deficiencyID];
		deficiencyPhotos = [];

		angular.forEach(currentDeficency.photo_data , function(value,key){
			deficiencyPhotos.push(value.src);
		});


		$scope.totaldeficiencyPhotos = 0;
		$scope.totaldeficiencyPhotos = deficiencyPhotos.length;
		var vendorInfo = currentDeficency.vendor_id != undefined ? {VendorNum : currentDeficency.vendor_id , VendorName : currentDeficency.vendor_name} : '';
		var nplEmployees = [];
		angular.forEach(globalVarFactory.assigned_employee, function(value,key){
			var emp = {name : value.name , EmpNum : value.EmpNum};
			if(nplEmployees.indexOf(emp) == -1){nplEmployees.push(emp);}
		});
		var auditForeman = globalVarFactory.audit_form_data.foreman;
		if(nplEmployees.indexOf({name : auditForeman.label, EmpNum : auditForeman.value}) == -1){nplEmployees.push({name : auditForeman.label, EmpNum : auditForeman.value});}

		$http.get('pages/auditor/deficiency.html').then(function(response){
			$scope.questionID = deficiency.questionID;
			$scope.defID = deficiency.deficiencyID;

			$scope.nplEmployeesData = nplEmployees;
			$scope.deficiency = {
					refNum : currentDeficency.ref_num,
					jobSiteCorrection : currentDeficency.is_job_site_correction,
					vendor : vendorInfo,
					nplEmployee : {JobTitleID: '',EmpNum : currentDeficency.employee_id,jobTitle: '',name: currentDeficency.employee_name},
					vendorEmployee : currentDeficency.vendor_emp,
					notes : currentDeficency.notes
			};
			$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
			$scope.aside = {aside_content: $sce.trustAsHtml(response.data)};
			angular.element(flyout_el).triggerHandler('click');

		});
	};			

	$scope.moveBack = function(){
		if (globalVarFactory.inProgressAuditID == 0 || globalVarFactory.inProgressAuditID == '') {
			navigator.notification.confirm('Are you sure you want to cancel? Audit data will not be saved.',
					function(buttonIndex){
				if (buttonIndex == 1) {
					$location.path("/");
				}
			},'Warning');
		}else{
			$location.path("/new_audit/categories");	
		}
	}

	//Submit audit
	$scope.submitAudit = function(){
		if (processing == 0) {
			processing = 1;
			$scope.logData('Submit Audit');

			if(globalVarFactory.jobsitePhotos.length > 0)
			{
				angular.forEach(globalVarFactory.jobsitePhotos , function(value,key){
					jobsitePhotoNames.push({src: value});
				});
			}

			var auditDate = globalVarFactory.audit_form_data.audit_date;

			if (globalVarFactory.audit_form_data.audit_date.getMonth) {
				var month = globalVarFactory.audit_form_data.audit_date.getMonth() + 1;
				auditDate = globalVarFactory.audit_form_data.audit_date.getFullYear() + '-' + month + '-' + globalVarFactory.audit_form_data.audit_date.getDate();
			}

			//Audit Form Data - job / Phase
			finalAuditData.audit_data = {
					aDateTime: auditDate,
					supervisor_id : supervisor,
					foreman_id    : foreman,
					phasenum      : auditFormData.phase_number,
					jobnum        : auditFormData.job_number,
					audit_type    : auditFormData.audit_type,
					work_location : auditFormData.job_location,
					city          : auditFormData.city, 
					state         : auditFormData.state.StateId,
					lattitude     : globalVarFactory.latitude,
					longitude     : globalVarFactory.longitude,
					zipcode       : auditFormData.zip,
					customer_id   : customer,
					one_call_ticket : auditFormData.one_call_ticket,
					area_id       : auditFormData.area_master,
					auditor_empid : Session.employeeID ,
					comments      : auditFormData.comments,
					safety_manager_id : auditFormData.safetyManagers.EmpNum,
					photo_data    : jobsitePhotoNames,
					is_post_audit   : globalVarFactory.audit_form_data.post_audit
			};

			//Audit Form Data - job / Phase - employee picker
			finalAuditData.employee_data = [];
			for( var e = 0; e < employee_data.length; e++)
			{
				finalAuditData.employee_data.push({
					employee_id : employee_data[e].EmpNum,
					job_title   : globalVarFactory.jobTitles[employee_data[e].JobTitleId]
				});
			}

			//Na Subcategories
			finalAuditData.subcat_data = categoryData.naSubCategories;
			//Question data
			finalAuditData.question_data = categoryData.questionData;

			//log in console for development mode
			$scope.logData(finalAuditData);

			// fix to allow percent signs
			finalAuditData = JSON.stringify(finalAuditData);

			//console.log(JSON.stringify(finalAuditData));
			var audit_json_data = 'audit_json_data='+encodeURIComponent(finalAuditData).replace(/[!&'()*]/g, escape);;


			//send to server if have connection or save locally
			serviceData.send('auditSave', audit_json_data , {now : true, root : true, method : 'POST', headers : {'Content-Type': 'application/x-www-form-urlencoded'} }).then(function(res){

				serviceData.deleteRow('inProgressAudits','id',globalVarFactory.inProgressAuditID,function(response){
					//console.log(response);
				});
				var finalPhotoData = [];

				// If audit saved on server, save all photo of completed audit in local sqlite
				// and than this photos are uploaded one by one

				if (res.audit_id != undefined && res.audit_id != '') {

					angular.forEach(globalVarFactory.jobsitePhotos, function(value,key){
						finalPhotoData.push(value);
					});

					angular.forEach(categoryData.questionData,function(value,key){

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
						serviceData.db.insert('photoDataStorage', {'photoData' : encodeURIComponent(JSON.stringify(finalPhotoData)), 'auditID' : res.audit_id, 'status' : 0 },function(res){
							$scope.logData(res.audit_id);
							$scope.logData('Audit Post Successfuly');
							$scope.global_success = 'Saved to server';
							globalVarFactory.reset();
							setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/';$location.path('/');}, 1000);	
						});
					}else{
						$scope.logData(res.audit_id);
						$scope.logData('Audit Post Successfuly');
						$scope.global_success = 'Saved to server';
						globalVarFactory.reset();
						setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/';$location.path('/');}, 1000);	
					}


				}



			},function(error){
				serviceData.deleteRow('inProgressAudits','id',globalVarFactory.inProgressAuditID,function(response){
					//console.log(response);
				});
				$scope.logData(JSON.stringify(error));
				if (error.data != undefined && error.data.error_text != undefined) {
					$scope.global_error = error.data.error_text;
				}else{
					$scope.global_success = 'No internet connection.Audit data saved in localstorage for now.';
					globalVarFactory.reset();
					setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/';$location.path('/');}, 1000);	
				}


			});
		}



	};
}])

// Logout User Session
.controller('logoutController',['Session', '$location','serviceData','$route', function(Session, $location,serviceData,$route){
	if (Session.employeeID) {
		var lastUsername = localStorage.getItem('lastUsername');
		//serviceData.dropDatabase(function(){
		Session.destroy();
		localStorage.setItem("lastUsername" , lastUsername);
		window.location.reload(true);	
		//});
	}else{
		$location.path('/login');
	}

}]);	