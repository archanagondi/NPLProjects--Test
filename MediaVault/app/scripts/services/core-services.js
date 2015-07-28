'use strict';
/**
 * @ngdoc service
 * @name MediaVault.service: coreservices
 * @description
 * # coreservices
 *
 * The module of the application that handles coreservices on the site.
 */

angular.module('MediaVault').service('coreservices', function (ENV,ENDPOINTS, ERRORS, nplApi) 
{
	var core={};
	
	core.getAccessToken = function () 
	{
        return nplApi.get(ENDPOINTS.accesstoken, {version: ENV.version});
    };
	core.generatefolder = function (accessToken,folderName) 
	{
		console.log(nplApi.post1(ENDPOINTS.createfolder, {accessToken: accessToken,folderName:folderName}));
        return  nplApi.post1(ENDPOINTS.createfolder, {accessToken: accessToken,folderName:folderName});
    };
	core.foldercontents = function (accessToken,folderId) 
	{
        return nplApi.post1(ENDPOINTS.listfoldercontents,{accessToken:accessToken,folderId:folderId});
    };
	core.fileupload = function () 
	{
        return nplApi.post(ENDPOINTS.uploadfile, {version: ENV.version});
    };
	core.filedownload = function () 
	{
        return nplApi.post(ENDPOINTS.downloadfile, {version: ENV.version});
    };
	core.filedelete = function () 
	{
        return nplApi.post(ENDPOINTS.deletefile, {version: ENV.version});
    };	
	core.filesearch = function () 
	{
        return nplApi.post(ENDPOINTS.searchfile, {version: ENV.version});
    };
  return core;
});