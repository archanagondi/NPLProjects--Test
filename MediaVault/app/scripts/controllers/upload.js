'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function(LABELS,coreservices,Uploaddata, $window, $filter, $scope, $state, localRecord, access, $rootScope, loadAppData, $http, $q) {
    
	$rootScope.showorhide=false;
	$scope.hidedata=true;
	$rootScope.videoimagepath='';
	$scope.hideimage=false;
	$rootScope.listresponse=[];
	$rootScope.queuelist ==[];
	$rootScope.queuelist = angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
	$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
	console.log($rootScope.folderdetails);
	$rootScope.uploadimage='';
	$rootScope.imgname='';
	$scope.isDisabled = true;
    $scope.job = [];
    $scope.phases = [];
    $scope.uploadformdata = [];
    $rootScope.geocity = [];
    $scope.areaSelect = '';
    $scope.phaseUpload = '';
	$scope.today=new Date();
    $scope.dateUpload = $scope.today;
    $scope.jobUpload = '';
    $scope.dprUpload = '';
    $scope.streetUpload = '';
	$rootScope.imgpath='';
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
	//var image = document.getElementById('uploaded-image');
     if($rootScope.uploadimage != "")
	 {
      $scope.isDisabled = "false";
    }
	//button click navigation to queue	
	$('#uploadData').click(function() 
	{
	$('#queue').click();
	});	
	//keywords	
	$('#upload').click(function() 
	{
		$scope.dateUpload = $scope.today;
		$rootScope.type='upload';
		//$window.alert($rootScope.type);
		$scope.selection = [];
		$rootScope.selectedKeywords=[];	
	});
    document.addEventListener("deviceready", onDeviceReady, false);
    var imagesfoldername ='Mediavault-files';
    var projectpath = '';
    // PhoneGap is ready
    function onDeviceReady() 
	{
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }
    function gotFS(fileSystem) 
	{
        fileSystem.root.getDirectory(imagesfoldername, {create: true, exclusive: false}, projectdirexist, notexists);
    }
    //on creating a folder successfully
    function projectdirexist(direntry) 
	{
		//alert('project created success fully');
        projectpath = direntry.fullPath;
    }
    function notexists(error) 
	{
        //$window.alert(error.code);
    }
    function fail(error) 
	{
        //$window.alert('fail1' + error);
    }
    $scope.camera = function(type)
    {
        if(type == 'video') 
		{
            navigator.device.capture.captureVideo(captureVideoSuccess, captureVideoError, {duration: 30});
        } else 
		{
            navigator.camera.getPicture(onSuccess, onFail,
			{quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
			saveToPhotoAlbum:true
			});
			$scope.hidedata=false;
			$scope.hideimage='';
			$scope.hideimage=true;
        }
        /* Image capture success */
        function onSuccess(imageData) 
		{
			//alert('response '+imageData);
            var image = document.getElementById('uploaded-image');
            image.src = "data:image/jpeg;base64,"+imageData;
            $rootScope.uploadimage = "data:image/jpeg;base64," + imageData;
			//$window.alert("image url-----"+$rootScope.uploadimage);
			//alert($scope.isDisabled);
			$scope.isDisabled = "false";
			//alert($scope.isDisabled);
        }
        /* Fail image capture */
        function onFail(message)
        {
            $window.alert('Failed because: ' + message);
        }
        /* Video capture success */
        function captureVideoSuccess(mediaFiles) 
		{
            var i, len;
            for (i = 0, len = mediaFiles.length; i < len; i++) 
			{
                saveVideoFile(mediaFiles[i]);
            }
        }
        /* save video file */
        function saveVideoFile(mediaFile) 
		{
            $window.alert(mediaFile.fullPath);
            save_video_locally(mediaFile.fullPath);
        }
        function save_video_locally(video_file) 
		{
            //$window.alert('inside save video filel' + video_file)
            var stamp = new Date().getTime();
            var folder = imagesfoldername;
            var currentImageUrl = 'Video' + stamp + '.MP4';
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                var imagePath = fs.root.toURL() + folder + '/' + currentImageUrl;
                //$window.alert('new...' + fs.root.toURL() + folder + '/' + currentImageUrl)
                var fileTransfer = new FileTransfer();
                var vppath = 'file://' + video_file;
               //$window.alert('old path' + vppath);
                fileTransfer.download(vppath, imagePath, function(entry) {
                   //$window.alert('::: success' + entry.fullPath); 
				  $rootScope.videoimagepath=entry.fullPath;
				//alert($rootScope.videoimagepath);
                },function(error) {
				//$window.alert('error' + error.code);
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
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
        }

        function onGalSuccess(imageData) 
		{
            var image = document.getElementById('uploaded-image');
            image.src ="data:image/jpeg;base64,"+imageData;
            $rootScope.uploadimage ="data:image/jpeg;base64,"+imageData;
			$scope.hidedata=false;
			$scope.hideimage=true;
			//alert($scope.isDisabled);
			$scope.isDisabled = "false";
			//alert($scope.isDisabled);
        }
        function onGalFail(message)
        {
            //$window.alert('Failed because: ' + message);
        }
        function galVideoSuccess(VideoURI) 
		{
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
        function galVideoFail() 
		{
			//$window.alert('Failed because: ' + message);
        }
    };
    $scope.clear = function()
    {
        $rootScope.uploadimage ={};
		$scope.hidedata=true;
		$scope.hideimage=false;	
		$scope.responsestatus = {};
	
    };
    $scope.continuee = function() 
	{
      
		  //$window.alert('This is the position the file is saving locally ');
		  //$window.alert('base 64 :'+$rootScope.uploadimage);
          $rootScope.type = 'upload';
		 //alert("this is upload type "+$rootScope.type);
         $scope.selection = [];
         $rootScope.selectedKeywords = [];
         $scope.uploadpage = false;
         $scope.uploaddtl = true;
    };
	function resolveOnSuccess(entry) 
		{
            var d = new Date();
            var n = d.getTime();
            //new file name
            var newFileName = n + ".jpg";
            // var myFolderApp = "EasyPacking";
            // $window.alert("image name is " + newFileName)
			 $rootScope.imgname= newFileName;
             window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                //The folder is created if doesn't exist
                fileSys.root.getDirectory(imagesfoldername,
                        {create: true, exclusive: false},
                function(directory) 
				{
                    //alert("moving function")
                    entry.moveTo(directory, newFileName, successMove, resOnError);
					//alert('after entry move ');
                },resOnError);
            },resOnError);
        }  
		function successMove(entry) 
		{
            //I do my insert with "entry.fullPath" as for the path
            var full_path = entry.toURL();
			$rootScope.imgpath=full_path;
			//alert($rootScope.imgpath);
            //alert("image path success of" + full_path);
        }
        function resOnError(error) 
		{
            //alert("failure" + error.code);
        }  
		
$scope.back = function()
	{
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
		$rootScope.imgname='';
        $rootScope.keywordsUpload = '';
		$rootScope.uploadimage={};
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
		 window.resolveLocalFileSystemURI($rootScope.uploadimage, resolveOnSuccess, resOnError);
		
		//alert($rootScope.uploadimage);
		console.log($scope.uploadformFulldata+"hai");
		uploaddata = new Uploaddata($scope.uploadformFulldata.length,$scope.areaSelect,$scope.jobUpload,$scope.phaseUpload,$scope.dateUpload,$scope.dprUpload,$scope.streetUpload,$scope.cityUpload,$scope.zipcodeUpload,$scope.NotesUpload,$rootScope.keywordsUpload,$rootScope.imgname,$rootScope.uploadimage,'pending');
		$scope.uploadformFulldata.push(uploaddata);		
		localRecord.save('uploaddata',angular.toJson($scope.uploadformFulldata));
		$rootScope.queuelist = angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
		console.log($rootScope.queuelist);
		//navigating to queue tab
		$scope.uploadformclear();
		$rootScope.showorhide=true;
    };
    $scope.localcitydata = angular.fromJson(localRecord.get('geodata').geodataCode);
    $scope.getgeoloactiondata = function()
    {
        $scope.geocity = [];

        angular.forEach($scope.localcitydata, function(value) {
            if (value.Zip === $scope.zipcodeUpload) 
			{
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