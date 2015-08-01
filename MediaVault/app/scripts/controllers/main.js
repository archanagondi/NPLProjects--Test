'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller
 */
angular.module('MediaVault').controller('MainCtrl', function (LABELS, $scope, $state,$interval, localRecord, access, $rootScope,coreservices) {
$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
console.log($rootScope.accesstoken+'main in controller');	
		
$rootScope.type='';
//getting the type while click the tab 
$('#search-tab').click(function()
 {	 
	$rootScope.type='search';
	//alert($rootScope.type);
	$scope.selection = [];
	$rootScope.selectedKeywords=[];	
});
//getting the type while click the tab 
$('#upload').click(function() 
{
	$rootScope.type='upload';
	//alert($rootScope.type);
	$scope.selection = [];
	$rootScope.selectedKeywords=[];	
});
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
    $rootScope.selectedKeywords = [];

    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(keyword) 
	{
        var idx = $scope.selection.indexOf(keyword);

        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selection.push(keyword);
        }
        $rootScope.selectedKeywords = $scope.selection;
    };
	
    $scope.selectedKeys = function () 
	{
		if($rootScope.type === 'search')
		{
			$('#searchKeyword').val($rootScope.selectedKeywords);
			$rootScope.searchKeyword = $rootScope.selectedKeywords;	
			alert('this is the search keyword part ');
		}
	  else if($rootScope.type === 'searchDetails')
	  { 
		$('#searchDetailsKeyword').val($rootScope.selectedKeywords);
		$rootScope.searchDetailsKeyword = $rootScope.selectedKeywords;	
		alert('this is the search details part ');
	  }
	else if($rootScope.type === 'upload')
	{
	  $('#keywordsUpload').val($rootScope.selectedKeywords);
	  $rootScope.keywordsUpload = $rootScope.selectedKeywords;
	  alert('this is the upload keyword part ');
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
	$scope.foldername='test';
	coreservices.generatefolder($rootScope.accesstoken,$scope.foldername).then(function(response)
		{
			$scope.folderresponse=angular.toJson(response);
			console.log($scope.folderresponse+'===create folder response  login js file ');
			localRecord.save('folderdata',angular.toJson(response));
		}).catch(function(errorresponse){
			 $scope.folderresponse=angular.fromJson(errorresponse);
				console.log("error");
				console.log($scope.folderresponse.status);
				
				/* if($scope.folderresponse.status == 401){
					alert("token expired");
					//generateaccesstoken();
					coreservices.getAccessToken();
					
				} */
		}); 
		
		
		
$interval(coreservices.getAccessToken,5000);



});


