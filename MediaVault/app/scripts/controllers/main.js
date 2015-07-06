'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller
 */
angular.module('MediaVault').controller('MainCtrl', function (LABELS, $scope, $state, localRecord, access,$rootScope) {
     $scope.areacode = localRecord.get('area').areaCode.split(',');
	 $scope.phaseCode = localRecord.get('phase').phaseCode;
	 $rootScope.category = angular.fromJson(localRecord.get('categories').categoriesCode);
	 $rootScope.kewordsdata = angular.fromJson(localRecord.get('keywords').keywordsCode);
	 $rootScope.jandp=angular.fromJson($scope.phaseCode);
	 $rootScope.keywordsUpload='';
	
 //end of date functionality 
    if (!access.isSignedIn())
	{
        $state.go('login');
    }
    // set the title to Time Entry
    $scope.pageTitle = LABELS.main.pageTitle;
    $scope.currentUser = localRecord.get('user');
    
	//select keyword function 
	
	 //$scope.events = $rootScope.kewordsdata;
     $scope.filterCategories = [];
    
	$scope.keywordToFilter = function() 
	{
        $scope.filterCategories= [];
          return $rootScope.kewordsdata;
    };
    $scope.filterCategory = function(event) {
          $scope.newCategory =  $scope.filterCategories.indexOf(event.Category) === -1;
        if ( $scope.newCategory) {
            $scope.filterCategories.push(event.Category);   
        }
       return  $scope.newCategory;
    };
	
    // selected fruits
    $scope.selection = [];
	$rootScope.selectedKeywords=[];
	
    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(keyword) {
      var idx = $scope.selection.indexOf(keyword);
      
      // is currently selected
      if (idx > -1) {
        $scope.selection.splice(idx, 1);
      }
      // is newly selected
      else {
        $scope.selection.push(keyword);
      }
	  $rootScope.selectedKeywords=$scope.selection;
   
     };
	
    $scope.selectedKeys = function()
	{	
	$rootScope.keywordsUpload = $rootScope.selectedKeywords;
	};	   
	
	//date
	$scope.model ={};
	$scope.formats = ['MM/dd/yyyy'];
	$scope.format =$scope.formats[0];
	//date functionality 				
	$scope.open = function($event,elementOpened)
		{
			$event.preventDefault();
			$event.stopPropagation();
			$scope.model[elementOpened] = !$scope.model[elementOpened];
		};
	$scope.dateOptions =
	{
    formatYear: 'yy',
    startingDay: 1,
	max: '2030-07-22'
	};
	
	
	
	
	
	
	
	
	
});


