'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function (LABELS, $window,$filter, $scope, $state, localRecord, access, $rootScope, loadAppData,$http, $q) {
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
	$scope.areatext=false;
	$scope.ziptext=false;
    $scope.uploadpage = true;
    $scope.uploaddtl = false;

   
   
    $scope.camera = function()
	{
		   navigator.camera.getPicture(onSuccess, onFail, {quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
            });
            function onSuccess(imageData) {
               
                var image = document.getElementById('uploaded-image');
                image.src = "data:image/jpeg;base64," + imageData;
				$rootScope.uploadimage=image.src;
            }
            function onFail(message) 
			{
                alert('Failed because: ' + message);
            }		
    };
	
		
	$scope.gallery =function()
	{
			navigator.camera.getPicture(onGalSuccess, onGalFail, {quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
            function onGalSuccess(imageData) {
                var image = document.getElementById('uploaded-image');
                image.src = "data:image/jpeg;base64," + imageData;
            }
            function onGalFail(message) 
			{
                alert('Failed because: ' + message);
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