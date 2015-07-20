'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function (LABELS, $window,$filter, $scope, $state, localRecord, access, $rootScope, loadAppData,$http, $q) {

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
	$scope.areatext=false;
	$scope.ziptext=false;

    $scope.uploadpage = true;
    $scope.uploaddtl = false;

    /* script for camera*/
    $scope.pictureSource = '';
    $scope.destinationType = '';
    $scope.picturetype = '';
    var destinationType = '';

    $scope.camera = function(source) {

        var deferred = $q.defer();
		
        var cameraOptions = {quality: 70, destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true};

        // If source == 1 photo upload from gallery
        if (source === parseInt(1)) 
		{
            cameraOptions = {quality: 70, destinationType: Camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, targetWidth: 600, targetHeight: 600, correctOrientation: true};
			
        }

        navigator.camera.getPicture(function(imageURI) {
		
                var networkState = navigator.network.connection.type;
                var states = {};
                states[Connection.UNKNOWN] = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI] = 'WiFi connection';
                states[Connection.CELL_2G] = 'Cell 2G connection';
                states[Connection.CELL_3G] = 'Cell 3G connection';
                states[Connection.CELL_4G] = 'Cell 4G connection';
                states[Connection.NONE] = 'No network connection';

                if (states[networkState] === 'WiFi connection' || states[networkState] === 'Cell 4G connection') {
                    $scope.imagePath = imageURI;
                    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                            fileSys.root.getDirectory('uploadedPhoto', {create: true, exclusive: false}, function(dir) {
                                fileEntry.copyTo(dir, generateRandomID() + '.png', function(entry) {
                                    deferred.resolve(entry.toURL());
                                }, null);
                            }, null);
                        }, null);
                    }, null);
                } else {
                    navigator.notification.alert(
                        'This App requires an internet connection.', // message
                        'No Internet Connection', // title
                        'Close'                  // buttonName
                    );
                    return false;
                }
            },
            function(message) {
                deferred.reject(message);
            },
            cameraOptions
        );

        return deferred.promise;


        // generate random code
        function generateRandomID() 
		{
            var length = 10;
            var letters = 'abcdefghijklmnopqrstuvwxyz';
            var numbers = '1234567890';
            var charset = letters + letters.toUpperCase() + numbers;
            var randomID = '';
            for (var i = 0; i < length; i++)
            {
               randomID += charset.substr(Math.floor(Math.random() * length), 2);
            }
            return randomID;
        }
    };

    $scope.clear = function () 
	{
        $scope.imagePath = '';
    };
    $scope.continuee = function () {
		$rootScope.type='upload';
		$scope.selection = [];
	$rootScope.selectedKeywords=[];
        $scope.uploadpage = false;
        $scope.uploaddtl = true;
    };
    $scope.back = function () {
        $scope.uploadpage = true;
        $scope.uploaddtl = false;
    };

    //form validations in upload html
    $scope.uploadformclear = function (){
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
		$scope.ziptext=false;
    };

    $scope.jobsFilter = function () {
        $scope.job = [];
        $scope.phases = [];

        loadAppData.getGeoLocation($scope.areaSelect).success(
            function (selectedGeoData) {
                localRecord.remove('geodata');
                $scope.geodata = angular.toJson(selectedGeoData);
                localRecord.save('geodata', $scope.geodata);
            }
        ).error(function () {

            });

        angular.forEach($rootScope.jobsandphases, function (value) {
            if (value.Area === parseInt($scope.areaSelect)) {
                $scope.jobOptions = [];
                $scope.jobOptions.jobName = value.JobName;
                $scope.jobOptions.jobNum = value.JobNum;
                $scope.job.push($scope.jobOptions);
            }
        });
        if ($scope.job.length === parseInt(0)) {
			 $scope.areatext=true;
        }
		else{$scope.areatext=false;
			}
    };
    $scope.phaseFilter = function () 
	{
        $scope.phases = [];
        angular.forEach($rootScope.jobsandphases, function (value) 
		{
            if (value.JobNum === parseInt($scope.jobUpload)) {
                angular.forEach(value.Phases, function (value1) {
                    $scope.jobOptions = [];
                    $scope.jobOptions.Desc = value1.Desc;
                    $scope.jobOptions.Phase = value1.Phase;
                    $scope.phases.push($scope.jobOptions);
                });
            }
        });
    };	
    $scope.uploadData = function ()
	{
		$scope.uploadformdata=[];
		$scope.uploadformdata.push($scope.areaSelect);
		$scope.uploadformdata.push($scope.jobUpload);
		$scope.uploadformdata.push($scope.phaseUpload);
		$scope.dateUpload =$filter('date')($scope.dateUpload, 'MM/dd/yyyy');
		$scope.uploadformdata.push($scope.dateUpload);
		$scope.uploadformdata.push($scope.dprUpload);
		$scope.uploadformdata.push($scope.streetUpload);
		$scope.uploadformdata.push($scope.zipcodeUpload);
		$scope.uploadformdata.push($scope.cityUpload);
		$scope.uploadformdata.push($scope.NotesUpload);
		$scope.uploadformdata.push($rootScope.keywordsUpload);				
    };

    $scope.localcitydata = angular.fromJson(localRecord.get('geodata').geodataCode);

    $scope.getgeoloactiondata = function () 
	{
        $scope.geocity = [];
		
        angular.forEach($scope.localcitydata, function (value) {
            if (value.Zip === $scope.zipcodeUpload) {
                $scope.geo = [];
                $scope.geo.PrimaryCity = value.PrimaryCity;
                $scope.geocity.push($scope.geo);	
            }
        });		
        if ($scope.geocity.length === parseInt(0)) 
		{ $scope.ziptext=true;
        }
		else
		{$scope.ziptext=false;
		}
    };

});