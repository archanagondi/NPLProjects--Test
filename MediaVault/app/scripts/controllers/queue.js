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
//$interval(calluploadService,300000);

//$interval(accesstokenupdate,3000);
$("#queue-tab").click(function(){

calluploadService();
$('.progress-bar-success').css('background-color', "#5cb85c");
 $('.progress-bar-success').css('width', '0%');
});

function calluploadService() 
{		

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
			
         } else 
		 {
			 console('no wifi connection is avaliable ');
			 window.resolveLocalFileSystemURI($rootScope.uploadimage, resolveOnSuccess, resOnError)         
		 } */
       
        //Callback function when the file system uri has been resolved
        /* function resolveOnSuccess(entry) 
		{
            var d = new Date();
            var n = d.getTime();
            //new file name
            var newFileName = n + ".jpg";
            // var myFolderApp = "EasyPacking";
            // alert("image name is " + newFileName)
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                //The folder is created if doesn't exist
                fileSys.root.getDirectory(imagesfoldername,
                        {create: true, exclusive: false},
                function(directory) 
				{
                    //alert("moving function")
                    entry.moveTo(directory, newFileName, successMove, resOnError);
                },
                        resOnError);
            },
                    resOnError);
        }  */

        //Callback function when the file has been moved successfully - inserting the complete path
        /* function successMove(entry) 
		{
            //I do my insert with "entry.fullPath" as for the path
            var full_path = entry.toURL();
           // alert("success of" + full_path);
        }

        function resOnError(error) 
		{
            alert("failure" + error.code);
        }  */
		$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
       
		//$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
		//console.log($rootScope.folderdetails);
	
		//$scope.folderld = $rootScope.folderdetails.data.folderId;
		//$scope.folderName = $rootScope.folderdetails.data.folderName;  
		$scope.folderld = "01J2RPBCMACFBV7IPW6ZHZYRZ6JM37QERZ";
		$scope.folderName = "testm578";  
		angular.forEach($rootScope.queuelist, function(value,key)
        {
		
			var error='';
			
			//var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
			 var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city=ghfgh&phase=fgh&job=fgh&description=fghfg&workDate="+value.date+"&zip=45676&keywords=side walk&redirectUrl=http://localhost/api-v3/MediaVault";
			coreservices.fileupload($rootScope.accesstoken,$scope.folderld,$scope.folderName,str).then(function(downloadresponse)
			{
				$scope.download=angular.toJson(downloadresponse);
				console.log($scope.download+'hello this is download ');
				 $('#'+id+' .progress-bar-success').css('width','100%');
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