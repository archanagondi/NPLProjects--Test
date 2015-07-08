'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function (LABELS, $window, $scope, $state, localRecord, access, $rootScope) {

    $scope.job = [];
    $scope.phases = [];

    $scope.areaSelect = '';
    $scope.phaseUpload = '';
    $scope.dateUpload = '';
    $scope.jobUpload = '';
    $scope.dprUpload = '';
    $scope.streetUpload = '';
    $scope.zipUpload = '';
    $scope.cityUpload = '';
    $scope.NotesUpload = '';
    $scope.dt = '';


    $scope.uploadpage = true;
    $scope.uploaddtl = false;

    /* script for camera*/
    var destinationType = '';

    $scope.camera = function () {

        navigator.camera.getPicture(onPhotoFromlibraryDataSuccess, onFail, {
            quality: 4,
            allowEdit: true,
            destinationType: Camera.DestinationType.FILE_URI
        });
    };

    $scope.gallery = function () {

        navigator.camera.getPicture(onPhotoFromlibraryDataSuccess, onFail, {
            quality: 4,
            destinationType: destinationType.FILE_URI,
            allowEdit: true
        });
    };

    function onPhotoFromlibraryDataSuccess(imageURI) {

        $scope.imagePath = imageURI;
    }

    function onFail(message) {
        navigator.notification.alert(
            message, // message
            null, // callback
            'Camera Error', // title
            'Ok'  // buttonName
        );
    }

    $scope.clear = function () {
        $scope.imagePath = '';
    };
    $scope.continuee = function () {
        $scope.uploadpage = false;
        $scope.uploaddtl = true;
    };
    $scope.back = function () {
        $scope.uploadpage = true;
        $scope.uploaddtl = false;
    };

    //form validations in upload html
    $scope.uploadformclear = function () {
        $scope.areaSelect = '';
        $scope.phaseUpload = '';
        $scope.dateUpload = '';
        $scope.jobUpload = '';
        $scope.dprUpload = '';
        $scope.streetUpload = '';
        $scope.zipUpload = '';
        $scope.cityUpload = '';
        $scope.NotesUpload = '';

        $rootScope.keywordsUpload = '';

    };

    $scope.jobsFilter = function () {
        $scope.job = [];
        $scope.phases = [];

        angular.forEach($rootScope.jobsandphases, function (value) {
            if (value.Area === parseInt($scope.areaSelect)) {
                $scope.jobOptions = [];
                $scope.jobOptions.jobName = value.JobName;
                $scope.jobOptions.jobNum = value.JobNum;
                $scope.job.push($scope.jobOptions);

            }
        });
        if ($scope.job.length === parseInt(0)) {
            $window.alert('No jobs in this area ');
        }
    };

    $scope.phaseFilter = function () {
        $scope.phases = [];
        angular.forEach($rootScope.jobsandphases, function (value) {

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

    $scope.uploadData = function () {
        $scope.areaSelect;
        $scope.phaseUpload;
        $scope.dateUpload;
        $scope.jobUpload;
        $scope.dprUpload;
        $scope.streetUpload;
        $scope.zipUpload;
        $scope.cityUpload;
        $scope.NotesUpload;
        $rootScope.keywordsUpload;
    };

});