'use strict';
/**
 * @ngdoc service
 * @name MediaVault.service: coreservices
 * @description
 * # coreservices
 *
 * The module of the application that handles coreservices on the site.
 */

angular.module('MediaVault').service('coreservices', function (ENV,ENDPOINTS, ERRORS, nplApi, localRecord) 
{
	var core={};
	core.getAccessToken = function () 
	{
		alert('access token started');
        //return nplApi.post1(ENDPOINTS.accesstoken,"token");
		nplApi.post1(ENDPOINTS.accesstoken,"token").then(function(accessTokenresponse)
			{
				var response=angular.fromJson(accessTokenresponse);
				console.log("accesstoken status----"+response.status);
				var responsestatus = response.status;
				console.log(response.data.accessToken+"   ----this is before save ");
				localRecord.save('accesstokendata',angular.toJson(response.data.accessToken));
			
			
			//console.log($rootScope.accesstoken);
			}).catch(function()
			{
			alert('access token error error');
			});
    }; 

	core.generatefolder = function (accessToken,folderName) 
	{
	var querystring = "accessToken="+accessToken;
	
	querystring= querystring+"&folderName="+folderName;
	console.log("endpoint----->"+querystring);
        return  nplApi.post1(ENDPOINTS.createfolder,querystring);
    };
	core.foldercontents = function (accessToken,folderId) 
	{
	console.log('folderId');
	var querystring = "accessToken="+accessToken;
	querystring = querystring+"&folderId="+folderId;
	console.log("endpoint----->"+querystring);
     return  nplApi.post1(ENDPOINTS.listfoldercontents,querystring);
    };

	core.fileupload = function(accessToken,folderId,folderName,str) 
	{
		var querystring = "accessToken="+accessToken+"&folderId="+folderId+"&folderName="+folderName+"&"+str;
        return nplApi.post1(ENDPOINTS.uploadfile,querystring);
    };	
	
	core.filedownload = function (accessToken,fileld) 
	{
		console.log('coreservice======== '+accessToken);
		console.log('coreservice========= '+fileld);
		var querystring = "accessToken="+accessToken;
		querystring = querystring+"&fileld="+fileld;
        return nplApi.post1(ENDPOINTS.downloadfile,querystring);
    };

	core.filedelete = function (accessToken,fileld) 
	{
		var querystring = "accessToken="+accessToken;
		querystring = querystring+"&fileld="+fileld;
        return nplApi.post1(ENDPOINTS.deletefile,querystring);
    };	
	
	core.filesearch = function (accessToken,querytext,folderName) 
	{
		var querystring = "accessToken="+accessToken;
		querystring = querystring+"&querytext="+querytext;
		querystring = querystring+"&folderName="+folderName;
        return nplApi.post1(ENDPOINTS.searchfile,querystring);
    };
	
  return core;
});