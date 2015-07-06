'use strict';

/**
 * @ngdoc service
 * @name MediaVault.service: Release Notes
 * @description
 * # releaseNotes
 *
 * The module of the application that shows release notes.
 */
angular.module('MediaVault').service('releaseNotes', function ($modal) {
    function showNotes(showVersion) {
        $modal.open({
            templateUrl: 'views/partials/release-notes.html',
            size: 'lg',
            controller: 'ReleaseNotesCtrl',
            resolve: {
                showVersion: function () {
                    return showVersion;
                }
            }
        });
    }

    return {
        showNotes: function (showVersion) {
            return showNotes(showVersion);
        }
    };
});

