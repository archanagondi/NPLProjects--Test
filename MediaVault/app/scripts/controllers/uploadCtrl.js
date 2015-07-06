'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('uploadCtrl', function(LABELS, $scope, $state, localRecord, access, $rootScope) {





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

    $scope.camera = function() {
        // alert("Note camera");
        navigator.camera.getPicture(onPhotoFromlibraryDataSuccess, onFail, {quality: 4, allowEdit: true, destinationType: Camera.DestinationType.FILE_URI});
    };

    $scope.gallary = function() {
        // alert("Note gallary section ");
        navigator.camera.getPicture(onPhotoFromlibraryDataSuccess, onFail, {quality: 4, destinationType: destinationType.FILE_URI, allowEdit: true});
    };

    function onPhotoFromlibraryDataSuccess(imageURI) {
        // alert("Photo upload success");
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

    $scope.clear = function()
    {
        //alert("Note clear");
        $scope.imagePath = '';
    };
    $scope.continuee = function()
    {
        $scope.uploadpage = false;
        $scope.uploaddtl = true;
    };
    $scope.back = function() {
        $scope.uploadpage = true;
        $scope.uploaddtl = false;
    };
    //form validations in upload html 	
    $scope.clears = function()
    {
    };


    $scope.jobsFilter = function()
    {
        $scope.job = [];
        $scope.phases = [];
        angular.forEach($rootScope.jandp, function(value) {
            if (value.Area === $scope.areaSelect)
            {
                $scope.jobOptions = [];
                $scope.jobOptions.push(value.JobNum);
                $scope.jobOptions.push(value.JobName);
                $scope.job.push($scope.jobOptions);
            }

        });
        if ($scope.job.length === 0)
        {
            
        }
    };

    $scope.phaseFilter = function()
    {
        $scope.phases = [];
        angular.forEach($rootScope.jandp, function(value) {

            if (value.JobNum === $scope.jobUpload)
            {
                angular.forEach(value.Phases, function(value1)
                {
                    $scope.jobOptions = [];
                    $scope.jobOptions.push(value1.Phase);
                    $scope.jobOptions.push(value1.Desc);
                    $scope.phases.push($scope.jobOptions);
                });
            }
        });
    };

});