'use strict';

/**
 * @ngdoc Controller
 * @name npl.Controller:loginController,mainController,addAuditController,photoController,categoryController,reviewController
 * @description
 * Provides the Constructor controllers & set up the initial state of a scope.
 */

angular.module('npl')        

/**
 * @function manageAudits of auditors
 * Show summary of audits
 * 
 */
.controller('manageAuditController',['$scope','$location','serviceAudit','serviceData','Session','globalVarFactory','$q','$http','config', function($scope, $location,serviceAudit,serviceData,Session,globalVarFactory,$q,$http,config) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	if (Session.group === 'Safety Auditors' || Session.group === '')
		$location.path('/');

	$scope.global_error = '';
	$scope.global_process = 'Loading';
	var allAuditList;
	var now = false;

	if (globalVarFactory.filterOption != '') {
		$scope.filter_options = globalVarFactory.filterOption;
	}else{
		$scope.filter_options ='Awaiting Safety Manager';
	}
	if (globalVarFactory.refresh == 1) {
		now = true;
	}

	var tryAgain = 0;
	//Area Details
	var AllAreas = serviceData.getLocalData('AllAreas').then(function(res){
		$scope.areaMaster =  res.data;
		$scope.area_master =  parseInt(Session.area);
	},function(err){
		if (tryAgain == 0) {
			tryAgain = 1;
			serviceData.getLocalData('AllAreas').then(function(res){
				$scope.areaMaster =  res.data;
				$scope.area_master =  parseInt(Session.area);
			});
		}
		//console.log(JSON.stringify(err));
	});

	//get all audit list for logged in manger
	var auditListProcess = serviceAudit.getAuditList(now).then(function(result){
		allAuditList = result;
		$scope.audit_list = _.where(allAuditList, {'AuditStatus' : $scope.filter_options, 'FKAreaID' : Session.area});
		globalVarFactory.refresh = 0;
		$scope.global_process = '';
	},function(err){
		if (err.data != undefined && err.data != '' && angular.isArray(err.data)) {
			allAuditList = err.data;
			$scope.audit_list = _.where(allAuditList, {'AuditStatus' : 'Awaiting Safety Manager', 'FKAreaID' : Session.area});
		}
		globalVarFactory.refresh = 0;
		$scope.global_process = '';
		//console.log(err);
	});

	//Filter audit list 
	$scope.filter_audit_list = function(){
		globalVarFactory.filterOption = this.filter_options;
		if (this.filter_options == '') {
			if ($scope.area_master != '' && $scope.area_master != undefined) {
				$scope.audit_list = _.where(allAuditList, {'FKAreaID' : String ($scope.area_master)});   
			}else{
				$scope.audit_list = allAuditList;
			}
		}else{
			if ($scope.area_master != '' && $scope.area_master != undefined) {
				$scope.audit_list = _.where(allAuditList, {'AuditStatus' : this.filter_options,'FKAreaID' : String ($scope.area_master)});
			}else{
				$scope.audit_list = _.where(allAuditList, {'AuditStatus' : this.filter_options});
			}

		}
	};

	// hide global messages (success and error)
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	// audit edit
	$scope.editAudit = function(auditId){

		$scope.global_process = 'Loading...';
		var param = {};
		// http request for get audit details by auditId
		var Headers = {'Content-Type':'application/x-www-form-urlencoded'};
		param.audit_id = auditId;

		//Get Audit Details
		$http({method: "get", url :config.currentEnvironment.server+ '/auditDetail?audit_id='+param.audit_id, headers: Headers}).then(function(res){
			//console.log('Here' + res);
			var response = res.data;

			//Set global factory of jobsite photos
			globalVarFactory.jobsitePhotos = [];
			globalVarFactory.jobSitePhotoID = [];
			for (var j = 0; j < response.jobSitePhotoData.length ; j ++) {

				globalVarFactory.jobsitePhotos.push(response.jobSitePhotoData[j].FileName);
				globalVarFactory.jobSitePhotoID.push(response.jobSitePhotoData[j].PKAuditPhotoID);
			}

			//Create an array of deficiency photos with deficencyPK as index for future use
			var deficiencyPhotos = [];
			for (var dp = 0; dp < response.deficiencyPhotoData.length ; dp ++) {
				if (deficiencyPhotos[response.deficiencyPhotoData[dp].FKAuditReqCategoryDeficientID] == undefined) {
					deficiencyPhotos[response.deficiencyPhotoData[dp].FKAuditReqCategoryDeficientID] = [];
				}
				deficiencyPhotos[response.deficiencyPhotoData[dp].FKAuditReqCategoryDeficientID].push({src : response.deficiencyPhotoData[dp].FileName, photoID: response.deficiencyPhotoData[dp].PKAuditPhotoID});
			}

			//Get employee list from localstorage
			var employeeList= JSON.parse(localStorage.getItem('storageEmpList'));

			//Create an array of deficiency data with FKAuditReqCategoryID as index for future use
			var defArr = [];				
			for(var c = 0; c < response.reqCategoryDeficiencyData.length; c++) {
				var rec = response.reqCategoryDeficiencyData[c];
				if(defArr[rec.FKAuditReqCategoryID] == undefined){
					defArr[rec.FKAuditReqCategoryID] = [];	
				}
				var photo_data = [];
				if (deficiencyPhotos[rec.PKAuditReqCategoryDeficientID] != undefined && deficiencyPhotos[rec.PKAuditReqCategoryDeficientID].length > 0) {
					photo_data = deficiencyPhotos[rec.PKAuditReqCategoryDeficientID];
				}
				var empName = '';
				if(rec.FKEmployeeID != '' && rec.FKEmployeeID != null){
					var EmpObj = _.where(employeeList, {EmpNum : parseInt(rec.FKEmployeeID)});											
					if(EmpObj != ''){empName =  EmpObj[0].name;}											
				}


				defArr[rec.FKAuditReqCategoryID].push({deficiencyID: rec.PKAuditReqCategoryDeficientID ,employee_id : rec.FKEmployeeID,employee_name : empName, vendor_name : rec.VendorName, vendor_emp : rec.VendorEmployeeName, audit_req_category_id : rec.FKAuditReqCategoryID, notes : rec.Notes, updateauditID : rec.FKAuditID, vendor_id : rec.FKVendorID, is_job_site_correction : rec.IsJobSiteCorrection, ref_num : rec.RefNumber, photo_data : photo_data });

			}

			//Audit form data - Job / Phase data
			var auditData = response.auditData;

			//Process begins here, Set  categoryStatus and audit_category to convert edit as add replica
			// Get all category,sub-category and question details from local storage

			serviceData.getLocalData('categoryMaster').then(function(categoryResponse){

				//filter category for audit type got from audit detail service            
				var categoryMaster = categoryResponse.data.Category;
				var categoryForNull = _.where(categoryMaster, {"CategoryType" : auditData.AuditType,"FKCustomerID": null});
				var categoryForID = _.where(categoryMaster, {"CategoryType" : auditData.AuditType,"FKCustomerID": String(auditData.FKCustomerID)});
				//var mainIDS = _.where(categoryMaster, {"CategoryType" : auditData.AuditType,"FKCustomerID": String(auditData.FKCustomerID)});
				var mainIDS = _.uniq(_.union(categoryForNull, categoryForID), false, function(item, key, a){ return item.PKAuditCategoryID; });
				//Set data got from audit detail service
				var employeeData = response.employeeData;
				var deficiencyData = response.deficiencyData;
				var correctiveActionData = response.correctiveActionData;
				//var mainIDS = response.categoryData;
				var subIDS = response.subCategoryData;
				var allQuestionData = response.reqCategoryData;
				var deficencyIds = response.categorySubcategoryIdData;

				// Private vars
				var FinalData = {};
				var objSubcat = '';
				var subCategory = [];
				var category_satatus = [];

				// Loop all categories got from local storage
				for(var i = 0; i < mainIDS.length; i++){

					// Intiate category_satatus for main categories
					FinalData[mainIDS[i].PKAuditCategoryID] = {};
					if(category_satatus[mainIDS[i].PKAuditCategoryID] == undefined)
					{
						category_satatus[mainIDS[i].PKAuditCategoryID] = {subCategoryCount : 0 , deficiencyIds : [], NaIds : [], inCompleteIds :[] };
					}

					//Na subcatgory ids from audit detail
					var naIDS = _.where(response.isnaSubcategoryIdsData, {CategoryId :  mainIDS[i].PKAuditCategoryID});

					//Subcategorys Ids have question data got from audit detail service
					var subIDS = _.where(categoryResponse.data.SubCategory, {'FKAuditCategoryID' : mainIDS[i].PKAuditCategoryID, 'CategoryType': auditData.AuditType });
					category_satatus[mainIDS[i].PKAuditCategoryID].subCategoryCount = subIDS.length;

					// Set NA sub-catids for corresponding main category
					angular.forEach(naIDS, function(value,key){
						if (category_satatus[mainIDS[i].PKAuditCategoryID].NaIds.indexOf(value.SubCategoryId) == -1) {
							category_satatus[mainIDS[i].PKAuditCategoryID].NaIds.push(value.SubCategoryId);
						}

					});

					// filter question Data as per main category id
					var mainCat_data  = _.where(allQuestionData, {PKAuditCategoryID :  mainIDS[i].PKAuditCategoryID});

					// Loop all sub-categories got from local storage and set question data as per above calculations in FinalData
					// Finaldata [MaincategoryPK][SubCategoryPK] = {question data or NA}

					for(var s = 0; s < subIDS.length; s++){
						if(subIDS[s] != undefined){

							var questionData = _.where(mainCat_data, {PKAuditCategoryID :  mainIDS[i].PKAuditCategoryID, PKAuditSubCategoryID : subIDS[s].PKAuditSubCategoryID});

							if (questionData.length > 0 ) {
								var finalQuestionData = [];
								var naQuestionCount = 0;
								for(var q = 0; q < questionData.length; q++){

									if(questionData[q].ComplianceType == 0){
										finalQuestionData[questionData[q].PKAuditQuestionID] = defArr[questionData[q].PKAuditReqCategoryID];

									}else if(questionData[q].ComplianceType == 1){
										finalQuestionData[questionData[q].PKAuditQuestionID] = 'isComplaint';

									}else if(questionData[q].ComplianceType == 2){

										finalQuestionData[questionData[q].PKAuditQuestionID] = 'isNA';
										naQuestionCount++;
									}

								}
								if (naQuestionCount == questionData.length) {
									category_satatus[mainIDS[i].PKAuditCategoryID].NaIds.push(subIDS[s].PKAuditSubCategoryID);
								}
								FinalData[mainIDS[i].PKAuditCategoryID][subIDS[s].PKAuditSubCategoryID]  = finalQuestionData;     
							}else{
								FinalData[mainIDS[i].PKAuditCategoryID][subIDS[s].PKAuditSubCategoryID] = 'isNA';
							}

						}
					}
				}

				globalVarFactory.audit_categories = FinalData;
				for(var d = 0; d < deficencyIds.length; d++){
					if(category_satatus[deficencyIds[d].PKAuditCategoryID] != undefined){category_satatus[deficencyIds[d].PKAuditCategoryID].deficiencyIds.push(deficencyIds[d].PKAuditSubCategoryID);}
				}

				// Global factory and allow manager to move ahead
				globalVarFactory.deficiencyData = '';
				globalVarFactory.audit_form_data = '';
				globalVarFactory.deletedDeficiency = [];
				globalVarFactory.categoryStatus = category_satatus;   
				globalVarFactory.edit_audit_form_data = auditData;
				globalVarFactory.edit_employee_data = employeeData;
				globalVarFactory.edit_auditID = auditId;
				globalVarFactory.deletedPhotos = [];
				globalVarFactory.assigned_employee = [];
				$location.path('/edit_audit');

				//setTimeout(function() {$scope.global_process = ''; $location.path('/edit_audit'); }, 1000);


			},function(err){
				$scope.global_error = 'Please try again later.';
			});



		},function(error){
			//console.log(error);
			$scope.global_process = '';
			$scope.global_error = 'An error occured. Please check Internet connection.';
		});        
	}

	$scope.readOnlyAudit = function(auditID, auditStatus){
		if (auditStatus != 'Awaiting Safety Manager') {
			$location.path("/audit_summary/"+auditID);
		}
	}

	$scope.back_page = $scope.lastAccessedURL;
}])


