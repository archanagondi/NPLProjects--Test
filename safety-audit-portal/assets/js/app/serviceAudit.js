'use strict';

angular.module('npl')

.service('serviceAudit', ['$rootScope','serviceData', '$http', 'config', 'Session', '$q','$location', function ($rootScope,serviceData, $http, config, Session, $q,$location) {

  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#employees
   * @description A map of employees from empNum to their employee records.
   */
  var auditList = {},
    employees = {},
    auditDetail = {};



  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getAuditList
   * @param {object} audit status, audit type, foreman, period
   * @description LoggedIn user Audit history
   */
    
  function getAuditList(param) {
   param.time = new Date().getTime();	  
   return serviceData.get('auditList',param,{root: 'yes'})
    .then(function(data){
      auditList = data;
      return auditList;
    });  
  };
  
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getAuditDetail
   * @param {object} audit status, audit type, foreman, period
   * @description Selected Audit detail
   */
    
  function getAuditDetail(param) {
   return serviceData.get('auditDetail',param,{root: 'yes'})
    .then(function(data){
      auditDetail = data;
      return auditDetail;
    });  
  };
  
  
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getEmployeeName
   * @param {object} customerId
   * @description get employee name by passing employeeId
   */
    
  function getEmployeeName(employeeId) {
      var defer = $q.defer();
      if(!isNaN(employeeId) && angular.isNumber(parseInt(employeeId)) && employeeId != '' && employeeId != null){
	return $http({method: "GET",url : config.defaultEnvironment.dataServer + '/data/masterData?employeeNumber='+employeeId, headers: {'Authorization': 'Bearer '+Session.token, 'Accept': 'application/json;odata=verbose'}})
		  .then(function(employeeData){
		      //var employeeName = employeeData.data.currentEmployee[0];
		      defer.resolve(employeeData.data.currentEmployee[0]);
		       return defer.promise;
		  },function(error){
		      var employeeData = '';
		      defer.resolve(employeeData);
		      return defer.promise;
		});
      }else{
	var employeeData = '';
	defer.resolve(employeeData);
	return defer.promise;
      }
  };
  
  
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getLocationStateName
   * @param locationStateId
   * @description get location state name by passing locationStateId
   */
    
  function getLocationStateName(locationStateId) {
      var defer = $q.defer();
      if(!isNaN(locationStateId) && angular.isNumber(parseInt(locationStateId)) && locationStateId != ''){
		return $http({method: "GET",url : config.defaultEnvironment.dataServer + '/data/auditMaster', headers: {'Authorization': 'Bearer '+Session.token, 'Accept': 'application/json;odata=verbose'}})
			  .then(function(auditMasterData){
				var stateData = _.where(auditMasterData.data.AllStates, {StateId : parseInt(locationStateId)});	
				  defer.resolve(stateData);
				   return defer.promise;
			  },function(error){
				  var stateData = '';
				  defer.resolve(stateData);
				  return defer.promise;
			});
      }else{
			var stateData = '';
			defer.resolve(stateData);
			return defer.promise;
      }
  };
  
  
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getCustomerName
   * @param {object} customerId
   * @description get customer name by passing customerId
   */
    
  function getCustomerName(customerId) {
			  var defer = $q.defer();
			  if(!isNaN(customerId) && angular.isNumber(parseInt(customerId)) && customerId != ''){
				// var customerNameData = angular.fromJson(localStorage.getItem('customerData'));
			return $http({method: "GET",url : config.defaultEnvironment.dataServer + '/data/customerById?CustomerId='+customerId, headers: {'Authorization': 'Bearer '+Session.token, 'Accept': 'application/json;odata=verbose'}})
				  .then(function(customerData){
				if (customerData.data != '') {
					defer.resolve(customerData.data.customerName[0]);
					return defer.promise;
				}
				  },function(error){
					console.log(error);
					if (error.status != undefined && error.status == 401) {
					  $location.path('/logout');
					}
					var customerName = '';
					defer.resolve(customerName);
					return defer.promise;
				  });
			  }else{
					var customerName = '';
					defer.resolve(customerName);
					return defer.promise;
			  }
  }
  
  
  return {
    getAuditList : getAuditList,
    auditList    : auditList,
    getAuditDetail : getAuditDetail,
    getEmployeeName : getEmployeeName,
    getCustomerName : getCustomerName,
	getLocationStateName : getLocationStateName
  };
}]);
