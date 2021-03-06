'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller
 */
angular.module('MediaVault').controller('MainCtrl', function (LABELS, $scope,$window, $state,$interval, localRecord, access, $rootScope,coreservices) {
$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
console.log($rootScope.accesstoken+'main in controller');	
		
$rootScope.type='';
/* //getting the type while click the tab 
$('#search-tab').click(function()
 {	 
	$rootScope.type='search';
	$window.alert($rootScope.type);
	$scope.selection = [];
	$rootScope.selectedKeywords=[];	
}); */
//getting the type while click the tab 

   $scope.areacode = '';

    if (localRecord.get('area').areaCode)
	{
        $scope.areacode = localRecord.get('area').areaCode.split(',');
    }
    $scope.phaseCode = localRecord.get('phase').phaseCode;
    $rootScope.category = angular.fromJson(localRecord.get('categories').categoriesCode);
    $rootScope.kewordsdata = angular.fromJson(localRecord.get('keywords').keywordsCode);
    $rootScope.jobsandphases = angular.fromJson($scope.phaseCode);
    $rootScope.keywordsUpload = '';

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

    $scope.keywordToFilter = function () 
	{
        $scope.filterCategories = [];
        return $rootScope.kewordsdata;
    };
    $scope.filterCategory = function (event) 
	{
        $scope.newCategory = $scope.filterCategories.indexOf(event.Category) === -1;
        if ($scope.newCategory) 
		{
            $scope.filterCategories.push(event.Category);
        }
        return $scope.newCategory;
    };

    // selected fruits
    $scope.selection = [];
    $rootScope.structures = [];
    $rootScope.conditions = [];
    $rootScope.entities = [];
    $rootScope.selectedKeywords = [];

    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(keyword,categoryId) 
	{
		//var tableId = $(this).closest("table").find(".keyword-modal").attr(id);
		//alert(categoryId);
		
		
        var idx = $scope.selection.indexOf(keyword);
        var idx_structure = $rootScope.structures.indexOf(keyword);
        var idx_conditions = $rootScope.conditions.indexOf(keyword);
        var idx_entities = $rootScope.entities.indexOf(keyword);
		
        // is currently selected
        if (idx > -1) {	
            $scope.selection.splice(idx, 1);
			if(categoryId == "Structures"){
			$rootScope.structures.splice(idx_structure,1);
		}else if(categoryId == "Condition"){
			$rootScope.conditions.splice(idx_conditions,1);
		}else if(categoryId == "Entities"){
			$rootScope.entities.splice(idx_entities,1);
		
		}
        }
        // is newly selected
        else {
            $scope.selection.push(keyword);
		if(categoryId == "Structures"){
			$rootScope.structures.push(keyword);
		}else if(categoryId == "Condition"){
			$rootScope.conditions.push(keyword);
		}else if(categoryId == "Entities"){
			$rootScope.entities.push(keyword);
		
		}
        }
        $rootScope.selectedKeywords = $scope.selection;
    };
	
    $scope.selectedKeys = function () 
	{
		if($rootScope.type === 'search')
		{
			$('#searchKeyword').val($rootScope.selectedKeywords);
			$rootScope.searchKeyword = $rootScope.selectedKeywords;	
		   //alert('this is the search keyword part ');
		  
		}
	  else if($rootScope.type === 'searchDetails')
	  { 
		$('#searchDetailsKeyword').val($rootScope.selectedKeywords);
		$rootScope.searchDetailsKeyword = $rootScope.selectedKeywords;	
		//alert('this is the search details part ');
		
	  }
	else if($rootScope.type === 'upload')
	{
	  $('#keywordsUpload').val($rootScope.selectedKeywords);
	  $rootScope.keywordsUpload = $rootScope.selectedKeywords;
	  //alert('this is the upload keyword part ');
	  
	} 

	
	};
    //date
    $scope.model = {};
    $scope.formats = ['MM/dd/yyyy'];
    $scope.format = $scope.formats[0];
    //date functionality
    $scope.open = function ($event, elementOpened) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.model[elementOpened] = !$scope.model[elementOpened];
    };
    $scope.dateOptions =
    {
        formatYear: 'yy',
        startingDay: 1
    };
	
	
	
	
	
	
	
//popup for delete
	$scope.deleteRecord = function(){	
	$scope.uploadformFulldata=angular.fromJson(localRecord.get('uploaddata').uploaddataCode);
	$scope.uploadformFulldata.pop($rootScope.deleteId)
	localRecord.save('uploaddata',angular.toJson($scope.uploadformFulldata));
	$("#"+$rootScope.deleteId).remove();
	};
	//pop-up for search delete method 	
	$scope.deletesearchfile = function()
	{
		alert($rootScope.url);
	/* 	$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);

			$scope.folderld = $rootScope.folderdetails.data.folderId;
			$scope.folderName = $rootScope.folderdetails.data.folderName;
			$scope.fileld='DWEEDE474HUBEJ4JC2WNQVJ2TOY6UH'; */
			coreservices.filedelete($rootScope.accesstoken,$rootScope.url).then(function(deletedresponse)
			{
				$scope.deletedfile=angular.toJson(deletedresponse);
				console.log($scope.deletedfile+'hello this is download ');
			}).catch(function(response)
			{
				alert("this file is already deleted");
			});
	};
	 
		
		
		
$interval(coreservices.getAccessToken,500000);



});


