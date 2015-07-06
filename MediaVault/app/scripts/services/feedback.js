'use strict';
/**
 * @ngdoc service
 * @name MediaVault.service: Feedback
 * @description
 * # feedback
 *
 * The module of the application that handles feedback on the site.
 */

angular.module('MediaVault').service('feedback', function (ENDPOINTS, ERRORS, nplApi, localRecord, access, $state) {
    // sends a message
    function sendMessage(comment, callback) {
        if (!access.isSignedIn() && !access.requestUserLogin()) {
            $state.go('login');
        }

        // check online before getting new data from API
        if (access.hasToken()) {
            // send the feedback
            nplApi.post(ENDPOINTS.feedback, {'comment': comment}).then(function () {
                callback(false, null);
            }, function () {
                callback(true, ERRORS.feedback.postFailed);
            });
        } else {
            callback(true, ERRORS.feedback.offline);
        }
    }

    return {
        sendMessage: sendMessage
    };
});