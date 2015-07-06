'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('FeedbackCtrl', function (MESSAGES, $scope, $modalInstance, nplApi, $rootScope, feedback) {
    $scope.feedback = {};
    $scope.feedback.alerts = [];

    // handles feedback being sent
    $scope.sendFeedback = function (userFeedback) {
        var comment = userFeedback.message;

        feedback.sendMessage(comment, processFeedbackResponse);
    };

    // handles the response from the API
    function processFeedbackResponse(hasError, message) {
        $scope.feedback.message = '';

        // if there is an error
        if (hasError) {
            $scope.feedback.alerts = [{type: 'danger', message: message}];
        } else {
            $scope.feedback.alerts = [{type: 'success', message: MESSAGES.feedback.sendSuccess}];
        }
    }

    // handles the user clicking the cancel button in the modal (closes modal)
    $scope.cancel = function () {
        $modalInstance.close();
    };

    // closes the alert
    $scope.closeAlert = function () {
        $scope.feedback.alerts = [];
    };
});