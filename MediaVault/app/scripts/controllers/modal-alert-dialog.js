'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: AlertDialogueModalCtrl
 * @description
 * # AlertDialogueModalCtrl
 *
 * Controller
 */

angular.module('MediaVault').controller('ModalAlertDialogCtrl', function (LABELS, $modalInstance, stringUtil, modalAlertDialog, message, title, btnText, $scope) {
    $scope.title = title;
    if (stringUtil.isEmptyOrNull(title)) {
        $scope.title = LABELS.alertDialog.defautlTitle;
    }

    $scope.message = message;
    if (stringUtil.isEmptyOrNull(message)) {
        $modalInstance.close();
    }

    $scope.buttonText = LABELS.alertDialog.defautlButton;
    if (!stringUtil.isEmptyOrNull(btnText)) {
        $scope.buttonText = btnText;
    }

    $scope.close = function () {
        $modalInstance.close();
    };
});