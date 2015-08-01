'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function(LABELS,coreservices,Uploaddata, $window, $filter, $scope, $state, localRecord, access, $rootScope, loadAppData, $http, $q) {
    
	
	$scope.hidedata=true;
	$scope.hideimage=false;
	$rootScope.listresponse=[];
	//$rootScope.queuelist=[];
	$rootScope.queuelist = angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
	//$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
	//console.log('this is in upload js ');
	//console.log($rootScope.accesstoken);
		$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
		 console.log($rootScope.folderdetails);
			/*$scope.folderName=$rootScope.folderdetails.data.folderName;
			$scope.folderid=$rootScope.folderdetails.data.folderId;
			console.log(angular.toJson($rootScope.folderdetails)+'---------------------');
			console.log($scope.folderName);
			console.log($scope.folderid);   */
	
	
	
	
	$rootScope.uploadimage;
    $scope.job = [];
    $scope.phases = [];
    $scope.uploadformdata = [];
    $rootScope.geocity = [];
    $scope.areaSelect = '';
    $scope.phaseUpload = '';
    $scope.dateUpload = '';
    $scope.jobUpload = '';
    $scope.dprUpload = '';
    $scope.streetUpload = '';
    $scope.zipcodeUpload = '';
    $scope.cityUpload = '';
    $scope.NotesUpload = '';
    $scope.dt = '';
    $scope.geodata = [];
    $scope.areatext = false;
    $scope.ziptext = false;
    $scope.uploadpage = true;
    $scope.uploaddtl = false;
	$rootScope.accesstoken='';
	$rootScope.folderdetails='';
	$rootScope.foldercontentslistresopnes='';
	$scope.uploadformFulldata = [];
		
	//button click navigation to queue	
	$('#uploadData').click(function() 
	{
	$('#queue').click();
	});	
    document.addEventListener("deviceready", onDeviceReady, false);
    var imagesfoldername ='Mediavault-files';
    var projectpath = '';
    // PhoneGap is ready
    function onDeviceReady() 
	{
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }
    function gotFS(fileSystem) {
        fileSystem.root.getDirectory(imagesfoldername, {create: true, exclusive: false}, projectdirexist, notexists);
    }
    //on creating a folder successfully
    function projectdirexist(direntry) {
        projectpath = direntry.fullPath;
    }
    function notexists(error) 
	{
        alert(error.code);
    }
    function fail(error) 
	{
        alert('fail1' + error);
    }
    $scope.camera = function(type)
    {
        if (type == 'video') {
            navigator.device.capture.captureVideo(captureVideoSuccess, captureVideoError, {duration: 30});
        } else {
            navigator.camera.getPicture(onSuccess, onFail, {quality: 50,
                //destinationType: Camera.DestinationType.DATA_URL,
                destinationType: Camera.DestinationType.FILE_URI,
            });
			$scope.hidedata=false;
			$scope.hideimage="";
			$scope.hideimage=true;
        }
        /* Image capture success */
        function onSuccess(imageData) 
		{
            var image = document.getElementById('uploaded-image');
            image.src = imageData;
            $rootScope.uploadimage = imageData;
        }
        /* Fail image capture */
        function onFail(message)
        {
            alert('Failed because: ' + message);
        }

        /* Video capture success */
        function captureVideoSuccess(mediaFiles) {
            var i, len;
            for (i = 0, len = mediaFiles.length; i < len; i++) 
			{
                saveVideoFile(mediaFiles[i]);
            }
        }
        /* save video file */
        function saveVideoFile(mediaFile) {
            // alert(mediaFile.fullPath);
            save_video_locally(mediaFile.fullPath);
        }
        function save_video_locally(video_file) {
            // alert("inside save video filel" + video_file)
            var stamp = new Date().getTime();
            var folder = imagesfoldername;
            var currentImageUrl = "Video" + stamp + ".MOV";
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                var imagePath = fs.root.toURL() + folder + "/" + currentImageUrl;
                // alert("new..." + fs.root.toURL() + folder + "/" + currentImageUrl)
                var fileTransfer = new FileTransfer();
                var vppath = "file://" + video_file;
                // alert("old path" + vppath);
                fileTransfer.download(vppath, imagePath, function(entry) {
                    // alert("::: success" + entry.fullPath);
                }, function(error) {
                //    alert("error " + error.code);

                });
            });
        }
        /* error when video capture */
        function captureVideoError(error) 
		{
            var msg = 'An error occurred during capture: ' + error.code;
            navigator.notification.alert(msg, null, 'Camera Not Found!');
        }
    };

    /* Gallery */
    $scope.gallery = function(type)
    {
        if (type == 'video') 
		{
            navigator.camera.getPicture(galVideoSuccess, galVideoFail, {
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                mediaType: Camera.MediaType.VIDEO
            });
        } else {
            navigator.camera.getPicture(onGalSuccess, onGalFail, {quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
        }

        function onGalSuccess(imageData) {
            var image = document.getElementById('uploaded-image');
            image.src = imageData;
            $rootScope.uploadimage = imageData;
			$scope.hidedata=false;
			$scope.hideimage=true;
        }
        function onGalFail(message)
        {
            alert('Failed because: ' + message);
        }

        function galVideoSuccess(VideoURI) {
            $scope.video = document.getElementById('myVideo');
            if (VideoURI.substring(0, 21) === 'content://com.android') 
			{
                var photo_split = VideoURI.split("%3A");
                VideoURI = 'content://media/external/video/media/' + photo_split[1];
            }
            $scope.VideoURI = VideoURI;
            $scope.video.src = $scope.VideoURI;
            $scope.apply();
        }

        function galVideoFail() {
            alert('Failed because: ' + message);
        }
    };
    $scope.clear = function()
    {
        $rootScope.uploadimage ={};
		$scope.hidedata=true;
		$scope.hideimage=false;	
		$scope.responsestatus = {};
		/* alert('services is calling ');
		//service one	
		 coreservices.getAccessToken().then(function(accessTokenresponse)
		{
			$scope.response=angular.fromJson(accessTokenresponse);
			console.log("accesstoken status----"+$scope.response.status);
			$scope.responsestatus = $scope.response.status;
			localRecord.save('accesstokendata',angular.toJson($scope.response.data.accessToken));
			//getting saved token 
		$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
	    console.log("access token====");
	    console.log($rootScope.accesstoken);
		//end of service one 
		
			
			//service two	
			$scope.foldername='usertech27';
			
		
		
			coreservices.foldercontents($rootScope.accesstoken,$scope.folderid).then(function(listresponse)
			{
			console.log(listresponse+'=====');
			localRecord.save('foldercontentslist',angular.toJson(listresponse)); 
			$rootScope.foldercontentslistresopnes=angular.fromJson(localRecord.get('foldercontentslist').foldercontentslistCode);
			console.log(angular.toJson($rootScope.foldercontentslistresopnes));
			}).catch(function(response)
			{
				
			}); 
		
		
		
		
		*/
			
		/* 
			$scope.fileld='DWEEDE474HUBEJ4JC2WNQVJ2TOY6UH';
			coreservices.filedownload($rootScope.accesstoken,$scope.fileld).then(function(downloadresponse)
			{
			$scope.download=angular.toJson(downloadresponse);
			console.log($scope.download+'hello this is download ');
			}).catch(function(response){
			});
			
			$scope.fileld='DWEEDE474HUBEJ4JC2WNQVJ2TOY6UH';
			coreservices.filedelete($rootScope.accesstoken,$scope.fileld).then(function(deletedresponse)
			{
			$scope.download=angular.toJson(deleteresponse);
			console.log($scope.download+'hello this is download ');
			}).catch(function(response)
			{
				
			}); */
			
			/* //search service 
			$scope.querytext='Hydrangeas.jpg';
			$scope.foldername='tests'
			coreservices.filesearch($rootScope.accesstoken,$scope.querytext,$scope.foldername).then(function(searchfileresponse)
			{
				$scope.download=angular.toJson(searchfileresponse);
			}).catch(function(response)
			{
				
			}); */
		/*	
		
		}).catch(function()
		{
			alert('access token error error');
		});   
			 */	
	//end of method 	
    };
	
    $scope.continuee = function() 
	{
       //image creating 
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

         $rootScope.type = 'upload';
		 alert($rootScope.type);
         $scope.selection = [];
         $rootScope.selectedKeywords = [];
         $scope.uploadpage = false;
         $scope.uploaddtl = true; 

    };

    $scope.back = function() {
        $scope.uploadpage = true;
        $scope.uploaddtl = false;
    };

    //form validations in upload html
    $scope.uploadformclear = function() {
        $scope.areaSelect = '';
        $scope.phaseUpload = '';
        $scope.dateUpload = '';
        $scope.jobUpload = '';
        $scope.dprUpload = '';
        $scope.streetUpload = '';
        $scope.zipcodeUpload = '';
        $scope.cityUpload = '';
        $scope.NotesUpload = '';
        $rootScope.keywordsUpload = '';
        $scope.ziptext = false;
    };

    $scope.jobsFilter = function() {
        $scope.job = [];
        $scope.phases = [];

        loadAppData.getGeoLocation($scope.areaSelect).success(
                function(selectedGeoData) 
				{
                    localRecord.remove('geodata');
                    $scope.geodata = angular.toJson(selectedGeoData);
                    localRecord.save('geodata', $scope.geodata);
                }
				).error(function() {});

        angular.forEach($rootScope.jobsandphases, function(value) {
            if (value.Area === parseInt($scope.areaSelect)) {
                $scope.jobOptions = [];
                $scope.jobOptions.jobName = value.JobName;
                $scope.jobOptions.jobNum = value.JobNum;
                $scope.job.push($scope.jobOptions);
            }
        });
        if ($scope.job.length === parseInt(0)) {
            $scope.areatext = true;
        }
        else {
            $scope.areatext = false;
        }
    };
    $scope.phaseFilter = function()
    {
        $scope.phases = [];
        angular.forEach($rootScope.jobsandphases, function(value)
        {
            if (value.JobNum === parseInt($scope.jobUpload)){
                angular.forEach(value.Phases, function(value1) 
				{
                    $scope.jobOptions = [];
                    $scope.jobOptions.Desc = value1.Desc;
                    $scope.jobOptions.Phase = value1.Phase;
                    $scope.phases.push($scope.jobOptions);
                });
            }
        });
    };
    $scope.uploadData = function()
    {
		var uploaddata={};
		//creating form data object upload data and pushing in array and saving locally 
		
		if(localRecord.get('uploaddata').uploaddataCode){
		$scope.uploadformFulldata=angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
		}
		else{
		$scope.uploadformFulldata=[];
		}
		console.log($scope.uploadformFulldata+"hai");
		uploaddata = new Uploaddata($scope.uploadformFulldata.length,$scope.areaSelect,$scope.jobUpload,$scope.phaseUpload,$scope.dateUpload,$scope.dprUpload,$scope.streetUpload,$scope.cityUpload,$scope.zipcodeUpload,$scope.NotesUpload,$rootScope.keywordsUpload,'icon','pending');
		$scope.uploadformFulldata.push(uploaddata);		
		localRecord.save('uploaddata',angular.toJson($scope.uploadformFulldata));
		
		$rootScope.queuelist = angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
		console.log($rootScope.queuelist);
		//navigating to queue tab
    };

    $scope.localcitydata = angular.fromJson(localRecord.get('geodata').geodataCode);
    $scope.getgeoloactiondata = function()
    {
        $scope.geocity = [];

        angular.forEach($scope.localcitydata, function(value) {
            if (value.Zip === $scope.zipcodeUpload) {
                $scope.geo = [];
                $scope.geo.PrimaryCity = value.PrimaryCity;
                $scope.geocity.push($scope.geo);
            }
        });
        if ($scope.geocity.length === parseInt(0))
        {
            $scope.ziptext = true;
        }
        else
        {
            $scope.ziptext = false;
        }
    };
	


});