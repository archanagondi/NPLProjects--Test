'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('searchCtrl', function (LABELS, $window, $scope, $state,$filter, $http,localRecord, access, $rootScope, loadAppData,coreservices){
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
	$scope.spinnervalue=false;	
	$rootScope.url='';
	$scope.jobsearch = [];
    $scope.phasesSearch =[];
    $scope.searchgeocity =[];
    $scope.searchdetailsgeocity = [];
	//$rootScope.searchresultdata = [];
	$rootScope.searchresponse =[];

	
$rootScope.type='';
//getting the type while click the tab 
$('#search-tab').click(function()
 {	 
	$rootScope.type='search';
	//$window.alert($rootScope.type);
	$scope.selection = [];
	$rootScope.selectedKeywords=[];	
});
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
	//search service 
	$scope.formdata=$scope.searchVaultId+','+$scope.searchAreaSelect+','+$scope.searchJob+','+$scope.searchPhase+','+$scope.searchDate+','+$scope.searchExtNo+','+$scope.searchStreetName+','+$scope.searchZipCode+','+$scope.searchCity+','+$scope.searchNotes+','+$rootScope.searchKeyword;
	$scope.enhancedstring=$scope.formdata.replace(/^,|,$/g,'');
	console.log($scope.formdata);
	
	if($scope.searchVaultId=='' && $scope.searchAreaSelect==''&&$scope.searchJob==''&&$scope.searchDate==''&&$scope.searchExtNo==''&&$scope.searchStreetName==''&&$scope.searchZipCode==''&&$scope.searchCity==''&&$scope.searchNotes==''&&$rootScope.searchKeyword=='')
	{
		alert('Please select atleast one value for continue search ');
	}else
	{
		$scope.searchpage = false;
        $scope.searchpageresults = true;	
	} 
	$scope.querytext=$scope.enhancedstring; //sending selected keywords
	//$scope.foldername='sathish';
	$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
	console.log($rootScope.accesstoken);
	$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
	console.log($rootScope.folderdetails);
	$scope.folderld = $rootScope.folderdetails.data.folderId;
	$scope.folderName = $rootScope.folderdetails.data.folderName;
	
	//$scope.folderId='017LDWEEF3GUWOANB2PVB2RGVU2UMQMDBK';
	coreservices.filesearch($rootScope.accesstoken,$scope.querytext,$scope.folderld).then(function(searchfileresponse)
	{	$rootScope.searchresponse=angular.fromJson(searchfileresponse.data);
				//localRecord.save('searchresults',$scope.searchresponse);
				//$rootScope.searchresultdata = angular.fromJson(localRecord.get('searchresults').searchresultsCode);
				console.log($rootScope.searchresponse);
				$scope.spinnervalue=true;	
			}).catch(function(response)
			{
					
			}); 	
    };

    $scope.searchback = function () {
		$rootScope.type='search';
		//alert("This is search type------------>"+$rootScope.type);
		$scope.selection = [];
		$rootScope.selectedKeywords=[];
        $scope.searchpage = true;
        $scope.searchpageresults = false;
    };
    $scope.elementclick = function (webUrl){
			$rootScope.url=webUrl;
			//$scope.url='https://centuri.sharepoint.com/Shared%20Documents/10014727/1438882338545.jpeg';
			alert($rootScope.url);
			coreservices.filedetails($rootScope.accesstoken,$rootScope.url).then(function(filedetailsresponse)
			{	alert('file details services '+ filedetailsresponse);
			}).catch(function(response)
			{		
			}); 
		$rootScope.type='searchDetails';
		//alert("This is search details type "+$rootScope.type);
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
		  }
		else
		{$scope.searchdetailsziptext=false;
		}
    };
	$scope.downloadfile = function () 
	{
		//alert("in download");
	   //$rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
	   //console.log($rootScope.folderdetails);
		alert($rootScope.url);
		coreservices.filedownload($rootScope.accesstoken,$rootScope.url).then(function(downloadresponse)
		{
		$scope.download=angular.fromJson(downloadresponse);
		console.log($scope.download.data.contentUrl);
			$http({
				method: 'GET',
				url: $scope.download.data.contentUrl,

				headers: {'Authorization': 'Bearer '+$rootScope.accesstoken}
				}).success(function(data){
					alert("file downloaded service is called ");
					//alert(data);
				}).error(function(){
					alert("error");
				
					
			});
		
		
		}).catch(function(response){
			if(response.status == 401){
				//alert("token expired");
			}else{
				//alert("sorry! file has been deleted");
			}
		}); 
		
    };


	
	
	
	
});