'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: Release Notes
 * @description
 * # ReleaseNotesCtrl
 *
 * The controller that handles the release notes.
 */

angular.module('MediaVault').controller('ReleaseNotesCtrl', function (ERRORS, $scope, $modalInstance, $http, showVersion, nplApi, ENV, ENDPOINTS) {
    $scope.loading = true;
    $scope.error = '';

    var releaseNotes = [];
    var version = 0;
    var releaseCounter = 0;
    var foundRelease = false;
    var loadVersionNotes = true;

    var params = {};
    params.rnd = +new Date().getTime();

    nplApi.get(ENDPOINTS.releaseNotes, {version: ENV.version}).success(function (data) {
        $scope.loading = false;

        $.each(data, function (key, data) {
            foundRelease = false;
            version = data.Version;
            loadVersionNotes = true;

            // if we want a specific version
            if (showVersion !== 0 && showVersion !== version && showVersion !== undefined) {
                loadVersionNotes = false;
            }

            // if we should load this version of notes
            if (loadVersionNotes) {
                // check if the release exists
                for (var x = 0; x < releaseNotes.length; x++) {
                    if (releaseNotes[x].version === version) {
                        foundRelease = true;
                    }
                }

                // if this is a release we do not have
                if (!foundRelease) {
                    releaseNotes[releaseCounter] = {};
                    releaseNotes[releaseCounter].version = version;

                    releaseCounter++;
                }

                // if no notes are present for this release
                if (!releaseNotes[releaseCounter - 1].notes) {
                    releaseNotes[releaseCounter - 1].notes = [];
                }

                // add the notes
                releaseNotes[releaseCounter - 1].notes.push(data.Note);
            }
        });

        // add the release notes to the view
        $scope.releaseNotes = releaseNotes;
    }).error(function () {
        $scope.loading = false;

        $scope.error = ERRORS.releaseNotes.getFailed;
    });

    // handles the user clicking the ok button in the modal (closes modal)
    $scope.ok = function () {
        $modalInstance.close();
    };
});