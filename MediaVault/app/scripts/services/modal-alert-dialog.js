'use strict';
/**
 * @ngdoc service
 * @name MediaVault.service: Alert Dialog
 * @description
 * # modalAlertDialog
 *
 * The module of the application that handles alerting the user.
 */
angular.module('MediaVault').service('modalAlertDialog', function ($modal) {
    var dialog = this;

    dialog.alert = function (message, title, btnText) {
        $modal.open({
            templateUrl: 'views/partials/modal-alert-dialog.html',
            size: 'lg',
            controller: 'ModalAlertDialogCtrl',
            resolve: {
                message: function () {
                    return message;
                },
                title: function () {
                    return title;
                },
                btnText: function () {
                    return btnText;
                }
            }
        });
    };

    return dialog;

});
   
 