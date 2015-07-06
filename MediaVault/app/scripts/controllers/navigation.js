'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller
 */
angular.module('MediaVault').controller('NavigationCtrl', function (ENV, $scope, navigation, access, releaseNotes, $modal) {
    // set the navigation for detecting if open or close
    $scope.navigation = navigation;
    // set the version number
    $scope.version = ENV.version;


    // shows release notes
    $scope.showReleaseNotes = function () {
        navigation.close();

        releaseNotes.showNotes();
    };

    // function to handle logging out
    $scope.logout = function () {
        navigation.close();
        access.signOut();
    };

    // show feedback form
    $scope.showFeedbackForm = function () {
        navigation.close();

        $modal.open({
            templateUrl: 'views/partials/feedback.html',
            size: 'lg',
            controller: 'FeedbackCtrl'
        });
    };
});
