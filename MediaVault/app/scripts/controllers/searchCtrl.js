'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('searchCtrl', function (LABELS, $scope, $state, localRecord, access,$rootScope) 
{
	
    $scope.searchpage = true;
    $scope.searchpageresults = false;
    $scope.searchdetails = false;
    $scope.searchmediaimg = true;
    $scope.searchmediadtl = false; 
	
	 //search page buttons
    $scope.searchbutton = function () 
	{
        $scope.searchpage = false;
        $scope.searchpageresults = true;
    };

    $scope.searchback = function () {
        $scope.searchpage = true;
        $scope.searchpageresults = false;
    };

    $scope.elementclick = function () {
        $scope.searchpageresults = false;
        $scope.searchdetails = true;
    };

    $scope.searchImage = function () {
        $scope.searchmediaimg = true;
        $scope.searchmediadtl = false;

    };
    $scope.searchDetails = function () {
        $scope.searchmediaimg = false;
        $scope.searchmediadtl = true;
    };

    $scope.searchback2 = function () 
	{
        $scope.searchpageresults = true;
        $scope.searchdetails = false;
    };
	  $scope.jobsearch=[];
	  $scope.phasesSearch=[];
	  
	  
	$scope.searchAreaSelect='';
	$scope.searchJob='';
	$scope.searchPhase='';
	
  $scope.searchjobsFilter = function()
		 { 
			   $scope.jobsearch=[];
			   $scope.phasesSearch=[];
			   
			   angular.forEach($rootScope.jandp, function(value) {
				
				
				 if(value.Area === $scope.searchAreaSelect)
				 {
							 $scope.jobOptions = [];
							 $scope.jobOptions.push(value.JobNum); 
							 $scope.jobOptions.push(value.JobName); 
							 $scope.jobsearch.push($scope.jobOptions); 
				 }
			 });
			 if($scope.jobsearch.length === 0)
			 {
				 
			 }
			};

   $scope.searchphaseFilter = function()
	{ 
	  $scope.phasesSearch=[];
	    angular.forEach($rootScope.jandp, function(value) {
		  //console.log(value);
		 if(value.JobNum === $scope.searchJob)
		 {
			 
			 angular.forEach(value.Phases, function(value1) {
				  $scope.jobOptions = [];
				 
				 $scope.jobOptions.push(value1.Phase); 
				 $scope.jobOptions.push(value1.Desc); 
				 $scope.phasesSearch.push($scope.jobOptions); 
				 
			 });
			 }	
	 });
	};
	
	
	
	
	
	
	

	
	
	
	
	
});