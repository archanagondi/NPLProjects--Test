'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function(LABELS, $window, $filter, $scope, $state, localRecord, access, $rootScope, loadAppData, $http, $q) {
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

    document.addEventListener("deviceready", onDeviceReady, false);

    var imagesfoldername = "Mediavault-files";

    var projectpath = '';

    // PhoneGap is ready
    function onDeviceReady() {
        // alert('hi');
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }

    function gotFS(fileSystem) {
        // alert('hi2');
        fileSystem.root.getDirectory(imagesfoldername, {create: true, exclusive: false}, projectdirexist, notexists);
        // fileSystem.root.getFile("pic.jpg", {create: true, exclusive: false}, gotFileEntry, fail);
    }

    //on creating a folder successfully
    function projectdirexist(direntry) {
        projectpath = direntry.fullPath;
        alert(projectpath);
    }

    function notexists(error) {
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
        }

        /* Image capture success */
        function onSuccess(imageData) {

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
            for (i = 0, len = mediaFiles.length; i < len; i++) {
                saveVideoFile(mediaFiles[i]);
            }
        }

        /* save video file */
        function saveVideoFile(mediaFile) {
            alert(mediaFile.fullPath);

            save_video_locally(mediaFile.fullPath);
        }

        function save_video_locally(video_file) {
            alert("inside save video filel" + video_file)
            var stamp = new Date().getTime();
            var folder = imagesfoldername;
            var currentImageUrl = "Video" + stamp + ".MOV";

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

                //   var imagePath = fs.root.fullPath + folder+"/"+currentImageUrl;
                //  alert(imagePath);
                var imagePath = fs.root.toURL() + folder + "/" + currentImageUrl;
                alert("new..." + fs.root.toURL() + folder + "/" + currentImageUrl)
                var fileTransfer = new FileTransfer();
                var vppath = "file://" + video_file;
                alert("old path" + vppath);
                fileTransfer.download(vppath, imagePath, function(entry) {

                    //           and replacing the same image src with new src
                    alert("::: success" + entry.fullPath);
                }, function(error) {
                    alert("error " + error.code);

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
        $scope.imagePath = '';
    };
    $scope.continuee = function() {

        var networkState = navigator.network.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';


        /*  if (states[networkState] == "WiFi connection") {
         alert('wifi');
         } else { */
        alert($rootScope.uploadimage);
        $rootScope.uploadimage
        //   $rootScope.uploadimage;
        window.resolveLocalFileSystemURI($rootScope.uploadimage, resolveOnSuccess, resOnError);
        // }

        //Callback function when the file system uri has been resolved
        function resolveOnSuccess(entry) {
            var d = new Date();
            var n = d.getTime();
            //new file name
            var newFileName = n + ".jpg";
            // var myFolderApp = "EasyPacking";
            alert("image name is " + newFileName)
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                //The folder is created if doesn't exist
                fileSys.root.getDirectory(imagesfoldername,
                        {create: true, exclusive: false},
                function(directory) {
                    alert("moving function")
                    entry.moveTo(directory, newFileName, successMove, resOnError);
                },
                        resOnError);
            },
                    resOnError);
        }

        //Callback function when the file has been moved successfully - inserting the complete path
        function successMove(entry) 
		{
            //I do my insert with "entry.fullPath" as for the path
            var full_path = entry.toURL();
            alert("success of" + full_path);
        }

        function resOnError(error) 
		{
            alert("failure" + error.code);
        }

        $rootScope.type = 'upload';
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
            if (value.JobNum === parseInt($scope.jobUpload)) {
                angular.forEach(value.Phases, function(value1) {
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
        $scope.uploadformdata = [];
        $scope.uploadformdata.push($scope.areaSelect);
        $scope.uploadformdata.push($scope.jobUpload);
        $scope.uploadformdata.push($scope.phaseUpload);
        $scope.dateUpload = $filter('date')($scope.dateUpload, 'MM/dd/yyyy');
        $scope.uploadformdata.push($scope.dateUpload);
        $scope.uploadformdata.push($scope.dprUpload);
        $scope.uploadformdata.push($scope.streetUpload);
        $scope.uploadformdata.push($scope.zipcodeUpload);
        $scope.uploadformdata.push($scope.cityUpload);
        $scope.uploadformdata.push($scope.NotesUpload);
        $scope.uploadformdata.push($rootScope.keywordsUpload);
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