/**
 * @ngdoc
 * @name npl.Controller:editAuditController
 * @description
 * Provides the edit configuration interface and information for audit Job / Phase.
 */

.controller('editAuditController', ['serviceAudit','serviceData', '$routeParams', '$scope','config','$location','globalVarFactory','Session','$q', '$http', function(serviceAudit,serviceData,$routeParams,$scope,config,$location, globalVarFactory, Session, $q, $http) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	if (globalVarFactory.edit_audit_form_data == "") {
		$location.path("/manage_audit");
	}

	// View data binding
	$scope.takePhoto = '';
	$scope.global_process = '';
	$scope.available_employee = globalVarFactory.available_employee;
	$scope.assigned_employee = globalVarFactory.assigned_employee;
	$scope.job_numbers = globalVarFactory.job_numbers;
	$scope.phase_numbers = globalVarFactory.phase_numbers;
	$scope.supervisors = globalVarFactory.supervisors;
	$scope.foremans = globalVarFactory.foremans;
	$scope.customers = globalVarFactory.Customers;
	var catData =JSON.parse(globalVarFactory.getQuestionData());
	$scope.totaljobSitePhotos = (globalVarFactory.jobsitePhotos.length + catData.defPhotoCount);

	if (!angular.isArray(globalVarFactory.safetyManagers)) {
		globalVarFactory.safetyManagers = [globalVarFactory.safetyManagers];
	}
	$scope.safetyManagers = globalVarFactory.safetyManagers;
	// hide take photo popup box
	$scope.hideTakePhoto = function(){
		$scope.takePhoto = '';
	};

	// hide global messages (success and error)
	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	// get longitude and latitude
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
	});

	//Get all employee list from local storage
	var employeeAllList= JSON.parse(localStorage.getItem('storageEmpList'));



	// get area wise data from local storage
	var areaWiseData = serviceData.getLocalData('areaWiseData').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// get all area data from local storage
	var AllAreas = serviceData.getLocalData('AllAreas').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// get all job titles from local storage
	var AllJobTitles = serviceData.getLocalData('AllJobTitles').then(function(res){
		return res.data;	
	},function(err){
		return err;	
	});

	// get all states data from local storage
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

		var areaWiseData = finalResult[0];
		$scope.areaMaster = finalResult[1];
		$scope.stateData = finalResult[3];
		var jobWiseData = finalResult[5];

		// get fields by tagname
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

		//Update Job Number as per phase number
		$scope.updatejobNumber = function(){
			if ($scope.phase_numbers.indexOf(this.audit_data.phase_number) != -1) {
				var JobNum = finalResult[4];
				var areaNum = this.audit_data.area_master.AreaNum != undefined ? this.audit_data.area_master.AreaNum : this.audit_data.area_master;

				if (JobNum.length > 0 && JobNum[areaNum] != undefined && JobNum[areaNum][parseInt(this.audit_data.phase_number)] != undefined) {
					$scope.job_numbers = globalVarFactory.job_numbers = JobNum[areaNum][parseInt(this.audit_data.phase_number)];

				}
			}else if($scope.phase_numbers != '' && angular.isArray($scope.phase_numbers) && $scope.phase_numbers.length > 0){
				this.audit_data.phase_number = '';
			}
			//$scope.onUpdateJobnumber();
		};

		//Update area dependent list
		$scope.onAreaUpdate = function(area){
			var areaId = this.audit_data.area_master != undefined && this.audit_data.area_master.AreaNum != undefined ? this.audit_data.area_master.AreaNum : this.audit_data.area_master;
			var selectedArea = area || areaId;

			if (areaWiseData[parseInt(selectedArea)] != undefined) {
				$scope.available_employee = globalVarFactory.available_employee = areaWiseData[selectedArea].employess;this.audit_data.employee_area_master = selectedArea;
				$scope.job_numbers = globalVarFactory.job_numbers = areaWiseData[selectedArea].JobNum;
				$scope.phase_numbers = globalVarFactory.phase_numbers = areaWiseData[selectedArea].PhaseNum;

				//$scope.updatejobNumber();

				if(areaWiseData[selectedArea].Super.length > 0){$scope.supervisors = globalVarFactory.supervisors = areaWiseData[selectedArea].Super; this.audit_data.supervisor_area_master = selectedArea}
				if(areaWiseData[selectedArea].Foremen.length > 0){$scope.foremans = globalVarFactory.foremans = areaWiseData[selectedArea].Foremen; this.audit_data.foreman_area_master = selectedArea}
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
					$scope.audit_data.safety_manager = $scope.safetyManagers[0];
				}
				this.audit_data.employee_area_master = selectedArea;	
			}

		}

		//update data as per job number

		$scope.onUpdateJobnumber = function(jobVal){
			if (jobVal != undefined && jobVal != '') {
				this.audit_data.job_number = jobVal;
			}
			if ($scope.job_numbers.indexOf(this.audit_data.job_number) != -1) {

				var selectedArea = this.audit_data.area_master != undefined && this.audit_data.area_master.AreaNum != undefined ? this.audit_data.area_master.AreaNum : this.audit_data.area_master;
				//var phaseNum = parseInt(this.audit_data.phase_number);
				var jobNum = this.audit_data.job_number;

				if (jobWiseData[selectedArea] != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined) {

					var areaSuper	= jobWiseData[selectedArea][jobNum].supervisor;
					var areaForeman	= jobWiseData[selectedArea][jobNum].foreman;
					var areaCustomer = jobWiseData[selectedArea][jobNum].CustomerDetails;

					if(areaSuper.length > 0){
						$scope.supervisors = globalVarFactory.supervisors  = areaSuper;
					}
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
		if($scope.audit_data.area_master != ''){$scope.onAreaUpdate($scope.audit_data.area_master);}
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

			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined){        

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
			if(jobNum != '' && jobWiseData[selectedArea] != undefined && jobWiseData[selectedArea][jobNum] != undefined){

				$scope.foremans = globalVarFactory.foremans  = jobWiseData[selectedArea][phaseNum][jobNum].foreman;

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


		//Set Job/Phase data from global factory
		if (globalVarFactory.audit_form_data == "") {
			var auditData = globalVarFactory.edit_audit_form_data;

			var foremanEmpName  = _.where(employeeAllList, {EmpNum : parseInt(auditData.FKForemanID)}); 

			var foremanName = foremanEmpName != '' ? foremanEmpName[0].name : auditData.FKForemanID;

			var superVisorEmpName =  _.where(employeeAllList, {EmpNum : parseInt(auditData.FKSupervisorID)});  
			var superVisorName = superVisorEmpName != '' ? superVisorEmpName[0].name : auditData.FKSupervisorID;
			var customerName = _.where(areaWiseData[auditData.FKAreaID].Customer, {value : auditData.FKCustomerID});
			var CustomerValue = customerName!= '' ? customerName[0].value : '';
			var CustomerLable = customerName!= '' ? customerName[0].label : '';

			var stateName = _.where($scope.stateData, {StateId : parseInt(auditData.LocationState)});
			var stateValue = stateName!= '' ? stateName[0].StateId : '';
			var stateLable = stateName!= '' ? stateName[0].StateName : '';
			var managerInfo = _.where(employeeAllList, {EmpNum : parseInt(auditData.FKSafetyManagerEmployeeID)});
			var managerName = managerInfo != '' ? managerInfo[0].name : Session.employeeName;

			$scope.audit_data = {
					audit_date: auditData.AuditDateTime,
					// auditId :            param.audit_id,
					audit_type:          auditData.AuditType,
					area_master :        {AreaNum: parseInt(auditData.FKAreaID)},
					post_audit:          auditData.IsPostAudit,
					phase_number :       auditData.PhaseNumber,
					job_number :         auditData.JobNumber,
					customer:            {value: CustomerValue, label: CustomerLable} ,
					one_call_ticket : auditData.one_call_ticket,
					job_location:        auditData.WorkLocation,
					city:                auditData.City,
					state:               {StateId: stateValue, StateName: stateLable} ,
					zip:                 auditData.Zipcode,
					comments:            auditData.Comments,
					supervisor :         {value: auditData.FKSupervisorID, label: superVisorName},
					foreman :            {value: auditData.FKForemanID, label: foremanName},
					safety_manager :     {EmpNum : parseInt(auditData.FKSafetyManagerEmployeeID), name : managerName},
			};
			$scope.updatejobNumber();
			globalVarFactory.audit_form_data = $scope.audit_data;
			$scope.onAreaUpdate();


		}else{
			$scope.audit_data = globalVarFactory.audit_form_data;
		}



		//Reset category data on update of Audit type (gas,Electric& traffic)
		$scope.onTypeUpdate = function(){
			globalVarFactory.audit_categories = [];	

		};

		//Display aside/Flyouts for employee, supervisor and foreman    
		$scope.triggerAside = function(backParam,trigger){
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

				}, 1);
			}
		};

		//Set Employee picker first time for edit
		if(globalVarFactory.edit_employee_data != ''){
			var employeeData =  globalVarFactory.edit_employee_data;

			if($scope.available_employee == undefined){
				$scope.available_employee = globalVarFactory.available_employee = areaWiseData[this.audit_data.area_master.AreaNum].employess; 
			}								
			$scope.assigned_emp = [];
			for(var i =0; i < employeeData.length; i++){
				var employeeInfo = _.where(employeeAllList, {EmpNum : parseInt(employeeData[i].FKEmployeeID)});	


				if(employeeInfo[0] != undefined){

					employeeInfo[0].JobTitleId = jobTitles.indexOf(employeeData[i].JobTitle);
					$scope.assigned_emp.push(employeeInfo[0]);
					var index = $scope.available_employee.indexOf(employeeInfo[0]);	
					$scope.avail_emp = $scope.available_employee;
					if(index != -1){
						$scope.avail_emp = $scope.available_employee.slice(index);
					}
					$scope.assigned_employee = globalVarFactory.assigned_employee = $scope.assigned_emp ;
					$scope.available_employee = globalVarFactory.available_employee = $scope.avail_emp; 
				}
			}
			globalVarFactory.edit_employee_data = '';
			//console.log("Check =="+JSON.stringify($scope.assigned_employee));
		}



		// Employee Picker and Emplyee Remover function  
		$scope.move = function(employee, move_from, move_to, action){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 2);
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

		// modify jobtitle in SELECT EMPLOYEE slide box
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

		//View Added Photos
		$scope.viewPhotoPage = function(){
			globalVarFactory.audit_form_data = $scope.audit_data;
			globalVarFactory.assigned_employee = $scope.assigned_employee;
			globalVarFactory.available_employee = $scope.available_employee;
			$location.path("/photo");
		}

		//Take Photo
		$scope.showPhotoOption = function(){setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);$scope.takePhoto = 'show';globalVarFactory.audit_form_data = $scope.audit_data;};
		$scope.takeJobSitePhoto = function(type){
			$scope.takePhoto = '';
			serviceAudit.capturePhoto(type).then(function(image){
				globalVarFactory.jobsitePhotos.push(image);
				$scope.totaljobSitePhotos = globalVarFactory.jobsitePhotos.length;
				var catData =JSON.parse(globalVarFactory.getQuestionData());
				$scope.totaljobSitePhotos = (globalVarFactory.jobsitePhotos.length + catData.defPhotoCount);
				angular.element(document.getElementById('AutoHideBox')).triggerHandler('click');
				//navigator.notification.alert('Image Added');
			},function(message){
				navigator.notification.alert(message);
			});
		}

		// pagination
		$scope.curPage = 0;
		$scope.pageSize = 40;
		$scope.scrollWindow = function(){
			setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 2);
		}
		//console.log($scope.pageSize);
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

		$scope.checkZip = function(){
			var reg = /^[0-9]{5}$/;
			if (!reg.test(this.audit_data.zip)) {
				$scope.audit_data.zip = '';
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

		//Lock updated data and Move to next step
		$scope.update_audit = function (audit_data)
		{
			var error = 0;
			var reg = /^[0-9]{5}$/;
			$scope.global_error = '';
			//console.log(JSON.stringify($scope.audit_data.customer));
			if($scope.audit_data.phase_number == '' || $scope.phase_numbers.indexOf($scope.audit_data.phase_number) == -1){$scope.audit_data.phase_number = ''; error = 1;};
			if($scope.audit_data.job_number == '' || $scope.job_numbers.indexOf($scope.audit_data.job_number) == -1 ){$scope.audit_data.job_number = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.supervisor) || Object.keys($scope.audit_data.supervisor).length == 0){$scope.audit_data.supervisor = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.customer) || Object.keys($scope.audit_data.customer).length == 0 || $scope.audit_data.customer.value == undefined ||  $scope.audit_data.customer.value == '' ){$scope.audit_data.customer = ''; error = 1;};
			if(!angular.isObject($scope.audit_data.foreman) ||  Object.keys($scope.audit_data.foreman).length == 0){$scope.audit_data.foreman = ''; error = 1;};

			if($scope.assigned_employee == "" || $scope.assigned_employee.length == 0) {
				$scope.global_error = "Please select employees";
				error = 1;
			};

			if (error == 0) {
				globalVarFactory.audit_form_data = $scope.audit_data;
				globalVarFactory.assigned_employee = $scope.assigned_employee;
				globalVarFactory.available_employee = $scope.available_employee;
				//globalVarFactory.deficiencyData = res.data.deficiencyData;
				$location.path('/edit_audit/categories');
			}
		}

	});

}])

