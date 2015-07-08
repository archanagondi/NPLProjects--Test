'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('searchCtrl', function (LABELS, $window, $scope, $state, localRecord, access, $rootScope) {

    $scope.searchpage = true;
    $scope.searchpageresults = false;
    $scope.searchdetails = false;
    $scope.searchmediaimg = true;
    $scope.searchmediadetails = false;

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

    $scope.jobsearch = [];
    $scope.phasesSearch = [];


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
    $rootScope.keywordsUpload = '';

    //search details
    $scope.searchDetailsdate = '';
    $scope.searchDetailsExt = '';
    $scope.searchDetailsZip = '';
    $scope.searchDetailsCity = '';
    $scope.searchDetailsNotes = '';
    $scope.searchdetailsStreet = '';


    $scope.searchdetailscancel = function () {

        $scope.searchDetailsdate = '';
        $scope.searchDetailsExt = '';
        $scope.searchDetailsZip = '';
        $scope.searchDetailsCity = '';
        $scope.searchDetailsNotes = '';
        $rootScope.keywordsUpload = '';
        $scope.searchAreaSelect = '';
        $scope.searchJob = '';
        $scope.searchPhase = '';
        $scope.searchdetailsStreet = '';
    };


    $scope.searchclear = function () {
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
        $rootScope.keywordsUpload = '';
    };

    $scope.searchjobsFilter = function () {
        $scope.jobsearch = [];
        $scope.phasesSearch = [];
        angular.forEach($rootScope.jobsandphases, function (value) {
            if (value.Area === parseInt($scope.searchAreaSelect)) {
                $scope.jobOptions = [];
                $scope.jobOptions.jobName = value.JobName;
                $scope.jobOptions.jobNum = value.JobNum;
                $scope.jobsearch.push($scope.jobOptions);
            }
        });
        if ($scope.jobsearch.length === parseInt(0)) {
            $window.alert('No jobs in this area ');
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
});