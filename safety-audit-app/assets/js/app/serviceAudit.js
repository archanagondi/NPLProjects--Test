'use strict';

angular.module('npl')

.service('serviceAudit', ['$rootScope','serviceData', 'config', 'AuthService', '$q', '$timeout', 'Session', '$window','$webSql','$http','$location', function ($rootScope,serviceData, config, AuthService, $q, $timeout,Session,$window,$webSql,$http,$location) {

  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#employees #auditList #AuditJobData #areaData
   * @description
   * A map of employees from empNum to their employee records.
   * A map of AuditJobData from auditMaster.
   * A map of AreaMaster from auditMaster.
   */

  var auditList = [],
    employees = {},
    employeeMasterData = {},
    AuditJobData = {},
    areaData = [];
    
  /**
    * @ngdoc
    * @name npl.service:serviceAudit#haveConnection
    * @methodOf npl.service:serviceAudit
    * @description
    *
    * Runs to check internet connection status
    *
    */
  
  function haveConnection() 
  {
    return !navigator.connection || navigator.connection.type !== Connection.NONE;
  }  
    
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#clearLists
   * @description Clear all master lists
   */


  function clearLists() {
    $rootScope.logData('clearlist local storage');
    angular.forEach(employees, function(val, key) {
      delete employees[key];
    });
    angular.forEach(AuditJobData, function(val, key) {
      delete AuditJobData[key];
    });
  };
  
  /**
   * @ngdoc
   * @propertyOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#getAuditList
   * @param {integer} status The Audit status type id to filter audit list
   * @description LoggedIn user Audit history
   */
    
  function getAuditList(now) {
    auditList = [];
    var defer = $q.defer();
    //serviceData.clear('auditList');
    var auditListParams = {employee_id: Session.employeeID, role_type: 1};
    if (Session.group == 'SafetyManagers') {
      //auditListParams = {employee_id: Session.employeeID, role_type: 2};
      auditListParams = {};
    }
    var auditListOptions = {root: 'yes'};
    if (now && now == true && serviceData.haveConnection()) {
      auditListOptions = {now:true,root: 'yes'};
    }
    
   // console.log(JSON.stringify(auditListOptions));
   serviceData.get('auditList',auditListParams,auditListOptions)
    .then(function(data){
      auditList = data;
      serviceData.db.select('inProgressAudits', {employeeID : Session.employeeID},function(res){
        for(var i=0; i < res.rows.length; i++){
          var auditFormData = JSON.parse(decodeURIComponent(res.rows.item(i).auditData)).audit_form_data;            
          auditList.push({ AuditDateTime: auditFormData.date,
          AuditStatus: "In Progress",         
		  DefCount: res.rows.item(i).TotalDef,
          PKAuditID: res.rows.item(i).id,
          WorkLocation: auditFormData.job_location,
          auditData : res.rows.item(i).auditData,
          step : res.rows.item(i).step});
       }
       defer.resolve(auditList);
      });
      //return auditList;
    },function(err){
      if (err.data != undefined) {
        if (err.data.data != undefined) {
          auditList = err.data.data;
        }else{
          auditList = err.data;
        }
        serviceData.db.select('inProgressAudits', {employeeID : Session.employeeID},function(res){
           for(var i=0; i < res.rows.length; i++){
            var auditFormData = JSON.parse(decodeURIComponent(res.rows.item(i).auditData)).audit_form_data;            
            auditList.push({ AuditDateTime: auditFormData.date,
            AuditStatus: "In Progress",         
            DefCount: res.rows.item(i).TotalDef,
            PKAuditID: res.rows.item(i).id,
            WorkLocation: auditFormData.job_location,
            auditData : res.rows.item(i).auditData,
            step : res.rows.item(i).step});
            
           }
          defer.resolve(auditList);
        });
      }
    });
    return defer.promise;
  };
  
  // Returns Unique objects from an array
  function uniqueObjects( arr ){
    var uniqueData =  _.uniq( _.collect( arr, function( x ){
            return JSON.stringify(x);
    }));
    
    var finalObjectArr = [];
    angular.forEach(uniqueData , function(value,key){
            finalObjectArr.push(JSON.parse(value));
    });
    return finalObjectArr;
  };
  
  // return Unique employee list
  function uniqueEmpObjects(arr){
    var existingEmp = [];
    var uniqueData =  _.uniq( _.collect( arr, function( x ){
            return JSON.stringify(x);
    }));
    
    var finalObjectArr = [];
    angular.forEach(uniqueData , function(value,key){
	    var emp = JSON.parse(value);
	    if (existingEmp.indexOf(emp.EmpNum) == -1) {
		finalObjectArr.push(emp);
		existingEmp.push(emp.EmpNum);
	      
	    }
            
    });
    return finalObjectArr;
  }
  
  //Return Sorted data
  function sortObjects(arr){
    
    var sortedData =  _.sortBy(arr, function(obj){return obj.label;});
    return sortedData;
    
  }
  
  /**
   * @ngdoc
   * @methodOf npl.service:serviceAudit
   * @name npl.service:serviceAudit#updateLists
   * @description Updates the list of current jobs, employees, and employeesAllowed.
   */

  function updateLists() {
    $rootScope.logData('update local storage starts');
    
    /*clearLists();
    serviceData.clear('employeeMaster');
    serviceData.clear('auditMaster');
    serviceData.clear('categoryMaster');*/
    
    localStorage.setItem('synchronizationStatus' , 0);
    
     var employeeList = serviceData.get('Api.php?endpoint=employeeMaster','',{now : true, headers : {'Authorization' : 'Bearer '+Session.token+''}, method : 'GET'})
    .then(function(data){
      employeeMasterData = data.EmployeeMaster;
      $rootScope.logData('update local employee list success');
      angular.forEach(data.EmployeeMaster, function (employee) {
        employee.name = employee.FirstName + ' ' + employee.MiddleName + ' ' + employee.LastName;
        return employees[employee.EmpNum] = employee;
      });
      return data;
    },function(err){
      
      if (err.errorCode != undefined && err.errorCode == 401) {
        $location.path('/logout');
      }
      
      $rootScope.logData('update local employee list error' + err.message + err.errorCode);
      if (err.data != undefined && err.data != '') {
        employeeMasterData = err.data;
        angular.forEach(err.data.EmployeeMaster, function (employee) {
        employee.name = employee.FirstName + ' ' + employee.MiddleName + ' ' + employee.LastName;
        return employees[employee.EmpNum] = employee;
      });
      }
      return err; 
    });  

    var auditMaster = serviceData.get('safety/Api.php?endpoint=auditMaster','', { now : true, headers : {'Authorization' : 'Bearer '+Session.token+''}, method : 'GET' }).then(function(data){
        AuditJobData = data.AuditJobData;
        var AllAreas = data.AllAreas;
        var AllVendors = data.AllVendors;
        var AllJobTitles = data.AllJobTitles;
        var AllStates = data.AllStates;
        var employeesObjects = employees;
        var areaWiseData = [];
        var phaseWiseJob = [];
        var jobWiseData = [];
        angular.forEach(AllAreas, function(value,key){
            var PhaseNum  =  []; var JobNum = []; var Super = []; var Foremen = []; var Customer = [];
            var particularAreaData = _.where(AuditJobData, {AreaNum : ""+value.AreaNum+""});
            var areaEmployess =   _.sortBy(_.where(employeeMasterData, {Area : parseInt(value.AreaNum)}),function(obj){return obj.FirstName;});
            var areaNumber = value.AreaNum;
	    
            for(var i = 0; i < particularAreaData.length; i++){
		
		
		var phaseNumber = particularAreaData[i].PhaseNum;
		var jobNumber = particularAreaData[i].JobNum;
	      
                if(PhaseNum.indexOf(phaseNumber) == -1)PhaseNum.push(phaseNumber);
                
                if(JobNum.indexOf(jobNumber) == -1){JobNum.push(jobNumber);}
                
                if (phaseWiseJob[areaNumber] == undefined) { phaseWiseJob[areaNumber] = []; }
                if (phaseWiseJob[areaNumber][parseInt(phaseNumber)] == undefined) {phaseWiseJob[areaNumber][parseInt(phaseNumber)] = []; }
                if (phaseWiseJob[areaNumber][parseInt(phaseNumber)].indexOf(jobNumber) == -1){phaseWiseJob[areaNumber][parseInt(phaseNumber)].push(jobNumber);}
                
                if (jobWiseData[areaNumber] == undefined) { jobWiseData[areaNumber] = {}; }
		if (jobWiseData[areaNumber][jobNumber] == undefined) {jobWiseData[areaNumber][jobNumber] = {supervisor : [], foreman : [], CustomerDetails : []}; }
                
                if(particularAreaData[i].Super != null && particularAreaData[i].Super != undefined && employeesObjects[particularAreaData[i].Super] != undefined)
                {
                  var superObj = {value : parseInt(particularAreaData[i].Super), label : employeesObjects[particularAreaData[i].Super].FirstName+ " " +employeesObjects[particularAreaData[i].Super].LastName};
                  if (Super.indexOf(superObj) == -1) {
                    Super.push(superObj); 
                  }
                  if(jobWiseData[areaNumber][jobNumber].supervisor.indexOf(superObj) == -1){jobWiseData[areaNumber][jobNumber].supervisor.push(superObj);}
                  jobWiseData[areaNumber][jobNumber].supervisor = sortObjects(uniqueObjects(jobWiseData[areaNumber][jobNumber].supervisor));
                   
                }
                if(particularAreaData[i].Foreman != null && particularAreaData[i].Foreman != undefined && employeesObjects[particularAreaData[i].Foreman] != undefined)
                {
                  var foremanObj = {value : parseInt(particularAreaData[i].Foreman), label : employeesObjects[particularAreaData[i].Foreman].FirstName+ " " +employeesObjects[particularAreaData[i].Foreman].LastName};
                  if (Foremen.indexOf(foremanObj) == -1) {
                    Foremen.push(foremanObj);  
                  }
                  if(jobWiseData[areaNumber][jobNumber].foreman.indexOf(foremanObj) == -1){jobWiseData[areaNumber][jobNumber].foreman.push(foremanObj);}
                  jobWiseData[areaNumber][jobNumber].foreman = sortObjects(uniqueObjects(jobWiseData[areaNumber][jobNumber].foreman));
                }
                
                if (particularAreaData[i].CustomerNum != undefined && particularAreaData[i].CustomerNum != '' && particularAreaData[i].CustomerName != null) {
                    var customerObj = {value: particularAreaData[i].CustomerNum, label :particularAreaData[i].CustomerName.trim()};
                    if (Customer.indexOf(customerObj) == -1) {
                      Customer.push(customerObj);
                    }
                    
                    if(jobWiseData[areaNumber][jobNumber].CustomerDetails.indexOf(customerObj) == -1){jobWiseData[areaNumber][jobNumber].CustomerDetails.push(customerObj);}
                    jobWiseData[areaNumber][jobNumber].CustomerDetails = sortObjects(uniqueObjects(jobWiseData[areaNumber][jobNumber].CustomerDetails));
                }
                
            }
            areaWiseData[areaNumber]  = {PhaseNum : uniqueObjects(PhaseNum).sort(function(a, b){return a-b}), JobNum : uniqueObjects(JobNum).sort(function(a, b){return a-b}) , Super : sortObjects(uniqueObjects(Super)) , Foremen : sortObjects(uniqueObjects(Foremen)), Customer : sortObjects(uniqueObjects(Customer)), employess : uniqueEmpObjects(areaEmployess), allAreaEmp :  uniqueObjects(areaEmployess)};
          });
        //console.log(areaWiseData);
        //localStorage.setItem('phaseWiseJob' , encodeURIComponent(JSON.stringify(phaseWiseJob)));
        //localStorage.setItem('jobWiseData' , encodeURIComponent(JSON.stringify(jobWiseData)));
        //console.log(jobWiseData);
        serviceData.set('areaWiseData', areaWiseData);
        serviceData.set('AllAreas', AllAreas);
        serviceData.set('AllVendors', AllVendors);
        serviceData.set('AllJobTitles', AllJobTitles);
        serviceData.set('AllStates',AllStates);
        serviceData.set('jobWiseData', jobWiseData);
        serviceData.set('phaseWiseJob', phaseWiseJob);
        
        $rootScope.logData('update local audit list success');
        
        if (data.AllJobTitles) {
          localStorage.setItem('synchronizationStatus' , 1);
        }else{
          localStorage.setItem('synchronizationStatus' , 0);
        }
        
        return data;
    },function(err){
      if (err.errorCode != undefined && err.errorCode == 401) {
        $location.path('/logout');
      }
      
      if (err.data != undefined && err.data != '') {
        if (err.data.AllJobTitles) {
          localStorage.setItem('synchronizationStatus' , 1);
        }else{
          localStorage.setItem('synchronizationStatus' , 0);
        }
        return err;
      }
      $rootScope.logData('update local audit list error' + err.message + err.errorCode);
      localStorage.setItem('synchronizationStatus' , 0);
      return err; 
    });
    
    var auditListParams = {employee_id: Session.employeeID, role_type: 1};
    if (Session.group == 'SafetyManagers') {
      auditListParams = {status : 2, employee_id: Session.employeeID, role_type: 2};
    }
    var auditListOptions = {root: 'yes'};
    if (serviceData.haveConnection()) {
      auditListOptions = {now:true,root: 'yes'};
    }
    var auditList = getAuditList(true);
    
    var categories = serviceData.get('categoryMaster','',{now : true, root : 'yes', method : 'GET'}).then(function(data){
      $rootScope.logData('update local category list success');
        return data;
    },function(err){
      if (err.errorCode != undefined && err.errorCode == 401) {
        $location.path('/logout');
      }
      
      $rootScope.logData('update local category list error' + err.message + err.errorCode);
      if (err.data != undefined && err.data != '') {
        return err;
      }
      return err; 
    });
     
    return $q.all([employeeList, auditMaster,categories,auditList]).then(function(result) {
    //return $q.all([employeeList, auditMaster,categories]).then(function(result) {    
        var updatedData = {};
        updatedData.employeeMaster = result[0];
        updatedData.auditMaster = result[1];
        updatedData.categories = result[2];
		
		localStorage.setItem('storageEmpList' , JSON.stringify(result[0].EmployeeMaster));
		
       // updatedData.auditList = result[3];
        $rootScope.logData('update local storage success');
        //$rootScope.logData(updatedData);
        return updatedData;
    },function(err){
      $rootScope.logData('update local storage err below ');
      $rootScope.logData(err);
      return err;
    });
  
  };
  
  // Geolocation Position of auditor
  function getPosition() {
    var deferred = $q.defer();
    if (haveConnection()) {
      navigator.geolocation.getCurrentPosition(function(position) {
          deferred.resolve(position);
      }, function(error) {
          deferred.reject(error);
      });  
    }else{
      deferred.reject('No Internet connection to get Lat / Long.');
    }
    return deferred.promise;
  }
 
  // generate random alphanumeric string for filename
  function generateRandomID() {
      var length = 10;
      var letters = 'abcdefghijklmnopqrstuvwxyz';
      var numbers = '1234567890';
      var charset = letters + letters.toUpperCase() + numbers;
      var R = '';
      for(var i=0; i<length; i++)
      {R += charset.substr(Math.floor(Math.random()*length),2);}
      return R;
  }
  
  //Capture Photo either from camera or IPAD library
   function capturePhoto(source){
    
    var deferred = $q.defer();
    //When source == 1 than from Photo Library
    var cameraOptions = { quality: 70, destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true };
    if(source == 1){ cameraOptions = { quality: 70, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,targetWidth: 600,targetHeight: 600, correctOrientation: true }; }
    
    navigator.camera.getPicture( function (imageURI) {
        window.resolveLocalFileSystemURI(imageURI, function (fileEntry) {
                                         
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                                    
                  fileSys.root.getDirectory("auditPhotos", {create: true, exclusive: false}, function(dir) {
                                            
                      fileEntry.copyTo(dir,generateRandomID()+".png",function (entry) {

                                       deferred.resolve(entry.toURL());
                      }, null);
                  }, null);
            }, null);
        },null);
      },
      function (message)  {
        deferred.reject(message);
      },
      cameraOptions
    );
    //deferred.resolve(generateRandomID()+".jpg");
    return deferred.promise;
  }
  
  
  return {
    getAuditList   : getAuditList,
    auditList      : auditList,
    employees      : employees,
    AuditJobData   : AuditJobData,
    areaData       : areaData,
    updateLists    : updateLists,
    getPosition    : getPosition,
    haveConnection : haveConnection,
    capturePhoto   : capturePhoto
    
  };
}]);