/**
 * @ngdoc
 * @name npl.Controller:editCategoryController
 * @description
 * Display list of all Categories available for audit and mark selected categories as per audit details.
 *
 */

.controller('editCategoryController', ['$scope','$location', '$routeParams', 'config','globalVarFactory','checkCategoryIndex','serviceData', function($scope, $location, $routeParams,config,globalVarFactory, checkCategoryIndex,serviceData){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	//Check wheter previous step is completed or not
	if (globalVarFactory.audit_form_data == "") {
		$location.path("/edit_audit");
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
		var categoryForNull = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": null});
		var categoryForID = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": String(globalVarFactory.audit_form_data.customer.value)});
		var mergedCategories = _.uniq(_.union(categoryForNull, categoryForID), false, function(item, key, a){ return item.PKAuditCategoryID; });
		//$scope.categories = _.where(categoryMaster, {"CategoryType" : $scope.audit_type,"FKCustomerID": String(globalVarFactory.audit_form_data.customer.value)});
		$scope.categories = mergedCategories;

		angular.forEach($scope.categories, function(value, key){
			if (globalVarFactory.audit_categories[value.PKAuditCategoryID] == undefined) {
				globalVarFactory.audit_categories[value.PKAuditCategoryID] = {};
				globalVarFactory.categoryStatus[value.PKAuditCategoryID] = {};
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
				$location.path('/edit_summary/'+globalVarFactory.edit_auditID);
			}
		}

		//Completed category check ends here

		$scope.select_category = function(){
			globalVarFactory.audit_selected_category = '';
			globalVarFactory.audit_selected_category = this.category;
			$location.path("/edit_audit/categories/sub_categories");
		};

		$scope.saveProgress = function(){
			if(globalVarFactory.inProgressAuditID == 0){
				serviceData.saveAuditprogress(globalVarFactory,{type : 1, employeeID : Session.employeeID}).then(function(res){
					if(res.insertId != undefined){
						globalVarFactory.inProgressAuditID = res.insertId;
						navigator.notification.alert('Progress Saved');	
					};

				});
			}else{
				serviceData.saveAuditprogress(globalVarFactory,{type: 0, employeeID : Session.employeeID, id : globalVarFactory.inProgressAuditID}).then(function(res){

					if (res.rowsAffected > 0 ) {
						navigator.notification.alert('Progress Saved');	
					}
				});
			}	
		};

		$scope.global_process = '';
	});


}])



