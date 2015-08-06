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
	core.getAccessToken = function() 
	{
		//alert('access token started');
		//return nplApi.post1(ENDPOINTS.accesstoken,'token');
		nplApi.post(ENDPOINTS.accesstoken,{version: ENV.version}).then(function(accessTokenresponse)
			{
				
				var response=angular.fromJson(accessTokenresponse);
				//console.log('accesstoken status----'+response.status);
				var responsestatus = response.status;
				console.log(response.data.accessToken+'   ----this is before save ');
				localRecord.save('accesstokendata',angular.toJson(response.data.accessToken));
				//console.log($rootScope.accesstoken);
			}).catch(function()
			{
				//alert('access token error error');
			});
    }; 

	core.generatefolder = function (accessToken,folderName) 
	{
		var querystring = ENDPOINTS.createfolder+'&accessToken='+accessToken;
	
		querystring= querystring+'&folderName='+folderName;
		console.log('endpoint----->'+querystring);
        return  nplApi.post(querystring,{version: ENV.version});
    };
	core.foldercontents = function (accessToken,folderId) 
	{
		console.log('folderId');
		var querystring = 'accessToken='+accessToken;
		querystring = querystring+'&folderId='+folderId;
		console.log('endpoint----->'+querystring);
		return  nplApi.post1(ENDPOINTS.listfoldercontents,querystring);
    };

	core.fileupload = function(str) 
	{
		//var querystring = ENDPOINTS.uploadfile+'&accessToken='+accessToken+'&'+str;
		//str.push({version: ENV.version});
		console.log("in fileupload service in api.js file");
		console.log(str);
		// return nplApi.postFormData(ENDPOINTS.uploadfile,str);
		return nplApi.postFormData(ENDPOINTS.uploadfile,str);
    };	
	
	core.filedownload = function (accessToken,webUrl) 
 { var querystring = ENDPOINTS.downloadfile+'&accessToken='+accessToken+'&webURL='+webUrl;
  //querystring = querystring+'&fileld='+fileld;
        return nplApi.post(querystring,{version: ENV.version});
    };
 core.filedelete = function (accessToken,webUrl) 
 {
  var querystring = ENDPOINTS.deletefile+'&accessToken='+accessToken+'&webURL='+webUrl;
        return nplApi.post(querystring,{version: ENV.version});
    }; 
 core.filesearch = function (accessToken,querytext,folderId) 
 {
  var querystring = ENDPOINTS.searchfile+'&accessToken='+accessToken+'&queryText='+querytext+'&folderId='+folderId;
        return nplApi.post(querystring,{version: ENV.version});
    };
 core.filedetails = function (accessToken,webUrl) 
 {
  var querystring = ENDPOINTS.getfiledetails+'&accessToken='+accessToken+'&webURL='+webUrl;
        return nplApi.post(querystring,{version: ENV.version});
    };
  return core;
});