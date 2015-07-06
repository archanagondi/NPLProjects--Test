'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller
 */
angular.module('MediaVault').controller('LoginCtrl', function (ENV, ERRORS, $scope, $rootScope, $state, stringUtil, nplApi, access, localRecord, loadAppData) {
     $scope.currentEnvironment = ENV;
	 $scope.Phases= [];
     $scope.jobs= [];
    // if the user is logged in, take them to the dashboard
    if (access.isSignedIn()) 
	{
        $state.go('main');
    }
    // if a last username is stored
    if (localRecord.get('login') && localRecord.get('login').lastUser !== null) {
        $scope.username = localRecord.get('login').lastUser;
    }
    // function to handle processing a login
    $scope.login = function () {
        $scope.error = undefined;
        if (stringUtil.isEmptyOrNull($scope.username) || stringUtil.isEmptyOrNull($scope.password)) {
            $scope.error = ERRORS.login.incomplete;
            return;
        }
        $scope.loggingIn = true;
        var callback = function (error) {
            if (error) {
                if (error.statusText) {
                    if (error.status === 404) {
                        $scope.error = ERRORS.login.missingUsername;
                    } else if (error.status === 401) {
                        $scope.error = error.data;
                    } else {
                        $scope.error = ERRORS.login.apiUnreachable;
                    }
                } else if (error.message) {
                    $scope.error = error.message;
                } else if (Object.prototype.toString.call(error) === '[object String]') {
                    $scope.error = error;
                }
            } else if (access.isSignedIn()) {
                $scope.loggingIn = false;
                //load data of service get area data here get area is service
                loadAppData.getAreas().success(
                    function (areas)
					{
					  localRecord.save('area',areas);
                    }
                ).error(function()
				{
					
				});
                loadAppData.getJobsAndPhases().success(
                    function (jobsandphases)
					{
						$scope.test=angular.toJson(jobsandphases);
						
						localRecord.save('phase',$scope.test);
					}
                ).error(function()
				{
					
				});
				loadAppData.getCategorie().success(
                    function (categoryresponse)
					{
					  console.log(categoryresponse);
					  $scope.categories =angular.toJson(categoryresponse);
					  localRecord.save('categories',$scope.categories );
					}
                ).error(function()
				{
					
				});
				
				loadAppData.getKeywords().success(
                    function (keywordresponse)
					{
						 console.log(keywordresponse);
						 $scope.keys =angular.toJson(keywordresponse);
					  localRecord.save('keywords', $scope.keys);
					}
                ).error(function()
				{
				});
				
				
                $state.go('main');
            }
            $scope.loggingIn = false;
        };
        access.signIn($scope.username, $scope.password, callback);
    };
});