/**
 * @ngdoc
 * @name npl.Controller:editSubCategoryController
 * @description
 * Display list of all Sub-Categories available for audit as per Audit Type & Category selected.
 * Sub-Sub category and its deficiency are managed here.
 */

.controller('editSubCategoryController', ['$scope', '$http', '$location', '$routeParams', 'checkCategoryIndex','$modal','$sce', 'globalVarFactory','serviceData','$q','serviceAudit', function($scope, $http, $location, $routeParams, checkCategoryIndex, $modal,$sce,globalVarFactory,serviceData,$q,serviceAudit){
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	if (globalVarFactory.audit_selected_category == "") {
		$location.path("/edit_audit/categories");
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
		globalVarFactory.vendorList = response.data;
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
			}else if (globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID] != undefined && Object.keys(globalVarFactory.audit_categories[category_id][category_obj.PKAuditSubCategoryID]).length > 0) {
				if(globalVarFactory.categoryStatus[category_id].inCompleteIds.indexOf(category_obj.PKAuditSubCategoryID) != -1)
				{	return ''; }
				else if(globalVarFactory.categoryStatus[category_id].deficiencyIds.indexOf(category_obj.PKAuditSubCategoryID) == -1)
				{	return 'active'; }

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

			var indexVal = globalVarFactory.categoryStatus[category_id].NaIds.indexOf(categoryObj.PKAuditSubCategoryID);
			var me = this;
			if (indexVal == -1) {

				var markNA = function(){
					globalVarFactory.categoryStatus[category_id].NaIds.push(me.category.PKAuditSubCategoryID);

					if (globalVarFactory.audit_categories[category_id][me.category.PKAuditSubCategoryID] != undefined) {
						angular.forEach(globalVarFactory.audit_categories[category_id][me.category.PKAuditSubCategoryID], function(value,key){

							if (angular.isArray(value) && value.length > 0) {
								angular.forEach(value, function(defData, defKey){
									if (defData.deficiencyID != undefined && defData.deficiencyID != '' && defData.deficiencyID != null) {
										if(globalVarFactory.deletedDeficiency.indexOf(defData.deficiencyID) == -1){globalVarFactory.deletedDeficiency.push(defData.deficiencyID);}
									}

								});

							}
						});
					}

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
					$scope.$apply();
				}

				var deficiencyIDS =  globalVarFactory.categoryStatus[category_id].deficiencyIds;
				if (deficiencyIDS.indexOf(me.category.PKAuditSubCategoryID) != -1) {
					navigator.notification.confirm('Are you sure you want to delete all deficiencies for this sub-category ?',
							function(buttonIndex){
						if(buttonIndex == 1){
							markNA();
						}else{
							document.getElementById('box_'+ me.category.PKAuditSubCategoryID).checked = false;
						}

					} , 'Warning');
				}else{
					markNA();
				}
			}else{
				//console.log(globalVarFactory.categoryStatus[category_id].NaIds);
				globalVarFactory.categoryStatus[category_id].NaIds.splice(indexVal, 1);
				//console.log(globalVarFactory.categoryStatus[category_id].NaIds);

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


		$scope.toggleState = true;

		//Show deficiency form in deficiency flyout
		$scope.toggleDeficiencyForm = function(){
			deficiencyPhotos = [];
			editDeficiencyIndex = -1;
			$scope.toggleState = false;
			$scope.disableVendor = $scope.disableEmployee = '';
			$scope.deficiency = { refNum : '', jobSiteCorrection : '', vendor : '', nplEmployee : {}, vendorEmployee : '', notes : '' };
			$scope.totaldeficiencyPhotos = 0;
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

		//Show Question Popup and populate answer for question if added
		$scope.questions = globalVarFactory.Questions;
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

				$http.get('pages/manager/edit_question.html').then(function(response){

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
				currentQuestion = this.question.PKAuditQuestionID;
				$scope.questionName  = this.question.Question;
				var nplEmployees = [];
				angular.forEach(globalVarFactory.assigned_employee, function(value,key){
					var emp = {name : value.name , EmpNum : value.EmpNum};
					if(nplEmployees.indexOf(emp) == -1){nplEmployees.push(emp);}
				});
				var auditForeman = globalVarFactory.audit_form_data.foreman;
				if(nplEmployees.indexOf({name : auditForeman.label, EmpNum : parseInt(auditForeman.value)}) == -1){nplEmployees.push({name : auditForeman.label, EmpNum : parseInt(auditForeman.value)});}


				$http.get('pages/manager/edit_deficiency.html').then(function(response){

					$scope.nplEmployeesData = nplEmployees;
					$scope.addedDeficiencyData = '';
					if (question_details[currentQuestion] != 'isComplaint' && question_details[currentQuestion] != 'isNA' && angular.isArray(question_details[currentQuestion])) {
						var employeeAllList= JSON.parse(localStorage.getItem('storageEmpList'));
						angular.forEach(question_details[currentQuestion],function(value,key){
							if (value.employee_id != '' && value.employee_name == '' ) {

								var EmpName  = _.where(employeeAllList, {EmpNum : parseInt(value.employee_id)}); 
								value.employee_name = EmpName != '' ? EmpName[0].name : value.employee_id;
							}
							question_details[currentQuestion][key] = value;
						});
						$scope.addedDeficiencyData = question_details[currentQuestion];
						deficiencyArray = question_details[currentQuestion];
						$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
						$scope.aside = {aside_content: $sce.trustAsHtml(response.data)};
						angular.element(flyout_el).triggerHandler('click');

					}else{
						$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
						$scope.aside = {aside_content: $sce.trustAsHtml(response.data)};
						angular.element(flyout_el).triggerHandler('click');        
					}


					$scope.deficiency = { refNum : '', jobSiteCorrection : '', vendor : '', nplEmployee : {}, vendorEmployee : '', notes : '', deficiencyID : '' };
				});
			}else{
				if (question_details[this.question.PKAuditQuestionID] != undefined && angular.isArray(question_details[this.question.PKAuditQuestionID]) && question_details[this.question.PKAuditQuestionID].length > 0) {
					var $this = this;
					navigator.notification.confirm('Are you sure you want to delete all deficiencies for this sub-sub-category ?',

							function(buttonIndex){
						if (buttonIndex == 1) {
							angular.forEach(question_details[$this.question.PKAuditQuestionID], function(defData, defKey){
								if (defData.deficiencyID != undefined && defData.deficiencyID != '' && defData.deficiencyID != null) {
									if(globalVarFactory.deletedDeficiency.indexOf(defData.deficiencyID) == -1){globalVarFactory.deletedDeficiency.push(defData.deficiencyID);}
								}

							});
							question_details[$this.question.PKAuditQuestionID] = type;
						}else{
							document.getElementById($this.question.PKAuditQuestionID+"_green").checked=false;
							document.getElementById($this.question.PKAuditQuestionID+"_red").checked=true;
						}
						$scope.apply();
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
					if (photoID != '') {
						globalVarFactory.deletedPhotos.push(photoID);
					}
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
				if (angular.isObject(deficiencyData.vendor) &&  Object.keys(deficiencyData.vendor).length > 0) {
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
						'photo_data' :   deficiencyPhotoNames,
						'deficiencyID' : deficiencyData.deficiencyID
				};

				$scope.logData(editDeficiencyIndex);
				if (editDeficiencyIndex == -1 && editDeficiencyIndex != 0) {
					deficiencyArray[deficiencyArray.length] = deficiencyObject;
					question_details[currentQuestion] = deficiencyArray;
					$scope.addedDeficiencyData = question_details[currentQuestion];

				}else{
					navigator.notification.confirm('Are you sure want to overwrite ?',
							function(buttonIndex){
						if (buttonIndex == 1) {
							$scope.logData(question_details[currentQuestion][editDeficiencyIndex]);
							question_details[currentQuestion][editDeficiencyIndex] = deficiencyObject;
							editDeficiencyIndex = -1;
						}
					}, 'Warning');        
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
				this.deficiencyID = '';

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
			this.deficiency.nplEmployee = {EmpNum : parseInt(currentDeficency.employee_id), name: currentDeficency.employee_name};
			this.deficiency.vendor = {VendorNum : currentDeficency.vendor_id , VendorName : currentDeficency.vendor_name};
			//this.deficiency.vendor = currentDeficency.vendor_name;
			this.deficiency.vendorEmployee = currentDeficency.vendor_emp;
			this.deficiency.deficiencyID = currentDeficency.deficiencyID;
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
			navigator.notification.confirm('Are you sure want to delete ?',
					function(buttonIndex){
				if (buttonIndex == 1) {

					var removeDeficiencyIndex = question_details[currentQuestion].indexOf($this.addedDeficiency);
					if (removeDeficiencyIndex == editDeficiencyIndex) {
						editDeficiencyIndex = -1;
					}
					question_details[currentQuestion].splice(removeDeficiencyIndex,1);
					if (this.addedDeficiency.deficiencyID != '') {
						globalVarFactory.deletedDeficiency.push($this.addedDeficiency.deficiencyID);
					}
					$scope.addedDeficiencyData = question_details[currentQuestion];
					if (angular.isArray(question_details[currentQuestion]) && question_details[currentQuestion].length == 0) {
						question_details[currentQuestion] = 'isComplaint';
					}
					$scope.apply();
				}
			}, 'Warning');
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
				var $this = this;
				navigator.notification.confirm('Mark all question as compliant ?',
						function(buttonIndex){
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
				},'Warning');

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
 * @name npl.Controller:editReviewController
 * @description
 * Show summary of audit before submission for update audit
 */

.controller('editReviewController',['$http', '$routeParams', '$scope', 'serviceData','globalVarFactory','Session','$location','$sce','serviceAudit', function($http, $routeParams, $scope, serviceData,globalVarFactory, Session,$location,$sce,serviceAudit) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	if (globalVarFactory.audit_form_data == "") {
		$location.path("/edit_audit/categories");
	}
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
	$scope.logData(globalVarFactory);
	$scope.jobNumber = globalVarFactory.audit_form_data.job_number;
	$scope.Area = globalVarFactory.audit_form_data.area_master;
	$scope.City = globalVarFactory.audit_form_data.city;
	$scope.State = globalVarFactory.audit_form_data.state;
	$scope.one_call_ticket = globalVarFactory.audit_form_data.one_call_ticket;
	$scope.Customer = globalVarFactory.audit_form_data.customer.label;
	$scope.Supervisor = globalVarFactory.audit_form_data.supervisor.label;
	$scope.Foreman = globalVarFactory.audit_form_data.foreman.label;
	$scope.EmployeeCount = globalVarFactory.assigned_employee.length;
	//$scope.employees = globalVarFactory.assigned_employee;
	$scope.Comments = globalVarFactory.audit_form_data.comments;
	$scope.location = globalVarFactory.audit_form_data.job_location;

	var manager = globalVarFactory.audit_form_data.safety_manager;
	$scope.manager = manager != undefined ? manager.name : '';

	var employeeAllList= JSON.parse(localStorage.getItem('storageEmpList'));
	var employeeAuditorData = _.where(employeeAllList, {EmpNum : parseInt(Session.employeeID)});
	$scope.employeeName = (employeeAuditorData != '') ? employeeAuditorData[0].name : Session.employeeName;

	//console.log(JSON.stringify(manager));

	$scope.hideMessage = function(messageVar){
		messageVar == 'global_success' ? $scope.global_success = '' : $scope.global_error = '';
	};

	var categoryData = {};

	var deficiencyPhotos = [];
	var deficiency = {};
	var question_details = [];
	// Show take photo option in Deficiency Flyout
	$scope.takeDeficiencyPhoto = '';
	$scope.hideTakeDeficiencyPhoto = function(){
		$scope.takeDeficiencyPhoto = '';return false;

	};
	var allAuditEmployees = [];
	for(var i =0; i < globalVarFactory.assigned_employee.length; i++){
		allAuditEmployees[i] = {FirstName :globalVarFactory.assigned_employee[i].FirstName , LastName : globalVarFactory.assigned_employee[i].LastName};	
	}

	//Get Category data
	if (globalVarFactory.vendorList.length == 0 || globalVarFactory.vendorList == '' ) {
		var AllVendors = serviceData.getLocalData('AllVendors').then(function(response){
			globalVarFactory.vendorList = response.data;
			categoryData =JSON.parse(globalVarFactory.getQuestionData());
			$scope.deficiencyDetails = categoryData.allDeficiency;

			//$scope.photoCount = (globalVarFactory.jobsitePhotos.length + globalVarFactory.deficiencyPhotos.length);
			$scope.totalPhotoCount = (globalVarFactory.jobsitePhotos.length + categoryData.defPhotoCount);

			angular.forEach(categoryData.allDeficiency, function(value,key){
				if (value.vendor_id != undefined && value.vendor_id != '') {
					allAuditEmployees.push({FirstName :value.employee , LastName : ''});
				}

			});

		});        
	}else{
		categoryData =JSON.parse(globalVarFactory.getQuestionData());
		$scope.deficiencyDetails = categoryData.allDeficiency;

		//$scope.photoCount = (globalVarFactory.jobsitePhotos.length + globalVarFactory.deficiencyPhotos.length);
		$scope.totalPhotoCount = (globalVarFactory.jobsitePhotos.length + categoryData.defPhotoCount);

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

		$scope.deficiencyPhotos = [];
		$scope.InprogressPhoto = deficiencyPhotos;
		$scope.DeficiencyPhotoCount = deficiencyPhotos.length;
		$scope.showPhotoPageDef = 'show';
	}

	// Delete photo of current question deficiency
	$scope.deleteCurrentPhoto = function(source,questionId, index, photoID){
		var $this = this;
		navigator.notification.confirm('Are you sure want to delete ?',
				function(buttonIndex){
			if (buttonIndex == 1) {
				var photoIndex = question_details[questionId][index].photo_data.indexOf({src : source, photoID : photoID});
				question_details[questionId][index].photo_data.splice(photoIndex,1);
				$this.PhotoPage();
				$scope.apply();
			}
		}, 'Warning');        
	};

	// Delete photo from deficency which was in progress and not completed
	$scope.deleteInProgressPhoto = function(src,imageIndex){
		navigator.notification.confirm('Are you sure want to delete ?',
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
		//console.log(reg.test(deficiencyData.refNum))
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
			//console.log(JSON.stringify(deficiencyData));
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
					'photo_data' :   deficiencyPhotoNames,
					'deficiencyID' : deficiency.deficiencyPK
			};

			globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID][deficiency.questionID][deficiency.deficiencyID] = deficiencyObject;
			categoryData =JSON.parse(globalVarFactory.getQuestionData());
			$scope.deficiencyDetails = categoryData.allDeficiency;
			//console.log(JSON.stringify(deficiencyObject));

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
		deficiency.deficiencyPK = '';
		//deficency flyout  trigger
		var flyout_el = document.getElementById('trigger_dificiency_flyout');
		$scope.vendors = globalVarFactory.vendorList;
		$scope.takeDeficiencyPhoto = $scope.disableVendor = $scope.disableEmployee = '';
		$scope.summaryPage = true;
		deficiency = this.deficiency;
		question_details = globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID];
		var currentDeficency = globalVarFactory.audit_categories[deficiency.mainCategoryID][deficiency.subCategoryID][deficiency.questionID][deficiency.deficiencyID];
		deficiency.deficiencyPK = currentDeficency.deficiencyID;
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
		if(nplEmployees.indexOf({name : auditForeman.label, EmpNum : parseInt(auditForeman.value)}) == -1){nplEmployees.push({name : auditForeman.label, EmpNum : parseInt(auditForeman.value)});}

		$http.get('pages/manager/edit_deficiency.html').then(function(response){

			$scope.questionID = deficiency.questionID;
			$scope.defID = deficiency.deficiencyID;

			$scope.nplEmployeesData = nplEmployees;
			$scope.questionName = deficiency.question;
			$scope.deficiency = {
					refNum : currentDeficency.ref_num,
					jobSiteCorrection : currentDeficency.is_job_site_correction,
					vendor : vendorInfo,
					nplEmployee : {EmpNum : parseInt(currentDeficency.employee_id),name: currentDeficency.employee_name},
					vendorEmployee : currentDeficency.vendor_emp,
					notes : currentDeficency.notes
			};
			$scope.doThisOnBlurInputs = function(){ setTimeout(function() { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1); }
			$scope.aside = {aside_content: $sce.trustAsHtml(response.data)};
			angular.element(flyout_el).triggerHandler('click');

		});
	};

	//Submit Updated audit
	$scope.updateAudit = function(){
		if (processing == 0) {
			categoryData =JSON.parse(globalVarFactory.getQuestionData());

			processing = 1;
			$scope.logData('Submit Update');

			if(globalVarFactory.jobsitePhotos.length > 0)
			{
				angular.forEach(globalVarFactory.jobsitePhotos , function(value,key){
					jobsitePhotoNames.push({src: value});
				});
			}

			var jobNumber = auditFormData.job_number.jobNum;

			if(jobNumber == undefined){

				jobNumber = auditFormData.job_number;
			}
			if (auditFormData.safety_manager == undefined || auditFormData.safety_manager.EmpNum == undefined) {
				var safetyManagerID = Session.employeeID;
			}else{
				var safetyManagerID = auditFormData.safety_manager.EmpNum;
			}

			var auditDate = auditFormData.audit_date;

			if (auditFormData.audit_date.getMonth) {
				var month = auditFormData.audit_date.getMonth() + 1;
				auditDate = auditFormData.audit_date.getFullYear() + '-' + month + '-' + auditFormData.audit_date.getDate();
			}          

			//Audit Form Data - job / Phase
			finalAuditData.audit_data = {
					aDateTime: auditDate,
					supervisor_id : supervisor,
					foreman_id    : foreman,
					jobnum        : jobNumber,
					phasenum      : auditFormData.phase_number,
					audit_type    : auditFormData.audit_type,
					work_location : auditFormData.job_location,
					city          : auditFormData.city, 
					state         : auditFormData.state.StateId,
					lattitude     : globalVarFactory.latitude,
					longitude     : globalVarFactory.longitude,
					zipcode       : auditFormData.zip,
					customer_id   : customer,
					one_call_ticket : auditFormData.one_call_ticket,
					area_id       : auditFormData.area_master.AreaNum,
					auditor_empid : Session.employeeID ,
					comments      : auditFormData.comments,
					safety_manager_id : safetyManagerID,
					photo_data    : jobsitePhotoNames,
					is_post_audit   : auditFormData.post_audit,
					update_audit_id : globalVarFactory.edit_auditID
			};
			//Audit Form Data - job / Phase - employee picker
			finalAuditData.employee_data = [];
			for( var e = 0; e < employee_data.length; e++)
			{
				if(employee_data[e] != undefined ){
					finalAuditData.employee_data.push({
						employee_id : employee_data[e].EmpNum,
						job_title   : globalVarFactory.jobTitles[employee_data[e].JobTitleId]
					});
				}
			}

			//Na Subcategories
			finalAuditData.subcat_data = categoryData.naSubCategories;

			//Question data
			finalAuditData.question_data = categoryData.questionData;

			//Deleted Deficiency PrimaryKey in comma seperated string
			var commaseperatedDefIDS = '';
			angular.forEach(globalVarFactory.deletedDeficiency, function(value,key){
				commaseperatedDefIDS += value + ',';   

			});

			finalAuditData.deletedDeficiency = commaseperatedDefIDS.slice(0,-1);

			//Deleted Photo PrimaryKey in comma seperated string
			var commaseperatedPhotoIDS = '';
			angular.forEach(globalVarFactory.deletedPhotos, function(value,key){
				commaseperatedPhotoIDS += value + ',';   

			});
			finalAuditData.deletedPhotos = commaseperatedPhotoIDS.slice(0,-1);
			
			finalAuditData = JSON.stringify(finalAuditData); 
			//$scope.logData(finalAuditData);

			var audit_json_data = 'audit_json_data='+encodeURI(finalAuditData).replace(/[!&'()*]/g, escape); 
			
			//Send Updated data
			
			serviceData.send('auditUpdate', audit_json_data , {now : true, root : true, method : 'POST', headers : {'Content-Type': 'application/x-www-form-urlencoded'} }).then(function(res){
				var finalPhotoData = [];
				if (res.audit_id != undefined && res.audit_id != '') {
					//console.log(res.audit_id);
					angular.forEach(globalVarFactory.jobsitePhotos, function(value,key){
						if(globalVarFactory.jobSitePhotoID[key] == undefined || globalVarFactory.jobSitePhotoID[key] == ''){
							finalPhotoData.push(value);
						}
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
											if (photoData[p].photoID == undefined || photoData[p].photoID == '') {
												finalPhotoData.push(photoData[p].src);
											}

										}
									}
								}
							}
						}	
					});

					//Update photo in local storage
					if (finalPhotoData.length > 0) {
						serviceData.db.del('photoDataStorage', {"auditID" : res.audit_id}, function(response){

							serviceData.db.insert('photoDataStorage', {'photoData' : encodeURIComponent(JSON.stringify(finalPhotoData)), 'auditID' : res.audit_id, 'status' : 0 },function(resp){

								//console.log(resp);
								$scope.logData(res);
								$scope.logData('Audit Updated Successfuly');
								$scope.global_success = 'Audit Updated on Server.';
								globalVarFactory.reset();
								setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/manage_audit'; $location.path('/manage_audit');}, 1000);
							});
						});
					}else{
						$scope.logData(res);
						$scope.logData('Audit Updated Successfuly');
						$scope.global_success = 'Audit Updated on Server.';
						globalVarFactory.reset();
						setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/manage_audit';$location.path('/manage_audit');}, 1000);
					}
				}



			},function(error){

				$scope.logData(JSON.stringify(error));
				if (error.data != undefined && error.data.error_text != undefined) {
					$scope.global_error = error.data.error_text;
				}else{

					$scope.global_success = 'No internet connection.Audit data updated in localstorage for now.';
					globalVarFactory.reset();
					setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/manage_audit';$location.path('/manage_audit');}, 1000);	
				}


			});
		}



	};
}])


/**
 * @function auditSummaryController
 * Show audit summary detail to approve
 *
 */
.controller('auditSummaryController',[ '$scope', 'serviceAudit', 'serviceData', '$routeParams', '$q', '$http', 'config', 'Session', '$location', '$timeout','globalVarFactory', function($scope, serviceAudit, serviceData, $routeParams, $q, $http, config, Session, $location, $timeout,globalVarFactory) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	var param = {};

	if (Session.group == 'Safety Auditors') {
		$scope.readOnly = true;
	}
	$scope.isApprove = true;
	globalVarFactory.reset();
	$scope.deficiency = {};                      
	param.audit_id = $routeParams.auditId;
	$scope.audit_id = $routeParams.auditId;

	var auditDetail = serviceData.get('auditDetail',{audit_id : param.audit_id}, { now: true, root: 'yes'}).then(function(res){
		return res;

	},function(err){

		return err;
	})

	var areaWiseData = serviceData.getLocalData('areaWiseData').then(function(dataArray){
		return  dataArray;       
	},function(err){

		return err;
	})
	var AllStates = serviceData.getLocalData('AllStates').then(function(response){
		return response;

	},function(err){
		return err;
	});


	$q.all([auditDetail,areaWiseData, AllStates]).then(function(result){
		var res = result[0];
		var areaWiseData = result[1];
		var allStates = result[2];
		var employeeAllList= JSON.parse(localStorage.getItem('storageEmpList'));

		// get all states data from local storage
		$scope.Area = [];
		$scope.auditData = res.auditData;
		globalVarFactory.audit_form_data = res.auditData;
		globalVarFactory.jobsitePhotos = res.jobSitePhotoData;
		globalVarFactory.deficiencyPhotos = res.deficiencyPhotoData;
		globalVarFactory.deficiencyData = res.deficiencyData;
		$scope.date = res.auditData.AuditDateTime;
		$scope.jobNumber  = res.auditData.JobNumber;
		$scope.Area.AreaNum  = res.auditData.FKAreaID;
		$scope.EmployeeCount = res.employeeData.length;
		var allAssignedEmp = [];
		angular.forEach(res.employeeData, function(value,key){

			var empData = _.where(employeeAllList, {EmpNum : parseInt(value.FKEmployeeID)});
			if(empData != '' && empData != undefined){allAssignedEmp.push(empData[0]);}
		});

		$scope.employees = allAssignedEmp;
		$scope.Comments = res.auditData.Comments;
		$scope.City = res.auditData.City;
		$scope.one_call_ticket = res.auditData.one_call_ticket;
		$scope.location = res.auditData.WorkLocation;

		// _.where(employeeAllList, {EmpNum : parseInt(deficiencyEmployeeId)});

		var manager = _.where(employeeAllList, {EmpNum : parseInt(globalVarFactory.audit_form_data.FKSafetyManagerEmployeeID)});
		$scope.manager  = manager != '' && manager != undefined ? manager[0].name : '';

		$scope.deficiencyPhotos = res.deficiencyPhotoData;
		$scope.totaljobSitePhotos = res.jobSitePhotoData.length;

		$scope.totalPhotoCount = res.deficiencyPhotoData.length +  res.jobSitePhotoData.length;
		$scope.deficiency.defPhotoCount = res.deficiencyPhotoData.length;


		//get state from local storage
		$scope.State = [];

		var stateName = _.where(allStates.data, {StateId : parseInt(res.auditData.LocationState)});
		var stateLable = stateName!= '' ? stateName[0].StateName : '';
		if(stateLable != ''){
			$scope.State.StateName = stateLable;
		}else{
			$scope.State.StateName = res.auditData.LocationState;
		}


		// for deficiency data
		var defObjData = [];

		// loop for add employee name in employeeDataObject
		globalVarFactory.deficiencyDetails = [];
		angular.forEach(res.deficiencyData, function(objDeficiencyData, key) {

			// get employee name by passing auditEmpId
			var deficiencyEmployeeId = objDeficiencyData.FKEmployeeID;
			var deficiencyVenderId = objDeficiencyData.VendorName;
			if (deficiencyEmployeeId) {
				var deficiencyEmpData = _.where(employeeAllList, {EmpNum : parseInt(deficiencyEmployeeId)});	
				var deficiencyEmpData = deficiencyEmpData[0]; 
				objDeficiencyData.employee = deficiencyEmpData.name;
			}else if(deficiencyVenderId){

				objDeficiencyData.employee = objDeficiencyData.VendorEmployeeName +" ( " + deficiencyVenderId +" )" ;
				$scope.employees.push({FirstName :objDeficiencyData.employee , LastName : ''});

			}
			var deficiencyPhoto = _.where(res.deficiencyPhotoData, {FKAuditReqCategoryDeficientID : objDeficiencyData.PKAuditReqCategoryDeficientID});
			objDeficiencyData.defPhotoCount = deficiencyPhoto.length;
			objDeficiencyData.refNum = objDeficiencyData.RefNumber;
			objDeficiencyData.mainCatname = objDeficiencyData.Category;
			objDeficiencyData.subCatname  = objDeficiencyData.SubCategory;
			objDeficiencyData.question =    objDeficiencyData.Question;

			defObjData.push(objDeficiencyData);

			// assign empObjData in $scope.empDataWithName
			$scope.deficiencyDetails = globalVarFactory.deficiencyDetails = defObjData;

		});

		// get super visor name from local storage
		var superVisorData = _.where(employeeAllList, {EmpNum : parseInt(res.auditData.FKSupervisorID)});
		$scope.Supervisor = (superVisorData != '') ? superVisorData[0].name : '';

		// get auditor name from local storage
		var employeeAuditorData = _.where(employeeAllList, {EmpNum : parseInt(res.auditData.FKAuditorEmployeeID)});
		$scope.employeeName = (employeeAuditorData != '') ? employeeAuditorData[0].name : '';

		// get foreman name from local storage
		var foremanData = _.where(employeeAllList, {EmpNum : parseInt(res.auditData.FKForemanID)});
		$scope.Foreman = (foremanData != '') ? foremanData[0].name : '';

		// get customer name from local storage
		var customerId = res.auditData.FKCustomerID;
		var customerData = areaWiseData.data[$scope.Area.AreaNum].Customer;
		var cusrtomerName = _.where(customerData, {value : customerId});
		$scope.Customer = (cusrtomerName != '') ? cusrtomerName[0].label : customerId;


	});

	$scope.submitAuditStatus = function(auditId){
		//console.log(globalVarFactory.deficiencyDetails);
		if(globalVarFactory.deficiencyDetails == undefined || globalVarFactory.deficiencyDetails.length == 0){
			param.status_id = 4;
		}else{
			param.status_id = 3;
		}
		param.audit_id = auditId;

		var sendHeaders = {'Content-Type':'application/x-www-form-urlencoded'};
		var auditJsonData = 'audit_status='+JSON.stringify(param);
		$http({method: "POST", url :config.currentEnvironment.server+ '/auditStatusUpdate', data: auditJsonData,  headers: sendHeaders})
		.then(function(res){
			if (res.data.code == 'S0101') {
				$scope.global_success = 'Status updated.';

				setTimeout(function(){globalVarFactory.refresh = 1;window.location.href='#/manage_audit';$location.path('/manage_audit');}, 1000);
			}else{
				$scope.global_error = 'Status Updated Failed.';
				$timeout(function() {$scope.hideMessage('global_error');}, 1000);
			}
		},function(error){
			$scope.global_error = 'Status Updated Failed.';
			$timeout(function(){$scope.hideMessage('global_error');}, 1000);
		});
	}

}])

/**
 * @function auditPhotoController
 * Show audit photo befor approve
 *
 */
.controller('auditPhotoController',[ '$scope', 'serviceData', '$routeParams', '$q', '$http', 'config', 'Session', '$location', '$timeout', 'globalVarFactory', function($scope, serviceData, $routeParams, $q, $http, config, Session, $location, $timeout, globalVarFactory) {
	$scope.lastRefresh = localStorage.getItem('lastRefresh');

	var param = {};
	$scope.audit_id = $routeParams.auditId;
	if(globalVarFactory.audit_form_data ==''){
		//$location.path('#/audit_summary/'+$scope.audit_id);
	}
	$scope.back_page = '#/audit_summary/'+$scope.audit_id;
	$scope.totalphoto = 0;
	$scope.isApprove = true;
	$scope.showEnlargePhoto = '';
	$scope.AreaNum = globalVarFactory.audit_form_data.FKAreaID;
	$scope.jobsitePhotosData = globalVarFactory.jobsitePhotos;
	$scope.deficiencyPhotos = globalVarFactory.deficiencyPhotos;
	$scope.totaljobSitePhotos = globalVarFactory.jobsitePhotos.length;
	$scope.totalDeficiencyPhotos = globalVarFactory.deficiencyPhotos.length;
	$scope.deficiencyData = globalVarFactory.deficiencyData;
	var dificiencyArray = [];
	var photos = [];
	var jobsitePhotos = [];
	$scope.showPhotoPage = '';
	$scope.showPhotoPageDef = '';
	$scope.showLiveFile = function(){
		return true;
	}

	angular.forEach($scope.jobsitePhotosData, function(value, key) {
		jobsitePhotos.push(value.FileName);
	});
	$scope.jobsitePhotos = jobsitePhotos;

	angular.forEach($scope.deficiencyData, function(value, key) {
		var isExists = _.where($scope.deficiencyPhotos, {FKAuditReqCategoryDeficientID : value.PKAuditReqCategoryDeficientID});
		if(isExists != ''){
			for(var i=0; i < isExists.length; i++){
				photos.push({'src':isExists[i].FileName});
			}
		}
		if(photos != ''){
			value.photos = photos;
			value.refNum = value.RefNumber;
			dificiencyArray.push(value);
		}
		photos = [];
	});
	//console.log(JSON.stringify( $scope.jobsitePhotos));
	$scope.deficiencyPhotos = dificiencyArray;


	$scope.enLargeImage = function(source){
		$scope.LargeImage = source;
		angular.element(document.getElementById('triggerImage')).triggerHandler('click');
	};
	$scope.hideEnlargePhoto = function(){
		$scope.showEnlargePhoto = '';
	}

	globalVarFactory.deficiencyEmpData = globalVarFactory.deficiencyEmpData;
}]);
