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
	$rootScope.queuelist=[];
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
	$scope.uploadformFulldata = [];
		
		$('#uploadData').click(function() 
		{
			$('#queue').click();
		});	
    document.addEventListener("deviceready", onDeviceReady, false);

    var imagesfoldername = "Mediavault-files";

    var projectpath = '';

    // PhoneGap is ready
    function onDeviceReady() {
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

    function fail(error) {
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
        function captureVideoError(error) {
            var msg = 'An error occurred during capture: ' + error.code;
            navigator.notification.alert(msg, null, 'Camera Not Found!');
        }
    };

    /* Gallery */
    $scope.gallery = function(type)
    {
        if (type == 'video') {
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
            if (VideoURI.substring(0, 21) == "content://com.android") {
                var photo_split = VideoURI.split("%3A");
                VideoURI = "content://media/external/video/media/" + photo_split[1];
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
		//createFolder service call 
		$scope.accesstoken='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL3RlY2htaWxlYWdlLnNoYXJlcG9pbnQuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYWM3ZWQwNjgtZTkwMS00MmRmLWI1ZGQtYzUwODYwZjE0ZTU1LyIsImlhdCI6MTQzODE1Njk3MiwibmJmIjoxNDM4MTU2OTcyLCJleHAiOjE0MzgxNjA4NzIsInZlciI6IjEuMCIsInRpZCI6ImFjN2VkMDY4LWU5MDEtNDJkZi1iNWRkLWM1MDg2MGYxNGU1NSIsIm9pZCI6ImU5Mjc2ZTMzLWQ4ZTQtNDUxMC04NDljLWM0N2Q2YzZjZDRkZCIsInVwbiI6ImRpbGVlcC10ZWNobWlsZWFnZUB0ZWNobWlsZWFnZS5vbm1pY3Jvc29mdC5jb20iLCJwdWlkIjoiMTAwMzdGRkU5MkQ0MkQwNyIsInN1YiI6IjFkbGxrR0pKWGNrWVRXbC15M3lEUGFLZFJSOVlnM1V6UTZURjlUT05wQm8iLCJnaXZlbl9uYW1lIjoiRGlsZWVwIiwiZmFtaWx5X25hbWUiOiJLdW1hciIsIm5hbWUiOiJEaWxlZXAgS3VtYXIiLCJhbXIiOlsicHdkIl0sInVuaXF1ZV9uYW1lIjoiZGlsZWVwLXRlY2htaWxlYWdlQHRlY2htaWxlYWdlLm9ubWljcm9zb2Z0LmNvbSIsImFwcGlkIjoiZjQwODE0YTEtY2FhYi00MGM2LTg0NTQtN2IxYTMwM2Q3MGJhIiwiYXBwaWRhY3IiOiIwIiwic2NwIjoiQWxsU2l0ZXMuRnVsbENvbnRyb2wgQWxsU2l0ZXMuTWFuYWdlIiwiYWNyIjoiMSJ9.mYgzeu_kXioDFj303ORw98Zwv--cIq-Lo-IWw3BXcvtOVFl1-43gSQabr9HGxRQgbTYThbnv2ePtiaUjMmaSsDgfZYz-M15TCKq0E7yh5q8HjKBVl6drhKBZoa4vD3j3NcWgHLfW3MCl75F9TO8hatB4UfnPUMGar377f2CGlbs4j7T6UYtrgvJa44vw7WaSdRROExvAQEgva88QNaDgvcu-Bq37FN3DJRGgCYEF1r2Kv9dRtrJ-y4gXyrII2IDTMl3Vk7QGWLNNvVq9vUz_r3c2eByQ9eoH7chQJr_n0hCi3j5umeetc9nbPmysLWazEtr9GwXwXfIDw9ZZttCXdQ';
		$scope.foldername='yaswanth';
	 	$scope.folder=coreservices.generatefolder($scope.accesstoken,$scope.foldername);
		console.log($scope.folder);
		 
		//getaccesstoken service call 
		 coreservices.getAccessToken().success(function(accessTokenresponse)
		{
		 alert(accessTokenresponse);
		}).error(function(){});
		
		//listFolderContents
		$scope.accesstoken='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL3RlY2htaWxlYWdlLnNoYXJlcG9pbnQuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYWM3ZWQwNjgtZTkwMS00MmRmLWI1ZGQtYzUwODYwZjE0ZTU1LyIsImlhdCI6MTQzODA5Mjg1MiwibmJmIjoxNDM4MDkyODUyLCJleHAiOjE0MzgwOTY3NTIsInZlciI6IjEuMCIsInRpZCI6ImFjN2VkMDY4LWU5MDEtNDJkZi1iNWRkLWM1MDg2MGYxNGU1NSIsIm9pZCI6ImU5Mjc2ZTMzLWQ4ZTQtNDUxMC04NDljLWM0N2Q2YzZjZDRkZCIsInVwbiI6ImRpbGVlcC10ZWNobWlsZWFnZUB0ZWNobWlsZWFnZS5vbm1pY3Jvc29mdC5jb20iLCJwdWlkIjoiMTAwMzdGRkU5MkQ0MkQwNyIsInN1YiI6IjFkbGxrR0pKWGNrWVRXbC15M3lEUGFLZFJSOVlnM1V6UTZURjlUT05wQm8iLCJnaXZlbl9uYW1lIjoiRGlsZWVwIiwiZmFtaWx5X25hbWUiOiJLdW1hciIsIm5hbWUiOiJEaWxlZXAgS3VtYXIiLCJhbXIiOlsicHdkIl0sInVuaXF1ZV9uYW1lIjoiZGlsZWVwLXRlY2htaWxlYWdlQHRlY2htaWxlYWdlLm9ubWljcm9zb2Z0LmNvbSIsImFwcGlkIjoiZjQwODE0YTEtY2FhYi00MGM2LTg0NTQtN2IxYTMwM2Q3MGJhIiwiYXBwaWRhY3IiOiIwIiwic2NwIjoiQWxsU2l0ZXMuRnVsbENvbnRyb2wgQWxsU2l0ZXMuTWFuYWdlIiwiYWNyIjoiMSJ9.uiuxdlbnIsF3aX5IKtHMxIE22fa18EW-IncL0dGxDs0HYS5at4id7I3vQK47O6kxak-4T3Q_lc9-PVqCOCYx09HUOve6Dal6K7Z4Yp5ET0048yEne3JFJuNgqkJcA3gmV9p5zyHlKQCs5b0A2P4JB1-ZStuQmjTeOi-qVRi_hK3PjrjyoqSEoitpyOkDuft0crzt3nMgSBHMgGLT2ZFmmF2mKzuaoNg9AJNX5fpcwi32O1x5fjUat7YEnl9MjzxLvRPtORm3lrIuqDkQwFakTMVGpyiKMh1vx-CU3GcZ-AgWTrUBV8zW_GdU0R5dOOuEmMLf8qbeZeRYyeExeXIPlQ';
		$scope.folderId='017LDWEEF3GUWOANB2PVB2RGVU2UMQMDBK';
		coreservices.foldercontents($scope.accesstoken,$scope.folderId).success(function(listserviceresponse){
			//alert(listserviceresponse);
		}).error(function(){});
		
		//uploadFile service
		coreservices.fileupload().success(function(fileuploadserviceresponse){
			//alert(uploadserviceresponse);
		}).error(function(){});
		
		//file download service 
		$scope.accesstoken='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL3RlY2htaWxlYWdlLnNoYXJlcG9pbnQuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYWM3ZWQwNjgtZTkwMS00MmRmLWI1ZGQtYzUwODYwZjE0ZTU1LyIsImlhdCI6MTQzODA5Mjg1MiwibmJmIjoxNDM4MDkyODUyLCJleHAiOjE0MzgwOTY3NTIsInZlciI6IjEuMCIsInRpZCI6ImFjN2VkMDY4LWU5MDEtNDJkZi1iNWRkLWM1MDg2MGYxNGU1NSIsIm9pZCI6ImU5Mjc2ZTMzLWQ4ZTQtNDUxMC04NDljLWM0N2Q2YzZjZDRkZCIsInVwbiI6ImRpbGVlcC10ZWNobWlsZWFnZUB0ZWNobWlsZWFnZS5vbm1pY3Jvc29mdC5jb20iLCJwdWlkIjoiMTAwMzdGRkU5MkQ0MkQwNyIsInN1YiI6IjFkbGxrR0pKWGNrWVRXbC15M3lEUGFLZFJSOVlnM1V6UTZURjlUT05wQm8iLCJnaXZlbl9uYW1lIjoiRGlsZWVwIiwiZmFtaWx5X25hbWUiOiJLdW1hciIsIm5hbWUiOiJEaWxlZXAgS3VtYXIiLCJhbXIiOlsicHdkIl0sInVuaXF1ZV9uYW1lIjoiZGlsZWVwLXRlY2htaWxlYWdlQHRlY2htaWxlYWdlLm9ubWljcm9zb2Z0LmNvbSIsImFwcGlkIjoiZjQwODE0YTEtY2FhYi00MGM2LTg0NTQtN2IxYTMwM2Q3MGJhIiwiYXBwaWRhY3IiOiIwIiwic2NwIjoiQWxsU2l0ZXMuRnVsbENvbnRyb2wgQWxsU2l0ZXMuTWFuYWdlIiwiYWNyIjoiMSJ9.uiuxdlbnIsF3aX5IKtHMxIE22fa18EW-IncL0dGxDs0HYS5at4id7I3vQK47O6kxak-4T3Q_lc9-PVqCOCYx09HUOve6Dal6K7Z4Yp5ET0048yEne3JFJuNgqkJcA3gmV9p5zyHlKQCs5b0A2P4JB1-ZStuQmjTeOi-qVRi_hK3PjrjyoqSEoitpyOkDuft0crzt3nMgSBHMgGLT2ZFmmF2mKzuaoNg9AJNX5fpcwi32O1x5fjUat7YEnl9MjzxLvRPtORm3lrIuqDkQwFakTMVGpyiKMh1vx-CU3GcZ-AgWTrUBV8zW_GdU0R5dOOuEmMLf8qbeZeRYyeExeXIPlQ';
		$scope.fileId='547836d8c3077af35f2481e9';
		coreservices.filedownload($scope.accesstoken,$scope.fileId).success(function(uploadserviceresponse){
			//alert(uploadserviceresponse);
		}).error(function(){});
		
		//file delete service 
		coreservices.filedelete($scope.accesstoken,$scope.fileId).success(function(filedeleteserviceresponse){
		//alert(filedeleteserviceresponse);
		}).error(function(){});
		//file search service 
		$scope.accesstoken='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL3RlY2htaWxlYWdlLnNoYXJlcG9pbnQuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYWM3ZWQwNjgtZTkwMS00MmRmLWI1ZGQtYzUwODYwZjE0ZTU1LyIsImlhdCI6MTQzODA5Mjg1MiwibmJmIjoxNDM4MDkyODUyLCJleHAiOjE0MzgwOTY3NTIsInZlciI6IjEuMCIsInRpZCI6ImFjN2VkMDY4LWU5MDEtNDJkZi1iNWRkLWM1MDg2MGYxNGU1NSIsIm9pZCI6ImU5Mjc2ZTMzLWQ4ZTQtNDUxMC04NDljLWM0N2Q2YzZjZDRkZCIsInVwbiI6ImRpbGVlcC10ZWNobWlsZWFnZUB0ZWNobWlsZWFnZS5vbm1pY3Jvc29mdC5jb20iLCJwdWlkIjoiMTAwMzdGRkU5MkQ0MkQwNyIsInN1YiI6IjFkbGxrR0pKWGNrWVRXbC15M3lEUGFLZFJSOVlnM1V6UTZURjlUT05wQm8iLCJnaXZlbl9uYW1lIjoiRGlsZWVwIiwiZmFtaWx5X25hbWUiOiJLdW1hciIsIm5hbWUiOiJEaWxlZXAgS3VtYXIiLCJhbXIiOlsicHdkIl0sInVuaXF1ZV9uYW1lIjoiZGlsZWVwLXRlY2htaWxlYWdlQHRlY2htaWxlYWdlLm9ubWljcm9zb2Z0LmNvbSIsImFwcGlkIjoiZjQwODE0YTEtY2FhYi00MGM2LTg0NTQtN2IxYTMwM2Q3MGJhIiwiYXBwaWRhY3IiOiIwIiwic2NwIjoiQWxsU2l0ZXMuRnVsbENvbnRyb2wgQWxsU2l0ZXMuTWFuYWdlIiwiYWNyIjoiMSJ9.uiuxdlbnIsF3aX5IKtHMxIE22fa18EW-IncL0dGxDs0HYS5at4id7I3vQK47O6kxak-4T3Q_lc9-PVqCOCYx09HUOve6Dal6K7Z4Yp5ET0048yEne3JFJuNgqkJcA3gmV9p5zyHlKQCs5b0A2P4JB1-ZStuQmjTeOi-qVRi_hK3PjrjyoqSEoitpyOkDuft0crzt3nMgSBHMgGLT2ZFmmF2mKzuaoNg9AJNX5fpcwi32O1x5fjUat7YEnl9MjzxLvRPtORm3lrIuqDkQwFakTMVGpyiKMh1vx-CU3GcZ-AgWTrUBV8zW_GdU0R5dOOuEmMLf8qbeZeRYyeExeXIPlQ';
		$scope.querytext="";
		$scope.folderName="";
		coreservices.filesearch($scope.accesstoken,$scope.querytext,$scope.folderName).success(function(filesearchserviceresponse){
			//alert(filesearchserviceresponse);
		}).error(function(){});
		  
    };
    $scope.continuee = function() 
	{
       /*  var networkState = navigator.network.connection.type;
         var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection'; */
	
        /*  if (states[networkState] == "WiFi connection") 
		{
         alert('wifi');
         } else { */
        //alert($rootScope.uploadimage);
        //$rootScope.uploadimage
        //   $rootScope.uploadimage;
       // window.resolveLocalFileSystemURI($rootScope.uploadimage, resolveOnSuccess, resOnError);
        // }

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
                function(selectedGeoData) {
                    localRecord.remove('geodata');
                    $scope.geodata = angular.toJson(selectedGeoData);
                    localRecord.save('geodata', $scope.geodata);
                }
        ).error(function() {

        });

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
		uploaddata = new Uploaddata($scope.uploadformFulldata.length,$scope.areaSelect,$scope.jobUpload,$scope.phaseUpload,$scope.dateUpload,$scope.dprUpload,$scope.streetUpload,$scope.cityUpload,$scope.zipcodeUpload,$scope.NotesUpload,$rootScope.keywordsUpload,$rootScope.uploadimage);
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