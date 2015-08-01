'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('queueCtrl', function (LABELS,coreservices,$filter, $scope,$state, localRecord, access, $rootScope,$interval) {
	
	$scope.deleteRecordId = function(divId)
	{$rootScope.deleteId = divId;
	};
//it will call the method every 3 minutes it will check wifi if it is avaliable 
//if data is avaliable in queue it will call upload web service if not it wont do any thing 
$interval(calluploadService,300000);

//$interval(accesstokenupdate,3000);

function calluploadService() 
{		
		//console.log('this is the data ');
		/* var networkState = navigator.network.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection'; 
         if (states[networkState] === 'WiFi connection') 
		 {
			//service code has to implement her 
			$scope.uploadfile = function () 
	{
       alert("in upload function");
	 
		$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
		console.log($rootScope.folderdetails);
		$scope.folderld = $rootScope.folderdetails.data.folderId;
		$scope.folderName = $rootScope.folderdetails.data.folderName;
		angular.forEach($rootScope.queuelist, function(value)
        {
			var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
			coreservices.fileupload($rootScope.accesstoken,$scope.folderld,$scope.folderName,str).then(function(downloadresponse)
			{
			$scope.download=angular.toJson(downloadresponse);
			console.log($scope.download+'hello this is download ');
			
			}).catch(function(response){
			}); 
		});
    };
         } else 
		 {
			 window.resolveLocalFileSystemURI($rootScope.uploadimage, resolveOnSuccess, resOnError);         
		 } */
}



});