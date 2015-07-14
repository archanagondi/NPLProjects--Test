'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('searchCtrl', function (LABELS, $window, $scope, $state,$filter, localRecord, access, $rootScope, loadAppData) {
	$scope.searcharea= false;
    $scope.searchpage = true;
    $scope.searchpageresults = false;
    $scope.searchdetails = false;
    $scope.searchmediaimg = true;
    $scope.searchmediadetails = false;
    $scope.searchgeodata = [];
	$scope.searchformdata=[];
	$scope.searchdetailsformdata=[];
	$scope.searchziptext=false;
	$scope.searchdetailsziptext=false;

	 $scope.jobsearch = [];
    $scope.phasesSearch =[];
    $scope.searchgeocity =[];
    $scope.searchdetailsgeocity = [];




	
    $scope.searchVaultId = '';
    $scope.searchAreaSelect = '';
    $scope.searchJob = '';
    $scope.searchPhase = '';
    $scope.searchDate = '';
    $scope.searchExtNo = '';
    $scope.searchStreetName = '';
    $scope.searchZipCode = '';
    $scope.searchCity = '';
    $scope.searchNotes = '';
	$rootScope.searchKeyword='';
	
    //search details
    $scope.searchDetailsdate = '';
    $scope.searchDetailsExt = '';
    $scope.searchDetailsZip = '';
    $scope.searchDetailsCity = '';
    $scope.searchDetailsNotes = '';
    $scope.searchdetailsStreet = '';
	$rootScope.searchDetailsKeyword='';
	
    //search page buttons
    $scope.searchbutton = function () 
	{
        $scope.searchpage = false;
        $scope.searchpageresults = true;	
		
	$scope.searchformdata=[];
	$scope.searchformdata.push($scope.searchVaultId);
	$scope.searchformdata.push($scope.searchAreaSelect);
	$scope.searchformdata.push( $scope.searchJob );
	$scope.searchformdata.push( $scope.searchPhase);
	$scope.searchDate =$filter('date')($scope.searchDate, 'MM/dd/yyyy');
	$scope.searchformdata.push($scope.searchDate);
	$scope.searchformdata.push($scope.searchExtNo);
	$scope.searchformdata.push($scope.searchStreetName);
	$scope.searchformdata.push($scope.searchZipCode);
	$scope.searchformdata.push($scope.searchCity);
	$scope.searchformdata.push($scope.searchNotes);
	$scope.searchformdata.push($rootScope.searchKeyword);
    };
    $scope.searchback = function () {
		$rootScope.type='search';
		$scope.selection = [];
		$rootScope.selectedKeywords=[];
        $scope.searchpage = true;
        $scope.searchpageresults = false;
    };
    $scope.elementclick = function () {
		$rootScope.type='searchDetails';
		$scope.selection = [];		
		$rootScope.selectedKeywords=[];
        $scope.searchpageresults = false;
        $scope.searchdetails = true;
		
    };
    $scope.searchdetailsimage = function () {
        $scope.searchmediaimg = true;
        $scope.searchmediadetails = false;

    };
    $scope.searchdetailsinformation = function () {
		
        $scope.searchmediaimg = false;
        $scope.searchmediadetails = true;
    };
    $scope.searchdetailsback = function () {
        $scope.searchpageresults = true;
        $scope.searchdetails = false;
    };
	 $scope.searchdetailssave = function () 
	{
	  $scope.searchdetailsformdata=[];
	  $scope.searchdetailsformdata.push($scope.searchAreaSelect);
	  $scope.searchdetailsformdata.push($scope.searchJob);
	  $scope.searchdetailsformdata.push($scope.searchPhase);
	  $scope.searchDetailsdate =$filter('date')($scope.searchDetailsdate, 'MM/dd/yyyy');
	  $scope.searchdetailsformdata.push($scope.searchDetailsdate);
	  $scope.searchdetailsformdata.push($scope.searchDetailsExt);
	  $scope.searchdetailsformdata.push($scope.searchDetailsZip);
	  $scope.searchdetailsformdata.push($scope.searchDetailsCity);
	  $scope.searchdetailsformdata.push($scope.searchDetailsNotes );
	  $scope.searchdetailsformdata.push($scope.searchdetailsStreet);
	  $scope.searchdetailsformdata.push($rootScope.searchDetailsKeyword);	 
	};
    $scope.searchdetailscancel = function () 
	{
		$scope.searcharea= false;
        $scope.searchDetailsdate = '';
        $scope.searchDetailsExt = '';
        $scope.searchDetailsZip = '';
        $scope.searchDetailsCity = '';
        $scope.searchDetailsNotes = '';
        $rootScope.searchDetailsKeyword = '';
        $scope.searchAreaSelect = '';
        $scope.searchJob = '';
        $scope.searchPhase = '';
        $scope.searchdetailsStreet = '';
		$scope.searchdetailsziptext=false;

    };
    $scope.searchclear = function () {
		$scope.searcharea= false;
        $scope.searchVaultId = '';
        $scope.searchAreaSelect = '';
        $scope.searchJob = '';
        $scope.searchPhase = '';
        $scope.searchDate = '';
        $scope.searchExtNo = '';
        $scope.searchStreetName = '';
        $scope.searchZipCode = '';
        $scope.searchCity = '';
        $scope.searchNotes = '';
        $rootScope.searchKeyword = '';
		$scope.searchziptext=false;
    };
    $scope.searchjobsFilter = function () {
        $scope.jobsearch = [];
        $scope.phasesSearch = [];
        loadAppData.getGeoLocation($scope.searchAreaSelect).success(
            function (selectedGeoData) {
                localRecord.remove('geodata');
                $scope.geodata = angular.toJson(selectedGeoData);
                localRecord.save('geodata', $scope.geodata);
            }
            ).error(function () {

            });
        angular.forEach($rootScope.jobsandphases, function (value) {
            if (value.Area === parseInt($scope.searchAreaSelect)) {
                $scope.jobOptions = [];
                $scope.jobOptions.jobName = value.JobName;
                $scope.jobOptions.jobNum = value.JobNum;
                $scope.jobsearch.push($scope.jobOptions);
            }
        });
        if ($scope.jobsearch.length === parseInt(0)) {
		   $scope.searcharea=true;
		   $scope.searchareamessage='No jobs in this area';
        }
		else {
			  $scope.searcharea=false;
			}
    };
    $scope.searchphaseFilter = function () {
        $scope.phasesSearch = [];
        angular.forEach($rootScope.jobsandphases, function (value) {

            if (value.JobNum === parseInt($scope.searchJob)) {
                angular.forEach(value.Phases, function (value1) {
                    $scope.jobOptions = [];
                    $scope.jobOptions.Desc = value1.Desc;
                    $scope.jobOptions.Phase = value1.Phase;
                    $scope.phasesSearch.push($scope.jobOptions);

                });
            }
        });
    };
    $scope.searchcitydata = angular.fromJson(localRecord.get('geodata').geodataCode);	
    $scope.getsearchgeoloactiondata = function () {
        $scope.searchgeocity = [];
        angular.forEach($scope.searchcitydata, function (value) {
            if (value.Zip === $scope.searchZipCode) {
                $scope.geo = [];
                $scope.geo.PrimaryCity = value.PrimaryCity;
                $scope.searchgeocity.push($scope.geo);
            }
        });
        if ($scope.searchgeocity.length === parseInt(0))
		{
		   $scope.searchziptext=true;
           $scope.searchzipmessage='no city for this zipcode ';
           
        }else
		{
			$scope.searchziptext=false;
		}
    };
    $scope.searchdetailcitydata = angular.fromJson(localRecord.get('geodata').geodataCode);
    $scope.getsearchdetailsgeoloactiondata = function () 
	{
        $scope.searchdetailsgeocity = [];
        angular.forEach($scope.searchdetailcitydata, function (value) {
            if (value.Zip === $scope.searchDetailsZip) {
                $scope.geo = [];
                $scope.geo.PrimaryCity = value.PrimaryCity;
                $scope.searchdetailsgeocity.push($scope.geo);
            }
        });
        if ($scope.searchdetailsgeocity.length === parseInt(0)) {
			$scope.searchdetailsziptext=true;
			$scope.searchdetailszipmessage='no city for this zipcode ';   
		  }
		else
		{$scope.searchdetailsziptext=false;
		}
    };


});