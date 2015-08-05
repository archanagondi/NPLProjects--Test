'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller
 */
angular.module('MediaVault').controller('LoginCtrl', function (ENV, ERRORS, $scope, $rootScope, $state, stringUtil, nplApi, access, localRecord, loadAppData,coreservices) {
    $scope.currentEnvironment = ENV;
    $scope.Phases = [];
    $scope.jobs = [];

    // if the user is logged in, take them to the dashboard
    if (access.isSignedIn()) {
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
                    } else if (error.status === 401) 
					{
                        $scope.error = error.data;
						
                    }else if (error.status === 403 || error.status === 500) 
					{
                       
						$scope.error = ERRORS.login.invalidCredientials;
                    } else 
					{
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
                    function (areas) {
                        localRecord.save('area', areas);
                    }
                ).error(function () {

                    });
                loadAppData.getJobsAndPhases().success(
                    function (jobsandphases) {
                        $scope.test = angular.toJson(jobsandphases);

                        localRecord.save('phase', $scope.test);
                    }
                ).error(function () {

                    });
                loadAppData.getCategory().success(
                    function (categoryresponse) {

                        $scope.categories = angular.toJson(categoryresponse);
                        localRecord.save('categories', $scope.categories);
                    }
                ).error(function () {

                    }); 

                loadAppData.getKeywords().success(
                    function (keywordresponse) {
                        $scope.keys = angular.toJson(keywordresponse);
                        localRecord.save('keywords', $scope.keys);
                    }
                ).error(function () {
                    }); 
					
					coreservices.getAccessToken();
						//create folder service
		$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
		  var user = localRecord.get('user');
		$scope.foldername= user.id;
		//console.log("getting saved data-------------->"+$rootScope.accesstoken)
			coreservices.generatefolder($rootScope.accesstoken,$scope.foldername).then(function(response)
			{
				$scope.folderresponse=angular.toJson(response);
				console.log($scope.folderresponse+'===create folder response  login js file ');
				localRecord.save('folderdata',angular.toJson(response));
			}).catch(function(errorresponse){
				 $scope.folderresponse=angular.fromJson(errorresponse);
					//alert("error in create folder");
					console.log("error");
					console.log($scope.folderresponse.status);
					
					/* if($scope.folderresponse.status == 401){
						//alert("token expired");
						//generateaccesstoken();
						coreservices.getAccessToken();
						
					} */
			});
						
					
					
                $state.go('main');
            }
            $scope.loggingIn = false;
        };
        access.signIn($scope.username, $scope.password, callback);
    };
	
			/*.then(function(accessTokenresponse)
			{
				$scope.response=angular.fromJson(accessTokenresponse);
				console.log("accesstoken status----"+$scope.response.status);
				$scope.responsestatus = $scope.response.status;
				console.log($scope.response.data.accessToken+"   ----this is before save ");
				localRecord.save('accesstokendata',angular.toJson($scope.response.data.accessToken));
			
			
			//console.log($rootScope.accesstoken);
			}).catch(function()
			{
			//alert('access token error error');
			}); 
			
			*/


});