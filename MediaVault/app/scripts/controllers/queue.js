'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('queueCtrl', function (LABELS,coreservices,$filter, $scope,$state, localRecord, access, $rootScope,$interval) {
	
	
	console.log($rootScope.queuelist);
	
	$scope.deleteRecordId = function(divId)
	{$rootScope.deleteId = divId;
	};
//it will call the method every 3 minutes it will check wifi if it is avaliable 
//if data is avaliable in queue it will call upload web service if not it wont do any thing 
//$interval(calluploadService,300000);

//$interval(accesstokenupdate,3000);
$("#queue-tab").click(function(){
	calluploadService();
	$('.progress-bar-success').css('background-color', "#5cb85c");
	$('.progress-bar-success').css('width', '0%');
});
function calluploadService() 
{		
//alert(dateTime);
	   /*  var networkState = navigator.network.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection'; 
         if (states[networkState] == "WiFi connection") 
		 {
	$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
  $rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
  console.log($rootScope.folderdetails);
 
  $scope.folderld = $rootScope.folderdetails.data.folderId;
  $scope.folderName = $rootScope.folderdetails.data.folderName;  

  angular.forEach($rootScope.queuelist, function(value,key)
        {
  if(value.status == "pending"){
  var dateTime=new Date().getTime();
  
   var error='';
   
   //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
    //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city=ghfgh&phase=fgh&job=fgh&description=fghfg&workDate="+value.date+"&zip=45676&keywords=side walk&redirectUrl=http://localhost/api-v3/MediaVault";
   var str = "fileName="+dateTime+"&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workDate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&folderName="+$scope.folderName +"&fileExt=jpeg&base64Data="+value.imagepath;
   coreservices.fileupload($rootScope.accesstoken,str).then(function(downloadresponse)
   {
    $scope.download=angular.toJson(downloadresponse);
    
    console.log($scope.download);
    console.log('file is uploaded');
	 progress = 100;
     $('#'+key+' .progress-bar-success').css('width',progress+"%");
     $rootScope.queuelist[key]['status'] = "completed";
     console.log( $rootScope.queuelist);
     localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   }).catch(function(response){
    
     error='false'; 
    
    //window.clearInterval(interval);
    $('#'+key+' .progress-bar-success').css('background-color', "#BD4343");
   });  
   var progress = 0;
   var interval = setInterval(
   function(){
   
    if (progress == 95 || error == "false"){
    window.clearInterval(interval);
    }else{
     setProgress(++progress,key);
    }
   }, 400);
   //localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   console.log("updated Queue list"); 
   console.log($rootScope.queuelist); 
   console.log(localRecord.get('uploaddata').uploaddataCode); 
  }
  
  }); 
} */
$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
  $rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
  console.log($rootScope.folderdetails);
 
  $scope.folderld = $rootScope.folderdetails.data.folderId;
  $scope.folderName = $rootScope.folderdetails.data.folderName;  
alert($scope.folderName);
  angular.forEach($rootScope.queuelist, function(value,key)
        {
  if(value.status == "pending"){
  var dateTime=new Date().getTime();
  alert(dateTime);
   var error='';
   
   //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
    //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city=ghfgh&phase=fgh&job=fgh&description=fghfg&workDate="+value.date+"&zip=45676&keywords=side walk&redirectUrl=http://localhost/api-v3/MediaVault";
   var str = "fileName="+dateTime+"&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workDate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&folderName="+$scope.folderName +"&fileExt=jpeg&base64Data=dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffg"+value.imagepath;
   coreservices.fileupload($rootScope.accesstoken,str).then(function(downloadresponse)
   {
    $scope.download=angular.toJson(downloadresponse);
    
    console.log($scope.download);
    console.log('file is uploaded');
	 progress = 100;
     $('#'+key+' .progress-bar-success').css('width',progress+"%");
     $rootScope.queuelist[key]['status'] = "completed";
     console.log( $rootScope.queuelist);
     localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   }).catch(function(response){
    
     error='false'; 
    
    //window.clearInterval(interval);
    $('#'+key+' .progress-bar-success').css('background-color', "#BD4343");
   });  
   var progress = 0;
   var interval = setInterval(
   function(){
   
    if (progress == 95 || error == "false"){
    window.clearInterval(interval);
    }else{
     setProgress(++progress,key);
    }
   }, 400);
   //localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   console.log("updated Queue list"); 
   console.log($rootScope.queuelist); 
   console.log(localRecord.get('uploaddata').uploaddataCode); 
  }else{
  setProgress(100,key);
  }
  
  });         
	}
	

   function setProgress(percent,id){
   //bar.style.width = percent + "%";
     $('#'+id+' .progress-bar-success').css('width', percent+'%');
   /* if (percent > 90)
    bar.className = "bar bar-success";
   else if (percent > 50)
    bar.className = "bar bar-warning"; */
	}


});